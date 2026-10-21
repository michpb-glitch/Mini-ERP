import { Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';

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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
