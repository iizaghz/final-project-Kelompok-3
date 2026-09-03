import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('kopi_senja_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tableNumber, setTableNumber] = useState(() => {
    try {
      // 1. Prioritaskan parameter dari Scan QR URL (?meja=5 atau ?table=05)
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get('meja') || params.get('table');
      if (urlTable) {
        const formatted = urlTable.toLowerCase().startsWith('meja') 
          ? urlTable 
          : `Meja ${urlTable}`;
        localStorage.setItem('kopi_senja_table', formatted);
        return formatted;
      }
      
      // Bersihkan nilai template lama jika ada
      const saved = localStorage.getItem('kopi_senja_table');
      if (saved === 'Meja 04' || saved === 'Meja 4') {
        localStorage.removeItem('kopi_senja_table');
        return '';
      }
      return saved || '';
    } catch {
      return '';
    }
  });

  const [activeOrder, setActiveOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('kopi_senja_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('kopi_senja_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem('kopi_senja_table', tableNumber);
    } else {
      localStorage.removeItem('kopi_senja_table');
    }
  }, [tableNumber]);

  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem('kopi_senja_active_order', JSON.stringify(activeOrder));
    } else {
      localStorage.removeItem('kopi_senja_active_order');
    }
  }, [activeOrder]);

  const addToCart = (product, quantity = 1, notes = '') => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.notes.trim() === notes.trim()
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].subtotal = updated[existingIndex].quantity * product.price;
        return updated;
      }

      return [
        ...prev,
        {
          product,
          quantity,
          notes,
          subtotal: quantity * product.price,
        },
      ];
    });
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    setCart((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQuantity;
      updated[index].subtotal = newQuantity * updated[index].product.price;
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalAmount,
        totalItems,
        tableNumber,
        setTableNumber,
        activeOrder,
        setActiveOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartProvider;
