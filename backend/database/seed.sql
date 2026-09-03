-- ====================================================================
-- SEED DATA AWAL - KOPI SENJA COFFEE SHOP
-- ====================================================================

-- 1. Akun Kasir & Admin Default
-- Password default: "kasir123" (bcrypt hash)
INSERT INTO users (id, name, email, password, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'Kasir Utama', 'kasir@kopisenja.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'kasir'),
('00000000-0000-0000-0000-000000000002', 'Admin Toko', 'admin@kopisenja.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 2. Kategori Produk
INSERT INTO categories (id, name, slug, icon) VALUES 
(1, 'Signature Coffee', 'signature-coffee', 'sparkles'),
(2, 'Espresso Based', 'espresso-based', 'coffee'),
(3, 'Non-Coffee & Tea', 'non-coffee', 'cup-soda'),
(4, 'Pastry & Snacks', 'pastry-snacks', 'croissant')
ON CONFLICT (id) DO NOTHING;

-- 3. Produk Menu
INSERT INTO products (category_id, name, description, price, image_url, is_available) VALUES 
(1, 'Kopi Senja Aren', 'Perpaduan espresso double shot arabika pilihan dengan susu segar dan gula aren murni khas Nusantara yang lembut dan creamy.', 22000, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60', true),
(1, 'Creamy Lotus Biscoff Coffee', 'Espresso aromatik berpadu saus karamel lembut dan taburan biskuit Lotus Biscoff renyah yang memanjakan lidah.', 28000, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60', true),
(2, 'Caffe Americano (Iced/Hot)', 'Ekstraksi murni espresso dengan air panas/dingin menghasilkan cita rasa kopi yang bersih, tajam, dan menyegarkan.', 18000, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60', true),
(2, 'Caramel Macchiato', 'Espresso pekat yang dituangkan di atas steamed milk manis dengan siraman saus karamel gurih berlapis.', 26000, 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&auto=format&fit=crop&q=60', true),
(2, 'Vanilla Cafe Latte', 'Paduan espresso seimbang dengan susu steamed lembut dan sentuhan aroma vanilla alami khas Madagaskar.', 24000, 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&auto=format&fit=crop&q=60', true),
(3, 'Matcha Green Tea Latte', 'Bubuk matcha murni impor dari Uji, Jepang yang dipadukan dengan fresh milk lembut dan aroma teh hijau autentik.', 25000, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60', true),
(3, 'Dark Chocolate Delight', 'Cokelat hitam premium pekat dengan susu hangat kaya rasa, tidak terlalu manis dan memiliki aftertaste gurih.', 24000, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&auto=format&fit=crop&q=60', true),
(4, 'Butter Croissant', 'Pastry klasik Prancis berlapis renyah di luar dan empuk lembut di dalam dengan aroma butter Prancis yang harum.', 20000, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60', true),
(4, 'Fudgy Brownie Bites', 'Potongan kue brownies cokelat panggang dengan tekstur fudgy lumer di bagian tengah dan crinkly top renyah.', 18000, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60', true);
