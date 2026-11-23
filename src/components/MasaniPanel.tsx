import React, { useState, useMemo } from 'react';
import {
  GitFork,
  Scale,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Layers,
  HelpCircle,
  Equal,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { SurahMeta } from '../types/quran';
import {
  getMasaniTreeForSurah,
  CURATED_MASANI_TREES,
  analyzeAyahMasani,
  getTopCrossSurahMatches,
  getExact2xPairs,
  getArithmeticTriplets,
  getWholeQuranEvenOddStats,
  getSurahMasaniReport,
} from '../utils/masaniAnalysis';
import { formatNumber } from '../utils/abjad';
import { renderHighlightedTranslation } from '../utils/highlightKeywords';
import { MasaniReportCard } from './MasaniReportCard';
import { MasaniDerivationTree } from './MasaniDerivationTree';
import { getMasaniDerivation } from '../utils/masaniDerivation';

interface MasaniPanelProps {
  allSurahs: SurahMeta[];
  onOpenSurah: (surahNumber: number, focusAyah?: number) => void;
}

export const MasaniPanel: React.FC<MasaniPanelProps> = ({
  allSurahs,
  onOpenSurah,
}) => {
  // Sub-tab: Default ke 'tree' (Pohon Konsep Masani 114 Surat), dengan 3 pilihan tab
  const [activeTab, setActiveTab] = useState<'tree' | 'hypothesis' | 'crossMatch'>('tree');

  // Selected Surah for Concept Tree (Default 2 = Al-Baqarah sesuai diagram user)
  const [selectedTreeSurah, setSelectedTreeSurah] = useState<number>(2);
  const [surahSearchText, setSurahSearchText] = useState<string>('');

  const activeTree = useMemo(() => {
    return getMasaniTreeForSurah(selectedTreeSurah);
  }, [selectedTreeSurah]);

  // Laporan Masani berbasis data, diawali ayat 1 surat terpilih
  const masaniReport = useMemo(() => getSurahMasaniReport(selectedTreeSurah), [selectedTreeSurah]);
  const masaniDerivation = useMemo(() => getMasaniDerivation(selectedTreeSurah), [selectedTreeSurah]);

  // Filtered surahs for selector search
  const filteredSurahsForSelect = useMemo(() => {
    if (!surahSearchText.trim()) return allSurahs;
    const q = surahSearchText.toLowerCase().trim();
    return allSurahs.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        String(s.number_of_surah).includes(q) ||
        s.name_translations.id.toLowerCase().includes(q)
    );
  }, [allSurahs, surahSearchText]);

  // Cross-match explorer state
  const [explorerSurah, setExplorerSurah] = useState<number>(2);
  const [explorerAyah, setExplorerAyah] = useState<number>(47);
  const selectedAyahAnalysis = useMemo(() => {
    return analyzeAyahMasani(explorerSurah, explorerAyah);
  }, [explorerSurah, explorerAyah]);

  // Top cross-surah matching values
  const topCrossMatches = useMemo(() => getTopCrossSurahMatches().slice(0, 15), []);


  // Hypothesis data
  const evenOddStats = useMemo(() => getWholeQuranEvenOddStats(), []);
  const [hypothesisSurahFilter, setHypothesisSurahFilter] = useState<number>(2);
  const hypothesisTree = useMemo(() => {
    return getMasaniTreeForSurah(hypothesisSurahFilter);
  }, [hypothesisSurahFilter]);
  const factor2Pairs = useMemo(
    () => getExact2xPairs(hypothesisSurahFilter).slice(0, 12),
    [hypothesisSurahFilter]
  );
  const arithmeticTriplets = useMemo(
    () => getArithmeticTriplets(hypothesisSurahFilter).slice(0, 12),
    [hypothesisSurahFilter]
  );

  const currentSurahMeta = allSurahs[explorerSurah - 1];

  return (
    <section
      id="mode-masani"
      className="w-full max-w-full overflow-hidden bg-white border-2 border-indigo-200/90 rounded-3xl shadow-sm p-3.5 sm:p-6 md:p-7 animate-fadeIn space-y-6"
    >
      {/* Header Utama Mode Masani */}
      <div className="space-y-3 pb-2 border-b border-slate-100">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black">
          <GitFork className="w-3.5 h-3.5 text-indigo-600" />
          <span>Mode Masani &amp; Analisis Pola Numerik</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Pohon Konsep Masani &amp; Sinkronisasi Numerik Al-Qur'an
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-3xl">
          Eksplorasi kaidah <strong className="text-indigo-900">Masani (المثاني)</strong>: penjelasan ayat berpasangan, struktur tsunai bertingkat (1+1=2, 1+2=3, 1+3=4, hingga faktorial penjelasan ayat), serta sinkronisasi numerik hisabul jumal (seperti QS. Al-Baqarah ayat 47 &amp; 122).
        </p>

        {/* 3 Tombol Sub-Tab Navigasi: Mengarah ke Bawah (1 Kolom Vertikal di Mobile, Tidak Di-wrap 2x2) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 w-full bg-slate-100 p-2 rounded-2xl pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('tree')}
            className={`py-3 px-3.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-start lg:justify-center gap-2.5 ${
              activeTab === 'tree'
                ? 'bg-white text-indigo-900 shadow-xs ring-2 ring-indigo-300'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <GitFork className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="leading-snug">Pohon Konsep Masani (114 Surat)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hypothesis')}
            className={`py-3 px-3.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-start lg:justify-center gap-2.5 ${
              activeTab === 'hypothesis'
                ? 'bg-white text-indigo-900 shadow-xs ring-2 ring-indigo-300'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Scale className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="leading-snug">Uji Hipotesa Numerik</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('crossMatch')}
            className={`py-3 px-3.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-start lg:justify-center gap-2.5 ${
              activeTab === 'crossMatch'
                ? 'bg-white text-indigo-900 shadow-xs ring-2 ring-indigo-300'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Equal className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="leading-snug">Persamaan Nilai Hisab Lintas Surat</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: POHON KONSEP MASANI (TERSEDIA DI SELURUH 114 SURAT) */}
      {/* ============================================================== */}
      {activeTab === 'tree' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Penjelasan Kaidah Masani */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
            <h4 className="font-extrabold text-indigo-900 mb-1 flex items-center gap-1.5 text-sm sm:text-base">
              <BookOpen className="w-4 h-4 text-indigo-700" />
              <span>Memahami Kaidah Masani (المثاني) di Seluruh 114 Surat Al-Qur'an:</span>
            </h4>
            <p>
              Kata <em>Masani</em> bermakna <strong>penjelasan yang diulang secara berpasangan</strong> (QS. Al-Hijr: 87 dan Az-Zumar: 23). Setiap surat memuat pilar berpasangan (misal: <em>Zakat melahirkan Infaq ↔ Sedekah</em>, <em>Waktu terbagi Malam ↔ Siang</em>, <em>Amal membuahkan Surga ↔ Peringatan</em>). Dari dua pilar tersebut, lahir cabang-cabang penjelas lanjutan (pohon faktorial) yang dirinci oleh ayat-ayat di Al-Qur'an.
            </p>
          </div>

          {/* PILIH SURAT (1–114) UNTUK MELIHAT POHON KONSEP MASANI */}
          <div className="bg-slate-50 border-2 border-indigo-200 rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-indigo-900 block">
                  Pilih Surat untuk Melihat Pohon Konsep Masani:
                </label>
                <p className="text-xs text-slate-500 font-semibold">
                  Tersedia untuk seluruh 114 surat. Silakan pilih surat yang ingin dipelajari:
                </p>
              </div>

              {/* Dropdown Pemilih 114 Surat yang Nyaman di HP & Desktop */}
              <select
                value={selectedTreeSurah}
                onChange={(e) => setSelectedTreeSurah(Number(e.target.value))}
                aria-label="Pilih surat pohon masani"
                className="w-full sm:w-72 bg-white border-2 border-indigo-400 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer shadow-2xs truncate"
              >
                {allSurahs.map((s) => (
                  <option key={s.number_of_surah} value={s.number_of_surah}>
                    {s.number_of_surah}. {s.name} ({s.number_of_ayah} ayat) {CURATED_MASANI_TREES[s.number_of_surah] ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Akses Cepat Pilihan Populer Termasuk Diagram User */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-bold text-slate-500">
              <span className="text-slate-400 shrink-0">Pilihan Cepat:</span>
              {[
                { n: 2, label: 'Al-Baqarah (Zakat, Infaq & Sedekah)' },
                { n: 89, label: 'Al-Fajr (Genap & Ganjil)' },
                { n: 1, label: 'Al-Fatihah (7 Ayat Masani)' },
                { n: 28, label: 'Al-Qashash (Malam ↔ Siang)' },
                { n: 56, label: 'Al-Waqi\'ah (Kanan ↔ Kiri)' },
                { n: 92, label: 'Al-Lail (Memberi ↔ Kikir)' },
                { n: 55, label: 'Ar-Rahman (Dua Lautan)' },
                { n: 67, label: 'Al-Mulk (Mati ↔ Hidup)' },
              ].map((p) => (
                <button
                  key={p.n}
                  type="button"
                  onClick={() => setSelectedTreeSurah(p.n)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                    selectedTreeSurah === p.n
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 hover:text-indigo-900 hover:border-indigo-300 border-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* KARTU POHON KONSEP MASANI YANG DIPILIH */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-4 sm:p-6 space-y-6">
            {/* Header Konsep & Ayat Induk (Anchor) */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  {activeTree.theme}
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900">
                  {activeTree.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed max-w-2xl">
                  {activeTree.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenSurah(activeTree.anchorSurah, activeTree.anchorAyah)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-indigo-50 border-2 border-indigo-200 text-indigo-900 font-extrabold text-xs cursor-pointer shadow-2xs transition-colors self-start"
              >
                <span>Lihat di Surat ({activeTree.verseAnchor})</span>
                <ChevronRight className="w-4 h-4 text-indigo-600" />
              </button>
            </div>

            {/* DIAGRAM VISUAL LENGKAP: POHON MASANI & FORMULA TSUNAI BERLAPIS */}
            <div className="bg-white border-2 border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500">
                <span className="flex items-center gap-1.5">
                  <GitFork className="w-4 h-4 text-indigo-600" />
                  Diagram Percabangan Pohon Masani
                </span>
                <span className="text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  2 Cabang Utama Simetris
                </span>
              </div>

              {/* Node Induk (Root) dengan Teks dan Highlight Ayat */}
              <div className="max-w-xl mx-auto text-center space-y-2 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-2xs">
                <div className="inline-block px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-xs">
                  Pilar Induk (Akar): {activeTree.theme}
                </div>
                <div className="font-arabic text-xl sm:text-2xl text-slate-900 py-1" dir="rtl">
                  {activeTree.anchorArabic}
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  {renderHighlightedTranslation(activeTree.anchorTranslation)}
                </div>
              </div>


              {/* DUA CABANG MASANI BERPASANGAN SIMETRIS (SISI A & SISI B) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* SISI A */}
                <div className="bg-sky-50/50 border-2 border-sky-300 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-sky-200">
                    <div>
                      <span className="text-[11px] font-black text-sky-700 uppercase tracking-wider">
                        Cabang Sisi A
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        {activeTree.branches.sideA.name}
                      </h4>
                    </div>
                    <span className="font-arabic text-2xl text-sky-800" dir="rtl">
                      {activeTree.branches.sideA.arabic}
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-sky-200">
                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                      {renderHighlightedTranslation(activeTree.branches.sideA.quote)}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenSurah(activeTree.branches.sideA.surahRef, activeTree.branches.sideA.ayahRef)
                      }
                      className="mt-2 text-xs font-black text-sky-700 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>QS. {activeTree.branches.sideA.surahName}:{activeTree.branches.sideA.ayahRef}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Turunan Ranting Faktorial Sisi A */}
                  <div className="space-y-2">
                    <div className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5 text-sky-600" />
                      <span>Turunan Penjelas Ayat:</span>
                    </div>
                    <div className="space-y-2">
                      {activeTree.branches.sideA.children.map((child, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onOpenSurah(child.surahRef, child.ayahRef)}
                          className="w-full text-left p-3 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer group shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-xs font-black text-slate-900 group-hover:text-sky-900 mb-0.5">
                            <span>{child.label}</span>
                            <span className="text-[11px] text-sky-700 group-hover:underline">
                              QS. {child.surahName}:{child.ayahRef} ↗
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">
                            {renderHighlightedTranslation(child.note)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SISI B */}
                <div className="bg-amber-50/50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                    <div>
                      <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">
                        Cabang Sisi B
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        {activeTree.branches.sideB.name}
                      </h4>
                    </div>
                    <span className="font-arabic text-2xl text-amber-800" dir="rtl">
                      {activeTree.branches.sideB.arabic}
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-amber-200">
                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                      {renderHighlightedTranslation(activeTree.branches.sideB.quote)}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenSurah(activeTree.branches.sideB.surahRef, activeTree.branches.sideB.ayahRef)
                      }
                      className="mt-2 text-xs font-black text-amber-700 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>QS. {activeTree.branches.sideB.surahName}:{activeTree.branches.sideB.ayahRef}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Turunan Ranting Faktorial Sisi B */}
                  <div className="space-y-2">
                    <div className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5 text-amber-600" />
                      <span>Turunan Penjelas Ayat:</span>
                    </div>
                    <div className="space-y-2">
                      {activeTree.branches.sideB.children.map((child, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onOpenSurah(child.surahRef, child.ayahRef)}
                          className="w-full text-left p-3 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer group shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-xs font-black text-slate-900 group-hover:text-amber-900 mb-0.5">
                            <span>{child.label}</span>
                            <span className="text-[11px] text-amber-700 group-hover:underline">
                              QS. {child.surahName}:{child.ayahRef} ↗
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">
                            {renderHighlightedTranslation(child.note)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LAPORAN MASANI BERBASIS DATA: DIAWALI AYAT 1, DALAM SURAT & ANTAR SURAT */}
          {masaniReport && <MasaniReportCard report={masaniReport} onOpenSurah={onOpenSurah} />}

          {/* RINCIAN AYAT TURUNAN PER LAPIS TSUNAI (1+1=2, 1+2=3, 1+3=4, 1+Banyak) */}
          {masaniDerivation && (
            <MasaniDerivationTree derivation={masaniDerivation} onOpenSurah={onOpenSurah} />
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PERSAMAAN HISAB LINTAS SURAT (Baqarah 47 & 122 + Cek Lain) */}
      {/* ============================================================== */}
      {activeTab === 'crossMatch' && (
        <div className="space-y-6 animate-fadeIn">
          {/* BANNER UTAMA: KASUS QS. AL-BAQARAH 47 & 122 */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-4 sm:p-6 md:p-7 shadow-md">
            <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl" />

            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/40 rounded-xl px-3 py-1 text-xs font-black text-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Kasus Utama: QS. Al-Baqarah 47 ＝ 122</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-200 bg-white/10 px-3 py-1 rounded-lg">
                  <span>Total Nilai Hisab:</span>
                  <span className="text-amber-300 font-black text-sm tabular-nums">4.822</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Lafaz &amp; Nilai Kembar Identik dalam Surat Al-Baqarah
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100 font-medium mt-1 leading-relaxed">
                  Lafaz panggilan kepada Bani Israil: <em className="italic text-amber-200">"Yaa bani Israa'ila-zkuruu ni'matiyal-latii an'amtu 'alaikum wa annii faddaltukum 'alal-'aalamiin"</em> terulang persis pada Ayat 47 dan Ayat 122 dengan bobot hisab yang sama yaitu <strong>4.822</strong>.
                </p>
              </div>

              {/* Kotak Berpasangan Al-Baqarah 47 & 122 dengan Tombol Lompat Langsung */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-extrabold text-indigo-200 mb-1">
                      <span>QS. Al-Baqarah (Surat 2)</span>
                      <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md font-black">
                        Ayat 47
                      </span>
                    </div>
                    <p className="font-arabic text-xl text-right text-white py-1" dir="rtl">
                      يَٰبَنِىٓ إِسْرَٰٓءِيلَ ٱذْكُرُوا۟ نِعْمَتِىَ ٱلَّتِىٓ أَنْعَمْتُ عَلَيْكُمْ...
                    </p>
                    <p className="text-xs text-indigo-100/90 font-medium">
                      "Wahai Bani Israil! Ingatlah nikmat-Ku yang telah Aku berikan kepadamu..."
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenSurah(2, 47)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Buka Al-Baqarah Ayat 47</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-extrabold text-indigo-200 mb-1">
                      <span>QS. Al-Baqarah (Surat 2)</span>
                      <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md font-black">
                        Ayat 122
                      </span>
                    </div>
                    <p className="font-arabic text-xl text-right text-white py-1" dir="rtl">
                      يَٰبَنِىٓ إِسْرَٰٓءِيلَ ٱذْكُرُوا۟ نِعْمَتِىَ ٱلَّتِىٓ أَنْعَمْتُ عَلَيْكُمْ...
                    </p>
                    <p className="text-xs text-indigo-100/90 font-medium">
                      "Wahai Bani Israil! Ingatlah nikmat-Ku yang telah Aku berikan kepadamu..."
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenSurah(2, 122)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Buka Al-Baqarah Ayat 122</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Keterangan Apakah Nilai 4.822 Muncul di Surat Lain */}
              <div className="rounded-xl bg-indigo-950/60 border border-indigo-500/30 p-3 text-xs font-semibold text-indigo-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  <strong>Hasil Pemeriksaan Lintas Surat:</strong> Nilai <strong>4.822</strong> hanya muncul tepat <strong>2 kali</strong> di seluruh Al-Qur'an, dan keduanya berada di Surat Al-Baqarah (Ayat 47 &amp; 122). Tidak ada surat lain yang memiliki ayat dengan nilai hisab 4.822.
                </span>
              </div>
            </div>
          </div>

          {/* ALAT PENJELAJAH PERSAMAAN HISAB LINTAS SURAT */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-base font-black text-slate-900">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>Pencari Persamaan Nilai Hisab Ayat</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                Pilih surat dan ayat manapun untuk mengecek: apakah ada ayat lain di surat yang sama atau di surat lain yang nilai hisabnya sama persis?
              </p>
            </div>

            {/* Dropdown Pemilih Surat & Ayat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              <label className="flex flex-col gap-1 text-xs font-extrabold text-slate-700">
                <span>Pilih Surat:</span>
                <select
                  value={explorerSurah}
                  onChange={(e) => {
                    const sn = Number(e.target.value);
                    setExplorerSurah(sn);
                    setExplorerAyah(1);
                  }}
                  className="bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs truncate"
                >
                  {allSurahs.map((s) => (
                    <option key={s.number_of_surah} value={s.number_of_surah}>
                      {s.number_of_surah}. {s.name} ({s.number_of_ayah} ayat)
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-extrabold text-slate-700">
                <span>Pilih Nomor Ayat:</span>
                <select
                  value={explorerAyah}
                  onChange={(e) => setExplorerAyah(Number(e.target.value))}
                  className="bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                >
                  {Array.from(
                    { length: currentSurahMeta?.number_of_ayah || 1 },
                    (_, i) => i + 1
                  ).map((num) => (
                    <option key={num} value={num}>
                      Ayat ke-{num}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Hasil Analisis Kesamaan Ayat Terpilih */}
            {selectedAyahAnalysis && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      Ayat Terpilih:
                    </span>
                    <h4 className="text-base font-black text-slate-900">
                      QS. {selectedAyahAnalysis.surahName} : Ayat {selectedAyahAnalysis.ayahNumber}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500">
                      Total Nilai Hisab:
                    </span>
                    <div className="text-lg font-black text-indigo-700 tabular-nums">
                      {formatNumber(selectedAyahAnalysis.value)}
                    </div>
                  </div>
                </div>

                {/* Status Kemunculan */}
                <div className="space-y-2 text-xs">
                  {/* Di Surat yang Sama */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-extrabold text-slate-800 mb-1 flex items-center justify-between">
                      <span>Di Surat yang Sama ({selectedAyahAnalysis.surahName}):</span>
                      <span className="text-indigo-700 font-black">
                        {selectedAyahAnalysis.sameSurahMatches.length} ayat kembar
                      </span>
                    </div>
                    {selectedAyahAnalysis.sameSurahMatches.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedAyahAnalysis.sameSurahMatches.map((m) => (
                          <button
                            key={m.ayah}
                            type="button"
                            onClick={() => onOpenSurah(m.surah, m.ayah)}
                            className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200 font-black text-indigo-900 cursor-pointer transition-colors"
                          >
                            Ayat {m.ayah} ↗
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">
                        Tidak ada ayat lain di surat ini yang bernilai hisab {formatNumber(selectedAyahAnalysis.value)}.
                      </p>
                    )}
                  </div>

                  {/* Di Surat Lain */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-extrabold text-slate-800 mb-1 flex items-center justify-between">
                      <span>Di Surat Lain dalam Al-Qur'an:</span>
                      <span className="text-indigo-700 font-black">
                        {selectedAyahAnalysis.otherSurahMatches.length} ayat sama
                      </span>
                    </div>
                    {selectedAyahAnalysis.otherSurahMatches.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedAyahAnalysis.otherSurahMatches.map((m) => (
                          <button
                            key={`${m.surah}:${m.ayah}`}
                            type="button"
                            onClick={() => onOpenSurah(m.surah, m.ayah)}
                            className="px-3 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-400 font-bold text-slate-800 cursor-pointer transition-colors shadow-2xs"
                          >
                            {allSurahs[m.surah - 1]?.name} : Ayat {m.ayah} ↗
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">
                        Nilai hisab {formatNumber(selectedAyahAnalysis.value)} tidak ditemukan di surat lain (unik untuk surat ini).
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TABEL CONTOH NILAI PALING SERING SAMA LINTAS SURAT */}
            <div className="pt-2">
              <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Nilai Hisab yang Paling Sering Muncul di Berbagai Surat:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {topCrossMatches.map((group) => (
                  <div
                    key={group.value}
                    className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-900 tabular-nums">
                        Nilai {formatNumber(group.value)}
                      </span>
                      <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                        {group.distinctSurahsCount} surat ({group.totalOccurrences} ayat)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {group.refs.slice(0, 4).map((r) => (
                        <button
                          key={`${r.surah}:${r.ayah}`}
                          type="button"
                          onClick={() => onOpenSurah(r.surah, r.ayah)}
                          className="px-1.5 py-0.5 rounded bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 font-medium cursor-pointer"
                        >
                          {allSurahs[r.surah - 1]?.name}:{r.ayah}
                        </button>
                      ))}
                      {group.refs.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-bold self-center">
                          +{group.refs.length - 4} lagi
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: UJI HIPOTESA NUMERIK (KELIPATAN 2 & DERET ARITMATIKA) */}
      {/* ============================================================== */}
      {activeTab === 'hypothesis' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Ringkasan Jawaban atas 3 Pertanyaan Hipotesa User */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Jawaban Pertanyaan 1 */}
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
              <span className="inline-block text-[11px] font-black text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-md">
                Hipotesa 1
              </span>
              <h4 className="text-sm font-extrabold text-slate-900">
                Numerik Sama dalam Ayat &amp; Surat
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                <strong>Terbukti:</strong> Al-Baqarah 47 dan 122 memiliki hisab sama persis (<strong>4.822</strong>) karena lafaznya identik. Terdapat 1.329 nilai hisab lain yang memiliki kesamaan nilai di berbagai surat dalam Al-Qur'an.
              </p>
            </div>

            {/* Jawaban Pertanyaan 2 */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="inline-block text-[11px] font-black text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-md">
                Hipotesa 2
              </span>
              <h4 className="text-sm font-extrabold text-slate-900">
                Kelipatan 2 &amp; Faktorisasi
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                <strong>Terbukti Signifikan:</strong> Ditemukan <strong>81 pasang ayat</strong> dengan rasio persis kelipatan 2× dalam surat yang sama. Secara makro, ayat bernilai Genap (50.7%) dan Ganjil (49.3%) berpasangan sangat seimbang (QS. Al-Fajr: 3).
              </p>
            </div>

            {/* Jawaban Pertanyaan 3 */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <span className="inline-block text-[11px] font-black text-amber-700 bg-white border border-amber-200 px-2 py-0.5 rounded-md">
                Hipotesa 3
              </span>
              <h4 className="text-sm font-extrabold text-slate-900">
                Pola Deret Barisan Aritmatika
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                <strong>Terdeteksi:</strong> Terdapat <strong>1.435 kelompok triplet ayat</strong> dalam Al-Qur'an yang membentuk deret barisan aritmatika dengan selisih beda nilai konstan (Ayat B − Ayat A ＝ Ayat C − Ayat B).
              </p>
            </div>
          </div>

          {/* KOTAK STATISTIK MAKRO KELIPATAN 2 (GENAP VS GANJIL SELURUH AL-QUR'AN) */}
          <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  Keseimbangan Makro (QS. Al-Fajr: 3)
                </span>
                <h3 className="text-lg font-black text-white">
                  Keseimbangan Ayat Genap (Kelipatan 2) &amp; Ganjil
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-300 bg-white/10 px-3 py-1 rounded-xl shrink-0">
                Total: 6.236 Ayat Mushaf
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                <div className="text-xs font-bold text-slate-300">Ayat Genap (Kelipatan 2)</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums">
                  {formatNumber(evenOddStats.evenCount)}
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  {evenOddStats.evenPercentage}% dari total
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                <div className="text-xs font-bold text-slate-300">Ayat Ganjil</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums">
                  {formatNumber(evenOddStats.oddCount)}
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  {evenOddStats.oddPercentage}% dari total
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                <div className="text-xs font-bold text-slate-300">Pasangan Rasio 2×</div>
                <div className="text-xl sm:text-2xl font-black text-sky-400 tabular-nums">
                  81 Pasang
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  Nilai A × 2 = Nilai B
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                <div className="text-xs font-bold text-slate-300">Deret Aritmatika Triplet</div>
                <div className="text-xl sm:text-2xl font-black text-rose-400 tabular-nums">
                  1.435 Pola
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  Beda selisih konstan
                </div>
              </div>
            </div>
          </div>

          {/* PEMERIKSA POLA NUMERIK PER SURAT */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-black text-slate-900">
                  Periksa Pasangan Kelipatan 2 &amp; Deret Aritmatika per Surat:
                </h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Pilih surat untuk melihat pasangan ayat dengan rasio 2× dan barisan aritmatika lokal di dalamnya.
                </p>
              </div>

              <select
                value={hypothesisSurahFilter}
                onChange={(e) => setHypothesisSurahFilter(Number(e.target.value))}
                aria-label="Filter surat pola numerik"
                className="w-full sm:w-64 bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs truncate"
              >
                {allSurahs.map((s) => (
                  <option key={s.number_of_surah} value={s.number_of_surah}>
                    {s.number_of_surah}. {s.name} ({s.number_of_ayah} ayat)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kolom 1: Pasangan Rasio Kelipatan 2 (2x) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900 uppercase">
                    Pasangan Kelipatan 2 (Rasio 2×)
                  </span>
                  <span className="text-[11px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                    {factor2Pairs.length} terdeteksi
                  </span>
                </div>

                {factor2Pairs.length > 0 ? (
                  <div className="space-y-2">
                    {factor2Pairs.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-extrabold text-slate-900">
                            Ayat {p.ayahA} ({formatNumber(p.valueA)})
                          </span>
                          <span className="text-indigo-600 font-black mx-1.5">× 2 =</span>
                          <span className="font-extrabold text-slate-900">
                            Ayat {p.ayahB} ({formatNumber(p.valueB)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenSurah(p.surah, p.ayahA)}
                          className="font-bold text-indigo-700 hover:underline cursor-pointer shrink-0"
                        >
                          Lihat ↗
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-slate-400 py-3 text-center">
                    Tidak ada pasangan bernilai persis 2× di surat ini.
                  </div>
                )}
              </div>

              {/* Kolom 2: Deret Aritmatika Triplet */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 uppercase">
                    Deret Aritmatika (Beda Selisih Konstan)
                  </span>
                  <span className="text-[11px] font-extrabold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                    {arithmeticTriplets.length} terdeteksi
                  </span>
                </div>

                {arithmeticTriplets.length > 0 ? (
                  <div className="space-y-2">
                    {arithmeticTriplets.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">
                            Ayat {t.ayahs[0]}, {t.ayahs[1]}, {t.ayahs[2]}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            Nilai: {formatNumber(t.values[0])} → {formatNumber(t.values[1])} → {formatNumber(t.values[2])} (Beda: {t.diff > 0 ? `+${t.diff}` : t.diff})
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenSurah(t.surah, t.ayahs[0])}
                          className="font-bold text-amber-700 hover:underline cursor-pointer shrink-0"
                        >
                          Lihat ↗
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-slate-400 py-3 text-center">
                    Tidak ada triplet deret aritmatika di surat ini.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION TAMBAHAN: KAIDAH TSUNAI (1+1=2) DI BAWAH UJI HIPOTESA */}
          {/* ============================================================== */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 sm:p-7 shadow-lg space-y-5 border border-indigo-400/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  Kaidah Tsunai / Masani Berlapis (Sesuai Diagram Pengguna)
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Mentsunaikan Ayat: 1+1=2 → 1+2=3 → 1+3=4 → 1+Banyak
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 leading-relaxed">
                  Hubungan numerik berjenjang antara pilar ayat berpasangan dengan konsep Genap (Asy-Syaf'i) dan Ganjil (Al-Watr) QS. Al-Fajr: 3 untuk <strong>QS {hypothesisTree.surahName}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedTreeSurah(hypothesisSurahFilter);
                  setActiveTab('tree');
                }}
                className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Buka Pohon Konsep Masani</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Kotak Lapis Kaidah Tsunai untuk surat terpilih di hipotesa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(hypothesisTree.tsunaiLayers ?? []).map((layer, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 border border-white/15 rounded-xl p-3.5 flex flex-col justify-between space-y-2 hover:bg-white/15 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-black uppercase text-indigo-300 bg-white/10 px-2 py-0.5 rounded">
                        {layer.step}
                      </span>
                      <span className="text-xs font-black text-amber-300 tabular-nums">
                        {layer.formula}
                      </span>
                    </div>
                    <h5 className="text-xs sm:text-sm font-black text-white">
                      {layer.name}
                    </h5>
                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-1">
                      {layer.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/10 text-[10px] font-semibold text-emerald-300">
                    {layer.detail}
                  </div>
                </div>
              ))}
            </div>

            {/* Formula Genap & Ganjil */}
            {hypothesisTree.evenOddFormula && (
              <div className="bg-black/30 rounded-xl p-3 text-center space-y-1 text-xs">
                <div className="font-black text-sky-300">
                  {hypothesisTree.evenOddFormula.pairFormula}
                </div>
                <div className="font-black text-emerald-300">
                  {hypothesisTree.evenOddFormula.totalFormula}
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  {hypothesisTree.evenOddFormula.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
