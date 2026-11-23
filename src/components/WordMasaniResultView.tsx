import React, { useState } from 'react';
import { WordHit, WordMasaniResult } from '../utils/masaniWord';
import { formatNumber } from '../utils/abjad';

type OpenFn = (surahNumber: number, focusAyah?: number) => void;

const SHOW = 60;

export const HitChips: React.FC<{ hits: WordHit[]; onOpen: OpenFn; showWord?: boolean }> = ({
  hits,
  onOpen,
  showWord,
}) => {
  const [all, setAll] = useState(false);
  const list = all ? hits : hits.slice(0, SHOW);
  return (
    <div className="flex flex-wrap gap-1">
      {list.map((h, i) => (
        <button
          key={`${h.surah}-${h.ayah}-${h.wordIndex}-${i}`}
          type="button"
          onClick={() => onOpen(h.surah, h.ayah)}
          className="px-1.5 py-0.5 rounded bg-white border border-slate-200 hover:border-indigo-500 text-[11px] font-bold text-slate-700 cursor-pointer"
          title={`QS. ${h.surahName}:${h.ayah}, kata ke-${h.wordIndex}: ${h.word}`}
        >
          {h.surah}:{h.ayah}
          {showWord && <span className="font-arabic ml-1">{h.word}</span>}
        </button>
      ))}
      {hits.length > SHOW && (
        <button
          type="button"
          onClick={() => setAll(!all)}
          className="px-1.5 py-0.5 text-[11px] font-black text-indigo-700 hover:underline cursor-pointer"
        >
          {all ? 'Ringkas' : `Tampilkan semua (${formatNumber(hits.length)})`}
        </button>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number; sub?: string }> = ({ label, value, sub }) => (
  <div className="rounded-xl border-2 border-indigo-200 bg-white p-2.5 text-center">
    <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">{label}</div>
    <div className="text-2xl font-black text-slate-900 tabular-nums">{formatNumber(value)}</div>
    {sub && <div className="text-[11px] font-bold text-slate-500">{sub}</div>}
  </div>
);

const Section: React.FC<{ tone: string; title: string; children: React.ReactNode }> = ({
  tone,
  title,
  children,
}) => (
  <section className={`rounded-2xl border p-3 space-y-2 ${tone}`}>
    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">{title}</h4>
    {children}
  </section>
);

const Empty: React.FC<{ text: string }> = ({ text }) => (
  <p className="text-xs text-slate-500 font-semibold">{text}</p>
);

export const WordMasaniResultView: React.FC<{ result: WordMasaniResult; onOpen: OpenFn }> = ({
  result,
  onOpen,
}) => {
  const [showAllGroups, setShowAllGroups] = useState(false);
  const groups = showAllGroups ? result.sameValueWords : result.sameValueWords.slice(0, 20);
  const totalOccur = result.exact.length + result.contains.length;

  return (
    <div className="space-y-4">
      {/* Kata yang dicari */}
      <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-wrap items-center justify-between gap-3">
        <div className="font-arabic text-4xl text-slate-900" dir="rtl">
          {result.query}
        </div>
        <div className="text-xs font-bold text-amber-900 space-y-0.5 text-right">
          <div>
            Kerangka huruf: <span className="font-arabic text-base">{result.skeleton}</span> (
            {result.letterCount} huruf)
          </div>
          <div className="text-lg font-black">Nilai hisab: {formatNumber(result.value)}</div>
        </div>
      </div>

      {/* JUMLAH TOTAL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Stat label="Kata Persis" value={result.exact.length} sub="kemunculan" />
        <Stat label="Mengandung Kata" value={result.contains.length} sub="kata berimbuhan" />
        <Stat
          label="Masani Kata"
          value={result.sameValueWordTotal}
          sub={`${formatNumber(result.sameValueWords.length)} kata berbeda, nilai sama`}
        />
        <Stat label="Masani Ayat" value={result.sameValueAyat.length} sub="ayat bernilai sama" />
      </div>
      <p className="text-xs font-bold text-slate-600">
        Kata ini (persis atau berimbuhan) muncul {formatNumber(totalOccur)} kali di{' '}
        {formatNumber(result.surahsWithWord)} dari 114 surat.
      </p>

      <Section
        tone="border-sky-200 bg-sky-50/50"
        title={`1. Kemunculan kata persis (${formatNumber(result.exact.length)})`}
      >
        {result.exact.length ? (
          <HitChips hits={result.exact} onOpen={onOpen} />
        ) : (
          <Empty text="Kata persis ini tidak ditemukan." />
        )}
      </Section>

      <Section
        tone="border-emerald-200 bg-emerald-50/50"
        title={`2. Kata yang mengandung huruf-huruf ini (${formatNumber(result.contains.length)})`}
      >
        {result.contains.length ? (
          <HitChips hits={result.contains} onOpen={onOpen} showWord />
        ) : (
          <Empty text="Tidak ada." />
        )}
      </Section>

      <Section
        tone="border-violet-200 bg-violet-50/50"
        title={`3. Masani kata: kata lain bernilai ${formatNumber(result.value)} (${formatNumber(
          result.sameValueWords.length
        )} kata, ${formatNumber(result.sameValueWordTotal)} kemunculan)`}
      >
        {groups.length === 0 ? (
          <Empty text="Tidak ada kata lain dengan nilai hisab yang sama." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-violet-200 bg-white">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-violet-600 text-white">
                <tr>
                  <th className="px-2 py-1.5 text-left font-black">#</th>
                  <th className="px-2 py-1.5 text-right font-black">Kata</th>
                  <th className="px-2 py-1.5 text-right font-black">Jumlah</th>
                  <th className="px-2 py-1.5 text-left font-black">Letak (surat:ayat)</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g, i) => (
                  <tr key={g.skeleton} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="px-2 py-1.5 text-slate-400 font-bold align-top">{i + 1}</td>
                    <td className="px-2 py-1.5 font-arabic text-xl text-right align-top" dir="rtl">
                      {g.word}
                    </td>
                    <td className="px-2 py-1.5 text-right font-black tabular-nums align-top">
                      {formatNumber(g.count)}
                    </td>
                    <td className="px-2 py-1.5">
                      <HitChips hits={g.hits} onOpen={onOpen} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {result.sameValueWords.length > 20 && (
          <button
            type="button"
            onClick={() => setShowAllGroups(!showAllGroups)}
            className="text-xs font-black text-violet-700 hover:underline cursor-pointer"
          >
            {showAllGroups
              ? 'Ringkas'
              : `Tampilkan semua ${formatNumber(result.sameValueWords.length)} kata`}
          </button>
        )}
      </Section>

      <Section
        tone="border-rose-200 bg-rose-50/50"
        title={`4. Ayat yang total hisabnya = ${formatNumber(result.value)} (${formatNumber(
          result.sameValueAyat.length
        )})`}
      >
        {result.sameValueAyat.length ? (
          <div className="flex flex-wrap gap-1">
            {result.sameValueAyat.map((a) => (
              <button
                key={`${a.surah}:${a.ayah}`}
                type="button"
                onClick={() => onOpen(a.surah, a.ayah)}
                className="px-2 py-0.5 rounded bg-white border border-rose-200 hover:border-rose-500 text-xs font-bold text-slate-700 cursor-pointer"
              >
                QS. {a.surahName}:{a.ayah}
              </button>
            ))}
          </div>
        ) : (
          <Empty text="Tidak ada ayat dengan nilai ini." />
        )}
      </Section>
    </div>
  );
};

