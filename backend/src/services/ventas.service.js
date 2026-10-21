const db = require('../config/db');

const fallo = (status, body) => {
  const e = new Error('Error controlado');
  e.status = status;
  e.body = body;
  return e;
};

const obtenerPorId = async (id) => {
  const [ventas] = await db.query(
    `SELECT v.id, v.fecha, v.total, v.cliente_id, c.nombre AS cliente
     FROM ventas v JOIN clientes c ON c.id = v.cliente_id
     WHERE v.id = ?`,
    [id]
  );
  if (!ventas[0]) return null;

  const [detalle] = await db.query(
    `SELECT d.producto_id, p.nombre AS producto, d.cantidad, d.precio_unitario,
            (d.cantidad * d.precio_unitario) AS subtotal
     FROM detalle_ventas d JOIN productos p ON p.id = d.producto_id
     WHERE d.venta_id = ?`,
    [id]
  );
  return { ...ventas[0], productos: detalle };
};

const obtenerTodos = async ({ page = 1, limit = 10 }) => {
  const pagina = Math.max(parseInt(page) || 1, 1);
  const limite = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM ventas');
  const [rows] = await db.query(
    `SELECT v.id, v.fecha, v.total, c.nombre AS cliente
     FROM ventas v JOIN clientes c ON c.id = v.cliente_id
     ORDER BY v.id DESC LIMIT ? OFFSET ?`,
    [limite, (pagina - 1) * limite]
  );
  return { rows, total, page: pagina, limit: limite };
};

const crear = async ({ clienteId, fecha, productos }) => {
  const conn = await db.getConnection();
  let ventaId;

  try {
    await conn.beginTransaction();

    // 1. Verificar cliente
    const [clientes] = await conn.query('SELECT id FROM clientes WHERE id = ?', [clienteId]);
    if (!clientes.length) {
      throw fallo(404, {
        success: false,
        error: { code: 'CLIENT_NOT_FOUND', message: 'El cliente solicitado no existe' },
      });
    }

    // Unir líneas repetidas del mismo producto
    const items = new Map();
    for (const { productoId, cantidad } of productos) {
      const id = Number(productoId);
      items.set(id, (items.get(id) || 0) + Number(cantidad));
    }

    // 2 y 3. Verificar productos y stock (FOR UPDATE bloquea la fila durante la transacción)
    let total = 0;
    const detalle = [];
    for (const id of [...items.keys()].sort((a, b) => a - b)) {
      const [rows] = await conn.query(
        'SELECT id, nombre, precio, stock FROM productos WHERE id = ? FOR UPDATE',
        [id]
      );
      const producto = rows[0];

      if (!producto) {
        throw fallo(404, {
          success: false,
          error: { code: 'PRODUCT_NOT_FOUND', message: `El producto ${id} no existe` },
        });
      }

      const cantidad = items.get(id);
      if (producto.stock < cantidad) {
        throw fallo(400, {
          success: false,
          message: 'Stock insuficiente',
          producto: producto.nombre,
          stockDisponible: producto.stock,
          cantidadSolicitada: cantidad,
        });
      }

      // 4. Calcular total
      total += Number(producto.precio) * cantidad;
      detalle.push({ id, cantidad, precio: Number(producto.precio) });
    }
    total = Math.round(total * 100) / 100;

    // 5. Registrar venta, detalle y descontar stock
    const fechaVenta = fecha || new Date().toISOString().slice(0, 10);
    const [venta] = await conn.query(
      'INSERT INTO ventas (cliente_id, fecha, total) VALUES (?, ?, ?)',
      [clienteId, fechaVenta, total]
    );
    ventaId = venta.insertId;

    for (const d of detalle) {
      await conn.query(
        'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [ventaId, d.id, d.cantidad, d.precio]
      );
      await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [d.cantidad, d.id]);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return obtenerPorId(ventaId);
};

module.exports = { obtenerTodos, obtenerPorId, crear };
