import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Coffee, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function BottomNav() {
  const location = useLocation();
  const { activeOrder } = useCart();
  const isQueueActive = activeOrder && activeOrder.order_status !== 'completed' && activeOrder.order_status !== 'cancelled';

  const navItems = [
    { name: 'Menu', path: '/', icon: Coffee },
    { name: 'Status Antrian', path: '/antrian', icon: CheckCircle2, badge: isQueueActive ? activeOrder?.queue_number : null },
  ];

  return (
    <nav 
      aria-label="Navigasi Bawah Mobile Pelanggan"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-coffee-200 shadow-floating pb-safe transition-all"
    >
      <div className="grid grid-cols-2 h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 transition-colors min-h-[48px] py-1 ${
                isActive ? 'text-terracotta-600' : 'text-coffee-600 hover:text-coffee-950'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-terracotta-500 text-white text-[9px] font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
