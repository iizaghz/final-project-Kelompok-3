import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coffee, ShoppingBag, Tv, LogOut, ShieldCheck } from 'lucide-react';

export default function CashierNavbar({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('kopi_senja_user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('kopi_senja_token');
    localStorage.removeItem('kopi_senja_user');
    navigate('/kasir');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-coffee-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo Portal Kasir */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-coffee-950 text-white flex items-center justify-center shadow-soft">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg font-bold text-coffee-950 tracking-tight leading-tight">
                Kopi Senja
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Kasir</span>
              </span>
            </div>
            <span className="text-[11px] text-coffee-500 font-medium block">
              Portal Manajemen Operasional
            </span>
          </div>
        </div>

        {/* Navigation Tabs Khusus Kasir */}
        <nav className="flex items-center gap-1 bg-coffee-100/80 p-1 rounded-xl border border-coffee-200">
          <button
            type="button"
            onClick={() => onTabChange('orders')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-white text-coffee-950 shadow-soft'
                : 'text-coffee-700 hover:text-coffee-950'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Pesanan Masuk</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('menu')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'menu'
                ? 'bg-white text-coffee-950 shadow-soft'
                : 'text-coffee-700 hover:text-coffee-950'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Katalog Menu</span>
          </button>
        </nav>

        {/* Right Action: Link Layar Display TV & Tombol Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-coffee-800 bg-coffee-50 hover:bg-coffee-100 border border-coffee-200 transition-colors"
          >
            <Tv className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Buka Layar TV</span>
          </Link>

          <div className="flex items-center gap-2 pl-2 border-l border-coffee-200">
            <span className="text-xs font-bold text-coffee-800 bg-coffee-100 px-2.5 py-1 rounded-lg">
              {user?.name || 'Kasir'}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar dari Akun Kasir"
              aria-label="Keluar dari akun kasir"
              className="p-2 rounded-xl text-coffee-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
