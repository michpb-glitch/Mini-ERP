import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError, dinero } from '../api';

interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  precio: number | string;
  stock: number;
  categoria: string | null;
}

const vacio = { nombre: '', codigo: '', precio: '', stock: '', categoria: '' };

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [buscar, setBuscar] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState<number | null>(null);
  const [errores, setErrores] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState('');

  const cargar = async () => {
    const res = await api(`/productos?buscar=${encodeURIComponent(buscar)}&page=${page}&limit=5`);
    setProductos(res.data);
    setTotalPages(res.pagination.totalPages || 1);
  };

  useEffect(() => {
    cargar();
  }, [page, buscar]);

  const cambiar = (campo: keyof typeof vacio, valor: string) =>
    setForm({ ...form, [campo]: valor });

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setErrores([]);
    setMensaje('');
    const body = { ...form, precio: Number(form.precio), stock: Number(form.stock) };
    try {
      if (editId) await api(`/productos/${editId}`, 'PUT', body);
      else await api('/productos', 'POST', body);
      setMensaje(editId ? 'Producto actualizado' : 'Producto creado');
      setForm(vacio);
      setEditId(null);
      cargar();
    } catch (err) {
      const apiErr = err as ApiError;
      setErrores(apiErr.body?.error?.detalles || [apiErr.message]);
    }
  };

  const editar = (p: Producto) => {
    setEditId(p.id);
    setMensaje('');
    setErrores([]);
    setForm({
      nombre: p.nombre,
      codigo: p.codigo,
      precio: String(p.precio),
      stock: String(p.stock),
      categoria: p.categoria || '',
    });
  };

  const cancelar = () => {
    setEditId(null);
    setForm(vacio);
    setErrores([]);
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    setErrores([]);
    setMensaje('');
    try {
      await api(`/productos/${id}`, 'DELETE');
      setMensaje('Producto eliminado');
      cargar();
    } catch (err) {
      setErrores([(err as Error).message]);
    }
  };

  return (
    <>
      <h1>Productos</h1>

      <div className="panel">
        <h3>{editId ? `Editar producto #${editId}` : 'Nuevo producto'}</h3>
        {errores.length > 0 && (
          <div className="error">{errores.map((m) => <div key={m}>{m}</div>)}</div>
        )}
        {mensaje && <div className="ok">{mensaje}</div>}
        <form onSubmit={guardar} className="form-grid">
          <label>Nombre
            <input value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
          </label>
          <label>Código
            <input value={form.codigo} onChange={(e) => cambiar('codigo', e.target.value)} />
          </label>
          <label>Precio
            <input type="number" value={form.precio} onChange={(e) => cambiar('precio', e.target.value)} />
          </label>
          <label>Stock
            <input type="number" value={form.stock} onChange={(e) => cambiar('stock', e.target.value)} />
          </label>
          <label>Categoría
            <input value={form.categoria} onChange={(e) => cambiar('categoria', e.target.value)} />
          </label>
          <div>
            <button type="submit">{editId ? 'Actualizar' : 'Guardar'}</button>{' '}
            {editId && <button type="button" className="secundario" onClick={cancelar}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="toolbar">
        <input
          placeholder="Buscar por nombre o código..."
          value={buscar}
          onChange={(e) => { setBuscar(e.target.value); setPage(1); }}
        />
      </div>

      <table>
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Código</th><th>Precio</th><th>Stock</th><th>Categoría</th><th></th></tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.codigo}</td>
              <td>{dinero(p.precio)}</td>
              <td>{p.stock}</td>
              <td>{p.categoria}</td>
              <td className="acciones">
                <button onClick={() => editar(p)}>Editar</button>
                <button className="peligro" onClick={() => eliminar(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="paginacion">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
        <span>Página {page} de {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Siguiente</button>
      </div>
    </>
  );
}
