import React from 'react';
import { AbjadVerseBreakdown, formatNumber } from '../utils/abjad';

/** Warna per kelompok nilai: satuan / puluhan / ratusan */
function tone(value: number) {
  if (value < 10) return { line: 'bg-emerald-400', chip: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  if (value < 100) return { line: 'bg-amber-400', chip: 'bg-amber-50 text-amber-800 border-amber-200' };
  return { line: 'bg-sky-400', chip: 'bg-sky-50 text-sky-800 border-sky-200' };
}

interface LetterBreakdownProps {
  breakdown: AbjadVerseBreakdown;
}

/**
 * Rincian per huruf: setiap huruf hijaiyah punya garis yang ditarik ke bawah
 * menuju nilainya, lalu subtotal per kata, dan total per ayat.
 */
export const LetterBreakdown: React.FC<LetterBreakdownProps> = ({ breakdown }) => {
  const { words, total, letterCount, frequency } = breakdown;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Per kata & per huruf */}
      <div className="flex flex-wrap gap-3 justify-start" dir="rtl">
        {words.map((w, wi) => (
          <div key={wi} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-2 pt-2 pb-2">
            <div className="flex gap-0.5" dir="rtl">
              {w.letters.map((l, li) => {
                const t = tone(l.value);
                return (
                  <div key={li} className="flex flex-col items-center w-10" title={`${l.char} = ${l.value}`}>
                    <span className="font-arabic text-2xl leading-none h-9 flex items-center text-slate-900">
                      {l.base}
                    </span>
                    {/* garis indikator */}
                    <span className={`w-0.5 h-5 rounded-full ${t.line}`} />
                    <span className={`w-1.5 h-1.5 rounded-full ${t.line} -mt-0.5`} />
                    <span
                      className={`mt-1 min-w-9 text-center text-xs font-extrabold tabular-nums rounded-md border px-1 py-0.5 ${t.chip}`}
                      dir="ltr"
                    >
                      {l.value}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 pt-1.5 border-t border-dashed border-slate-300 text-center" dir="ltr">
              <span className="text-xs font-semibold text-slate-500">kata </span>
              <span className="text-sm font-extrabold text-slate-900 tabular-nums">{formatNumber(w.total)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Frekuensi huruf */}
      <div>
        <div className="text-sm font-bold text-slate-700 mb-2">Jumlah per huruf</div>
        <div className="flex flex-wrap gap-1.5">
          {frequency.map((f) => {
            const t = tone(f.value);
            return (
              <div key={f.base} className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 ${t.chip}`}>
                <span className="font-arabic text-xl leading-none">{f.base}</span>
                <span className="text-xs font-bold tabular-nums">
                  {f.value} × {f.count} = <span className="font-extrabold">{formatNumber(f.subtotal)}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total ayat */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 text-white px-5 py-4">
        <div className="text-sm font-semibold text-slate-300">
          {letterCount} huruf · {words.length} kata
        </div>
        <div className="text-right">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">Total ayat</div>
          <div className="text-3xl font-extrabold tabular-nums">{formatNumber(total)}</div>
        </div>
      </div>
    </div>
  );
};
