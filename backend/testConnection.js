import { pool } from './db.js';

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    console.log('✅ Conexión a MySQL exitosa');
    console.table(rows);
  } catch (err) {
    console.error('❌ Error de conexión:', err);
  }
}

testConnection();

