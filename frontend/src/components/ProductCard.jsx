import React from 'react';
import { Plus } from 'lucide-react';

export default function ProductCard({ product, onSelect }) {
  if (!product) return null;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(number) || 0);
  };

  const isAvailable = product.is_available !== false;

  return (
    <article
      onClick={() => isAvailable && onSelect(product)}
      className={`group bg-white rounded-2xl border border-coffee-200/80 p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 overflow-hidden ${
        isAvailable 
          ? 'hover:border-terracotta-400 hover:shadow-card cursor-pointer active:scale-[0.98]' 
          : 'opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-coffee-100 mb-3">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60'}
          alt={product.name || 'Menu Kopi'}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60';
          }}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Out of Stock Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-coffee-950/50 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-xs sm:text-base text-coffee-950 leading-snug line-clamp-1 mb-1 group-hover:text-terracotta-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-coffee-600 line-clamp-2 leading-relaxed mb-3">
            {product.description || 'Pilihan menu istimewa dari Kopi Senja.'}
          </p>
        </div>

        {/* Bottom Price & Action */}
        <div className="pt-2.5 border-t border-coffee-100 flex items-center justify-between gap-1.5 mt-auto">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-coffee-500 block leading-tight">
              Harga
            </span>
            <span className="font-bold text-xs sm:text-sm text-coffee-950 truncate block">
              {formatRupiah(product.price)}
            </span>
          </div>

          <button
            type="button"
            disabled={!isAvailable}
            onClick={(e) => {
              e.stopPropagation();
              if (isAvailable) onSelect(product);
            }}
            aria-label={`Tambah ${product.name} ke pesanan`}
            className="w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl bg-terracotta-50 text-terracotta-700 hover:bg-terracotta-500 hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-all shrink-0 shadow-xs active:scale-95 min-h-[32px] sm:min-h-[36px]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>
      </div>
    </article>
  );
}
