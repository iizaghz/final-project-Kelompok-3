import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Coffee, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar({ onOpenCart }) {
  const location = useLocation();
  const { totalItems, activeOrder } = useCart();
  const isQueueActive = activeOrder && activeOrder.order_status !== 'completed' && activeOrder.order_status !== 'cancelled';

  const navLinks = [
    { name: 'Menu', path: '/', icon: Coffee },
    { name: 'Status Antrian', path: '/antrian', icon: CheckCircle2, badge: isQueueActive ? activeOrder?.queue_number : null },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAF5ED]/95 backdrop-blur-md border-b border-coffee-200 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo & Brand Pelanggan */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold text-coffee-950 tracking-tight block leading-tight">
              Kopi Senja
            </span>
            <span className="text-[11px] font-medium text-coffee-600 tracking-wider uppercase">
              Coffee & Eatery
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links Khusus Pelanggan */}
        <nav className="hidden sm:flex items-center gap-1 bg-coffee-100/70 p-1 rounded-xl border border-coffee-200/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-coffee-900 shadow-soft'
                    : 'text-coffee-700 hover:text-coffee-950 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
                {link.badge && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-terracotta-500 text-white text-[10px] font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Cart Trigger Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Buka keranjang belanja, ada ${totalItems} item`}
            className="relative p-2.5 rounded-xl bg-white border border-coffee-200 text-coffee-800 hover:text-terracotta-600 hover:border-terracotta-400 shadow-xs transition-all flex items-center justify-center active:scale-95"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-terracotta-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
