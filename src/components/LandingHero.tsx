import React from 'react';
import { Search, X, Layers, CheckCircle2, Calculator, Hash } from 'lucide-react';
import { ReadingProgress, SurahMeta } from '../types/quran';
import { TOTAL_AYAT_IN_QURAN } from '../utils/quranApi';
import { GRAND_TOTAL, GRAND_LETTERS } from '../utils/abjadStats';
import { formatNumber } from '../utils/abjad';

interface LandingHeroProps {
  allSurahs: SurahMeta[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  progress: ReadingProgress;
  onOpenSurah: (surahNumber: number) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  allSurahs,
  searchQuery,
  onSearchChange,
  progress,
  onOpenSurah,
}) => {
  const percentage = ((progress.totalAyatRead / TOTAL_AYAT_IN_QURAN) * 100).toFixed(1);

  const stats = [
    {
      label: 'Total Hisab Al-Qur\'an',
      value: formatNumber(GRAND_TOTAL),
      subtext: 'Kalkulasi seluruh 114 surat',
      icon: Calculator,
      color: 'text-emerald-600',
    },
    {
      label: 'Huruf Dihitung',
      value: formatNumber(GRAND_LETTERS),
      subtext: 'Total huruf rasm mushaf',
      icon: Hash,
      color: 'text-sky-600',
    },
    {
      label: '114 Surat & 6.236 Ayat',
      value: '6.236 / 114',
      subtext: 'Al-Fatihah s.d. An-Nas',
      icon: Layers,
      color: 'text-amber-600',
    },
    {
      label: 'Progres Membaca',
      value: `${progress.totalAyatRead} Ayat`,
      subtext: `${percentage}% selesai dibaca`,
      icon: CheckCircle2,
      color: 'text-rose-500',
    },
  ];

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-emerald-50/70 via-white to-white">
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        <div className="text-center max-w-3xl mx-auto animate-fadeUp">
          <p className="font-arabic text-3xl sm:text-4xl text-slate-800 mb-3 select-none" dir="rtl">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            Alquran Counter <span className="text-emerald-600">— Baca & Kalkulasi</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            Membaca dan mentadabburi Al-Qur'an lengkap dengan total hisab per surat dan per ayat, penanda ayat kembar, pencarian 114 surat, serta panduan kaidah abjad hijaiyah.
          </p>

          {/* Akses Cepat Surat Populer */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-semibold text-slate-500">
            <span className="text-slate-400">Pilihan Cepat:</span>
            {[
              { n: 1, name: 'Al-Fatihah' },
              { n: 2, name: 'Al-Baqarah' },
              { n: 18, name: 'Al-Kahf' },
              { n: 36, name: 'Yasin' },
              { n: 67, name: 'Al-Mulk' },
              { n: 114, name: 'An-Nas' },
            ].map((s) => (
              <button
                key={s.n}
                onClick={() => onOpenSurah(s.n)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer shadow-2xs font-bold text-slate-700"
              >
                {s.name} ({s.n})
              </button>
            ))}
          </div>
        </div>

        {/* Kotak Pencarian & Dropdown Surat Langsung */}
        <div
          className="max-w-3xl mx-auto mt-6 flex flex-col sm:flex-row gap-3 animate-fadeUp"
          style={{ animationDelay: '80ms' }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari surat: Al-Baqarah, 36, Yasin, Pembukaan…"
              className="w-full pl-12 pr-11 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 text-base font-semibold placeholder:text-slate-400 placeholder:font-medium shadow-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                aria-label="Bersihkan pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value=""
            onChange={(e) => e.target.value && onOpenSurah(Number(e.target.value))}
            className="sm:w-64 px-4 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-800 shadow-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 cursor-pointer"
            aria-label="Pilih surat langsung"
          >
            <option value="">Pilih & Buka Surat… (1–114)</option>
            {allSurahs.map((s) => (
              <option key={s.number_of_surah} value={s.number_of_surah}>
                {s.number_of_surah}. {s.name} ({s.number_of_ayah} ayat)
              </option>
            ))}
          </select>
        </div>

        {/* 4 Kartu Statistik dengan Total Hisab Al-Qur'an & Huruf Dihitung */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto mt-6">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all animate-fadeUp"
              style={{ animationDelay: `${140 + i * 50}ms` }}
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                {s.value}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
                {s.subtext}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
