import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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
      <Route path="*" element={<CatalogPreview />} />
    </Routes>
  );
}

export default AppRoutes;
