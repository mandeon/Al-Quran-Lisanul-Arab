import React from 'react';
import { Filter, RotateCcw, Check, Sparkles, BookOpen, Layers, FileText } from 'lucide-react';
import { FilterKey } from '../types/quran';

export const FILTER_OPTIONS: {
  key: FilterKey;
  label: string;
  hint: string;
  group: 'fitur' | 'kategori';
}[] = [
  {
    key: 'internalDup',
    label: 'Ada Ayat Kembar',
    hint: 'Surat yang memiliki ayat-ayat serupa di dalamnya (contoh: Al-Baqarah, Ar-Rahman)',
    group: 'fitur',
  },
  {
    key: 'sameAyahCount',
    label: 'Panjang Ayat Sama',
    hint: 'Surat yang jumlah ayatnya sama dengan surat lain',
    group: 'fitur',
  },
  {
    key: 'Makkiyah',
    label: 'Surat Makkiyah',
    hint: 'Diturunkan di kota Makkah',
    group: 'kategori',
  },
  {
    key: 'Madaniyah',
    label: 'Surat Madaniyah',
    hint: 'Diturunkan di kota Madinah',
    group: 'kategori',
  },
  {
    key: 'juz30',
    label: "Juz 30 (Juz 'Amma)",
    hint: 'Surat 78 (An-Naba) s.d. Surat 114 (An-Nas)',
    group: 'kategori',
  },
];

interface FilterSidebarProps {
  active: Set<FilterKey>;
  counts: Record<FilterKey, number>;
  onToggle: (key: FilterKey) => void;
  onReset: () => void;
  resultCount: number;
  onOpenSameAyahPanel?: () => void;
  onOpenAbjadDocs?: () => void;
  onOpenMasaniPanel?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  active,
  counts,
  onToggle,
  onReset,
  resultCount,
  onOpenSameAyahPanel,
  onOpenAbjadDocs,
  onOpenMasaniPanel,
}) => {
  const renderGroup = (group: 'fitur' | 'kategori', title: string, icon: React.ReactNode) => (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-1.5">
        {FILTER_OPTIONS.filter((f) => f.group === group).map((f) => {
          const checked = active.has(f.key);
          return (
            <label
              key={f.key}
              title={f.hint}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 cursor-pointer select-none transition-all ${
                checked
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                  : 'border-transparent bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => onToggle(f.key)}
              />
              <span
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                  checked ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300'
                }`}
              >
                {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </span>
              <span className="flex-1 text-sm">{f.label}</span>
              <span className="text-xs font-bold tabular-nums text-slate-500 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">
                {counts[f.key] ?? 0}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="lg:sticky lg:top-20 space-y-3.5">
      {/* Kotak Filter Surat */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-extrabold text-slate-900">
            <Filter className="w-4 h-4 text-emerald-600" />
            Filter Surat
          </div>
          {active.size > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-rose-600 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        {renderGroup('fitur', 'Pilihan Khusus', <Sparkles className="w-3.5 h-3.5 text-rose-500" />)}
        {renderGroup('kategori', 'Kategori Surat', <BookOpen className="w-3.5 h-3.5 text-emerald-600" />)}

        <div className="text-sm font-semibold text-slate-600 pt-2 border-t border-slate-100">
          Menampilkan <span className="font-extrabold text-slate-900">{resultCount}</span> surat
          {active.size > 0 && (
            <span className="block text-xs text-slate-400 mt-0.5">
              Filter aktif: {active.size} kriteria
            </span>
          )}
        </div>
      </div>

      {/* Tombol Mode Masani & Pola Numerik (Baru) */}
      {onOpenMasaniPanel && (
        <button
          type="button"
          onClick={onOpenMasaniPanel}
          className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-br from-indigo-700 to-slate-900 text-white shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between font-extrabold text-sm mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Pola Masani &amp; Numerik
            </span>
            <span className="text-xs bg-indigo-500/50 text-indigo-100 px-2 py-0.5 rounded-full font-bold">
              Mode Baru
            </span>
          </div>
          <p className="text-xs text-indigo-100 font-medium leading-relaxed">
            Analisis konsep Masani (berpasangan tematik &amp; faktorial) dan persamaan hisab (Baqarah 47 &amp; 122).
          </p>
        </button>
      )}

      {/* Tombol Panel Pasangan Surat Sama Ayat */}
      {onOpenSameAyahPanel && (
        <button
          type="button"
          onClick={onOpenSameAyahPanel}
          className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between font-extrabold text-sm mb-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-200" />
              Kotak Surat Sama Ayat
            </span>
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
              61 Surat
            </span>
          </div>
          <p className="text-xs text-emerald-100 font-medium leading-relaxed">
            Buka tampilan kotak perbandingan: Al-Fatihah (7) ＝ Al-Ma'un (7).
          </p>
        </button>
      )}

      {/* Tombol Panduan & Tabel Abjad Hisabul Jumal (Docs) */}
      {onOpenAbjadDocs && (
        <button
          type="button"
          onClick={onOpenAbjadDocs}
          className="w-full text-left p-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-emerald-500 text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between font-extrabold text-sm mb-1 text-slate-900 group-hover:text-emerald-800">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Tabel Abjad Hisabul Jumal
            </span>
            <span className="text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-black">
              Docs
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Cek bobot nilai per huruf hijaiyah: Satuan (1–9), Puluhan (10–90), Ratusan (100–1000).
          </p>
        </button>
      )}
    </aside>
  );
};
