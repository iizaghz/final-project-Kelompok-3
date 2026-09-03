import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MenuPage from '../pages/MenuPage';
import QueuePage from '../pages/QueuePage';

function AppRoutes() {
  return (
    <Routes>
      {/* Modul Pelanggan: Self-Order Menu (Tasya) */}
      <Route path="/" element={<MenuPage />} />
      <Route path="/menu" element={<MenuPage />} />

      {/* Modul Pelanggan: Live Tracking & Antrian (Tasya) */}
      <Route path="/antrian" element={<QueuePage />} />
      <Route path="/track/:orderId" element={<QueuePage />} />

      {/* Fallback */}
      <Route path="*" element={<MenuPage />} />
    </Routes>
  );
}

export default AppRoutes;
