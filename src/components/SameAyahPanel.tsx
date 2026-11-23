import React, { useState, useMemo } from 'react';
import { Layers, Search } from 'lucide-react';
import { SurahMeta } from '../types/quran';
import { SAME_AYAH_COUNT_GROUPS } from '../utils/abjadStats';

interface SameAyahPanelProps {
  allSurahs: SurahMeta[];
  onOpenSurah: (surahNumber: number) => void;
}

export const SameAyahPanel: React.FC<SameAyahPanelProps> = ({
  allSurahs,
  onOpenSurah,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  // Sorted groups: from shortest ayah count (3 ayat) to longest
  const sortedGroups = useMemo(() => {
    return Array.from(SAME_AYAH_COUNT_GROUPS.entries()).sort((a, b) => a[0] - b[0]);
  }, []);

  // Filter groups by search query
  const filteredGroups = useMemo(() => {
    if (!searchFilter.trim()) return sortedGroups;
    const q = searchFilter.toLowerCase().trim();
    return sortedGroups.filter(([count, surahNums]) => {
      if (String(count) === q) return true;
      return surahNums.some((n) => {
        const s = allSurahs[n - 1];
        if (!s) return false;
        return (
          s.name.toLowerCase().includes(q) ||
          s.name_translations.id.toLowerCase().includes(q) ||
          String(n) === q
        );
      });
    });
  }, [sortedGroups, searchFilter, allSurahs]);

  return (
    <div className="bg-white border-2 border-emerald-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 animate-fadeIn">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold mb-2">
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span>Katalog Pasangan Panjang Ayat</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Daftar Pasangan Surat dengan Jumlah Ayat Sama
          </h2>
          <p className="text-sm text-slate-500 font-semibold mt-0.5">
            Daftar seluruh surat dalam Al-Qur'an yang memiliki jumlah ayat persis sama (misal: Al-Fatihah ＝ Al-Ma'un sama-sama 7 ayat).
          </p>
        </div>

        {/* Pencarian jumlah ayat atau nama surat */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Cari jumlah ayat / nama surat..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-semibold focus:outline-none focus:border-emerald-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Grid Seluruh Pasangan Surat Sama Ayat */}
      <div className="space-y-4 max-h-[680px] overflow-y-auto pr-1">
        {filteredGroups.map(([ayahCount, surahNumbers]) => (
          <div
            key={ayahCount}
            className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-emerald-300 transition-colors"
          >
            {/* Header Kelompok */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black tabular-nums shadow-2xs">
                  {ayahCount} Ayat
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-700">
                  Ada {surahNumbers.length} surat yang memiliki {ayahCount} ayat:
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                Klik kartu untuk membuka surat
              </span>
            </div>

            {/* Kotak-kotak Surat Horizontal Berjejer dengan Tanda Sama Dengan ( = ) */}
            <div className="flex flex-wrap items-center gap-2.5">
              {surahNumbers.map((n, i) => {
                const s = allSurahs[n - 1];
                if (!s) return null;
                return (
                  <React.Fragment key={n}>
                    {i > 0 && (
                      <span className="text-lg font-black text-emerald-600 px-1 select-none">
                        ＝
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenSurah(n)}
                      className="group/item flex items-center gap-3 bg-white hover:bg-emerald-50 border-2 border-slate-200/90 hover:border-emerald-500 rounded-2xl px-4 py-3 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                    >
                      <span className="w-8 h-8 rounded-xl bg-slate-100 group-hover/item:bg-emerald-600 group-hover/item:text-white font-extrabold text-xs text-slate-800 flex items-center justify-center tabular-nums transition-colors">
                        {n}
                      </span>
                      <div className="text-left">
                        <div className="text-sm sm:text-base font-extrabold text-slate-900 group-hover/item:text-emerald-900 transition-colors">
                          {s.name}
                        </div>
                        <div className="text-xs text-slate-500 font-semibold">
                          {s.name_translations.id} · {s.type}
                        </div>
                      </div>
                      <span className="font-arabic text-xl text-slate-700 ml-1 select-none" dir="rtl">
                        {s.name_translations.ar}
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
