import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError, dinero } from '../api';

interface Opcion {
  id: number;
  nombre: string;
  precio?: number | string;
  stock?: number;
}
interface Linea {
  productoId: string;
  cantidad: string;
}
interface VentaFila {
  id: number;
  fecha: string;
  total: number | string;
  cliente: string;
}

export default function Ventas() {
  const [clientes, setClientes] = useState<Opcion[]>([]);
  const [productos, setProductos] = useState<Opcion[]>([]);
  const [ventas, setVentas] = useState<VentaFila[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [lineas, setLineas] = useState<Linea[]>([{ productoId: '', cantidad: '1' }]);
  const [errores, setErrores] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState('');

  const cargarVentas = async () => {
    const r = await api('/ventas?limit=20');
    setVentas(r.data);
  };
  const cargarProductos = async () => {
    const r = await api('/productos?limit=100');
    setProductos(r.data);
  };

  useEffect(() => {
    api('/clientes?limit=100').then((r) => setClientes(r.data));
    cargarProductos();
    cargarVentas();
  }, []);

  const cambiarLinea = (i: number, campo: keyof Linea, valor: string) =>
    setLineas(lineas.map((l, idx) => (idx === i ? { ...l, [campo]: valor } : l)));

  const totalEstimado = lineas.reduce((suma, l) => {
    const p = productos.find((x) => x.id === Number(l.productoId));
    return suma + (p ? Number(p.precio) * Number(l.cantidad || 0) : 0);
  }, 0);

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setErrores([]);
    setMensaje('');
    try {
      const res = await api('/ventas', 'POST', {
        clienteId: Number(clienteId),
        fecha,
        productos: lineas.map((l) => ({
          productoId: Number(l.productoId),
          cantidad: Number(l.cantidad),
        })),
      });
      setMensaje(`Venta #${res.data.id} registrada por ${dinero(res.data.total)}`);
      setClienteId('');
      setLineas([{ productoId: '', cantidad: '1' }]);
      cargarVentas();
      cargarProductos();
    } catch (err) {
      const b = (err as ApiError).body;
      if (b?.message === 'Stock insuficiente') {
        setErrores([
          `Stock insuficiente: ${b.producto} (disponible: ${b.stockDisponible}, solicitado: ${b.cantidadSolicitada})`,
        ]);
      } else {
        setErrores(b?.error?.detalles || [(err as Error).message]);
      }
    }
  };

  return (
    <>
      <h1>Ventas</h1>

      <div className="panel">
        <h3>Registrar venta</h3>
        {errores.length > 0 && (
          <div className="error">{errores.map((m) => <div key={m}>{m}</div>)}</div>
        )}
        {mensaje && <div className="ok">{mensaje}</div>}

        <form onSubmit={guardar}>
          <div className="form-grid">
            <label>Cliente
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Selecciona...</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
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
                    <option key={p.id} value={p.id}>
                      {p.nombre} — {dinero(p.precio ?? 0)} (stock: {p.stock})
                    </option>
                  ))}
                </select>
              </label>
              <label>Cantidad
                <input type="number" min="1" value={l.cantidad} onChange={(e) => cambiarLinea(i, 'cantidad', e.target.value)} />
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

          <button type="button" className="secundario" onClick={() => setLineas([...lineas, { productoId: '', cantidad: '1' }])}>
            + Agregar producto
          </button>

          <p><strong>Total estimado: {dinero(totalEstimado)}</strong></p>
          <button type="submit">Registrar venta</button>
        </form>
      </div>

      <h3>Últimas ventas</h3>
      <table>
        <thead>
          <tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Total</th></tr>
        </thead>
        <tbody>
          {ventas.map((v) => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{String(v.fecha).slice(0, 10)}</td>
              <td>{v.cliente}</td>
              <td>{dinero(v.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
