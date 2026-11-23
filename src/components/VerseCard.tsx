import React, { useMemo, useState } from 'react';
import { CheckCircle, Bookmark, Calculator, ChevronDown, Copy as CopyIcon, Link2 } from 'lucide-react';
import { Verse, SurahMeta } from '../types/quran';
import { abjadBreakdown, formatNumber, stripLeadingBismillah, stripTashkeel } from '../utils/abjad';
import { ayatInOtherSurahsWithValue } from '../utils/abjadStats';
import { renderHighlightedTranslation } from '../utils/highlightKeywords';
import { LetterBreakdown } from './LetterBreakdown';

interface VerseCardProps {
  verse: Verse;
  surahNumber: number;
  allSurahs: SurahMeta[];
  twins: number[]; // ayat lain dalam surat ini dengan nilai sama
  dimmed: boolean;
  highlighted: boolean;
  flash: boolean;
  isRead: boolean;
  arabicClass: string;
  showHarakat?: boolean;
  onToggleRead: () => void;
  onSetLastRead: () => void;
  onJumpAyah: (ayah: number) => void;
  onOpenOther: (surah: number, ayah: number) => void;
}

export const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  surahNumber,
  allSurahs,
  twins,
  dimmed,
  highlighted,
  flash,
  isRead,
  arabicClass,
  showHarakat = false,
  onToggleRead,
  onSetLastRead,
  onJumpAyah,
  onOpenOther,
}) => {
  const [open, setOpen] = useState(false);
  const [showOthers, setShowOthers] = useState(false);

  const text = useMemo(() => {
    if (showHarakat) {
      const sourceWithHarakat = verse.text_with_harakat || verse.text;
      return stripLeadingBismillah(surahNumber, verse.number, sourceWithHarakat);
    }
    const raw = stripLeadingBismillah(surahNumber, verse.number, verse.text);
    return stripTashkeel(raw);
  }, [surahNumber, verse.number, verse.text, verse.text_with_harakat, showHarakat]);
  const breakdown = useMemo(() => abjadBreakdown(text), [text]);
  const others = useMemo(
    () => ayatInOtherSurahsWithValue(breakdown.total, surahNumber),
    [breakdown.total, surahNumber]
  );

  return (
    <article
      id={`ayah-${verse.number}`}
      className={`scroll-mt-36 bg-white border-2 rounded-2xl p-5 sm:p-7 transition-all duration-300 ${
        highlighted
          ? 'border-rose-400 shadow-xl ring-4 ring-rose-200/80 bg-rose-50/20'
          : isRead
          ? 'border-emerald-200'
          : 'border-slate-200/80'
      } ${dimmed ? 'opacity-30 saturate-50 hover:opacity-75' : 'opacity-100'} ${
        flash ? 'animate-pulseRing ring-4 ring-rose-400 border-rose-500' : ''
      }`}
    >
      {/* Banner penjelas jika ayat sedang disorot sebagai ayat kembar (BISA LANGSUNG DIKLIK DI HP MAUPUN LAPTOP) */}
      {highlighted && twins.length > 0 && (
        <div className="mb-4 space-y-1.5 animate-fadeIn">
          {twins.map((twinAyah) => (
            <button
              key={twinAyah}
              type="button"
              onClick={() => onJumpAyah(twinAyah)}
              className="w-full text-left flex items-center justify-between gap-2 bg-rose-100 hover:bg-rose-200 border-2 border-rose-400 text-rose-950 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black cursor-pointer transition-all shadow-xs active:scale-[0.98]"
              title={`Klik untuk langsung melompat ke Ayat ${twinAyah}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <CopyIcon className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="truncate">
                  Ayat Kembar — Lafaz &amp; Hisab Sama dengan Ayat {twinAyah}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 bg-rose-600 text-white rounded-lg px-2.5 py-1 text-xs font-black shrink-0 shadow-2xs">
                Lompat ke Ayat {twinAyah} ↗
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Header Ayat */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-extrabold tabular-nums ${
              highlighted ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-900 text-white'
            }`}
          >
            {verse.number}
          </span>
          <span className="text-base font-bold text-slate-800">Ayat ke-{verse.number}</span>
          {isRead && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1">
              <CheckCircle className="w-3.5 h-3.5" /> Sudah Dibaca
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleRead}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
              isRead
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 bg-slate-50'
            }`}
            title={isRead ? 'Batalkan tanda sudah dibaca' : 'Tandai ayat ini sudah dibaca'}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isRead ? 'Selesai Dibaca' : 'Tandai Dibaca'}</span>
          </button>
          <button
            onClick={onSetLastRead}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:border-amber-400 hover:text-amber-600 bg-slate-50 cursor-pointer transition-colors"
            title="Tandai sebagai bacaan terakhir"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Teks Arab */}
      <p className={`font-arabic text-right text-slate-900 ${arabicClass}`} dir="rtl">
        {text}{' '}
        <span className="inline-block text-emerald-700 text-2xl mr-1 select-none">
          ﴿{verse.number}﴾
        </span>
      </p>

      {/* Terjemahan Bahasa Indonesia */}
      <div className="mt-4">
        <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
          {renderHighlightedTranslation(verse.translation_id)}
        </p>

        {/* Kajian Leksikal Akar Kata Lisanul Arab */}
        {verse.highlight_details && verse.highlight_details.length > 0 && (
          <div className="mt-3.5 space-y-2">
            {verse.highlight_details.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3 text-xs text-amber-950 space-y-1"
              >
                <div className="flex flex-wrap items-center justify-between gap-1 font-bold">
                  <span className="text-amber-900 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-amber-200/80 text-[11px] font-black">
                      Akar: {item.root}
                    </span>
                    <span>«{item.keyword}»</span>
                  </span>
                  <span className="font-arabic text-sm text-slate-800" dir="rtl">
                    {item.arabic_text.length > 70 ? `${item.arabic_text.slice(0, 70)}…` : item.arabic_text}
                  </span>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Baris Bawah: Total Nilai Hisab + Rincian & Badge Ayat Kembar */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Kiri: BADGE AYAT KEMBAR (BISA DIKLIK LANGSUNG UNTUK LOMPAT) */}
        <div className="flex flex-wrap items-center gap-2">
          {twins.length === 1 ? (
            <button
              type="button"
              onClick={() => onJumpAyah(twins[0])}
              className="w-full sm:w-auto group/twin inline-flex items-center justify-between sm:justify-start gap-2 rounded-xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 hover:border-rose-500 text-rose-900 px-3.5 py-2 font-black text-xs sm:text-sm cursor-pointer transition-all shadow-xs active:scale-95"
              title={`Klik tombol ini untuk langsung melompat ke Ayat ${twins[0]}`}
            >
              <div className="flex items-center gap-1.5">
                <CopyIcon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Sama dengan Ayat {twins[0]}</span>
              </div>
              <span className="text-[11px] font-extrabold bg-rose-600 text-white rounded-lg px-2 py-0.5 shadow-2xs">
                Lompat ↗
              </span>
            </button>
          ) : twins.length > 1 ? (
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-bold text-rose-900 inline-flex items-center gap-1">
                <CopyIcon className="w-3.5 h-3.5 text-rose-600" /> Kembaran:
              </span>
              {twins.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onJumpAyah(t)}
                  className="group/twin inline-flex items-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 hover:border-rose-500 text-rose-900 px-3 py-1.5 font-bold text-xs sm:text-sm cursor-pointer transition-all shadow-xs active:scale-95"
                  title={`Klik tombol ini untuk langsung melompat ke Ayat ${t}`}
                >
                  <span>Ayat {t}</span>
                  <span className="text-[10px] font-extrabold bg-rose-600 text-white rounded-md px-1.5 py-0.5">
                    Lompat ↗
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {others.length > 0 && (
            <button
              onClick={() => setShowOthers((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 border border-sky-200 hover:bg-sky-100 px-3 py-2 text-xs font-bold text-sky-800 cursor-pointer transition-colors"
            >
              <Link2 className="w-3.5 h-3.5 text-sky-600" />
              <span>{others.length} ayat serupa di surat lain</span>
            </button>
          )}
        </div>

        {/* Kanan: TOMBOL TOTAL HISAB PER AYAT & RINCIAN (MORE NOTICEABLE, CLEAR, ELEGAN) */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 cursor-pointer transition-all shadow-xs border-2 select-none ${
            open
              ? 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 hover:border-emerald-700'
          }`}
          aria-expanded={open}
          title={open ? 'Tutup rincian hitungan huruf' : 'Lihat rincian nilai tiap huruf hijaiyah'}
        >
          <Calculator className="w-4 h-4 text-emerald-200 shrink-0" />
          <span className="text-xs font-semibold text-emerald-100">Total Hisab:</span>
          <span className="text-sm sm:text-base font-black tabular-nums">
            {formatNumber(breakdown.total)}
          </span>
          <span className="text-[11px] font-semibold text-emerald-200/90 hidden sm:inline">
            ({breakdown.letterCount} huruf)
          </span>
          <span className="text-xs font-extrabold bg-white/20 hover:bg-white/30 text-white rounded-lg px-2 py-0.5 transition-colors ml-0.5">
            {open ? 'Tutup' : 'Rincian'}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-emerald-200 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Popup Ayat Surat Lain */}
      {showOthers && others.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 p-3 rounded-xl bg-sky-50/70 border border-sky-200 max-h-40 overflow-y-auto animate-fadeIn">
          {others.map((r) => (
            <button
              key={`${r.surah}:${r.ayah}`}
              onClick={() => onOpenOther(r.surah, r.ayah)}
              className="text-xs font-bold text-sky-900 bg-white border border-sky-200 hover:border-sky-500 rounded-lg px-2.5 py-1 cursor-pointer transition-colors"
            >
              Surat {allSurahs[r.surah - 1]?.name} : Ayat {r.ayah} ↗
            </button>
          ))}
        </div>
      )}

      {/* Drawer Rincian Huruf */}
      {open && (
        <div className="mt-5 pt-5 border-t border-slate-100 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2.5 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            <span>
              Tabel Rincian Huruf: Total {breakdown.letterCount} huruf hijaiyah
            </span>
            <span className="text-emerald-800 font-extrabold text-sm tabular-nums">
              Nilai Ayat: {formatNumber(breakdown.total)}
            </span>
          </div>
          <LetterBreakdown breakdown={breakdown} />
        </div>
      )}
    </article>
  );
};
