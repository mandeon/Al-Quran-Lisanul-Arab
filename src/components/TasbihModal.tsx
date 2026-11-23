import React, { useState } from 'react';
import { X, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { TasbihState } from '../types/quran';
import { DHIKR_PRESETS } from '../hooks/useQuranStorage';

interface TasbihModalProps {
  tasbih: TasbihState;
  onIncrement: () => void;
  onReset: () => void;
  onSelectPreset: (index: number) => void;
  onSetTarget: (target: number) => void;
  onClose: () => void;
}

export const TasbihModal: React.FC<TasbihModalProps> = ({
  tasbih,
  onIncrement,
  onReset,
  onSelectPreset,
  onSetTarget,
  onClose,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Soft bead click sound synthesized using Web Audio API
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {
      // AudioContext unavailable
    }
  };

  const handleTap = () => {
    playClickSound();
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
    onIncrement();
  };

  const progressPct =
    tasbih.target > 0
      ? Math.min(100, Math.round((tasbih.count / tasbih.target) * 100))
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md bg-stone-900/60 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-[#FAF9F5] border border-stone-300 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-950 flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                Tasbih & Dzikir Counter
              </h3>
              <p className="text-[11px] text-stone-500">
                Penghitung zikir dan wirid harian
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              title={soundEnabled ? 'Matikan Suara Klik' : 'Aktifkan Suara Klik'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-700" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Tutup tasbih"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-5">
          {/* Dhikr Presets */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {DHIKR_PRESETS.map((preset, idx) => (
              <button
                key={preset.label}
                onClick={() => onSelectPreset(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  tasbih.dhikrLabel === preset.label
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:border-pink-300'
                }`}
              >
                {preset.label} ({preset.target})
              </button>
            ))}
          </div>

          {/* Current Dhikr Display */}
          <div className="py-2">
            <p className="font-arabic text-3xl sm:text-4xl text-stone-900 mb-2 font-medium" dir="rtl">
              {tasbih.dhikrArabic}
            </p>
            <p className="text-sm font-semibold text-purple-950">
              {tasbih.dhikrLabel}
            </p>
            <p className="text-xs text-stone-500 italic mt-0.5">
              "{tasbih.dhikrMeaning}"
            </p>
          </div>

          {/* Huge Ergonomic Tap Button */}
          <div className="flex justify-center py-2">
            <button
              onClick={handleTap}
              className="relative w-48 h-48 rounded-full bg-gradient-to-br from-white to-[#F5F2EA] border-4 border-stone-200 hover:border-pink-400 text-stone-900 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer group select-none ring-4 ring-pink-100/50"
            >
              <span className="text-xs uppercase tracking-widest text-stone-400 group-hover:text-purple-700 transition-colors mb-1 font-semibold">
                Sentuh / Tekan
              </span>
              <span className="text-5xl font-serif font-bold text-stone-900 tabular-nums">
                {tasbih.count}
              </span>
              {tasbih.target > 0 && (
                <span className="text-xs text-stone-500 font-medium mt-1">
                  Target: {tasbih.target} ({progressPct}%)
                </span>
              )}
            </button>
          </div>

          {/* Counter Target & Reset Row */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-200/80 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500">Target:</span>
              <button
                onClick={() => onSetTarget(33)}
                className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
                  tasbih.target === 33 ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200'
                }`}
              >
                33
              </button>
              <button
                onClick={() => onSetTarget(99)}
                className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
                  tasbih.target === 99 ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200'
                }`}
              >
                99
              </button>
              <button
                onClick={() => onSetTarget(100)}
                className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
                  tasbih.target === 100 ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200'
                }`}
              >
                100
              </button>
              <button
                onClick={() => onSetTarget(0)}
                className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
                  tasbih.target === 0 ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200'
                }`}
              >
                Bebas
              </button>
            </div>

            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
