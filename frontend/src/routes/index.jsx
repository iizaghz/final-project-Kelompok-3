import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CashierPage from '../pages/CashierPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Modul Kasir: Manajemen Pesanan & Update Status (Putri) */}
      <Route path="/" element={<CashierPage />} />
      <Route path="/kasir" element={<CashierPage />} />
      <Route path="/orders" element={<CashierPage />} />

      {/* Fallback */}
      <Route path="*" element={<CashierPage />} />
    </Routes>
  );
}

export default AppRoutes;
