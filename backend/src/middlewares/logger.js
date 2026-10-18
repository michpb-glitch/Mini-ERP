module.exports = (req, res, next) => {
  const hora = new Date().toLocaleTimeString('es-MX', { hour12: false });
  console.log(`[${hora}] ${req.method} ${req.originalUrl}`);
  next();
};