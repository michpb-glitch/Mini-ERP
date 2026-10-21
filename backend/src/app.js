require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const productosRoutes = require('./routes/productos.routes');

const app = express();

// Pipeline: CORS -> JSON -> Logger -> Rutas -> Errores
app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Mini ERP API funcionando' });
});

app.use('/api/productos', productosRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' },
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
