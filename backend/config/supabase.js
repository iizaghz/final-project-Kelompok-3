const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

let supabase = null;

if (config.supabaseUrl && config.supabaseKey) {
  try {
    supabase = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
    console.log('✓ Supabase Client terinisialisasi dengan URL:', config.supabaseUrl);
  } catch (error) {
    console.warn('⚠️ Gagal inisialisasi Supabase Client:', error.message);
  }
} else {
  console.warn('⚠️ SUPABASE_URL atau SUPABASE_KEY belum diatur di .env! Menggunakan mode fallback in-memory untuk pengujian lokal.');
}

module.exports = supabase;
