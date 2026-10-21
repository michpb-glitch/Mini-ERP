const db = require('../config/db');

const fallo = (status, body) => {
  const e = new Error('Error controlado');
  e.status = status;
  e.body = body;
  return e;
};

const obtenerPorId = async (id) => {
  const [compras] = await db.query(
    `SELECT c.id, c.fecha, c.total, c.proveedor_id, pr.nombre AS proveedor
     FROM compras c JOIN proveedores pr ON pr.id = c.proveedor_id
     WHERE c.id = ?`,
    [id]
  );
  if (!compras[0]) return null;

  const [detalle] = await db.query(
    `SELECT d.producto_id, p.nombre AS producto, d.cantidad, d.precio_unitario,
            (d.cantidad * d.precio_unitario) AS subtotal
     FROM detalle_compras d JOIN productos p ON p.id = d.producto_id
     WHERE d.compra_id = ?`,
    [id]
  );
  return { ...compras[0], productos: detalle };
};

const obtenerTodos = async ({ page = 1, limit = 10 }) => {
  const pagina = Math.max(parseInt(page) || 1, 1);
  const limite = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM compras');
  const [rows] = await db.query(
    `SELECT c.id, c.fecha, c.total, pr.nombre AS proveedor
     FROM compras c JOIN proveedores pr ON pr.id = c.proveedor_id
     ORDER BY c.id DESC LIMIT ? OFFSET ?`,
    [limite, (pagina - 1) * limite]
  );
  return { rows, total, page: pagina, limit: limite };
};

const crear = async ({ proveedorId, fecha, productos }) => {
  const conn = await db.getConnection();
  let compraId;

  try {
    await conn.beginTransaction();

    // 1. Verificar proveedor
    const [prov] = await conn.query('SELECT id FROM proveedores WHERE id = ?', [proveedorId]);
    if (!prov.length) {
      throw fallo(404, {
        success: false,
        error: { code: 'SUPPLIER_NOT_FOUND', message: 'El proveedor solicitado no existe' },
      });
    }

    // 2. Verificar productos y calcular total
    let total = 0;
    const detalle = [];
    for (const p of productos) {
      const [rows] = await conn.query('SELECT id FROM productos WHERE id = ?', [p.productoId]);
      if (!rows.length) {
        throw fallo(404, {
          success: false,
          error: { code: 'PRODUCT_NOT_FOUND', message: `El producto ${p.productoId} no existe` },
        });
      }
      total += Number(p.precio) * Number(p.cantidad);
      detalle.push({ id: Number(p.productoId), cantidad: Number(p.cantidad), precio: Number(p.precio) });
    }
    total = Math.round(total * 100) / 100;

    // 3. Registrar compra, detalle y AUMENTAR stock
    const fechaCompra = fecha || new Date().toISOString().slice(0, 10);
    const [compra] = await conn.query(
      'INSERT INTO compras (proveedor_id, fecha, total) VALUES (?, ?, ?)',
      [proveedorId, fechaCompra, total]
    );
    compraId = compra.insertId;

    for (const d of detalle) {
      await conn.query(
        'INSERT INTO detalle_compras (compra_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [compraId, d.id, d.cantidad, d.precio]
      );
      await conn.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [d.cantidad, d.id]);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return obtenerPorId(compraId);
};

module.exports = { obtenerTodos, obtenerPorId, crear };
