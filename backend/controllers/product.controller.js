const supabase = require('../config/supabase');
const pool = require('../config/db');
const { generateMenuDescription } = require('../services/gemini.service');
const { successResponse, errorResponse } = require('../utils/response');

// Fallback in-memory products jika tanpa database
let mockProducts = [
  {
    id: 1,
    category_id: 1,
    name: 'Kopi Senja Aren',
    description: 'Perpaduan espresso double shot arabika pilihan dengan susu segar dan gula aren murni khas Nusantara yang lembut dan creamy.',
    price: 22000,
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    categories: { id: 1, name: 'Signature Coffee', slug: 'signature-coffee' },
  },
  {
    id: 2,
    category_id: 1,
    name: 'Creamy Lotus Biscoff Coffee',
    description: 'Espresso aromatik berpadu saus karamel lembut dan taburan biskuit Lotus Biscoff renyah yang memanjakan lidah.',
    price: 28000,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    categories: { id: 1, name: 'Signature Coffee', slug: 'signature-coffee' },
  },
  {
    id: 3,
    category_id: 2,
    name: 'Caffe Americano (Iced/Hot)',
    description: 'Ekstraksi murni espresso dengan air panas/dingin menghasilkan cita rasa kopi yang bersih, tajam, dan menyegarkan.',
    price: 18000,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    categories: { id: 2, name: 'Espresso Based', slug: 'espresso-based' },
  },
  {
    id: 4,
    category_id: 2,
    name: 'Caramel Macchiato',
    description: 'Espresso pekat yang dituangkan di atas steamed milk manis dengan siraman saus karamel gurih berlapis.',
    price: 26000,
    image_url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    categories: { id: 2, name: 'Espresso Based', slug: 'espresso-based' },
  },
  {
    id: 5,
    category_id: 3,
    name: 'Matcha Green Tea Latte',
    description: 'Bubuk matcha murni impor dari Uji, Jepang yang dipadukan dengan fresh milk lembut dan aroma teh hijau autentik.',
    price: 25000,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    categories: { id: 3, name: 'Non-Coffee & Tea', slug: 'non-coffee' },
  },
  {
    id: 6,
    category_id: 4,
    name: 'Butter Croissant',
    description: 'Pastry klasik Prancis berlapis renyah di luar dan empuk lembut di dalam dengan aroma butter Prancis yang harum.',
    price: 20000,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    categories: { id: 4, name: 'Pastry & Snacks', slug: 'pastry-snacks' },
  },
];

const getDefaultImageUrl = (categoryId) => {
  const cat = Number(categoryId);
  if (cat === 4) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60'; // Pastry / Bread
  }
  if (cat === 3) {
    return 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60'; // Matcha / Non coffee
  }
  return 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60'; // Coffee default
};

/**
 * Mengambil semua produk dengan filter kategori & pencarian
 * GET /api/products
 */
const getProducts = async (req, res, next) => {
  try {
    const { category_id, search, available_only } = req.query;

    // 1. Prioritaskan PostgreSQL Lokal (Pool)
    if (pool) {
      let queryText = `
        SELECT 
          p.id, p.category_id, p.name, p.description, p.price, p.image_url, p.is_available, p.created_at, p.updated_at,
          CASE 
            WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'icon', c.icon)
            ELSE NULL 
          END as categories
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
      `;
      const queryParams = [];

      if (category_id) {
        queryParams.push(Number(category_id));
        queryText += ` AND p.category_id = $${queryParams.length}`;
      }
      if (search) {
        queryParams.push(`%${search}%`);
        queryText += ` AND p.name ILIKE $${queryParams.length}`;
      }
      if (available_only === 'true') {
        queryText += ` AND p.is_available = true`;
      }

      queryText += ` ORDER BY p.id ASC`;

      const result = await pool.query(queryText, queryParams);
      return successResponse(res, 'Daftar produk berhasil diambil (PostgreSQL).', result.rows);
    }

    // 2. Supabase Cloud
    if (supabase) {
      let query = supabase
        .from('products')
        .select('*, categories(id, name, slug, icon)')
        .order('id', { ascending: true });

      if (category_id) {
        query = query.eq('category_id', category_id);
      }
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      if (available_only === 'true') {
        query = query.eq('is_available', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return successResponse(res, 'Daftar produk berhasil diambil (Supabase).', data);
    }

    // 3. Mock fallback
    let filtered = [...mockProducts];
    if (category_id) {
      filtered = filtered.filter(p => String(p.category_id) === String(category_id));
    }
    if (search) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (available_only === 'true') {
      filtered = filtered.filter(p => p.is_available === true);
    }

    return successResponse(res, 'Daftar produk berhasil diambil (Mock).', filtered);
  } catch (error) {
    next(error);
  }
};

/**
 * Detail Produk
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (pool) {
      const queryText = `
        SELECT 
          p.id, p.category_id, p.name, p.description, p.price, p.image_url, p.is_available, p.created_at, p.updated_at,
          CASE 
            WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'icon', c.icon)
            ELSE NULL 
          END as categories
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `;
      const result = await pool.query(queryText, [id]);
      if (result.rowCount === 0) return errorResponse(res, 'Produk tidak ditemukan.', null, 404);
      return successResponse(res, 'Detail produk berhasil diambil (PostgreSQL).', result.rows[0]);
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name, slug, icon)')
        .eq('id', id)
        .single();

      if (error || !data) return errorResponse(res, 'Produk tidak ditemukan.', null, 404);
      return successResponse(res, 'Detail produk berhasil diambil.', data);
    }

    const found = mockProducts.find(p => String(p.id) === String(id));
    if (!found) return errorResponse(res, 'Produk tidak ditemukan.', null, 404);
    return successResponse(res, 'Detail produk berhasil diambil (Mock).', found);
  } catch (error) {
    next(error);
  }
};

/**
 * Tambah Produk Baru
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
  try {
    const { category_id, name, description, price, image_url, is_available = true } = req.body;

    if (!name || price === undefined) {
      return errorResponse(res, 'Nama produk dan harga wajib diisi.', null, 400);
    }

    const finalImage = (image_url && image_url.trim()) ? image_url.trim() : getDefaultImageUrl(category_id);

    const payload = {
      category_id: category_id ? Number(category_id) : null,
      name: name.trim(),
      description: description || '',
      price: Number(price),
      image_url: finalImage,
      is_available: is_available !== false,
    };

    if (pool) {
      const queryText = `
        INSERT INTO products (category_id, name, description, price, image_url, is_available)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const result = await pool.query(queryText, [
        payload.category_id,
        payload.name,
        payload.description,
        payload.price,
        payload.image_url,
        payload.is_available
      ]);

      const inserted = result.rows[0];
      // Ambil detail dengan category join
      const fullRes = await pool.query(`
        SELECT p.*, json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'icon', c.icon) as categories
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `, [inserted.id]);

      return successResponse(res, 'Produk berhasil ditambahkan (PostgreSQL).', fullRes.rows[0] || inserted, 201);
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select('*, categories(id, name, slug, icon)')
        .single();

      if (error) throw error;
      return successResponse(res, 'Produk berhasil ditambahkan.', data, 201);
    }

    const newProduct = { id: Date.now(), ...payload };
    mockProducts.push(newProduct);
    return successResponse(res, 'Produk berhasil ditambahkan (Mock).', newProduct, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Edit Produk
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, image_url, is_available } = req.body;

    if (pool) {
      const updates = [];
      const values = [];

      if (category_id !== undefined) {
        values.push(category_id ? Number(category_id) : null);
        updates.push(`category_id = $${values.length}`);
      }
      if (name !== undefined) {
        values.push(name.trim());
        updates.push(`name = $${values.length}`);
      }
      if (description !== undefined) {
        values.push(description);
        updates.push(`description = $${values.length}`);
      }
      if (price !== undefined) {
        values.push(Number(price));
        updates.push(`price = $${values.length}`);
      }
      if (image_url !== undefined) {
        values.push(image_url);
        updates.push(`image_url = $${values.length}`);
      }
      if (is_available !== undefined) {
        values.push(is_available === true || is_available === 'true');
        updates.push(`is_available = $${values.length}`);
      }

      values.push(new Date());
      updates.push(`updated_at = $${values.length}`);

      values.push(id);
      const queryText = `
        UPDATE products 
        SET ${updates.join(', ')} 
        WHERE id = $${values.length} 
        RETURNING *;
      `;

      const result = await pool.query(queryText, values);
      if (result.rowCount === 0) return errorResponse(res, 'Produk tidak ditemukan.', null, 404);

      const fullRes = await pool.query(`
        SELECT p.*, json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'icon', c.icon) as categories
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `, [id]);

      return successResponse(res, 'Produk berhasil diperbarui (PostgreSQL).', fullRes.rows[0] || result.rows[0]);
    }

    if (supabase) {
      const updates = {};
      if (category_id !== undefined) updates.category_id = category_id ? Number(category_id) : null;
      if (name !== undefined) updates.name = name.trim();
      if (description !== undefined) updates.description = description;
      if (price !== undefined) updates.price = Number(price);
      if (image_url !== undefined) updates.image_url = image_url;
      if (is_available !== undefined) updates.is_available = is_available;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select('*, categories(id, name, slug, icon)')
        .single();

      if (error) throw error;
      return successResponse(res, 'Produk berhasil diperbarui.', data);
    }

    const index = mockProducts.findIndex(p => String(p.id) === String(id));
    if (index === -1) return errorResponse(res, 'Produk tidak ditemukan.', null, 404);

    mockProducts[index] = { ...mockProducts[index], ...req.body };
    return successResponse(res, 'Produk berhasil diperbarui (Mock).', mockProducts[index]);
  } catch (error) {
    next(error);
  }
};

/**
 * Hapus Produk
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (pool) {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return successResponse(res, 'Produk berhasil dihapus (PostgreSQL).', null);
    }

    if (supabase) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return successResponse(res, 'Produk berhasil dihapus.', null);
    }

    mockProducts = mockProducts.filter(p => String(p.id) !== String(id));
    return successResponse(res, 'Produk berhasil dihapus (Mock).', null);
  } catch (error) {
    next(error);
  }
};

/**
 * Generate AI Description via Gemini API
 * POST /api/products/generate-description
 */
const generateAiDescription = async (req, res, next) => {
  try {
    const { name, category } = req.body;

    if (!name) {
      return errorResponse(res, 'Nama produk wajib dicantumkan untuk generate deskripsi.', null, 400);
    }

    const description = await generateMenuDescription(name, category || 'Coffee');

    return successResponse(res, 'Deskripsi AI berhasil dibuat.', {
      name,
      category,
      description,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  generateAiDescription,
};
