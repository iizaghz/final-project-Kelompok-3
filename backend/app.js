const express = require('express');
const cors = require('cors');

const config = require('./config/env');
require('./config/db');
const errorHandler = require('./middlewares/error.middleware');

// Routes (Modul Salwa, Iza, & Putri)
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const displayRoutes = require('./routes/display.routes');

const app = express();

// 1. CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'va', 'signature', 'timestamp'],
}));

// 2. Request Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Logger Ringkas (Development)
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// 4. API Endpoints
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/display', displayRoutes);
app.use('/api/queue', displayRoutes);

// 5. Root Route Info
app.get('/', (req, res) => {
  res.json({
    name: 'Kopi Senja API',
    version: '2.0.0',
    status: 'Online',
    endpoints: [
      '/health',
      '/api/auth',
      '/api/categories',
      '/api/products',
      '/api/orders',
      '/api/payment',
      '/api/display',
    ],
  });
});

// 6. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan pada server ini.`,
  });
});

// 7. Global Error Handler
app.use(errorHandler);

// 8. Start Server (hanya saat tidak di-import sebagai module test)
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`☕ Kopi Senja Backend berjalan di http://localhost:${config.port}`);
    console.log(`📡 Ready for Self-Order, Cashier, Display & iPaymu QRIS`);
    console.log(`====================================================`);
  });
}

module.exports = app;
