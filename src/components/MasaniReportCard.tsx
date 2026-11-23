import React from 'react';
import { Layers } from 'lucide-react';
import { SurahMasaniReport, MasaniPairRef } from '../utils/masaniAnalysis';
import { formatNumber } from '../utils/abjad';

interface MasaniReportCardProps {
  report: SurahMasaniReport;
  onOpenSurah: (surahNumber: number, focusAyah?: number) => void;
}

const PairList: React.FC<{
  title: string;
  empty: string;
  refs: MasaniPairRef[];
  tone: 'sky' | 'amber';
  onOpenSurah: MasaniReportCardProps['onOpenSurah'];
}> = ({ title, empty, refs, tone, onOpenSurah }) => (
  <div
    className={`rounded-2xl border p-3 space-y-2 ${
      tone === 'sky' ? 'border-sky-200 bg-sky-50/50' : 'border-amber-200 bg-amber-50/50'
    }`}
  >
    <div
      className={`text-xs font-black uppercase tracking-wider ${
        tone === 'sky' ? 'text-sky-900' : 'text-amber-900'
      }`}
    >
      {title} ({refs.length})
    </div>
    {refs.length === 0 ? (
      <p className="text-xs text-slate-500 font-semibold">{empty}</p>
    ) : (
      refs.slice(0, 8).map((r) => (
        <button
          key={`${r.surah}-${r.ayah}`}
          type="button"
          onClick={() => onOpenSurah(r.surah, r.ayah)}
          className="w-full text-left p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer"
        >
          <div className={`text-xs font-black ${tone === 'sky' ? 'text-sky-800' : 'text-amber-800'}`}>
            QS. {r.surahName}:{r.ayah} ↗
          </div>
          <p className="text-xs text-slate-600 font-medium line-clamp-2">{r.translation}</p>
        </button>
      ))
    )}
    {refs.length > 8 && (
      <p className="text-[11px] text-slate-400 font-bold">+{refs.length - 8} lainnya</p>
    )}
  </div>
);


export const MasaniReportCard: React.FC<MasaniReportCardProps> = ({ report, onOpenSurah }) => (
  <div className="bg-white border-2 border-emerald-200 rounded-3xl p-4 sm:p-6 space-y-5">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
        <Layers className="w-5 h-5 text-emerald-600" />
        Masani QS. {report.surahName}, Diawali Ayat 1
      </h3>
      <div className="flex flex-wrap gap-1.5 text-[11px] font-black">
        <span className="px-2 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900">
          Dalam surat: {report.counts.withinSurahPairs} pasangan
        </span>
        <span className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
          Antar surat: {report.counts.acrossSurahPairs} kaitan · {report.counts.linkedSurahs} surat
        </span>
      </div>
    </div>

    {/* Ayat 1 sebagai akar */}
    <button
      type="button"
      onClick={() => onOpenSurah(report.surahNumber, 1)}
      className="w-full p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 hover:border-emerald-500 cursor-pointer space-y-2 text-left"
    >
      <div className="flex items-center justify-between text-xs font-black text-emerald-900">
        <span>Akar: QS. {report.surahName}:1</span>
        <span className="tabular-nums">Hisab {formatNumber(report.opening.value)}</span>
      </div>
      <p className="font-arabic text-xl sm:text-2xl text-slate-900 text-right" dir="rtl">
        {report.opening.arabic}
      </p>
      <p className="text-xs sm:text-sm text-slate-700 font-medium">{report.opening.translation}</p>
    </button>

    {/* Pasangan langsung ayat 1 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <PairList
        title="Pasangan ayat 1 dalam surat"
        empty="Tidak ada ayat lain bernilai sama di surat ini."
        refs={report.opening.withinSurah}
        tone="sky"
        onOpenSurah={onOpenSurah}
      />
      <PairList
        title="Pasangan ayat 1 antar surat"
        empty="Ayat 1 tidak punya kembaran nilai di surat lain."
        refs={report.opening.acrossSurahs}
        tone="amber"
        onOpenSurah={onOpenSurah}
      />
    </div>

    {/* Seluruh masani dalam surat */}
    <div className="space-y-2">
      <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
        Semua masani dalam surat ({report.withinSurahGroups.length} grup)
      </div>
      {report.withinSurahGroups.length === 0 ? (
        <p className="text-xs text-slate-500 font-semibold">
          Tidak ada ayat bernilai hisab sama di dalam surat ini.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {report.withinSurahGroups.slice(0, 30).map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => onOpenSurah(report.surahNumber, g.ayat[0])}
              className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 hover:border-sky-500 text-xs font-bold text-sky-900 cursor-pointer"
              title={`Nilai hisab ${formatNumber(g.value)}`}
            >
              Ayat {g.ayat.join(' = ')}
            </button>
          ))}
          {report.withinSurahGroups.length > 30 && (
            <span className="text-[11px] font-bold text-slate-400 self-center">
              +{report.withinSurahGroups.length - 30} grup lainnya
            </span>
          )}
        </div>
      )}
    </div>

    {/* Seluruh masani antar surat */}
    <div className="space-y-2">
      <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
        Masani antar surat: surat paling banyak terkait
      </div>
      {report.acrossSurahSummary.length === 0 ? (
        <p className="text-xs text-slate-500 font-semibold">Tidak ada kaitan nilai ke surat lain.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {report.acrossSurahSummary.slice(0, 10).map((s) => (
            <div key={s.surah} className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-black text-amber-900">
                <span>
                  QS. {s.surah}. {s.surahName}
                </span>
                <span>{s.links.length} kaitan</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {s.links.slice(0, 6).map((l, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onOpenSurah(s.surah, l.toAyah)}
                    className="px-1.5 py-0.5 rounded bg-white border border-amber-200 hover:border-amber-500 text-[11px] font-bold text-slate-700 cursor-pointer"
                    title={`Nilai hisab ${formatNumber(l.value)}`}
                  >
                    {report.surahNumber}:{l.fromAyah} ↔ {s.surah}:{l.toAyah}
                  </button>
                ))}
                {s.links.length > 6 && (
                  <span className="text-[11px] font-bold text-slate-400">+{s.links.length - 6}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {report.acrossSurahSummary.length > 10 && (
        <p className="text-[11px] text-slate-400 font-bold">
          +{report.acrossSurahSummary.length - 10} surat lain juga terkait.
        </p>
      )}
    </div>
  </div>
);

