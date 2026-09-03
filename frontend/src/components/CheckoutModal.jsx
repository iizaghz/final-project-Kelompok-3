import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CreditCard, Store, Check, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

export default function CheckoutModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { cart, totalAmount, tableNumber, setTableNumber, clearCart, setActiveOrder } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('payment_gateway'); // 'payment_gateway' | 'cashier'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMessage('Silakan masukkan nama Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        customer_name: customerName.trim(),
        table_number: tableNumber.trim() || 'Dine In',
        payment_method: paymentMethod,
        customer_phone: customerPhone.trim() || '081234567890',
        items: cart.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          notes: item.notes,
        })),
      };

      const res = await api.createOrder(payload);

      if (res.success && res.data?.order) {
        const order = res.data.order;
        setActiveOrder(order);
        clearCart();
        onClose();
        navigate('/antrian');
      } else {
        throw new Error(res.message || 'Gagal memproses pesanan');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-coffee-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl sm:rounded-2xl border border-coffee-200 shadow-floating overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-coffee-200 flex items-center justify-between bg-coffee-50/50">
          <div>
            <h2 className="font-bold text-base sm:text-lg text-coffee-950">
              Konfirmasi Pemesanan
            </h2>
            <span className="text-xs text-coffee-600 block">
              Total {cart.length} menu ({formatRupiah(totalAmount)})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form checkout"
            className="p-1.5 rounded-lg text-coffee-600 hover:bg-coffee-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleOrderSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="checkout-name" className="block text-xs font-semibold text-coffee-900 mb-1">
                Nama Pemesan <span className="text-red-500">*</span>
              </label>
              <input
                id="checkout-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Rian Pratama"
                className="w-full text-xs p-3 rounded-xl border border-coffee-200 bg-coffee-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500 transition-all text-coffee-900"
              />
            </div>

            <div>
              <label htmlFor="checkout-table" className="block text-xs font-semibold text-coffee-900 mb-1">
                Nomor Meja / Keterangan
              </label>
              <input
                id="checkout-table"
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Contoh: Meja 12, Lantai 2, atau Takeaway"
                className="w-full text-xs p-3 rounded-xl border border-coffee-200 bg-coffee-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500 transition-all text-coffee-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="checkout-phone" className="block text-xs font-semibold text-coffee-900 mb-1">
              Nomor WhatsApp / HP (Opsional)
            </label>
            <input
              id="checkout-phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="081234567890"
              className="w-full text-xs p-3 rounded-xl border border-coffee-200 bg-coffee-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500 transition-all text-coffee-900"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="pt-2">
            <span className="block text-xs font-semibold text-coffee-900 mb-2">
              Pilih Metode Pembayaran <span className="text-red-500">*</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* iPaymu QRIS Card */}
              <label
                className={`relative flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'payment_gateway'
                    ? 'border-terracotta-500 bg-terracotta-50/40 shadow-soft'
                    : 'border-coffee-200 bg-white hover:border-coffee-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="payment_gateway"
                  checked={paymentMethod === 'payment_gateway'}
                  onChange={() => setPaymentMethod('payment_gateway')}
                  className="sr-only"
                />
                <div className="w-9 h-9 rounded-xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-coffee-950">
                      QRIS iPaymu
                    </span>
                    {paymentMethod === 'payment_gateway' && (
                      <Check className="w-4 h-4 text-terracotta-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-coffee-600 leading-tight mt-0.5">
                    Scan via DANA, GoPay, OVO, ShopeePay, BCA
                  </p>
                </div>
              </label>

              {/* Bayar di Kasir Card */}
              <label
                className={`relative flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cashier'
                    ? 'border-terracotta-500 bg-terracotta-50/40 shadow-soft'
                    : 'border-coffee-200 bg-white hover:border-coffee-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="cashier"
                  checked={paymentMethod === 'cashier'}
                  onChange={() => setPaymentMethod('cashier')}
                  className="sr-only"
                />
                <div className="w-9 h-9 rounded-xl bg-coffee-100 text-coffee-800 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-coffee-950">
                      Bayar di Kasir
                    </span>
                    {paymentMethod === 'cashier' && (
                      <Check className="w-4 h-4 text-terracotta-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-coffee-600 leading-tight mt-0.5">
                    Bayar langsung di kasir dengan tunai atau EDC
                  </p>
                </div>
              </label>

            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm shadow-soft transition-all min-h-[46px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <span>Konfirmasi & Buat Pesanan ({formatRupiah(totalAmount)})</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
