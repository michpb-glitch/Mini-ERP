import { useEffect, useState } from 'react';
import { api } from '../api';

interface Fila {
  id: number;
  nombre: string;
  codigo: string;
  categoria: string | null;
  stock: number;
  estado: 'BAJO' | 'OK';
}

export default function Inventario() {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [soloBajo, setSoloBajo] = useState(false);

  useEffect(() => {
    api(`/inventario?stockBajo=${soloBajo}`).then((r) => setFilas(r.data));
  }, [soloBajo]);

  return (
    <>
      <h1>Inventario</h1>
      <div className="toolbar">
        <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={soloBajo} onChange={(e) => setSoloBajo(e.target.checked)} />
          Mostrar solo stock bajo (10 o menos)
        </label>
      </div>
      <table>
        <thead>
          <tr><th>ID</th><th>Producto</th><th>Código</th><th>Categoría</th><th>Stock</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.nombre}</td>
              <td>{f.codigo}</td>
              <td>{f.categoria}</td>
              <td>{f.stock}</td>
              <td style={{ color: f.estado === 'BAJO' ? '#dc2626' : '#166534', fontWeight: 600 }}>{f.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
