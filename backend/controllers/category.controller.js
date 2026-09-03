const supabase = require('../config/supabase');
const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// Fallback in-memory categories
let mockCategories = [
  { id: 1, name: 'Signature Coffee', slug: 'signature-coffee', icon: 'sparkles' },
  { id: 2, name: 'Espresso Based', slug: 'espresso-based', icon: 'coffee' },
  { id: 3, name: 'Non-Coffee & Tea', slug: 'non-coffee', icon: 'cup-soda' },
  { id: 4, name: 'Pastry & Snacks', slug: 'pastry-snacks', icon: 'croissant' },
];

/**
 * Mendapatkan semua kategori
 * GET /api/categories
 */
const getCategories = async (req, res, next) => {
  try {
    if (pool) {
      const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');
      return successResponse(res, 'Daftar kategori berhasil diambil (PostgreSQL).', result.rows);
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      return successResponse(res, 'Daftar kategori berhasil diambil (Supabase).', data);
    }

    return successResponse(res, 'Daftar kategori berhasil diambil (Mock).', mockCategories);
  } catch (error) {
    next(error);
  }
};

/**
 * Tambah Kategori Baru (Admin/Kasir)
 * POST /api/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, icon = 'coffee' } = req.body;

    if (!name) {
      return errorResponse(res, 'Nama kategori wajib diisi.', null, 400);
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (pool) {
      const result = await pool.query(
        'INSERT INTO categories (name, slug, icon) VALUES ($1, $2, $3) RETURNING *',
        [name.trim(), slug, icon]
      );
      return successResponse(res, 'Kategori berhasil ditambahkan (PostgreSQL).', result.rows[0], 201);
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name, slug, icon }])
        .select()
        .single();

      if (error) throw error;
      return successResponse(res, 'Kategori berhasil ditambahkan.', data, 201);
    }

    const newCat = { id: Date.now(), name, slug, icon };
    mockCategories.push(newCat);
    return successResponse(res, 'Kategori berhasil ditambahkan (Mock).', newCat, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Edit Kategori (Admin/Kasir)
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;

    if (pool) {
      const updates = [];
      const values = [];

      if (name) {
        values.push(name.trim());
        updates.push(`name = $${values.length}`);
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        values.push(slug);
        updates.push(`slug = $${values.length}`);
      }
      if (icon) {
        values.push(icon);
        updates.push(`icon = $${values.length}`);
      }

      values.push(id);
      const queryText = `UPDATE categories SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;
      const result = await pool.query(queryText, values);
      if (result.rowCount === 0) return errorResponse(res, 'Kategori tidak ditemukan.', null, 404);
      return successResponse(res, 'Kategori berhasil diperbarui (PostgreSQL).', result.rows[0]);
    }

    if (supabase) {
      const updates = {};
      if (name) {
        updates.name = name;
        updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (icon) updates.icon = icon;

      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return successResponse(res, 'Kategori berhasil diperbarui.', data);
    }

    const index = mockCategories.findIndex(c => String(c.id) === String(id));
    if (index === -1) return errorResponse(res, 'Kategori tidak ditemukan.', null, 404);

    mockCategories[index] = { ...mockCategories[index], ...req.body };
    return successResponse(res, 'Kategori berhasil diperbarui (Mock).', mockCategories[index]);
  } catch (error) {
    next(error);
  }
};

/**
 * Hapus Kategori (Admin/Kasir)
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (pool) {
      await pool.query('DELETE FROM categories WHERE id = $1', [id]);
      return successResponse(res, 'Kategori berhasil dihapus (PostgreSQL).', null);
    }

    if (supabase) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return successResponse(res, 'Kategori berhasil dihapus.', null);
    }

    mockCategories = mockCategories.filter(c => String(c.id) !== String(id));
    return successResponse(res, 'Kategori berhasil dihapus (Mock).', null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
