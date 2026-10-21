import { Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import Proveedores from './pages/Proveedores';
import Ventas from './pages/Ventas';
import Compras from './pages/Compras';
import Inventario from './pages/Inventario';

function Layout() {
  const navigate = useNavigate();

  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;

  const salir = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside>
        <h2>MINI ERP</h2>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/productos">Productos</NavLink>
        <NavLink to="/clientes">Clientes</NavLink>
        <NavLink to="/proveedores">Proveedores</NavLink>
        <NavLink to="/ventas">Ventas</NavLink>
        <NavLink to="/compras">Compras</NavLink>
        <NavLink to="/inventario">Inventario</NavLink>
        <button className="secundario" onClick={salir}>Cerrar sesión</button>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/inventario" element={<Inventario />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
