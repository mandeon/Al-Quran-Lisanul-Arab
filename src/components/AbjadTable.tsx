import React from 'react';
import { ABJAD_TABLE } from '../utils/abjad';

const GROUP_STYLE: Record<string, string> = {
  Satuan: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  Puluhan: 'bg-amber-50 border-amber-200 text-amber-800',
  Ratusan: 'bg-sky-50 border-sky-200 text-sky-800',
};

/** Tabel referensi Susunan Abjad Hisabul Jumal */
export const AbjadTable: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className="space-y-3">
    {ABJAD_TABLE.map((g) => (
      <div key={g.group}>
        <div className="text-sm font-bold text-slate-700 mb-1.5">Angka {g.group.toLowerCase()}</div>
        <div className="flex flex-wrap gap-1.5" dir="rtl">
          {g.items.map((it) => (
            <div
              key={it.letter}
              className={`flex flex-col items-center justify-center rounded-xl border ${GROUP_STYLE[g.group]} ${
                compact ? 'w-11 h-14' : 'w-14 h-16'
              }`}
            >
              <span className={`font-arabic leading-none ${compact ? 'text-xl' : 'text-2xl'}`}>{it.letter}</span>
              <span className="text-xs font-bold tabular-nums mt-1">{it.value}</span>
            </div>
          ))}
        </div>
      </div>
    ))}
    <p className="text-xs text-slate-500 font-medium leading-relaxed">
      أ إ آ ٱ ء = ا (1) · ة = ه (5) · ى ئ = ي (10) · ؤ = و (6). Harakat &amp; tanda waqaf tidak dihitung.
    </p>
  </div>
);
