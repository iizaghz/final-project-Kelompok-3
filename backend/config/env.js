const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const config = {
  port: process.env.PORT || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'kopi_senja_super_secret_jwt_key_2026',
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',

  // iPaymu
  ipaymuVa: process.env.IPAYMU_VA || '',
  ipaymuApiKey: process.env.IPAYMU_API_KEY || '',
  ipaymuUrl: process.env.IPAYMU_URL || 'https://sandbox.ipaymu.com/api/v2/payment/direct',
  ipaymuNotifyUrl: process.env.IPAYMU_NOTIFY_URL || 'http://localhost:3000/api/payment/callback',

  // Google Gemini API
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};

module.exports = config;
