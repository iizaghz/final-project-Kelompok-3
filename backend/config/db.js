const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

let pool = null;

if (process.env.DB_NAME && (process.env.DB_PASSWORD !== undefined || process.env.DATABASE_URL)) {
  try {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Sh052211ig',
      database: process.env.DB_NAME || 'kopi_senja',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Koneksi pool PostgreSQL mengalami error tak terduga:', err);
    });

    // Test quick connection
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.warn('⚠️ Gagal terhubung ke database PostgreSQL lokal kopi_senja:', err.message);
      } else {
        console.log('✓ Database PostgreSQL Lokal (kopi_senja) Aktif & Terhubung.');
      }
    });
  } catch (err) {
    console.warn('⚠️ Gagal inisialisasi koneksi PostgreSQL lokal:', err.message);
  }
}

module.exports = pool;
