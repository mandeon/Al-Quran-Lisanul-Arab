import React from 'react';
import { BookOpen, CheckCircle2, RotateCcw, Bookmark } from 'lucide-react';
import { ReadingProgress } from '../types/quran';

interface NavbarProps {
  progress: ReadingProgress;
  onOpenTasbih: () => void;
  onGoHome: () => void;
  onJumpToLastRead: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  progress,
  onOpenTasbih,
  onGoHome,
  onJumpToLastRead,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          <button onClick={onGoHome} className="flex items-center gap-3 text-left group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:bg-emerald-700 group-hover:rotate-[-6deg] transition-all">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <span className="block text-lg font-bold tracking-tight text-slate-900">Alquran Counter</span>
              <span className="block text-xs text-slate-500 font-semibold">Baca & Tadabbur · 114 Surat</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button onClick={onGoHome} className="hover:text-emerald-700 transition-colors cursor-pointer">
              Daftar Surat
            </button>
            {progress.lastRead && (
              <button
                onClick={onJumpToLastRead}
                className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors cursor-pointer"
                title="Lanjutkan bacaan terakhir"
              >
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span>
                  {progress.lastRead.surahName} : {progress.lastRead.ayahNumber}
                </span>
              </button>
            )}
            <span className="flex items-center gap-1.5 text-slate-500 tabular-nums">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {progress.totalAyatRead} ayat dibaca
            </span>
          </nav>

          <button
            onClick={onOpenTasbih}
            className="px-4 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tasbih</span>
          </button>
        </div>
      </div>
    </header>
  );
};
