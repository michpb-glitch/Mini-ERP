require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const { autenticar } = require('./middlewares/auth');
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const clientesRoutes = require('./routes/clientes.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const ventasRoutes = require('./routes/ventas.routes');
const comprasRoutes = require('./routes/compras.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Pipeline: CORS -> JSON -> Logger -> Auth -> Rutas -> Errores
app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Mini ERP API funcionando' });
});

// Públicas
app.use('/api/auth', authRoutes);

// Protegidas (requieren token)
app.use('/api/productos', autenticar, productosRoutes);
app.use('/api/clientes', autenticar, clientesRoutes);
app.use('/api/proveedores', autenticar, proveedoresRoutes);
app.use('/api/ventas', autenticar, ventasRoutes);
app.use('/api/compras', autenticar, comprasRoutes);
app.use('/api/inventario', autenticar, inventarioRoutes);
app.use('/api/dashboard', autenticar, dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' },
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
