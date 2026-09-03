const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT, 10) || 5432;
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'Sh052211ig';
const dbName = process.env.DB_NAME || 'kopi_senja';

async function initDatabase() {
  console.log('====================================================');
  console.log(' Memulai Inisialisasi Database PostgreSQL Lokal...');
  console.log(` Target Server: ${dbHost}:${dbPort} | User: ${dbUser}`);
  console.log('====================================================');

  // 1. Koneksi ke database default 'postgres' untuk membuat DB baru
  const rootClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres',
  });

  try {
    await rootClient.connect();
    console.log('✓ Terhubung ke server PostgreSQL.');

    // Cek apakah database kopi_senja sudah ada
    const checkDbRes = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDbRes.rowCount === 0) {
      console.log(`⚙️ Membuat database "${dbName}"...`);
      await rootClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✓ Database "${dbName}" berhasil dibuat.`);
    } else {
      console.log(`✓ Database "${dbName}" sudah ada.`);
    }
  } catch (err) {
    console.error('❌ Gagal terhubung ke server PostgreSQL default:', err.message);
    console.error('Pastikan layanan PostgreSQL sudah berjalan di komputer Anda.');
    process.exit(1);
  } finally {
    await rootClient.end();
  }

  // 2. Koneksi langsung ke database target 'kopi_senja'
  const targetClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  });

  try {
    await targetClient.connect();
    console.log(`✓ Terhubung ke database "${dbName}".`);

    // 3. Jalankan Skema Tabel
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Buang perintah storage.buckets khusus Supabase jika di local Postgres
    schemaSql = schemaSql.replace(/INSERT INTO storage\.buckets[\s\S]*?;/g, '');
    schemaSql = schemaSql.replace(/CREATE POLICY[\s\S]*?;/g, '');

    console.log('⚙️ Menjalankan schema.sql (Tabel users, categories, products, orders, order_items)...');
    await targetClient.query(schemaSql);
    console.log('✓ Seluruh tabel berhasil dibuat / disiapkan.');

    // 4. Jalankan Seed Data
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('⚙️ Menjalankan seed.sql (Akun kasir demo, kategori, & menu kopi)...');
    await targetClient.query(seedSql);
    console.log('✓ Data awal berhasil dimasukkan.');

    // Verifikasi jumlah data
    const userCount = await targetClient.query('SELECT count(*) FROM users');
    const productCount = await targetClient.query('SELECT count(*) FROM products');
    const catCount = await targetClient.query('SELECT count(*) FROM categories');

    console.log('====================================================');
    console.log('🎉 Inisialisasi Database Berhasil Sepenuhnya!');
    console.log(`- Jumlah Pengguna/Kasir : ${userCount.rows[0].count}`);
    console.log(`- Jumlah Kategori       : ${catCount.rows[0].count}`);
    console.log(`- Jumlah Menu Produk    : ${productCount.rows[0].count}`);
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat migrasi database:', err.message);
    process.exit(1);
  } finally {
    await targetClient.end();
  }
}

initDatabase();
