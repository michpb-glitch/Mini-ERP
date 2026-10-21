const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(body?.error?.message || body?.message || 'Error en la petición');
    this.status = status;
    this.body = body;
  }
}

export async function api<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new ApiError(res.status, data);
  }
  return data as T;
}

export const dinero = (n: number | string) =>
  Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
