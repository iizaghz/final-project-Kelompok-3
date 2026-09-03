import React, { useEffect } from 'react';
import { X, Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ isOpen, onClose, onProceedCheckout, onCheckout }) {
  const { cart, updateQuantity, removeFromCart, totalAmount, totalItems, clearCart } = useCart();
  const handleProceed = onProceedCheckout || onCheckout;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-coffee-950/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white h-full shadow-floating flex flex-col justify-between animate-in slide-in-from-right duration-250 border-l border-coffee-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-coffee-200 flex items-center justify-between bg-coffee-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-terracotta-500" />
            <h2 className="font-bold text-base text-coffee-950">
              Keranjang Pesanan ({totalItems})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup keranjang"
            className="p-1.5 rounded-lg text-coffee-600 hover:bg-coffee-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-coffee-100 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-coffee-500 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-coffee-100 text-coffee-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-coffee-800 text-sm">
                Keranjang Masih Kosong
              </h3>
              <p className="text-xs text-coffee-600 max-w-xs leading-relaxed">
                Pilih menu kopi atau makanan favoritmu untuk mulai memesan.
              </p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.product.id}-${index}`} className="pt-3 first:pt-0 flex gap-3">
                <img
                  src={item.product.image_url || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60'}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover bg-coffee-100 shrink-0 border border-coffee-200"
                />
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-xs sm:text-sm text-coffee-950 leading-tight">
                      {item.product.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeFromCart(index)}
                      aria-label={`Hapus ${item.product.name}`}
                      className="text-coffee-400 hover:text-red-600 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-terracotta-700 bg-terracotta-50/70 px-2 py-0.5 rounded italic line-clamp-1 my-1">
                      Catatan: {item.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-xs text-coffee-900">
                      {formatRupiah(item.subtotal)}
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-coffee-50 p-1 rounded-lg border border-coffee-200">
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-coffee-700 hover:bg-white transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-coffee-900 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-coffee-700 hover:bg-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Action */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-coffee-50 border-t border-coffee-200 space-y-3">
            <div className="flex items-center justify-between text-xs text-coffee-600">
              <span>Total Pesanan</span>
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] text-red-600 hover:underline"
              >
                Kosongkan
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-coffee-800">Total Pembayaran</span>
              <span className="text-lg font-bold text-coffee-950 font-serif">
                {formatRupiah(totalAmount)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (handleProceed) handleProceed();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 active:scale-[0.98] text-white font-bold text-sm shadow-soft transition-all min-h-[44px]"
            >
              <span>Lanjut ke Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
