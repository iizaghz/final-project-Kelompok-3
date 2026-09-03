import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Mail, Loader2, Sparkles } from 'lucide-react';
import api from '../utils/api';

export default function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await api.login(email.trim(), password);
      if (res.success && res.data?.token) {
        localStorage.setItem('kopi_senja_token', res.data.token);
        localStorage.setItem('kopi_senja_user', JSON.stringify(res.data.user));
        onClose();
        navigate('/kasir');
      } else {
        throw new Error(res.message || 'Login gagal');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Email atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('kasir@kopisenja.com');
    setPassword('kasir123');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-coffee-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-3xl sm:rounded-2xl border border-coffee-200 shadow-floating overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-coffee-950 font-serif">
              Masuk Dashboard Kasir
            </h2>
            <p className="text-xs text-coffee-600">
              Khusus staf barista dan admin Kopi Senja
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form login"
            className="p-1 rounded-lg text-coffee-600 hover:bg-coffee-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-coffee-900 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kasir@kopisenja.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-coffee-200 bg-coffee-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500 transition-all text-coffee-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-coffee-900 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-coffee-200 bg-coffee-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500 transition-all text-coffee-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 active:scale-[0.98] text-white font-bold text-xs shadow-soft transition-all min-h-[44px] mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk ke Dashboard</span>
            )}
          </button>
        </form>

        {/* Demo Quick-fill button */}
        <div className="pt-2 border-t border-coffee-100 text-center">
          <button
            type="button"
            onClick={handleDemoFill}
            className="text-xs text-coffee-600 hover:text-terracotta-600 font-medium py-1 px-2 rounded-lg hover:bg-coffee-50 transition-colors"
          >
            Gunakan Akun Demo Kasir
          </button>
        </div>
      </div>
    </div>
  );
}
