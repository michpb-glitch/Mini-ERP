import { useEffect, useState } from 'react';
import { api, dinero } from '../api';

interface Resumen {
  productos: number;
  clientes: number;
  proveedores: number;
  ventas: number;
  compras: number;
  stockBajo: number;
}

export default function Dashboard() {
  const [d, setD] = useState<Resumen | null>(null);

  useEffect(() => {
    api('/dashboard').then((res) => setD(res.data));
  }, []);

  if (!d) return <p>Cargando...</p>;

  return (
    <>
      <h1>Dashboard</h1>
      <div className="cards">
        <div className="card"><span>Productos</span><strong>{d.productos}</strong></div>
        <div className="card"><span>Clientes</span><strong>{d.clientes}</strong></div>
        <div className="card"><span>Proveedores</span><strong>{d.proveedores}</strong></div>
        <div className="card"><span>Ventas</span><strong>{dinero(d.ventas)}</strong></div>
        <div className="card"><span>Compras</span><strong>{dinero(d.compras)}</strong></div>
        <div className="card alerta"><span>Stock bajo</span><strong>{d.stockBajo}</strong></div>
      </div>
    </>
  );
}
