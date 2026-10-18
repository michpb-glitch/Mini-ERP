require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./middlewares/logger');

const app = express();

// Pipeline: CORS -> JSON -> Logger -> Rutas
app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Mini ERP API funcionando' });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));