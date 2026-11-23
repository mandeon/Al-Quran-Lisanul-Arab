import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RefreshCw,
  Type,
  Copy,
  Layers,
  Sparkles,
  CheckCircle2,
  Calculator,
} from 'lucide-react';
import { SurahDetail, ReadingProgress, SurahMeta } from '../types/quran';
import { getSurahDetail } from '../utils/quranApi';
import { internalDuplicates, surahsWithSameAyahCount, getSurahStat } from '../utils/abjadStats';
import { formatNumber } from '../utils/abjad';
import { VerseCard } from './VerseCard';

interface SurahDetailViewProps {
  surahNumber: number;
  initialAyah?: number | null;
  allSurahs: SurahMeta[];
  progress: ReadingProgress;
  onBack: () => void;
  onNavigateSurah: (surahNumber: number, focusAyah?: number) => void;
  onToggleRead: (surahNumber: number, ayahNumber: number) => void;
  onSetLastRead: (surahNumber: number, surahName: string, ayahNumber: number) => void;
}

const FONT_SIZES = {
  normal: 'text-2xl sm:text-3xl leading-[2.1]',
  large: 'text-3xl sm:text-4xl leading-[2.2]',
  huge: 'text-4xl sm:text-5xl leading-[2.3]',
} as const;

export const SurahDetailView: React.FC<SurahDetailViewProps> = ({
  surahNumber,
  initialAyah,
  allSurahs,
  progress,
  onBack,
  onNavigateSurah,
  onToggleRead,
  onSetLastRead,
}) => {
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<keyof typeof FONT_SIZES>('large');
  const [showHarakat, setShowHarakat] = useState(false); // default: false (Tanpa Harakat / Gundul)
  const [dupFilter, setDupFilter] = useState<'off' | 'all' | number>('off'); // number = group value
  const [flashAyah, setFlashAyah] = useState<number | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const stat = getSurahStat(surahNumber);
  const dupGroups = useMemo(() => internalDuplicates(surahNumber), [surahNumber]);
  const twinMap = useMemo(() => {
    const m = new Map<number, { value: number; others: number[] }>();
    dupGroups.forEach((g) =>
      g.ayat.forEach((a) => m.set(a, { value: g.value, others: g.ayat.filter((x) => x !== a) }))
    );
    return m;
  }, [dupGroups]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDupFilter('off');
    getSurahDetail(surahNumber)
      .then((d) => !cancelled && (setSurah(d), setLoading(false)))
      .catch((e) => !cancelled && (setError(e.message || 'Gagal memuat data surat.'), setLoading(false)));
    return () => {
      cancelled = true;
    };
  }, [surahNumber]);

  // Hentikan audio saat ganti surat / unmount
  useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);

  useEffect(() => {
    setAudio(null);
    setPlaying(false);
  }, [surahNumber]);

  const jumpToAyah = (n: number) => {
    const el = document.getElementById(`ayah-${n}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFlashAyah(n);
    window.setTimeout(() => setFlashAyah((c) => (c === n ? null : c)), 2600);
  };

  // Lompat ke ayat awal (dari landing page / peta kesamaan)
  useEffect(() => {
    if (!loading && surah && initialAyah) {
      const t = window.setTimeout(() => jumpToAyah(initialAyah), 200);
      return () => window.clearTimeout(t);
    }
  }, [loading, surah, initialAyah]);

  // Handle dropdown ganti sorot ayat kembar + AUTO SCROLL LANGSUNG
  const handleDupFilterChange = (valStr: string) => {
    if (valStr === 'off') {
      setDupFilter('off');
      return;
    }

    if (valStr === 'all') {
      setDupFilter('all');
      // Otomatis scroll ke ayat kembar pertama di surat ini
      const firstTwin = dupGroups[0]?.ayat[0];
      if (firstTwin) {
        jumpToAyah(firstTwin);
      }
      return;
    }

    const valNum = Number(valStr);
    setDupFilter(valNum);
    // Cari grup ayat kembar yang dipilih dan langsung scroll ke ayat pertamanya
    const targetGroup = dupGroups.find((g) => g.value === valNum);
    if (targetGroup && targetGroup.ayat[0]) {
      jumpToAyah(targetGroup.ayat[0]);
    }
  };

  const toggleAudio = () => {
    const url =
      surah?.recitations?.[0]?.audio_url ||
      surah?.recitation ||
      `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${String(surahNumber).padStart(3, '0')}.mp3`;
    if (playing && audio) {
      audio.pause();
      setPlaying(false);
      return;
    }
    const a = audio || new Audio(url);
    if (!audio) setAudio(a);
    a.onended = () => setPlaying(false);
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Memuat surat…</h3>
      </div>
    );
  }

  if (error || !surah) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <RefreshCw className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Gagal memuat surat</h3>
        <p className="text-base text-slate-600 font-medium mb-6">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigateSurah(surahNumber)}
            className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl cursor-pointer"
          >
            Coba lagi
          </button>
          <button
            onClick={onBack}
            className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl cursor-pointer"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const isRead = (n: number) => Boolean(progress.readVerses[`${surahNumber}:${n}`]);

  const isInFilter = (n: number) => {
    if (dupFilter === 'off') return true;
    const t = twinMap.get(n);
    if (!t) return false;
    return dupFilter === 'all' || t.value === dupFilter;
  };

  const sameCount = surahsWithSameAyahCount(surahNumber);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-base font-bold text-slate-700 hover:text-emerald-700 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" /> Daftar 114 Surat
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateSurah(surahNumber - 1)}
            disabled={surahNumber <= 1}
            className="p-2.5 rounded-xl border-2 border-slate-200 text-slate-700 hover:border-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Surat sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-extrabold text-slate-700 tabular-nums">
            {surahNumber} / 114
          </span>
          <button
            onClick={() => onNavigateSurah(surahNumber + 1)}
            disabled={surahNumber >= 114}
            className="p-2.5 rounded-xl border-2 border-slate-200 text-slate-700 hover:border-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Surat selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header Surat (Desain Simpel & Nyaman untuk Semua Usia) */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8 mb-5 text-center">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="relative">
          <div className="font-arabic text-5xl text-slate-900 mb-2" dir="rtl">
            {surah.name_translations.ar}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">{surah.name}</h1>
          <p className="text-base text-slate-600 font-semibold mt-1">
            {surah.name_translations.id} · {surah.type} · {surah.number_of_ayah} Ayat
          </p>

          {/* Total Hisab Surat & Ringkasan Ayat Kembar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-bold">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl px-3.5 py-1.5 shadow-2xs">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total Hisab Surat:</span>
              <span className="text-emerald-800 font-extrabold tabular-nums text-sm">
                {formatNumber(stat?.total ?? 0)}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 font-semibold">{formatNumber(stat?.letters ?? 0)} Huruf</span>
            </div>

            {twinMap.size > 0 && (
              <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-3.5 py-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>{twinMap.size} Ayat Kembar ({dupGroups.length} grup)</span>
              </div>
            )}
          </div>

          {sameCount.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1 text-amber-800">
                <Layers className="w-3.5 h-3.5" /> Surat lain dengan {surah.number_of_ayah} ayat:
              </span>
              {sameCount.map((n) => (
                <button
                  key={n}
                  onClick={() => onNavigateSurah(n)}
                  className="font-bold text-amber-900 bg-amber-50 border border-amber-200 hover:border-amber-500 rounded-lg px-2 py-0.5 cursor-pointer"
                >
                  {n}. {allSurahs[n - 1]?.name}
                </button>
              ))}
            </div>
          )}

          {/* Tombol Audio & Ukuran Tulisan */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={toggleAudio}
              className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 bg-slate-900 hover:bg-emerald-700 text-white cursor-pointer transition-colors"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {playing ? 'Jeda Murottal' : 'Putar Murottal'}
            </button>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <Type className="w-4 h-4 text-slate-500 mx-1.5" />
              {(['normal', 'large', 'huge'] as const).map((k, i) => (
                <button
                  key={k}
                  onClick={() => setFontSize(k)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition-colors ${
                    fontSize === k ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {['Sedang', 'Besar', 'Ekstra'][i]}
                </button>
              ))}
            </div>

            {/* Toggle Teks Tanpa Harakat (Gundul) vs Berharakat */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setShowHarakat(false)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold cursor-pointer transition-all ${
                  !showHarakat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilkan teks Al-Qur'an rasm tanpa harakat (gundul)"
              >
                Tanpa Harakat
              </button>
              <button
                type="button"
                onClick={() => setShowHarakat(true)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold cursor-pointer transition-all ${
                  showHarakat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilkan teks dengan harakat lengkap"
              >
                Berharakat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Toolbar: Dropdown Lompat Ayat & Sorot Ayat Kembar (Fit Semua Devices & Layar HP) */}
      <div className="sticky top-16 z-30 w-full px-3 py-2.5 sm:px-4 sm:py-3 mb-5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full min-w-0">
          {/* Dropdown 1: Pilih & Lompat ke Ayat */}
          <div className="w-full min-w-0 flex items-center gap-2 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-3 py-1.5 overflow-hidden">
            <span className="text-xs sm:text-sm font-black text-emerald-800 shrink-0">Pilih Ayat:</span>
            <select
              value=""
              onChange={(e) => e.target.value && jumpToAyah(Number(e.target.value))}
              aria-label="Lompat ke nomor ayat"
              className="w-full min-w-0 flex-1 truncate bg-transparent py-1 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="">Lompat ayat… (1–{surah.number_of_ayah})</option>
              {surah.verses.map((v) => (
                <option key={v.number} value={v.number}>
                  Ayat {v.number} — hisab: {formatNumber(stat?.ayat[v.number - 1] ?? 0)}
                  {twinMap.has(v.number) ? ' • (kembar)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 2: Sorot Ayat Kembar */}
          {dupGroups.length > 0 ? (
            <div
              className={`w-full min-w-0 flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 overflow-hidden transition-colors ${
                dupFilter === 'off' ? 'border-slate-300 bg-white' : 'border-rose-400 bg-rose-50'
              }`}
            >
              <Copy className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-xs sm:text-sm font-black text-rose-900 shrink-0">
                Sorot Kembar:
              </span>
              <select
                value={String(dupFilter)}
                onChange={(e) => handleDupFilterChange(e.target.value)}
                aria-label="Pilih opsi sorot ayat kembar"
                className="w-full min-w-0 flex-1 truncate bg-transparent py-1 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="off">Mati (Semua Ayat)</option>
                <option value="all">
                  Semua Kembar ({twinMap.size} ayat)
                </option>
                {dupGroups.map((g) => (
                  <option key={g.value} value={g.value}>
                    Ayat {g.ayat.join(' & ')} ({g.ayat.length} ayat)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="w-full min-w-0 flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-400">
              <Copy className="w-4 h-4 shrink-0" />
              <span className="truncate">Tidak ada ayat kembar di surat ini</span>
            </div>
          )}
        </div>

        {/* Tombol Sentuh Cepat untuk Pengguna HP (Mobile Touch Friendly) */}
        {dupGroups.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">Pilihan Cepat:</span>
            <button
              type="button"
              onClick={() => handleDupFilterChange('all')}
              className={`px-2.5 py-1 rounded-lg font-black shrink-0 cursor-pointer transition-colors ${
                dupFilter === 'all'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              Semua Kembar ({twinMap.size})
            </button>
            {dupGroups.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => handleDupFilterChange(String(g.value))}
                className={`px-2.5 py-1 rounded-lg font-black shrink-0 cursor-pointer transition-colors ${
                  dupFilter === g.value
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-rose-50 border border-slate-200'
                }`}
              >
                Ayat {g.ayat.join(' & ')}
              </button>
            ))}
            {dupFilter !== 'off' && (
              <button
                type="button"
                onClick={() => handleDupFilterChange('off')}
                className="px-2 py-1 rounded-lg text-slate-500 hover:text-rose-700 font-bold shrink-0 cursor-pointer underline text-[11px]"
              >
                Matikan
              </button>
            )}
          </div>
        )}

        {/* Petunjuk jelas saat filter aktif */}
        {dupFilter !== 'off' && (
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-rose-900 bg-rose-100/90 rounded-xl px-3 py-1.5 animate-fadeIn">
            <span className="flex items-center gap-1.5 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate">
                Ayat kembar disorot ({dupFilter === 'all' ? `${twinMap.size} ayat` : 'pasangan terpilih'}). Ayat lain diredupkan.
              </span>
            </span>
            <button
              onClick={() => setDupFilter('off')}
              className="text-xs font-extrabold text-rose-900 hover:underline cursor-pointer shrink-0 ml-2"
            >
              Matikan ✕
            </button>
          </div>
        )}
      </div>

      {/* Basmalah */}
      {surahNumber !== 1 && surahNumber !== 9 && (
        <div className="text-center py-6 mb-5 rounded-2xl bg-white border border-slate-200">
          <p className="font-arabic text-3xl sm:text-4xl text-slate-800" dir="rtl">
            {showHarakat ? 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' : 'بسم الله الرحمن الرحيم'}
          </p>
          <p className="text-sm text-slate-500 font-semibold mt-2">
            Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang
          </p>
        </div>
      )}

      {/* Daftar Ayat */}
      <div className="space-y-4">
        {surah.verses.map((verse) => {
          const inFilter = isInFilter(verse.number);
          return (
            <VerseCard
              key={verse.number}
              verse={verse}
              surahNumber={surahNumber}
              allSurahs={allSurahs}
              twins={twinMap.get(verse.number)?.others ?? []}
              dimmed={dupFilter !== 'off' && !inFilter}
              highlighted={dupFilter !== 'off' && inFilter}
              flash={flashAyah === verse.number}
              isRead={isRead(verse.number)}
              arabicClass={FONT_SIZES[fontSize]}
              showHarakat={showHarakat}
              onToggleRead={() => onToggleRead(surahNumber, verse.number)}
              onSetLastRead={() => onSetLastRead(surahNumber, surah.name, verse.number)}
              onJumpAyah={jumpToAyah}
              onOpenOther={(s, a) => onNavigateSurah(s, a)}
            />
          );
        })}
      </div>

      {/* Tombol Bawah */}
      <div className="pt-10 pb-4 flex justify-center gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Surat
        </button>
        {surahNumber < 114 && (
          <button
            onClick={() => onNavigateSurah(surahNumber + 1)}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer inline-flex items-center gap-2 transition-colors"
          >
            {allSurahs[surahNumber]?.name} <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
