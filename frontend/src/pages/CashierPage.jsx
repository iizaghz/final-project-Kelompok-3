import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Coffee, RefreshCw, 
  Store, Plus, Edit2, Trash2, Check, X,
  ShoppingBag, Mail, Lock, Loader2, Bot,
  UploadCloud, Link as LinkIcon, Image as ImageIcon
} from 'lucide-react';
import CashierNavbar from '../components/CashierNavbar';
import api from '../utils/api';

export default function CashierPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu'
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(null);

  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('kopi_senja_token'));
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Form State for Menu Management
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    image_url: '',
    is_available: true,
  });
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await api.login(loginEmail.trim(), loginPassword);
      if (res.success && res.data?.token) {
        localStorage.setItem('kopi_senja_token', res.data.token);
        localStorage.setItem('kopi_senja_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
      } else {
        throw new Error(res.message || 'Login gagal.');
      }
    } catch (err) {
      setLoginError(err.message || 'Email atau kata sandi tidak valid.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoFill = () => {
    setLoginEmail('kasir@kopisenja.com');
    setLoginPassword('kasir123');
  };

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [orderRes, prodRes, catRes] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
        api.getCategories(),
      ]);

      setOrders(orderRes.data || []);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.warn('Failed loading cashier data:', err.message);
      if (err.message && err.message.includes('Token')) {
        localStorage.removeItem('kopi_senja_token');
        setToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
      const interval = setInterval(loadData, 4000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Actions
  const handleConfirmCashierPayment = async (orderId) => {
    setIsUpdating(orderId);
    try {
      await api.confirmCashierPayment(orderId);
      await loadData();
    } catch (err) {
      alert(err.message || 'Gagal mengonfirmasi pembayaran');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setIsUpdating(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadData();
    } catch (err) {
      alert(err.message || 'Gagal mengubah status');
    } finally {
      setIsUpdating(null);
    }
  };

  // AI Gemini Generator
  const handleGenerateAi = async () => {
    if (!productForm.name) {
      alert('Masukkan nama produk terlebih dahulu.');
      return;
    }

    setIsAiGenerating(true);
    try {
      const cat = categories.find((c) => String(c.id) === String(productForm.category_id));
      const res = await api.generateDescription(productForm.name, cat?.name || 'Coffee');
      if (res.success && res.data?.description) {
        setProductForm((prev) => ({ ...prev, description: res.data.description }));
      }
    } catch (err) {
      alert(err.message || 'Gagal generate AI');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Upload & Kompresi Foto Produk (Maks 800px, JPEG 0.85)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Ukuran file maksimal 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProductForm((prev) => ({ ...prev, image_url: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Save Product (Create / Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productForm);
      } else {
        await api.createProduct(productForm);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', category_id: '', price: '', description: '', image_url: '', is_available: true });
      await loadData();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan produk');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Hapus produk ini?')) return;
    try {
      await api.deleteProduct(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Gagal menghapus produk');
    }
  };

  // Metrics
  const countPending = orders.filter((o) => o.order_status === 'pending_payment').length;
  const countProcessing = orders.filter((o) => o.order_status === 'processing').length;
  const countReady = orders.filter((o) => o.order_status === 'ready').length;
  const countCompleted = orders.filter((o) => o.order_status === 'completed').length;

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.order_status === statusFilter;
  });

  // TAMPILAN LOGIN KHUSUS KASIR JIKA BELUM AUTENTIKASI
  if (!token) {
    return (
      <div className="min-h-screen bg-[#FAF5ED] flex items-center justify-center p-4 text-coffee-950">
        <div className="w-full max-w-md bg-white rounded-3xl border border-coffee-200 shadow-floating p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-coffee-950 text-white flex items-center justify-center mx-auto shadow-soft">
              <Coffee className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-coffee-950">
              Portal Kasir Kopi Senja
            </h1>
            <p className="text-xs text-coffee-600">
              Silakan masuk dengan akun staf atau kasir untuk mengelola operasional
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-coffee-900 mb-1">
                Email Kasir
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-coffee-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="kasir@kopisenja.com"
                  className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-coffee-200 bg-coffee-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500 transition-all text-coffee-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-coffee-900 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-coffee-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl border border-coffee-200 bg-coffee-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500 transition-all text-coffee-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-soft transition-all min-h-[46px]"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard Kasir</span>
              )}
            </button>
          </form>

          {/* Quick Demo Button */}
          <div className="pt-2 border-t border-coffee-100 text-center">
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-xs text-coffee-600 hover:text-terracotta-600 font-medium py-1 px-3 rounded-lg hover:bg-coffee-50 transition-colors"
            >
              Gunakan Akun Demo Kasir
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TAMPILAN DASHBOARD UTAMA KASIR
  return (
    <div className="min-h-screen bg-[#FAF5ED] pb-12 text-coffee-950">
      
      {/* Navbar Khusus Kasir */}
      <CashierNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Metrics Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-coffee-200/80 shadow-soft space-y-1">
            <span className="text-[11px] font-bold text-coffee-500 uppercase">Menunggu Bayar</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-terracotta-600">{countPending}</span>
              <Store className="w-5 h-5 text-terracotta-400" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-coffee-200/80 shadow-soft space-y-1">
            <span className="text-[11px] font-bold text-coffee-500 uppercase">Sedang Diracik</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-600">{countProcessing}</span>
              <Coffee className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-coffee-200/80 shadow-soft space-y-1">
            <span className="text-[11px] font-bold text-coffee-500 uppercase">Siap Diambil</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-sage-600">{countReady}</span>
              <CheckCircle2 className="w-5 h-5 text-sage-500" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-coffee-200/80 shadow-soft space-y-1">
            <span className="text-[11px] font-bold text-coffee-500 uppercase">Pesanan Selesai</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-coffee-900">{countCompleted}</span>
              <CheckCircle2 className="w-5 h-5 text-coffee-400" />
            </div>
          </div>
        </section>

        {/* Tab 1: Orders Management */}
        {activeTab === 'orders' && (
          <section className="space-y-4">
            
            {/* Filter Buttons & Refresh */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-coffee-200 shadow-soft">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { key: 'all', label: 'Semua' },
                  { key: 'pending_payment', label: 'Menunggu Bayar' },
                  { key: 'processing', label: 'Sedang Diracik' },
                  { key: 'ready', label: 'Siap Diambil' },
                  { key: 'completed', label: 'Selesai' },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setStatusFilter(f.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      statusFilter === f.key
                        ? 'bg-coffee-900 text-white shadow-xs'
                        : 'text-coffee-700 hover:bg-coffee-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={loadData}
                className="flex items-center gap-1.5 text-xs font-semibold text-coffee-600 hover:text-coffee-950 p-2 rounded-xl hover:bg-coffee-100 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Segarkan Data</span>
              </button>
            </div>

            {/* Orders Cards / Grid */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-coffee-200 p-12 text-center space-y-2">
                <ShoppingBag className="w-10 h-10 text-coffee-300 mx-auto" />
                <h3 className="font-bold text-coffee-800 text-sm">Tidak Ada Pesanan</h3>
                <p className="text-xs text-coffee-500">
                  Belum ada pesanan dengan status "{statusFilter}".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => {
                  const items = order.order_items || order.items || [];
                  const isPending = order.order_status === 'pending_payment';
                  const isProcessing = order.order_status === 'processing';
                  const isReady = order.order_status === 'ready';

                  return (
                    <article
                      key={order.id}
                      className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-soft flex flex-col justify-between space-y-4 transition-all ${
                        isReady 
                          ? 'border-sage-500 ring-2 ring-sage-200' 
                          : isProcessing 
                          ? 'border-amber-400' 
                          : isPending 
                          ? 'border-terracotta-300' 
                          : 'border-coffee-200'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-coffee-100 pb-3">
                        <div>
                          <span className="text-2xl font-serif font-black text-coffee-950 block">
                            {order.queue_number}
                          </span>
                          <span className="text-xs font-bold text-coffee-900 block">
                            {order.customer_name}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isReady
                              ? 'bg-sage-100 text-sage-800'
                              : isProcessing
                              ? 'bg-amber-100 text-amber-800'
                              : isPending
                              ? 'bg-terracotta-100 text-terracotta-800'
                              : 'bg-coffee-100 text-coffee-800'
                          }`}>
                            {order.order_status.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-coffee-500 block mt-1">
                            {order.table_number || 'Dine In'}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-1.5 text-xs flex-1">
                        {items.map((it, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-semibold text-coffee-900">
                                {it.quantity}x {it.products?.name || it.product_name || 'Menu'}
                              </span>
                              {it.notes && (
                                <p className="text-[10px] text-terracotta-700 italic">
                                  Catatan: {it.notes}
                                </p>
                              )}
                            </div>
                            <span className="text-coffee-600 font-medium shrink-0">
                              {formatRupiah(it.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Card Total & Method */}
                      <div className="pt-2 border-t border-coffee-100 flex items-center justify-between text-xs">
                        <span className="text-coffee-600 font-medium">
                          {order.payment_method === 'cashier' ? 'Bayar di Kasir' : 'QRIS iPaymu'}
                        </span>
                        <span className="font-bold text-sm text-coffee-950 font-serif">
                          {formatRupiah(order.total_amount)}
                        </span>
                      </div>

                      {/* Workflow Action Buttons */}
                      <div className="pt-2 space-y-2">
                        {/* 1. If Bayar di Kasir & Pending -> Konfirmasi Pembayaran */}
                        {isPending && order.payment_method === 'cashier' && (
                          <button
                            type="button"
                            disabled={isUpdating === order.id}
                            onClick={() => handleConfirmCashierPayment(order.id)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-xs transition-colors min-h-[40px]"
                          >
                            <Check className="w-4 h-4" />
                            <span>Konfirmasi Pembayaran Kasir</span>
                          </button>
                        )}

                        {/* 2. If Processing -> Pesanan Siap Diambil */}
                        {isProcessing && (
                          <button
                            type="button"
                            disabled={isUpdating === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'ready')}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-bold text-xs shadow-xs transition-colors min-h-[40px]"
                          >
                            <Check className="w-4 h-4" />
                            <span>Pesanan Siap Diambil</span>
                          </button>
                        )}

                        {/* 3. If Ready -> Serahkan Pesanan (Selesai) */}
                        {isReady && (
                          <button
                            type="button"
                            disabled={isUpdating === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-coffee-900 hover:bg-coffee-800 text-white font-bold text-xs shadow-xs transition-colors min-h-[40px]"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Serahkan Pesanan (Selesai)</span>
                          </button>
                        )}
                      </div>

                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Menu & Gemini AI Management */}
        {activeTab === 'menu' && (
          <section className="space-y-4">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-coffee-200 shadow-soft">
              <div>
                <h3 className="font-bold text-base text-coffee-950">
                  Daftar Produk Coffee Shop
                </h3>
                <p className="text-xs text-coffee-600">
                  Kelola nama, harga, stok, dan generate deskripsi dengan AI Gemini
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: '', category_id: categories[0]?.id || '', price: '', description: '', image_url: '', is_available: true });
                  setShowProductModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl text-xs font-bold shadow-soft transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Menu</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-coffee-200 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-coffee-50/80 border-b border-coffee-200 text-coffee-700 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3.5">Produk</th>
                      <th className="p-3.5">Kategori</th>
                      <th className="p-3.5">Harga</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-coffee-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-coffee-50/40 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={p.image_url || (p.category_id === 4 ? 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60' : 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60')}
                            alt={p.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60';
                            }}
                            className="w-10 h-10 rounded-lg object-cover bg-coffee-100 shrink-0 border border-coffee-200"
                          />
                          <div>
                            <span className="font-bold text-coffee-950 block">{p.name}</span>
                            <span className="text-[11px] text-coffee-500 line-clamp-1 max-w-xs">{p.description}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-medium text-coffee-700">
                          {p.categories?.name || categories.find(c => String(c.id) === String(p.category_id))?.name || 'Signature Coffee'}
                        </td>
                        <td className="p-3.5 font-bold text-coffee-900">
                          {formatRupiah(p.price)}
                        </td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={async () => {
                              await api.updateProduct(p.id, { is_available: !p.is_available });
                              loadData();
                            }}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              p.is_available !== false
                                ? 'bg-sage-100 text-sage-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.is_available !== false ? 'Tersedia' : 'Habis'}
                          </button>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setProductForm({
                                name: p.name,
                                category_id: p.category_id || '',
                                price: p.price,
                                description: p.description || '',
                                image_url: p.image_url || '',
                                is_available: p.is_available !== false,
                              });
                              setShowProductModal(true);
                            }}
                            className="p-1.5 rounded-lg text-coffee-700 hover:bg-coffee-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </section>
        )}

      </main>

      {/* Product Form Modal */}
      {showProductModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-coffee-950/40 backdrop-blur-xs p-4"
          onClick={() => setShowProductModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl border border-coffee-200 shadow-floating p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-coffee-100 pb-3">
              <h3 className="font-bold text-base text-coffee-950 font-serif">
                {editingProduct ? 'Edit Menu' : 'Tambah Menu Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-1 rounded-lg text-coffee-600 hover:bg-coffee-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-coffee-900 mb-1">
                  Nama Menu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Contoh: Kopi Aren Gula Senja"
                  className="w-full text-xs p-2.5 rounded-xl border border-coffee-200 bg-coffee-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-coffee-900 mb-1">
                    Kategori
                  </label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-coffee-200 bg-coffee-50/40 focus:bg-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-coffee-900 mb-1">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="22000"
                    className="w-full text-xs p-2.5 rounded-xl border border-coffee-200 bg-coffee-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-coffee-900">
                    Deskripsi Menu
                  </label>
                  
                  {/* Gemini AI Generator Button */}
                  <button
                    type="button"
                    disabled={isAiGenerating}
                    onClick={handleGenerateAi}
                    className="flex items-center gap-1 text-[11px] font-bold text-terracotta-600 hover:text-terracotta-700 bg-terracotta-50 px-2 py-1 rounded-md"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{isAiGenerating ? 'AI Sedang Menulis...' : 'Generate AI Gemini'}</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Tulis deskripsi rasa kopi atau klik tombol Generate AI..."
                  className="w-full text-xs p-2.5 rounded-xl border border-coffee-200 bg-coffee-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                />
              </div>

              {/* Foto Produk / Menu Upload & Preview */}
              <div>
                <label className="block text-xs font-semibold text-coffee-900 mb-1.5">
                  Foto Produk / Menu
                </label>

                {productForm.image_url ? (
                  <div className="relative rounded-2xl border border-coffee-200 overflow-hidden bg-coffee-50/60 p-2.5 flex items-center gap-3">
                    <img
                      src={productForm.image_url}
                      alt="Preview Foto Menu"
                      className="w-16 h-16 rounded-xl object-cover border border-coffee-200 bg-white shrink-0 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-coffee-900 block truncate">
                        Foto Siap Digunakan
                      </span>
                      <span className="text-[11px] text-coffee-500 block">
                        Tersimpan otomatis saat klik Simpan
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white border border-coffee-200 hover:bg-coffee-50 text-coffee-800 text-xs font-bold transition-colors shadow-2xs">
                        <span>Ganti</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, image_url: '' })}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-coffee-300 hover:border-terracotta-500 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-coffee-50/40 hover:bg-coffee-50/80 transition-all text-center group">
                    <div className="w-11 h-11 rounded-2xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-coffee-900 block">
                        Klik untuk Upload Foto dari Komputer / HP
                      </span>
                      <span className="text-[11px] text-coffee-500 block mt-0.5">
                        Format JPG, PNG, atau WebP (Otomatis dioptimasi)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Alternatif Input via Link URL */}
                <div className="mt-2 text-right">
                  <details className="text-left text-xs group">
                    <summary className="text-[11px] font-semibold text-terracotta-600 hover:text-terracotta-700 cursor-pointer list-none flex items-center justify-end gap-1 select-none">
                      <LinkIcon className="w-3 h-3" />
                      <span>Atau gunakan tautan URL gambar</span>
                    </summary>
                    <div className="mt-2 pt-2 border-t border-coffee-100">
                      <input
                        type="url"
                        value={productForm.image_url && !productForm.image_url.startsWith('data:') ? productForm.image_url : ''}
                        onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full text-xs p-2.5 rounded-xl border border-coffee-200 bg-coffee-50/40 focus:bg-white focus:outline-none text-coffee-900"
                      />
                    </div>
                  </details>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-coffee-200 text-xs font-bold text-coffee-700 hover:bg-coffee-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold shadow-soft"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
