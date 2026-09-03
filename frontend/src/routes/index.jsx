import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DisplayPage from '../pages/DisplayPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Modul Salwa: Display TV Antrian Publik */}
      <Route path="/" element={<DisplayPage />} />
      <Route path="/display" element={<DisplayPage />} />
      <Route path="/antrian" element={<DisplayPage />} />

      {/* Fallback */}
      <Route path="*" element={<DisplayPage />} />
    </Routes>
  );
}

export default AppRoutes;
