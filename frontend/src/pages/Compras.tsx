import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError, dinero } from '../api';

interface Opcion {
  id: number;
  nombre: string;
  stock?: number;
}
interface Linea {
  productoId: string;
  cantidad: string;
  precio: string;
}
interface CompraFila {
  id: number;
  fecha: string;
  total: number | string;
  proveedor: string;
}

const lineaVacia: Linea = { productoId: '', cantidad: '1', precio: '' };

export default function Compras() {
  const [proveedores, setProveedores] = useState<Opcion[]>([]);
  const [productos, setProductos] = useState<Opcion[]>([]);
  const [compras, setCompras] = useState<CompraFila[]>([]);
  const [proveedorId, setProveedorId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [lineas, setLineas] = useState<Linea[]>([lineaVacia]);
  const [errores, setErrores] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState('');

  const cargarCompras = async () => {
    const r = await api('/compras?limit=20');
    setCompras(r.data);
  };
  const cargarProductos = async () => {
    const r = await api('/productos?limit=100');
    setProductos(r.data);
  };

  useEffect(() => {
    api('/proveedores?limit=100').then((r) => setProveedores(r.data));
    cargarProductos();
    cargarCompras();
  }, []);

  const cambiarLinea = (i: number, campo: keyof Linea, valor: string) =>
    setLineas(lineas.map((l, idx) => (idx === i ? { ...l, [campo]: valor } : l)));

  const totalEstimado = lineas.reduce(
    (suma, l) => suma + Number(l.precio || 0) * Number(l.cantidad || 0),
    0
  );

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setErrores([]);
    setMensaje('');
    try {
      const res = await api('/compras', 'POST', {
        proveedorId: Number(proveedorId),
        fecha,
        productos: lineas.map((l) => ({
          productoId: Number(l.productoId),
          cantidad: Number(l.cantidad),
          precio: Number(l.precio),
        })),
      });
      setMensaje(`Compra #${res.data.id} registrada por ${dinero(res.data.total)}`);
      setProveedorId('');
      setLineas([lineaVacia]);
      cargarCompras();
      cargarProductos();
    } catch (err) {
      const apiErr = err as ApiError;
      setErrores(apiErr.body?.error?.detalles || [apiErr.message]);
    }
  };

  return (
    <>
      <h1>Compras</h1>

      <div className="panel">
        <h3>Registrar compra</h3>
        {errores.length > 0 && (
          <div className="error">{errores.map((m) => <div key={m}>{m}</div>)}</div>
        )}
        {mensaje && <div className="ok">{mensaje}</div>}

        <form onSubmit={guardar}>
          <div className="form-grid">
            <label>Proveedor
              <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
                <option value="">Selecciona...</option>
                {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </label>
            <label>Fecha
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </label>
          </div>

          <h4>Productos</h4>
          {lineas.map((l, i) => (
            <div className="form-grid" key={i} style={{ marginBottom: 8 }}>
              <label>Producto
                <select value={l.productoId} onChange={(e) => cambiarLinea(i, 'productoId', e.target.value)}>
                  <option value="">Selecciona...</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>
                  ))}
                </select>
              </label>
              <label>Cantidad
                <input type="number" min="1" value={l.cantidad} onChange={(e) => cambiarLinea(i, 'cantidad', e.target.value)} />
              </label>
              <label>Precio de compra
                <input type="number" min="0" step="0.01" value={l.precio} onChange={(e) => cambiarLinea(i, 'precio', e.target.value)} />
              </label>
              <div>
                {lineas.length > 1 && (
                  <button type="button" className="peligro" onClick={() => setLineas(lineas.filter((_, idx) => idx !== i))}>
                    Quitar
                  </button>
                )}
              </div>
            </div>
          ))}

          <button type="button" className="secundario" onClick={() => setLineas([...lineas, lineaVacia])}>
            + Agregar producto
          </button>

          <p><strong>Total estimado: {dinero(totalEstimado)}</strong></p>
          <button type="submit">Registrar compra</button>
        </form>
      </div>

      <h3>Últimas compras</h3>
      <table>
        <thead>
          <tr><th>ID</th><th>Fecha</th><th>Proveedor</th><th>Total</th></tr>
        </thead>
        <tbody>
          {compras.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{String(c.fecha).slice(0, 10)}</td>
              <td>{c.proveedor}</td>
              <td>{dinero(c.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
