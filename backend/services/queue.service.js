const pool = require('../config/db');
const supabase = require('../config/supabase');

let memoryQueueCounter = 0;
let lastDate = new Date().toISOString().slice(0, 10);

/**
 * Menghasilkan nomor antrian harian (contoh: A-001, A-002, dst.)
 */
const generateDailyQueueNumber = async () => {
  const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD

  // Reset in-memory counter bila hari baru
  if (lastDate !== today) {
    memoryQueueCounter = 0;
    lastDate = today;
  }

  // 1. Prioritaskan PostgreSQL lokal
  if (pool) {
    try {
      const result = await pool.query(
        "SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE"
      );
      const count = parseInt(result.rows[0].count, 10) || 0;
      const nextNumber = count + 1;
      return `A-${String(nextNumber).padStart(3, '0')}`;
    } catch (err) {
      console.warn('Gagal menghitung nomor antrian di PostgreSQL:', err.message);
    }
  }

  // 2. Supabase Cloud
  if (supabase) {
    try {
      const startOfDay = `${today}T00:00:00.000Z`;
      const endOfDay = `${today}T23:59:59.999Z`;

      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      if (!error) {
        const nextNumber = (count || 0) + 1;
        return `A-${String(nextNumber).padStart(3, '0')}`;
      }
    } catch (err) {
      console.warn('Gagal menghitung antrian Supabase:', err.message);
    }
  }

  // 3. In-memory fallback
  memoryQueueCounter += 1;
  return `A-${String(memoryQueueCounter).padStart(3, '0')}`;
};

module.exports = {
  generateDailyQueueNumber,
};
