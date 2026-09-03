import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Tutup modal saat tombol Escape ditekan
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, notes);
    onClose();
  };

  const subtotal = quantity * product.price;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-coffee-950/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-coffee-200 shadow-floating overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-200"
      >
        {/* Header Image & Close Button */}
        <div className="relative w-full h-56 sm:h-64 bg-coffee-100 shrink-0">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail menu"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-coffee-900 flex items-center justify-center shadow-soft hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div>
            <span className="text-[11px] font-semibold text-terracotta-600 bg-terracotta-50 px-2.5 py-1 rounded-md mb-2 inline-block">
              {product.categories?.name || 'Menu Pilihan'}
            </span>
            <h2 className="text-xl font-serif font-bold text-coffee-950 leading-tight">
              {product.name}
            </h2>
            <p className="text-lg font-bold text-coffee-900 mt-1">
              {formatRupiah(product.price)}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-coffee-700 leading-relaxed">
            {product.description || 'Pilihan menu kopi dan kuliner segar berkualitas dari Kopi Senja.'}
          </p>

          {/* Notes / Customization Input */}
          <div className="pt-3 border-t border-coffee-100">
            <label htmlFor="modal-notes" className="block text-xs font-semibold text-coffee-900 mb-1.5">
              Catatan Pesanan (Opsional)
            </label>
            <textarea
              id="modal-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Less sugar, extra ice, oat milk..."
              className="w-full text-xs p-3 rounded-xl border border-coffee-200 bg-coffee-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500 transition-all resize-none text-coffee-900 placeholder:text-coffee-400"
            />
          </div>
        </div>

        {/* Modal Footer with Quantity & CTA */}
        <div className="p-4 sm:p-5 bg-coffee-50/80 border-t border-coffee-200 flex items-center justify-between gap-4 shrink-0">
          
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-coffee-200 shadow-soft">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Kurangi jumlah"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-coffee-700 hover:bg-coffee-100 disabled:opacity-40 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-coffee-950 w-6 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Tambah jumlah"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-coffee-700 hover:bg-coffee-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-soft transition-all min-h-[44px]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Tambah ({formatRupiah(subtotal)})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
