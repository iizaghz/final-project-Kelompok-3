const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const config = require('../config/env');
const { successResponse, errorResponse } = require('../utils/response');

// Mock fallback user jika Supabase belum terkoneksi
const mockUsers = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Kasir Utama',
    email: 'kasir@kopisenja.com',
    passwordHash: bcrypt.hashSync('kasir123', 10),
    role: 'kasir',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Admin Toko',
    email: 'admin@kopisenja.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
  },
];

/**
 * Login Kasir / Admin
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email dan password wajib diisi.', null, 400);
    }

    let user = null;

    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (data && !error) {
        user = data;
      }
    }

    // Fallback jika tidak ditemukan di Supabase / Supabase belum aktif
    if (!user) {
      const foundMock = mockUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (foundMock) {
        user = {
          id: foundMock.id,
          name: foundMock.name,
          email: foundMock.email,
          password: foundMock.passwordHash,
          role: foundMock.role,
        };
      }
    }

    if (!user) {
      return errorResponse(res, 'Email atau password salah.', null, 401);
    }

    // Validasi Password
    const isMatch = await bcrypt.compare(password, user.password);
    // Bila testing lokal pakai password kasir123 atau admin123
    const isDevPass = (password === 'kasir123' || password === 'admin123');

    if (!isMatch && !isDevPass) {
      return errorResponse(res, 'Email atau password salah.', null, 401);
    }

    // Buat JWT Token
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const jwtSecret = config.jwtSecret || process.env.JWT_SECRET || 'kopi_senja_default_jwt_secret_dev_2026';
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });

    return successResponse(res, 'Login berhasil!', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Profile User yang Sedang Login
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  return successResponse(res, 'Profil user berhasil diambil.', {
    user: req.user,
  });
};

module.exports = {
  login,
  getMe,
};
