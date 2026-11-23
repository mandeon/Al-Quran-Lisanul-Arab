import React from 'react';
import { SurahMeta, ReadingProgress } from '../types/quran';
import { SurahCard } from './SurahCard';
import { BookOpen } from 'lucide-react';

interface SurahListProps {
  surahs: SurahMeta[];
  progress: ReadingProgress;
  onSelectSurah: (surahNumber: number) => void;
  onResetSearch?: () => void;
}

export const SurahList: React.FC<SurahListProps> = ({ surahs, progress, onSelectSurah, onResetSearch }) => {
  const getReadCountForSurah = (surahNumber: number, totalAyah: number): number => {
    let count = 0;
    for (let i = 1; i <= totalAyah; i++) {
      if (progress.readVerses[`${surahNumber}:${i}`]) count++;
    }
    return count;
  };

  if (surahs.length === 0) {
    return (
      <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl animate-fadeIn">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Surat tidak ditemukan</h3>
        <p className="text-base text-slate-500 font-medium mb-5">Coba kata kunci lain atau kurangi filter.</p>
        {onResetSearch && (
          <button
            onClick={onResetSearch}
            className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
          >
            Tampilkan semua 114 surat
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {surahs.map((surah, i) => (
        <SurahCard
          key={surah.number_of_surah}
          index={i}
          surah={surah}
          readCountInSurah={getReadCountForSurah(surah.number_of_surah, surah.number_of_ayah)}
          onSelect={onSelectSurah}
        />
      ))}
    </div>
  );
};
