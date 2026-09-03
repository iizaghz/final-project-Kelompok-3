import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import MenuPage from '../pages/MenuPage';
import QueuePage from '../pages/QueuePage';
import DisplayPage from '../pages/DisplayPage';
import CashierPage from '../pages/CashierPage';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';

function CatalogPreview() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const sampleProduct = {
    id: 'sample-1',
    name: 'Caramel Macchiato',
    category: 'Coffee',
    price: 32000,
    description: 'Espresso dengan paduan susu segar gurih, sirup vanila lembut, dan saus karamel premium di atasnya.',
    image_url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&auto=format&fit=crop&q=60'
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-amber-500 mb-4">Modul Produk & Kategori (Iza)</h1>
        <p className="text-sm text-slate-400 mb-6">Preview komponen ProductCard & ProductDetailModal</p>
        <ProductCard product={sampleProduct} onSelect={(p) => setSelectedProduct(p)} />
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(item) => {
              alert(`Item ${item.name} ditambahkan!`);
              setSelectedProduct(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Modul Pelanggan: Self-Order Menu & Checkout (Tasya) */}
      <Route path="/" element={<MenuPage />} />
      <Route path="/menu" element={<MenuPage />} />

      {/* Modul Pelanggan: Live Tracking & Antrian Mandiri (Tasya) */}
      <Route path="/antrian" element={<QueuePage />} />
      <Route path="/track/:orderId" element={<QueuePage />} />

      {/* Modul Kasir: Manajemen Pesanan & Operasional (Putri) */}
      <Route path="/kasir" element={<CashierPage />} />
      <Route path="/orders" element={<CashierPage />} />

      {/* Modul Display TV: Layar Pemanggil Antrian Publik Kafe (Salwa) */}
      <Route path="/display" element={<DisplayPage />} />
      <Route path="/tv" element={<DisplayPage />} />
      <Route path="/display-antrian" element={<DisplayPage />} />

      {/* Modul Produk & Kategori: Preview Komponen (Iza) */}
      <Route path="/catalog" element={<CatalogPreview />} />
      <Route path="/katalog" element={<CatalogPreview />} />
      <Route path="/produk" element={<CatalogPreview />} />

      {/* Fallback */}
      <Route path="*" element={<MenuPage />} />
    </Routes>
  );
}

export default AppRoutes;
