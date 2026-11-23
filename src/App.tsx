/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { SurahList } from './components/SurahList';
import { SurahDetailView } from './components/SurahDetailView';
import { TasbihModal } from './components/TasbihModal';
import { Footer } from './components/Footer';
import { FilterSidebar } from './components/FilterSidebar';
import { SimilarityMap } from './components/SimilarityMap';
import { SameAyahPanel } from './components/SameAyahPanel';
import { MasaniPanel } from './components/MasaniPanel';
import { AbjadDocsPage } from './components/AbjadDocsPage';
import { getAllSurahs, searchSurahs } from './utils/quranApi';
import { internalDuplicates, surahsWithSameAyahCount, surahsWithSameTotal } from './utils/abjadStats';
import { useQuranStorage } from './hooks/useQuranStorage';
import { FilterKey, SurahMeta } from './types/quran';
import { BookOpen, Layers, Sparkles, GitFork } from 'lucide-react';

const FILTER_FNS: Record<FilterKey, (s: SurahMeta) => boolean> = {
  sameAyahCount: (s) => surahsWithSameAyahCount(s.number_of_surah).length > 0,
  sameTotal: (s) => surahsWithSameTotal(s.number_of_surah).length > 0,
  internalDup: (s) => internalDuplicates(s.number_of_surah).length > 0,
  Makkiyah: (s) => s.type === 'Makkiyah',
  Madaniyah: (s) => s.type === 'Madaniyah',
  juz30: (s) => s.number_of_surah >= 78,
};

export default function App() {
  const allSurahs = useMemo(() => getAllSurahs(), []);

  // null = landing page, number = viewing specific surah
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [initialAyah, setInitialAyah] = useState<number | null>(null);

  // Tab mode tampilan di Landing Page: 'catalog' | 'sameAyah' | 'twins' | 'masani'
  const [landingViewMode, setLandingViewMode] = useState<'catalog' | 'sameAyah' | 'twins' | 'masani'>('catalog');

  // Halaman khusus panduan dokumentasi tabel abjad hisabul jumal
  const [isDocsPageOpen, setIsDocsPageOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [isTasbihOpen, setIsTasbihOpen] = useState(false);

  const {
    progress,
    toggleAyatRead,
    setLastRead,
    tasbih,
    incrementTasbih,
    resetTasbih,
    setDhikrPreset,
    setCustomTarget,
  } = useQuranStorage();

  const filterCounts = useMemo(() => {
    const out = {} as Record<FilterKey, number>;
    (Object.keys(FILTER_FNS) as FilterKey[]).forEach((k) => (out[k] = allSurahs.filter(FILTER_FNS[k]).length));
    return out;
  }, [allSurahs]);

  // Semua filter yang dicentang harus terpenuhi (AND), urutan tetap 1..114
  const filteredSurahs = useMemo(() => {
    let list = searchSurahs(allSurahs, searchQuery);
    activeFilters.forEach((k) => (list = list.filter(FILTER_FNS[k])));
    return list;
  }, [allSurahs, searchQuery, activeFilters]);

  const toggleFilter = (k: FilterKey) =>
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const handleOpenSurah = (surahNumber: number, focusAyah?: number) => {
    if (surahNumber < 1 || surahNumber > 114) return;
    setIsDocsPageOpen(false);
    setSelectedSurahNumber(surahNumber);
    setInitialAyah(focusAyah ?? null);
    if (!focusAyah) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setIsDocsPageOpen(false);
    setSelectedSurahNumber(null);
    setInitialAyah(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToLastRead = () => {
    if (progress.lastRead) handleOpenSurah(progress.lastRead.surahNumber, progress.lastRead.ayahNumber);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        progress={progress}
        onOpenTasbih={() => setIsTasbihOpen(true)}
        onGoHome={handleGoHome}
        onJumpToLastRead={handleJumpToLastRead}
      />

      <main className="flex-1">
        {isDocsPageOpen ? (
          /* Halaman Panduan Tabel Abjad Hisabul Jumal (Docs) */
          <AbjadDocsPage onBack={handleGoHome} />
        ) : selectedSurahNumber === null ? (
          /* Landing Page */
          <>
            <LandingHero
              allSurahs={allSurahs}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              progress={progress}
              onOpenSurah={handleOpenSurah}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
              <FilterSidebar
                active={activeFilters}
                counts={filterCounts}
                onToggle={toggleFilter}
                onReset={() => setActiveFilters(new Set())}
                resultCount={filteredSurahs.length}
                onOpenSameAyahPanel={() => {
                  setLandingViewMode('sameAyah');
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                onOpenMasaniPanel={() => {
                  setLandingViewMode('masani');
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                onOpenAbjadDocs={() => {
                  setIsDocsPageOpen(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              <div className="space-y-6 min-w-0">
                {/* 4 Tab Mode Tampilan (114 Surat | Sama Ayat | Ayat Kembar | Pola Masani) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setLandingViewMode('catalog')}
                      className={`px-3 sm:px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${landingViewMode === 'catalog'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                        }`}
                    >
                      <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>114 Surat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLandingViewMode('sameAyah')}
                      className={`px-3 sm:px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${landingViewMode === 'sameAyah'
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-200'
                        : 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-900'
                        }`}
                    >
                      <Layers className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>Sama Ayat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLandingViewMode('twins')}
                      className={`px-3 sm:px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${landingViewMode === 'twins'
                        ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-200'
                        : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-900'
                        }`}
                    >
                      <Sparkles className="w-4 h-4 text-pink-300 shrink-0" />
                      <span>Ayat Kembar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLandingViewMode('masani')}
                      className={`px-3 sm:px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${landingViewMode === 'masani'
                        ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200'
                        : 'bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-900'
                        }`}
                    >
                      <GitFork className="w-4 h-4 text-indigo-300 shrink-0" />
                      <span>Pola Masani</span>
                    </button>
                  </div>

                  <div className="text-xs font-bold text-slate-500 text-center sm:text-right px-2">
                    {landingViewMode === 'catalog' && 'Katalog Al-Fatihah (1) s.d. An-Nas (114)'}
                    {landingViewMode === 'sameAyah' && 'Daftar Pasangan Surat Sama Ayat (61 Surat)'}
                    {landingViewMode === 'twins' && 'Daftar 38 Surat Berayat Kembar'}
                    {landingViewMode === 'masani' && 'Mode Masani: Penjelasan Berpasangan & Pola Numerik'}
                  </div>
                </div>

                {/* KONTEN SESUAI TAB YANG DIPILIH */}
                {landingViewMode === 'catalog' && (
                  <SurahList
                    surahs={filteredSurahs}
                    progress={progress}
                    onSelectSurah={(n) => handleOpenSurah(n)}
                    onResetSearch={() => {
                      setSearchQuery('');
                      setActiveFilters(new Set());
                    }}
                  />
                )}

                {landingViewMode === 'sameAyah' && (
                  <SameAyahPanel allSurahs={allSurahs} onOpenSurah={handleOpenSurah} />
                )}

                {landingViewMode === 'twins' && (
                  <SimilarityMap allSurahs={allSurahs} onOpenSurah={handleOpenSurah} />
                )}

                {landingViewMode === 'masani' && (
                  <MasaniPanel allSurahs={allSurahs} onOpenSurah={handleOpenSurah} />
                )}
              </div>
            </div>
          </>
        ) : (
          /* Tampilan Detail Surat */
          <SurahDetailView
            surahNumber={selectedSurahNumber}
            initialAyah={initialAyah}
            allSurahs={allSurahs}
            progress={progress}
            onBack={handleGoHome}
            onNavigateSurah={handleOpenSurah}
            onToggleRead={toggleAyatRead}
            onSetLastRead={setLastRead}
          />
        )}
      </main>

      {isTasbihOpen && (
        <TasbihModal
          tasbih={tasbih}
          onIncrement={incrementTasbih}
          onReset={resetTasbih}
          onSelectPreset={setDhikrPreset}
          onSetTarget={setCustomTarget}
          onClose={() => setIsTasbihOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}
