import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api';

interface Persona {
  id: number;
  nombre: string;
  rfc: string;
  telefono: string | null;
  correo: string | null;
}

interface Props {
  endpoint: string;
  titulo: string;
  singular: string;
}

const vacio = { nombre: '', rfc: '', telefono: '', correo: '' };

export default function PersonaCrud({ endpoint, titulo, singular }: Props) {
  const [items, setItems] = useState<Persona[]>([]);
  const [buscar, setBuscar] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState<number | null>(null);
  const [errores, setErrores] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState('');

  const cargar = async () => {
    const res = await api(`/${endpoint}?buscar=${encodeURIComponent(buscar)}&page=${page}&limit=5`);
    setItems(res.data);
    setTotalPages(res.pagination.totalPages || 1);
  };

  useEffect(() => {
    cargar();
  }, [page, buscar, endpoint]);

  const cambiar = (campo: keyof typeof vacio, valor: string) =>
    setForm({ ...form, [campo]: valor });

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setErrores([]);
    setMensaje('');
    try {
      if (editId) await api(`/${endpoint}/${editId}`, 'PUT', form);
      else await api(`/${endpoint}`, 'POST', form);
      setMensaje(editId ? 'Registro actualizado' : 'Registro creado');
      setForm(vacio);
      setEditId(null);
      cargar();
    } catch (err) {
      const apiErr = err as ApiError;
      setErrores(apiErr.body?.error?.detalles || [apiErr.message]);
    }
  };

  const editar = (p: Persona) => {
    setEditId(p.id);
    setMensaje('');
    setErrores([]);
    setForm({
      nombre: p.nombre,
      rfc: p.rfc,
      telefono: p.telefono || '',
      correo: p.correo || '',
    });
  };

  const cancelar = () => {
    setEditId(null);
    setForm(vacio);
    setErrores([]);
  };

  const eliminar = async (id: number) => {
    if (!confirm(`¿Eliminar este ${singular}?`)) return;
    setErrores([]);
    setMensaje('');
    try {
      await api(`/${endpoint}/${id}`, 'DELETE');
      setMensaje('Registro eliminado');
      cargar();
    } catch (err) {
      setErrores([(err as Error).message]);
    }
  };

  return (
    <>
      <h1>{titulo}</h1>

      <div className="panel">
        <h3>{editId ? `Editar ${singular} #${editId}` : `Nuevo ${singular}`}</h3>
        {errores.length > 0 && (
          <div className="error">{errores.map((m) => <div key={m}>{m}</div>)}</div>
        )}
        {mensaje && <div className="ok">{mensaje}</div>}
        <form onSubmit={guardar} className="form-grid">
          <label>Nombre
            <input value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
          </label>
          <label>RFC
            <input value={form.rfc} onChange={(e) => cambiar('rfc', e.target.value.toUpperCase())} />
          </label>
          <label>Teléfono
            <input value={form.telefono} onChange={(e) => cambiar('telefono', e.target.value)} />
          </label>
          <label>Correo
            <input value={form.correo} onChange={(e) => cambiar('correo', e.target.value)} />
          </label>
          <div>
            <button type="submit">{editId ? 'Actualizar' : 'Guardar'}</button>{' '}
            {editId && <button type="button" className="secundario" onClick={cancelar}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="toolbar">
        <input
          placeholder="Buscar por nombre o RFC..."
          value={buscar}
          onChange={(e) => { setBuscar(e.target.value); setPage(1); }}
        />
      </div>

      <table>
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>RFC</th><th>Teléfono</th><th>Correo</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.rfc}</td>
              <td>{p.telefono}</td>
              <td>{p.correo}</td>
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
