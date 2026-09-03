import React, { useState, useEffect, useRef } from 'react';
import { Coffee, CheckCircle2, Clock, Volume2, VolumeX, Megaphone, BellRing } from 'lucide-react';
import api from '../utils/api';

// Global AudioContext singleton
let globalAudioCtx = null;
let globalActiveAudio = null;

const getSafeAudioContext = () => {
  try {
    if (!globalAudioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        globalAudioCtx = new AudioCtxClass();
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }
    return globalAudioCtx;
  } catch (e) {
    console.warn('Audio Context init error:', e);
    return null;
  }
};

export default function DisplayPage() {
  const [queueData, setQueueData] = useState({ processing: [], ready: [] });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [lastCalledTicket, setLastCalledTicket] = useState(null);
  
  const prevReadyIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);
  const speakTimeoutRef = useRef(null);
  const isAnnouncingRef = useRef(false);

  // 1. Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Global user gesture listener untuk unlock browser autoplay policy (1x saja)
  useEffect(() => {
    const unlockAudio = () => {
      getSafeAudioContext();
      setAudioUnlocked(true);
    };

    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Stop semua audio/suara yang sedang aktif agar tidak tumpang tindih
  const stopAllAudio = () => {
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    if (globalActiveAudio) {
      globalActiveAudio.pause();
      globalActiveAudio.currentTime = 0;
      globalActiveAudio = null;
    }
    isAnnouncingRef.current = false;
  };

  // 3. Dual/Triple Tone Airport Cafe Bell Chime (Web Audio API Synthesizer)
  const playDingDong = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = getSafeAudioContext();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;

      // Tone 1: C5 (523.25 Hz)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Tone 2: E5 (659.25 Hz)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.15);
      gain2.gain.setValueAtTime(0.35, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.5);

      // Tone 3: G5 (783.99 Hz)
      const osc3 = audioCtx.createOscillator();
      const gain3 = audioCtx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, now + 0.3);
      gain3.gain.setValueAtTime(0.4, now + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc3.connect(gain3);
      gain3.connect(audioCtx.destination);
      osc3.start(now + 0.3);
      osc3.stop(now + 0.75);
    } catch (e) {
      console.warn('Audio Context chime error:', e);
    }
  };

  // Helper agar nomor antrian diucapkan fasih dan jelas (contoh: A, kosong kosong satu)
  const formatQueuePronunciation = (queueStr) => {
    if (!queueStr) return '';
    return queueStr
      .replace(/-/g, ', ')
      .replace(/00/g, 'kosong kosong ')
      .replace(/0/g, 'kosong ');
  };

  // 4. Suara Panggilan Bahasa Indonesia Standar yang Jernih & Lengkap
  const speakStandardAnnouncement = (queueNumber, customerName) => {
    if (!soundEnabled) return;

    const queueFormatted = formatQueuePronunciation(queueNumber);
    const nameFormatted = customerName || 'Pelanggan';

    // Format kalimat standar kafe: jelas, sopan, dan profesional
    const textAnnouncement = `Panggilan nomor antrian, ${queueFormatted}. Pesanan atas nama ${nameFormatted}, silakan mengambil pesanan di konter barista. Terima kasih.`;

    try {
      // Pastikan audio lama berhenti total
      if (globalActiveAudio) {
        globalActiveAudio.pause();
        globalActiveAudio.currentTime = 0;
        globalActiveAudio = null;
      }

      // Gunakan audio stream Bahasa Indonesia asli beresolusi tinggi
      const audioUrl = `http://localhost:3000/api/display/voice?text=${encodeURIComponent(textAnnouncement)}`;
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = audioUrl;
      globalActiveAudio = audio;

      audio.onended = () => {
        isAnnouncingRef.current = false;
        globalActiveAudio = null;
      };

      audio.onerror = () => {
        isAnnouncingRef.current = false;
        globalActiveAudio = null;
      };

      audio.play().catch((err) => {
        console.warn('Audio play notice:', err.message);
        isAnnouncingRef.current = false;
      });
    } catch (e) {
      console.warn('Audio error:', e);
      isAnnouncingRef.current = false;
    }
  };

  // 5. Trigger Panggilan Otomatis Lengkap (Bell Chime + Suara Normal Standar)
  const announceOrderReady = (order) => {
    if (!order || !soundEnabled) return;

    // Bersihkan sesi pemanggilan sebelumnya agar suara tidak tumpang tindih
    stopAllAudio();
    isAnnouncingRef.current = true;

    setLastCalledTicket(order);
    playDingDong();
    
    // Tunggu bel dentang selesai berbunyi (850ms) baru mulai suara panggilan
    speakTimeoutRef.current = setTimeout(() => {
      speakStandardAnnouncement(order.queue_number, order.customer_name);
    }, 850);
  };

  // 6. Polling Antrian Realtime (Display TV)
  const fetchQueue = async () => {
    try {
      const res = await api.getQueueDisplay();
      if (res.success && res.data) {
        const data = res.data;
        const currentReady = data.ready || [];
        const currentReadyIds = new Set(currentReady.map((o) => String(o.id)));

        // PENTING: Jika bukan loading pertama dan ada pesanan baru yang masuk ke status Ready
        if (!isFirstLoadRef.current) {
          const newlyReady = currentReady.filter((o) => !prevReadyIdsRef.current.has(String(o.id)));
          if (newlyReady.length > 0 && !isAnnouncingRef.current) {
            console.log('📢 Pesanan Siap Terdeteksi! Memanggil:', newlyReady[0].queue_number);
            announceOrderReady(newlyReady[0]);
          }
        }

        isFirstLoadRef.current = false;
        prevReadyIdsRef.current = currentReadyIds;
        setQueueData(data);
      }
    } catch (err) {
      console.warn('Display poll error:', err.message);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000); // Polling display TV tiap 3 detik
    return () => {
      clearInterval(interval);
    };
  }, [soundEnabled]);

  const handleTestAudio = () => {
    getSafeAudioContext();
    setAudioUnlocked(true);
    announceOrderReady({
      queue_number: 'A-001',
      customer_name: 'Budi Santoso',
      table_number: 'Meja 04',
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF5ED] text-coffee-950 flex flex-col justify-between p-4 sm:p-8 select-none">
      
      {/* TV Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-coffee-200 pb-4 mb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center shadow-card">
            <Coffee className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-coffee-950 tracking-tight leading-none">
              Kopi Senja
            </h1>
            <p className="text-xs font-bold text-coffee-600 uppercase tracking-widest mt-1 flex items-center gap-2">
              <span>Display TV Layar Pemanggil Antrian</span>
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-ping" />
            </p>
          </div>
        </div>

        {/* Live Controls: Audio Controls */}
        <div className="flex items-center gap-3">
          
          {/* Tombol Uji Suara Bel / Panggilan Standar */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTestAudio();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold shadow-soft transition-all active:scale-95 cursor-pointer"
          >
            <BellRing className="w-4 h-4 text-white" />
            <span>Tes Panggilan Suara</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              getSafeAudioContext();
              if (soundEnabled) {
                stopAllAudio();
              }
              setSoundEnabled(!soundEnabled);
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              soundEnabled 
                ? 'bg-white border-coffee-200 text-terracotta-600 shadow-soft' 
                : 'bg-coffee-100 border-coffee-200 text-coffee-400'
            }`}
            title={soundEnabled ? 'Matikan Suara Panggilan TV' : 'Nyalakan Suara Panggilan TV'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Clock Widget */}
          <div className="text-right bg-white px-4 py-2 rounded-2xl border border-coffee-200 shadow-soft">
            <span className="text-lg sm:text-xl font-mono font-bold text-coffee-950 block leading-none">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-[10px] font-medium text-coffee-600 block mt-0.5">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </header>

      {/* Audio Activation Alert Banner (Jika belum pernah diklik) */}
      {!audioUnlocked && (
        <div 
          onClick={handleTestAudio}
          className="mb-4 bg-amber-100 border-2 border-amber-400 rounded-2xl p-3.5 flex items-center justify-between text-amber-900 shadow-soft cursor-pointer hover:bg-amber-200/80 transition-colors animate-pulse"
        >
          <div className="flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-amber-700" />
            <span className="text-xs font-bold">
              Klik di sini untuk mengaktifkan Suara Pengumuman TV Otomatis!
            </span>
          </div>
          <span className="text-xs font-bold underline bg-white/70 px-3 py-1 rounded-lg">
            Aktifkan Suara
          </span>
        </div>
      )}

      {/* Banner Panggilan Terakhir */}
      {lastCalledTicket && (
        <div className="mb-4 bg-terracotta-50 border-2 border-terracotta-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-soft animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-terracotta-700 uppercase tracking-wider block">
                Sedang Dipanggil di Konter Barista:
              </span>
              <span className="text-sm font-bold text-coffee-950">
                Nomor <strong>{lastCalledTicket.queue_number}</strong> ({lastCalledTicket.customer_name}) — {lastCalledTicket.table_number || 'Dine In'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              announceOrderReady(lastCalledTicket);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-terracotta-500 text-white text-xs font-bold hover:bg-terracotta-600 shadow-xs cursor-pointer"
          >
            Panggil Ulang
          </button>
        </div>
      )}

      {/* Main 2-Column Split: Sedang Diracik vs Siap Diambil */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-start">
        
        {/* Kolom 1: Sedang Diracik (Preparing) */}
        <section className="bg-white rounded-3xl border-2 border-amber-300 p-5 sm:p-6 shadow-soft h-full flex flex-col">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-600" />
              <h2 className="text-lg sm:text-xl font-bold text-coffee-950 font-serif">
                Sedang Diracik Barista
              </h2>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
              {queueData.processing.length} Pesanan
            </span>
          </div>

          {queueData.processing.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-coffee-400 space-y-2">
              <Coffee className="w-12 h-12 text-coffee-300" />
              <p className="text-xs font-semibold text-coffee-500">
                Tidak ada pesanan dalam proses peracikan
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[58vh] pr-1">
              {queueData.processing.map((order) => (
                <div
                  key={order.id}
                  className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl text-center space-y-1 shadow-xs"
                >
                  <span className="text-2xl sm:text-3xl font-serif font-black text-coffee-950 block">
                    {order.queue_number}
                  </span>
                  <span className="text-xs font-bold text-coffee-700 block truncate">
                    {order.customer_name}
                  </span>
                  <span className="text-[10px] text-coffee-500 block">
                    {order.table_number || 'Dine In'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Kolom 2: Siap Diambil di Konter (Ready for Pickup with Audio Trigger) */}
        <section className="bg-sage-50/70 rounded-3xl border-2 border-sage-500/50 p-5 sm:p-6 shadow-soft h-full flex flex-col">
          <div className="flex items-center justify-between border-b border-sage-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-sage-600" />
              <h2 className="text-lg sm:text-xl font-bold text-sage-950 font-serif">
                Siap Diambil di Konter
              </h2>
            </div>
            <span className="px-3 py-1 bg-sage-500 text-white text-xs font-bold rounded-full shadow-xs">
              {queueData.ready.length} Siap Diambil
            </span>
          </div>

          {queueData.ready.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-sage-700/60 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-sage-300" />
              <p className="text-xs font-semibold text-sage-700">
                Belum ada pesanan yang siap diambil
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[58vh] pr-1">
              {queueData.ready.map((order) => (
                <div
                  key={order.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    announceOrderReady(order);
                  }}
                  title="Klik untuk memanggil ulang nomor antrian"
                  className="bg-white border-2 border-sage-500 p-4 rounded-2xl text-center space-y-1.5 shadow-card animate-pulse-subtle cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className="text-3xl sm:text-4xl font-serif font-black text-sage-900 block leading-tight">
                    {order.queue_number}
                  </span>
                  <span className="text-xs font-bold text-coffee-950 block truncate">
                    {order.customer_name}
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[10px] text-sage-700 font-semibold bg-sage-100 px-2 py-0.5 rounded-md inline-block">
                      {order.table_number || 'Dine In'}
                    </span>
                    <span className="text-[10px] text-terracotta-600 font-bold">
                      <Volume2 className="w-3 h-3 inline" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* TV Footer Announcement */}
      <footer className="mt-6 pt-4 border-t border-coffee-200/80 flex items-center justify-between text-xs text-coffee-600">
        <span>Scan QR Code di meja Anda untuk memesan mandiri</span>
        <span className="font-serif italic text-coffee-800">Kopi Senja — Menemani Setiap Momen Berhargamu</span>
      </footer>

    </div>
  );
}
