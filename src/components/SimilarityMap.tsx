import React from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { SurahMeta } from '../types/quran';
import { SURAHS_WITH_INTERNAL_DUPLICATES } from '../utils/abjadStats';

interface SimilarityMapProps {
  allSurahs: SurahMeta[];
  onOpenSurah: (surahNumber: number, focusAyah?: number) => void;
}

/**
 * Komponen khusus fokus 100% pada AYAT KEMBAR PER SURAT (38 Surat).
 * Tidak lagi menampilkan tab surat sama ayat karena sudah ada mode tersendiri.
 */
export const SimilarityMap: React.FC<SimilarityMapProps> = ({
  allSurahs,
  onOpenSurah,
}) => {
  return (
    <section
      id="peta-ayat-kembar"
      className="bg-white border-2 border-slate-200/90 rounded-3xl shadow-sm p-5 sm:p-7 animate-fadeUp space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-extrabold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Fokus Mode Ayat Kembar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Daftar Surat yang Memiliki Ayat Kembar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
            Terdapat 38 surat yang memiliki pasangan ayat serupa di dalamnya. Klik nama surat atau tombol nomor ayat untuk langsung membukanya.
          </p>
        </div>

        <span className="text-xs font-extrabold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-center shrink-0">
          Total: {SURAHS_WITH_INTERNAL_DUPLICATES.length} Surat Berayat Kembar
        </span>
      </div>

      {/* Daftar 38 Surat dengan Pasangan Ayat Kembar */}
      <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 animate-fadeIn">
        {SURAHS_WITH_INTERNAL_DUPLICATES.map(({ surah, groups }) => (
          <div
            key={surah}
            className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/40 border border-rose-200 hover:border-rose-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2.5">
              <button
                type="button"
                onClick={() => onOpenSurah(surah)}
                className="flex items-center gap-2 text-base font-extrabold text-slate-900 hover:text-rose-700 cursor-pointer text-left"
              >
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center tabular-nums shadow-2xs">
                  {surah}
                </span>
                <span>{allSurahs[surah - 1]?.name}</span>
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  ({allSurahs[surah - 1]?.number_of_ayah} ayat)
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <span className="text-xs font-extrabold text-rose-800 bg-rose-100/80 px-2.5 py-1 rounded-lg">
                {groups.length} pasang ayat kembar
              </span>
            </div>

            {/* Tombol-tombol ayat kembar yang besar dan mudah ditekan */}
            <div className="space-y-2">
              {groups.map((g, gIdx) => (
                <div
                  key={gIdx}
                  className="flex flex-wrap items-center gap-2 bg-white border border-rose-200/90 rounded-xl p-2.5 text-xs font-bold text-rose-900 shadow-2xs"
                >
                  <span className="text-slate-500 font-semibold mr-1">
                    Pasangan Ayat Kembar:
                  </span>
                  {g.ayat.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => onOpenSurah(surah, a)}
                      className="inline-flex items-center gap-1 font-extrabold tabular-nums bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-300 rounded-lg px-3 py-1 cursor-pointer transition-colors"
                      title={`Buka surat ${allSurahs[surah - 1]?.name} ayat ${a}`}
                    >
                      <span>Ayat {a}</span>
                      <span className="text-[10px]">↗</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
