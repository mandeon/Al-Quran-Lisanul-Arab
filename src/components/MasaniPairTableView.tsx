import React, { useMemo, useState } from 'react';
import { Table, ArrowRight } from 'lucide-react';
import { MasaniPairTable } from '../utils/masaniTables';
import { formatNumber } from '../utils/abjad';

interface Props {
  title: string;
  subtitle: string;
  table: MasaniPairTable;
  /** true = tabel dalam satu surat (kolom surat cukup satu) */
  sameSurah: boolean;
  tone: 'sky' | 'amber';
  onOpenSurah: (surahNumber: number, focusAyah?: number) => void;
}

const PAGE = 50;

const TONE = {
  sky: { head: 'bg-sky-600', chip: 'bg-sky-50 border-sky-200 text-sky-900', ring: 'border-sky-200' },
  amber: {
    head: 'bg-amber-600',
    chip: 'bg-amber-50 border-amber-200 text-amber-900',
    ring: 'border-amber-200',
  },
};

export const MasaniPairTableView: React.FC<Props> = ({
  title,
  subtitle,
  table,
  sameSurah,
  tone,
  onOpenSurah,
}) => {
  const [page, setPage] = useState(0);
  const t = TONE[tone];
  const pageCount = Math.max(1, Math.ceil(table.totalPairs / PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const slice = useMemo(
    () => table.rows.slice(safePage * PAGE, safePage * PAGE + PAGE),
    [table.rows, safePage]
  );

  return (
    <div className={`bg-white border-2 ${t.ring} rounded-3xl p-3 sm:p-5 space-y-3`}>
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <Table className="w-5 h-5 text-slate-500" />
          {title}
        </h3>
        <p className="text-xs text-slate-600 font-medium">{subtitle}</p>
      </div>

      {/* JUMLAH TOTAL MASANI PADA TABEL INI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className={`rounded-xl border-2 ${t.ring} p-2.5 text-center`}>
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Total Masani
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {formatNumber(table.totalPairs)}
          </div>
          <div className="text-[11px] font-bold text-slate-500">pasangan ayat</div>
        </div>
        <div className={`rounded-xl border ${t.chip} p-2.5 text-center`}>
          <div className="text-[11px] font-black uppercase tracking-wider opacity-70">
            Nilai Hisab
          </div>
          <div className="text-xl font-black tabular-nums">{formatNumber(table.totalValues)}</div>
        </div>
        <div className={`rounded-xl border ${t.chip} p-2.5 text-center`}>
          <div className="text-[11px] font-black uppercase tracking-wider opacity-70">
            Ayat Terlibat
          </div>
          <div className="text-xl font-black tabular-nums">{formatNumber(table.totalAyat)}</div>
        </div>
        <div className={`rounded-xl border ${t.chip} p-2.5 text-center`}>
          <div className="text-[11px] font-black uppercase tracking-wider opacity-70">
            Surat Terlibat
          </div>
          <div className="text-xl font-black tabular-nums">{formatNumber(table.totalSurahs)}</div>

      {table.totalPairs === 0 ? (
        <p className="text-xs text-slate-500 font-semibold py-4 text-center">
          Tidak ada pasangan Masani pada cakupan ini.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead className={`${t.head} text-white`}>
                <tr>
                  <th className="px-2 py-2 text-left font-black">#</th>
                  <th className="px-2 py-2 text-right font-black">Nilai Hisab</th>
                  {sameSurah && <th className="px-2 py-2 text-left font-black">Surat</th>}
                  <th className="px-2 py-2 text-left font-black">Ayat A</th>
                  <th className="px-2 py-2 text-left font-black">Ayat B</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((r, i) => (
                  <tr
                    key={`${r.value}-${r.aSurah}-${r.aAyah}-${r.bSurah}-${r.bAyah}`}
                    className={i % 2 ? 'bg-slate-50' : 'bg-white'}
                  >
                    <td className="px-2 py-1.5 text-slate-400 font-bold tabular-nums">
                      {safePage * PAGE + i + 1}
                    </td>
                    <td className="px-2 py-1.5 text-right font-black text-indigo-800 tabular-nums">
                      {formatNumber(r.value)}
                    </td>
                    {sameSurah && (
                      <td className="px-2 py-1.5 font-bold text-slate-700 whitespace-nowrap">
                        {r.aSurah}. {r.aSurahName}
                      </td>
                    )}
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenSurah(r.aSurah, r.aAyah)}
                        className="font-black text-slate-900 hover:text-indigo-700 hover:underline cursor-pointer"
                      >
                        {sameSurah ? `Ayat ${r.aAyah}` : `${r.aSurah}. ${r.aSurahName}:${r.aAyah}`}
                      </button>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenSurah(r.bSurah, r.bAyah)}
                        className="font-black text-slate-900 hover:text-indigo-700 hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        {sameSurah ? `Ayat ${r.bAyah}` : `${r.bSurah}. ${r.bSurahName}:${r.bAyah}`}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Navigasi halaman */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <span className="text-slate-600">
              Menampilkan {formatNumber(safePage * PAGE + 1)}–
              {formatNumber(Math.min((safePage + 1) * PAGE, table.totalPairs))} dari{' '}
              <strong className="text-slate-900">{formatNumber(table.totalPairs)}</strong> pasangan
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(Math.max(0, safePage - 1))}
                disabled={safePage === 0}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Sebelumnya
              </button>
              <span className="tabular-nums text-slate-700">
                {safePage + 1} / {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
                disabled={safePage >= pageCount - 1}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

        </div>
      </div>
