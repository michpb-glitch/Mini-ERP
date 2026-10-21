const db = require('../config/db');

module.exports = (tabla) => {
  const obtenerPorId = async (id) => {
    const [rows] = await db.query(`SELECT * FROM ${tabla} WHERE id = ?`, [id]);
    return rows[0] || null;
  };

  const obtenerTodos = async ({ buscar, page = 1, limit = 10 }) => {
    const params = [];
    let where = '';
    if (buscar) {
      where = 'WHERE nombre LIKE ? OR rfc LIKE ?';
      params.push(`%${buscar}%`, `%${buscar}%`);
    }
    const pagina = Math.max(parseInt(page) || 1, 1);
    const limite = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM ${tabla} ${where}`, params);
    const [rows] = await db.query(
      `SELECT * FROM ${tabla} ${where} ORDER BY id LIMIT ? OFFSET ?`,
      [...params, limite, (pagina - 1) * limite]
    );
    return { rows, total, page: pagina, limit: limite };
  };

  const crear = async ({ nombre, rfc, telefono, correo }) => {
    const [result] = await db.query(
      `INSERT INTO ${tabla} (nombre, rfc, telefono, correo) VALUES (?, ?, ?, ?)`,
      [nombre, rfc, telefono, correo]
    );
    return obtenerPorId(result.insertId);
  };

  const actualizar = async (id, { nombre, rfc, telefono, correo }) => {
    const [result] = await db.query(
      `UPDATE ${tabla} SET nombre = ?, rfc = ?, telefono = ?, correo = ? WHERE id = ?`,
      [nombre, rfc, telefono, correo, id]
    );
    if (result.affectedRows === 0) return null;
    return obtenerPorId(id);
  };

  const eliminar = async (id) => {
    const [result] = await db.query(`DELETE FROM ${tabla} WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  };

  return { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
};
