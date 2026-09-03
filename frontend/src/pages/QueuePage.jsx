import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  CheckCircle2, Clock, Coffee, RotateCw, 
  Plus, Search, AlertCircle, QrCode,
  Layers, ArrowRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

export default function QueuePage() {
  const { orderId } = useParams();
  const { activeOrder, setActiveOrder } = useCart();

  // Public Queue Board State
  const [queueBoard, setQueueBoard] = useState({ ready: [], processing: [], pending: [], totalActive: 0 });
  const [isBoardLoading, setIsBoardLoading] = useState(true);

  // Individual Order Tracking State
  const [currentOrder, setCurrentOrder] = useState(activeOrder);
  const [searchCode, setSearchCode] = useState(orderId || '');
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // Load Papan Antrian Umum (Public Board)
  const fetchQueueBoard = async () => {
    try {
      const res = await api.getQueueDisplay();
      if (res.success && res.data) {
        setQueueBoard(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data antrian umum:', err);
    } finally {
      setIsBoardLoading(false);
    }
  };

  // Poll individual order status (Safe handling for background polling vs manual search)
  const fetchSpecificOrder = async (idOrQueue, isManual = false) => {
    if (!idOrQueue) return;
    if (isManual) {
      setIsTrackingLoading(true);
      setErrorMsg('');
    }

    try {
      const res = await api.trackOrder(idOrQueue);
      if (res.success && res.data) {
        const orderData = res.data;
        setCurrentOrder(orderData);
        if (isManual) setErrorMsg('');

        if (activeOrder && (activeOrder.id === orderData.id || activeOrder.queue_number === orderData.queue_number)) {
          setActiveOrder(orderData);
        }
      } else {
        throw new Error(res.message || 'Pesanan tidak ditemukan');
      }
    } catch (err) {
      if (isManual) {
        setErrorMsg('Nomor antrian tidak ditemukan.');
      } else {
        // Jika tiket di memori lokal sudah dihapus / tidak ada di DB, bersihkan otomatis tanpa spam error
        setCurrentOrder(null);
        setActiveOrder(null);
        localStorage.removeItem('kopi_senja_active_order');
      }
    } finally {
      if (isManual) setIsTrackingLoading(false);
    }
  };

  // Inisialisasi polling berkala tiap 4 detik
  useEffect(() => {
    fetchQueueBoard();
    const interval = setInterval(() => {
      fetchQueueBoard();
      if (currentOrder?.id || currentOrder?.queue_number) {
        fetchSpecificOrder(currentOrder.id || currentOrder.queue_number, false);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentOrder?.id, currentOrder?.queue_number]);

  // Handle Search Submission (Manual Search)
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    fetchSpecificOrder(searchCode.trim(), true);
  };

  // Simulate Payment Success (QRIS Demo)
  const handleSimulatePayment = async () => {
    if (!currentOrder) return;
    setIsSimulating(true);
    try {
      const res = await api.simulatePaymentSuccess(currentOrder.id);
      if (res.success) {
        await fetchSpecificOrder(currentOrder.id, false);
        fetchQueueBoard();
      }
    } catch (err) {
      alert(err.message || 'Simulasi pembayaran gagal');
    } finally {
      setIsSimulating(false);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(number) || 0);
  };

  const steps = [
    { key: 'pending_payment', label: 'Menunggu Bayar' },
    { key: 'processing', label: 'Sedang Diracik' },
    { key: 'ready', label: 'Siap Diambil' },
    { key: 'completed', label: 'Selesai' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending_payment': return 0;
      case 'processing': return 1;
      case 'ready': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const currentStepIndex = getStepIndex(currentOrder?.order_status);

  // Generate QR Value payload
  const getQrValue = () => {
    if (!currentOrder) return '';
    if (currentOrder.qris_url && !currentOrder.qris_url.startsWith('data:image') && !currentOrder.qris_url.startsWith('http')) {
      return currentOrder.qris_url;
    }
    return `00020101021226580016ID.CO.IPAYMU.WWW01189360091100000000000215${currentOrder.id || currentOrder.queue_number}52045812530336054${currentOrder.total_amount || 0}5802ID5910KOPI SENJA6007BANDUNG6304MOCK`;
  };

  return (
    <div className="min-h-screen bg-[#FAF5ED] pb-24 md:pb-12 text-coffee-950">
      
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 space-y-6">
        
        {/* Top Header Banner */}
        <section className="bg-white rounded-3xl border border-coffee-200 p-5 sm:p-7 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950">
              Papan Antrian & Status Pesanan
            </h1>
            <p className="text-xs sm:text-sm text-coffee-600 mt-1 max-w-lg">
              Pantau antrian pesanan yang sedang diracik barista atau siap diambil di konter pengambilan Kopi Senja.
            </p>
          </div>

          {/* Refresh Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                fetchQueueBoard();
                if (currentOrder) fetchSpecificOrder(currentOrder.id || currentOrder.queue_number, false);
              }}
              title="Perbarui Data Antrian"
              className="inline-flex items-center gap-2 px-4 py-2 bg-coffee-50 hover:bg-coffee-100 border border-coffee-200 rounded-xl text-coffee-800 text-xs font-semibold transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              <span>Segarkan</span>
            </button>
          </div>
        </section>

        {/* Search Bar for Any Specific Ticket */}
        <section className="bg-white rounded-2xl border border-coffee-200 p-4 shadow-soft">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-coffee-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Cari nomor antrian atau nama kamu (Contoh: A-001)..."
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 bg-coffee-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500 text-coffee-900 placeholder:text-coffee-400"
              />
            </div>
            <button
              type="submit"
              disabled={isTrackingLoading}
              className="px-5 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 active:scale-95 text-white font-bold text-xs shadow-soft transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isTrackingLoading ? 'Mencari...' : 'Cek Antrian'}</span>
            </button>
          </form>

          {errorMsg && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* BAGIAN 1: TIKET PRIBADI PELANGGAN (Jika sedang memiliki pesanan aktif) */}
        {/* ========================================================================= */}
        {currentOrder && (
          <section className="bg-white rounded-3xl border-2 border-terracotta-500/40 p-5 sm:p-7 shadow-card space-y-4 animate-in fade-in duration-300">
            
            <div className="flex items-center justify-between border-b border-coffee-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-terracotta-500" />
                <h2 className="font-bold text-sm text-coffee-950 uppercase tracking-wider">
                  Tiket Antrian Kamu
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentOrder(null);
                  setActiveOrder(null);
                  localStorage.removeItem('kopi_senja_active_order');
                }}
                className="text-[11px] font-semibold text-coffee-500 hover:text-red-600 transition-colors"
              >
                Tutup Tiket Pribadi
              </button>
            </div>

            {/* Status Hero Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              currentOrder.order_status === 'ready'
                ? 'bg-sage-50 border-sage-500/40 text-sage-900'
                : currentOrder.order_status === 'processing'
                ? 'bg-amber-50/60 border-amber-300 text-coffee-950'
                : currentOrder.order_status === 'completed'
                ? 'bg-coffee-50 border-coffee-300 text-coffee-950'
                : 'bg-coffee-50/80 border-coffee-200 text-coffee-950'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-coffee-200/60 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-coffee-600 block mb-0.5">
                    Nomor Antrian
                  </span>
                  <span className="text-4xl sm:text-5xl font-serif font-black text-coffee-950 tracking-tight block">
                    {currentOrder.queue_number}
                  </span>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-coffee-200 shadow-xs text-coffee-800">
                    <Clock className="w-3.5 h-3.5 text-terracotta-600" />
                    <span>{currentOrder.table_number || 'Dine In'}</span>
                  </span>
                  <p className="text-xs font-medium text-coffee-600 block">
                    Atas Nama: <strong className="text-coffee-900">{currentOrder.customer_name}</strong>
                  </p>
                </div>
              </div>

              {/* Status Message */}
              <div className="pt-3">
                {currentOrder.order_status === 'ready' ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sage-500 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-sage-900">
                        Pesananmu Sudah Siap Diambil!
                      </h3>
                      <p className="text-xs text-sage-700">
                        Silakan tunjukkan nomor <strong>{currentOrder.queue_number}</strong> ke konter barista.
                      </p>
                    </div>
                  </div>
                ) : currentOrder.order_status === 'processing' ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shrink-0">
                      <Coffee className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-coffee-950">
                        Barista Sedang Meracik Pesananmu
                      </h3>
                      <p className="text-xs text-coffee-600">
                        Mohon tunggu sebentar, nomor antrian akan dipanggil saat siap.
                      </p>
                    </div>
                  </div>
                ) : currentOrder.order_status === 'completed' ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-coffee-800 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-coffee-950">
                          Pesanan Telah Selesai
                        </h3>
                        <p className="text-xs text-coffee-600">
                          Terima kasih telah berkunjung ke Kopi Senja!
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveOrder(null);
                        setCurrentOrder(null);
                        localStorage.removeItem('kopi_senja_active_order');
                      }}
                      className="px-3 py-1.5 bg-terracotta-500 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Selesai
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-coffee-950">
                        Menunggu Konfirmasi Pembayaran
                      </h3>
                      <p className="text-xs text-coffee-600">
                        {currentOrder.payment_method === 'payment_gateway'
                          ? 'Selesaikan pembayaran QRIS berikut ini.'
                          : 'Silakan lakukan pembayaran tunai di meja kasir.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-4 gap-1.5 pt-4">
                {steps.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div key={step.key} className="text-center space-y-1">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isDone || isCurrent ? 'bg-terracotta-500' : 'bg-coffee-200'
                        } ${isCurrent ? 'ring-2 ring-terracotta-300' : ''}`}
                      />
                      <span className={`text-[10px] block font-bold leading-tight ${
                        isCurrent ? 'text-terracotta-600' : isDone ? 'text-coffee-900' : 'text-coffee-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QRIS Display jika pending payment (Tampil untuk seluruh pesanan yang belum dibayar) */}
            {currentOrder.order_status === 'pending_payment' && (
              <div className="bg-white p-6 rounded-2xl border-2 border-terracotta-500/40 text-center space-y-4 shadow-soft animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-center gap-2">
                  <QrCode className="w-5 h-5 text-terracotta-600" />
                  <span className="text-xs sm:text-sm font-bold text-terracotta-700 uppercase tracking-wider">
                    Scan QRIS untuk Bayar ({formatRupiah(currentOrder.total_amount)})
                  </span>
                </div>

                {/* Real-time High Resolution QR Code Renderer */}
                <div className="w-56 h-56 mx-auto p-3 bg-white border-2 border-coffee-300 rounded-2xl shadow-card flex items-center justify-center">
                  {currentOrder.qris_url && (currentOrder.qris_url.startsWith('data:image') || currentOrder.qris_url.startsWith('http')) ? (
                    <img
                      src={currentOrder.qris_url}
                      alt="QRIS Code"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <QRCodeSVG
                      value={getQrValue()}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  )}
                </div>

                <p className="text-xs text-coffee-600 max-w-sm mx-auto leading-relaxed">
                  Buka aplikasi <strong>BCA, GoPay, OVO, Dana, ShopeePay</strong> atau mobile banking lainnya, lalu scan kode QRIS di atas.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={handleSimulatePayment}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 active:scale-95 text-white rounded-xl text-xs font-bold shadow-soft transition-all"
                  >
                    <RotateCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
                    <span>{isSimulating ? 'Memverifikasi Pembayaran...' : 'Simulasi Pembayaran Berhasil'}</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* BAGIAN 2: PAPAN ANTRIAN UMUM SELURUH CAFE (Public Live Queue Board)      */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-terracotta-600" />
              <h2 className="font-serif font-bold text-lg text-coffee-950">
                Daftar Antrian Aktif ({queueBoard.totalActive || 0})
              </h2>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-terracotta-600 hover:text-terracotta-700"
            >
              <span>Pesan Menu Lain</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Kolom 1: Siap Diambil (Ready / Calling) */}
            <div className="bg-white rounded-3xl border border-sage-500/30 p-5 sm:p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-coffee-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sage-500" />
                  <h3 className="font-bold text-sm text-sage-900 uppercase tracking-wider">
                    Siap Diambil di Konter
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 text-xs font-bold">
                  {queueBoard.ready?.length || 0} Pesanan
                </span>
              </div>

              {queueBoard.ready && queueBoard.ready.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {queueBoard.ready.map((item) => {
                    const isMyTicket = currentOrder && (currentOrder.queue_number === item.queue_number || currentOrder.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => fetchSpecificOrder(item.id, false)}
                        className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                          isMyTicket 
                            ? 'bg-sage-100/80 border-sage-500 ring-2 ring-sage-400 shadow-card scale-[1.02]' 
                            : 'bg-sage-50/50 border-sage-200 hover:border-sage-400 hover:bg-sage-50'
                        }`}
                      >
                        <span className="text-2xl sm:text-3xl font-serif font-black text-sage-900 block">
                          {item.queue_number}
                        </span>
                        <span className="text-xs font-bold text-coffee-900 block truncate mt-1">
                          {item.customer_name}
                        </span>
                        <span className="text-[10px] font-semibold text-coffee-600 bg-white px-2 py-0.5 rounded-md mt-1.5 inline-block border border-coffee-100">
                          {item.table_number || 'Dine In'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center space-y-1.5">
                  <CheckCircle2 className="w-8 h-8 text-coffee-300 mx-auto" />
                  <p className="text-xs font-medium text-coffee-500">
                    Belum ada pesanan yang siap diambil saat ini.
                  </p>
                </div>
              )}
            </div>

            {/* Kolom 2: Sedang Diracik Barista (Processing / In Progress) */}
            <div className="bg-white rounded-3xl border border-coffee-200 p-5 sm:p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-coffee-100 pb-3">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-terracotta-600" />
                  <h3 className="font-bold text-sm text-coffee-950 uppercase tracking-wider">
                    Sedang Diracik Barista
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-coffee-100 text-coffee-800 text-xs font-bold">
                  {queueBoard.processing?.length || 0} Pesanan
                </span>
              </div>

              {queueBoard.processing && queueBoard.processing.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {queueBoard.processing.map((item) => {
                    const isMyTicket = currentOrder && (currentOrder.queue_number === item.queue_number || currentOrder.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => fetchSpecificOrder(item.id, false)}
                        className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                          isMyTicket 
                            ? 'bg-amber-50 border-terracotta-500 ring-2 ring-terracotta-400 shadow-card scale-[1.02]' 
                            : 'bg-coffee-50/50 border-coffee-200 hover:border-terracotta-400 hover:bg-white'
                        }`}
                      >
                        <span className="text-2xl sm:text-3xl font-serif font-black text-coffee-950 block">
                          {item.queue_number}
                        </span>
                        <span className="text-xs font-bold text-coffee-900 block truncate mt-1">
                          {item.customer_name}
                        </span>
                        <span className="text-[10px] font-semibold text-coffee-600 bg-white px-2 py-0.5 rounded-md mt-1.5 inline-block border border-coffee-100">
                          {item.table_number || 'Dine In'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center space-y-1.5">
                  <Coffee className="w-8 h-8 text-coffee-300 mx-auto" />
                  <p className="text-xs font-medium text-coffee-500">
                    Tidak ada pesanan dalam proses peracikan.
                  </p>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* CTA ke Menu */}
        <section className="bg-white rounded-3xl border border-coffee-200 p-6 text-center space-y-3">
          <h3 className="font-serif font-bold text-base text-coffee-950">
            Ingin Memesan Kopi atau Camilan Tambahan?
          </h3>
          <p className="text-xs text-coffee-600 max-w-md mx-auto">
            Jelajahi menu Signature Coffee, Espresso Based, dan Pastry segar yang siap memanjakan harimu.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buka Katalog Menu Kopi Senja</span>
          </Link>
        </section>

      </main>

      <BottomNav />

    </div>
  );
}
