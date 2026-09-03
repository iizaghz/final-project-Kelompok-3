import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Coffee, AlertCircle, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import CartDrawer from '../components/CartDrawer';
import CheckoutModal from '../components/CheckoutModal';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

export default function MenuPage() {
  const { totalItems, totalAmount, tableNumber, setTableNumber } = useCart();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [catRes, prodRes] = await Promise.all([
        api.getCategories(),
        api.getProducts(),
      ]);

      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
    } catch (err) {
      setFetchError(err.message || 'Gagal memuat menu coffee shop.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(number) || 0);
  };

  // Filtered Products (Safe null checks)
  const productList = Array.isArray(products) ? products : [];
  const filteredProducts = productList.filter((product) => {
    if (!product) return false;

    const matchCategory =
      activeCategory === 'all' ||
      String(product.category_id) === String(activeCategory) ||
      (product.categories && (product.categories.slug === activeCategory || String(product.categories.id) === String(activeCategory)));

    const matchSearch =
      !searchQuery.trim() ||
      (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF5ED] pb-24 md:pb-12 text-coffee-950">
      
      {/* Top Navbar */}
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 space-y-6">
        
        {/* Hero & Table Identifier Banner */}
        <section className="bg-white rounded-3xl border border-coffee-200/80 p-5 sm:p-7 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-terracotta-100 text-terracotta-700 text-[11px] font-bold uppercase tracking-wider">
                QR Self-Order
              </span>
              <span className="text-xs text-coffee-600 font-medium">
                Pesan langsung dari meja
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950">
              Selamat Menikmati Kopi Senja
            </h1>
            <p className="text-xs sm:text-sm text-coffee-600 mt-1 max-w-lg">
              Pilih menu favoritmu, masukkan catatan khusus, dan bayar dengan fleksibel via QRIS atau di kasir.
            </p>
          </div>

          {/* Table Selector Card */}
          <div className="bg-coffee-50/80 p-3 sm:p-3.5 rounded-2xl border border-coffee-200/80 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-coffee-800 flex items-center justify-center shadow-xs">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-coffee-500 block leading-tight">
                Lokasi Pemesanan
              </span>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Pilih Meja / Takeaway"
                className="bg-transparent font-bold text-xs sm:text-sm text-coffee-900 focus:outline-none focus:border-b border-terracotta-500 w-36 placeholder:font-normal placeholder:text-coffee-400"
              />
            </div>
          </div>
        </section>

        {/* Search Bar & Category Filter */}
        <section className="space-y-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-coffee-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kopi, latte, croissant, atau camilan..."
              className="w-full text-xs sm:text-sm pl-11 pr-4 py-3 rounded-2xl bg-white border border-coffee-200 shadow-soft focus:outline-none focus:ring-2 focus:ring-terracotta-500 transition-all text-coffee-900 placeholder:text-coffee-400"
            />
          </div>

          {/* Category Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[40px] ${
                activeCategory === 'all'
                  ? 'bg-coffee-900 text-white shadow-soft'
                  : 'bg-white text-coffee-700 hover:bg-coffee-100 border border-coffee-200'
              }`}
            >
              Semua Menu
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(String(cat.id))}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[40px] ${
                  activeCategory === String(cat.id)
                    ? 'bg-coffee-900 text-white shadow-soft'
                    : 'bg-white text-coffee-700 hover:bg-coffee-100 border border-coffee-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid State */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-coffee-200 p-4 animate-pulse space-y-3">
                <div className="w-full aspect-square bg-coffee-100 rounded-xl" />
                <div className="h-4 bg-coffee-100 rounded w-3/4" />
                <div className="h-3 bg-coffee-100 rounded w-1/2" />
                <div className="h-6 bg-coffee-100 rounded w-full pt-2" />
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="bg-white rounded-3xl border border-red-200 p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h2 className="font-bold text-coffee-900 text-base">Gagal Memuat Menu</h2>
            <p className="text-xs text-coffee-600 max-w-sm mx-auto">{fetchError}</p>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-coffee-900 text-white text-xs font-bold rounded-xl"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-coffee-200 p-12 text-center space-y-2">
            <Coffee className="w-12 h-12 text-coffee-400 mx-auto" />
            <h2 className="font-bold text-coffee-900 text-base">Menu Tidak Ditemukan</h2>
            <p className="text-xs text-coffee-600">
              Tidak ada menu yang sesuai dengan kata kunci "{searchQuery}".
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </section>
        )}

      </main>

      {/* Floating Action Cart Bar (Mobile) */}
      {totalItems > 0 && (
        <aside 
          aria-label="Keranjang Pemesanan Cepat"
          className="fixed bottom-20 sm:bottom-6 left-4 right-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom-5 duration-300"
        >
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Buka keranjang, total ${totalItems} item seharga ${formatRupiah(totalAmount)}`}
            className="w-full bg-coffee-950 text-white p-3.5 sm:p-4 rounded-2xl shadow-floating flex items-center justify-between hover:bg-black transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-terracotta-500 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                {totalItems}
              </div>
              <div className="text-left">
                <span className="text-xs text-coffee-300 font-medium block">Total Pembayaran</span>
                <span className="font-serif font-bold text-sm sm:text-base text-white block">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-terracotta-400 group-hover:translate-x-0.5 transition-transform">
              <span>Lihat Pesanan</span>
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
          </button>
        </aside>
      )}

      {/* Bottom Navigation for Mobile */}
      <BottomNav />

      {/* Modals & Drawers */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

    </div>
  );
}
