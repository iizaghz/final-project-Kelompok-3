const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { errorResponse } = require('../utils/response');

/**
 * Middleware untuk memverifikasi JWT token bagi route kasir/admin
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return errorResponse(res, 'Akses ditolak. Token autentikasi tidak ditemukan.', null, 401);
  }

  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7, authHeader.length).trim() 
    : authHeader;

  if (!token) {
    return errorResponse(res, 'Format token tidak valid.', null, 401);
  }

  try {
    const jwtSecret = config.jwtSecret || process.env.JWT_SECRET || 'kopi_senja_default_jwt_secret_dev_2026';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.', error, 403);
  }
};

/**
 * Middleware untuk membatasi role admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 'Akses terlarang. Hanya admin yang diizinkan mengakses fitur ini.', null, 403);
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
};
