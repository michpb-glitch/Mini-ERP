require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

(async () => {
  const hash = await bcrypt.hash('123456', 10);
  await db.query(
    `INSERT INTO usuarios (usuario, password, rol) VALUES ('admin', ?, 'admin')
     ON DUPLICATE KEY UPDATE password = VALUES(password), rol = 'admin'`,
    [hash]
  );
  console.log('Usuario admin listo (usuario: admin, password: 123456)');
  process.exit(0);
})();
