const db = require('../config/db');

const obtenerTodos = async () => {
  const [rows] = await db.query('SELECT * FROM productos ORDER BY id');
  return rows;
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
