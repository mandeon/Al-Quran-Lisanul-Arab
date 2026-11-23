import React from 'react';
import { SurahMeta } from '../types/quran';
import { ChevronRight, Sparkles, BookOpen, Calculator } from 'lucide-react';
import { internalDuplicates, getSurahStat } from '../utils/abjadStats';
import { formatNumber } from '../utils/abjad';

interface SurahCardProps {
  surah: SurahMeta;
  readCountInSurah?: number;
  onSelect: (surahNumber: number) => void;
  index?: number;
}

export const SurahCard: React.FC<SurahCardProps> = ({
  surah,
  readCountInSurah = 0,
  onSelect,
  index = 0,
}) => {
  const n = surah.number_of_surah;
  const stat = getSurahStat(n);
  const dupGroups = internalDuplicates(n).length;
  const readPct = Math.min(100, (readCountInSurah / surah.number_of_ayah) * 100);

  return (
    <button
      onClick={() => onSelect(n)}
      className="group text-left bg-white border-2 border-slate-200/90 hover:border-emerald-500 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between gap-3 animate-fadeUp"
      style={{ animationDelay: `${Math.min(index, 20) * 20}ms` }}
    >
      <div>
        {/* Baris Atas: Nomor, Nama Latin, Kaligrafi Arab */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-800 flex items-center justify-center text-sm font-extrabold tabular-nums transition-colors">
              {n}
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                {surah.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold truncate">
                {surah.name_translations.id}
              </p>
            </div>
          </div>
          <span className="font-arabic text-2xl text-slate-800 shrink-0 select-none" dir="rtl">
            {surah.name_translations.ar}
          </span>
        </div>

        {/* KOTAK TOTAL HISAB PER SURAT DARI HASIL KALKULASI */}
        <div className="flex items-center justify-between rounded-xl bg-emerald-50/80 border border-emerald-200/80 px-3.5 py-2 my-2">
          <div>
            <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Calculator className="w-3 h-3 text-emerald-600" />
              <span>Total Hisab Surat</span>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-950 tabular-nums">
              {formatNumber(stat?.total ?? 0)}
            </div>
          </div>
          <div className="text-right text-xs font-semibold text-slate-500">
            <div className="tabular-nums font-bold text-slate-700">{surah.number_of_ayah} Ayat</div>
            <div className="tabular-nums text-slate-400 text-[11px]">{formatNumber(stat?.letters ?? 0)} Huruf</div>
          </div>
        </div>

        {/* Info Ringkas: Tempat Turun */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-1">
          <span>{surah.type}</span>
          {readCountInSurah > 0 && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-emerald-700 font-extrabold">
                {readCountInSurah} dibaca
              </span>
            </>
          )}
        </div>

        {/* Badge Ayat Kembar jika ada */}
        {dupGroups > 0 && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Ada {dupGroups} grup ayat kembar</span>
          </div>
        )}
      </div>

      {/* Bagian Bawah: Aksi Buka Surat & Progres Baca */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
        <span className="flex items-center gap-1 text-slate-500">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Surat ke-{n}</span>
        </span>
        <span className="flex items-center gap-1 text-emerald-700 font-extrabold group-hover:gap-1.5 transition-all">
          Buka Surat <ChevronRight className="w-4 h-4" />
        </span>
      </div>

      {/* Progress Bar Bacaan */}
      {readCountInSurah > 0 && (
        <div className="h-1.5 -mt-1 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${readPct}%` }} />
        </div>
      )}
    </button>
  );
};
