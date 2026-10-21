import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/auth/login', 'POST', { usuario, password });
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="login panel">
      <h1>Mini ERP</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={enviar}>
        <label>Usuario
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        </label>
        <label>Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  );
}
