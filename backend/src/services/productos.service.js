const db = require('../config/db');

const COLUMNAS_ORDEN = ['id', 'nombre', 'codigo', 'precio', 'stock', 'categoria'];

const obtenerTodos = async ({ categoria, buscar, page = 1, limit = 10, sort = 'id', order = 'asc' }) => {
  const where = [];
  const params = [];

  if (categoria) {
    where.push('categoria = ?');
    params.push(categoria);
  }
  if (buscar) {
    where.push('(nombre LIKE ? OR codigo LIKE ?)');
    params.push(`%${buscar}%`, `%${buscar}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const columna = COLUMNAS_ORDEN.includes(sort) ? sort : 'id';
  const direccion = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const pagina = Math.max(parseInt(page) || 1, 1);
  const limite = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
  const offset = (pagina - 1) * limite;

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM productos ${whereSql}`,
    params
  );

  const [rows] = await db.query(
    `SELECT * FROM productos ${whereSql} ORDER BY ${columna} ${direccion} LIMIT ? OFFSET ?`,
    [...params, limite, offset]
  );

  return { rows, total, page: pagina, limit: limite };
};

const obtenerPorId = async (id) => {
  const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
  return rows[0] || null;
};

const crear = async ({ nombre, codigo, precio, stock, categoria }) => {
  const [result] = await db.query(
    'INSERT INTO productos (nombre, codigo, precio, stock, categoria) VALUES (?, ?, ?, ?, ?)',
    [nombre, codigo, precio, stock, categoria]
  );
  return obtenerPorId(result.insertId);
};

const actualizar = async (id, { nombre, codigo, precio, stock, categoria }) => {
  const [result] = await db.query(
    'UPDATE productos SET nombre = ?, codigo = ?, precio = ?, stock = ?, categoria = ? WHERE id = ?',
    [nombre, codigo, precio, stock, categoria, id]
  );
  if (result.affectedRows === 0) return null;
  return obtenerPorId(id);
};

const eliminar = async (id) => {
  const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
