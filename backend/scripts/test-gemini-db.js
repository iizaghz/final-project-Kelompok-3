const { generateMenuDescription } = require('../services/gemini.service');
const pool = require('../config/db');

async function testGeminiAndDatabase() {
  console.log('====================================================');
  console.log(' UJI COBA GENERATE DESKRIPSI GEMINI AI & INPUT DB');
  console.log('====================================================');

  const sampleMenu = {
    name: 'Pandan Cold Brew Breeze',
    category: 'Signature Coffee',
    categoryId: 1,
    price: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60'
  };

  console.log(`\n1. Mengirim permintaan generate deskripsi ke Gemini AI...`);
  console.log(`- Nama Menu : ${sampleMenu.name}`);
  console.log(`- Kategori  : ${sampleMenu.category}`);

  const startTime = Date.now();
  const description = await generateMenuDescription(sampleMenu.name, sampleMenu.category);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n✓ Deskripsi berhasil dibuat oleh Gemini AI dalam ${duration} detik:\n`);
  console.log(`"${description}"`);

  console.log('\n2. Memasukkan produk ke database PostgreSQL lokal (kopi_senja)...');
  const insertQuery = `
    INSERT INTO products (category_id, name, description, price, image_url, is_available)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, price, description, is_available, created_at;
  `;

  const res = await pool.query(insertQuery, [
    sampleMenu.categoryId,
    sampleMenu.name,
    description,
    sampleMenu.price,
    sampleMenu.imageUrl,
    true
  ]);

  const inserted = res.rows[0];
  console.log('\n✓ Produk berhasil disimpan ke tabel products:');
  console.log(`- ID Produk    : ${inserted.id}`);
  console.log(`- Nama Menu    : ${inserted.name}`);
  console.log(`- Harga        : Rp ${Number(inserted.price).toLocaleString('id-ID')}`);
  console.log(`- Deskripsi AI : ${inserted.description}`);
  console.log(`- Status Stok  : ${inserted.is_available ? 'Tersedia' : 'Habis'}`);
  console.log(`- Waktu Simpan : ${inserted.created_at}`);
  console.log('====================================================');

  await pool.end();
  process.exit(0);
}

testGeminiAndDatabase().catch((err) => {
  console.error('❌ Terjadi kesalahan saat pengujian:', err);
  process.exit(1);
});
