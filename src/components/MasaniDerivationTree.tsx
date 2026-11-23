import React from 'react';
import { GitFork, ArrowRight } from 'lucide-react';
import { MasaniDerivation, DerivedAyah, DerivationLayer } from '../utils/masaniDerivation';
import { formatNumber } from '../utils/abjad';

interface Props {
  derivation: MasaniDerivation;
  onOpenSurah: (surahNumber: number, focusAyah?: number) => void;
}

const LAYER_TONE = [
  { box: 'border-sky-200 bg-sky-50/40', badge: 'bg-sky-600' },
  { box: 'border-emerald-200 bg-emerald-50/40', badge: 'bg-emerald-600' },
  { box: 'border-violet-200 bg-violet-50/40', badge: 'bg-violet-600' },
  { box: 'border-rose-200 bg-rose-50/40', badge: 'bg-rose-600' },
];

const AyahRow: React.FC<{ d: DerivedAyah; onOpen: Props['onOpenSurah'] }> = ({ d, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(d.surah, d.ayah)}
    className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer space-y-1"
  >
    <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-black">
      <span className="text-slate-900">
        QS. {d.surah}. {d.surahName}:{d.ayah} ↗
      </span>
      <span className="tabular-nums text-indigo-700">Hisab {formatNumber(d.value)}</span>
    </div>
    <div className="flex flex-wrap items-center gap-1 text-[11px] font-bold">
      <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-100">
        {d.relation}
      </span>
      <span className="text-slate-400 flex items-center gap-0.5">
        induk {d.parent} <ArrowRight className="w-3 h-3" /> {d.surah}:{d.ayah}
      </span>
    </div>
    {d.arabic && (
      <p className="font-arabic text-lg text-slate-900 text-right line-clamp-2" dir="rtl">
        {d.arabic}
      </p>
    )}
    {d.translation && (
      <p className="text-xs text-slate-600 font-medium line-clamp-2">{d.translation}</p>
    )}
  </button>
);

const Side: React.FC<{
  title: string;
  items: DerivedAyah[];
  total: number;
  onOpen: Props['onOpenSurah'];
}> = ({ title, items, total, onOpen }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
    <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
      {title} ({total})
    </div>
    {items.length === 0 ? (
      <p className="text-xs text-slate-400 font-semibold">Tidak ada ayat turunan pada lapis ini.</p>
    ) : (
      items.map((d) => <AyahRow key={`${d.surah}:${d.ayah}`} d={d} onOpen={onOpen} />)
    )}
    {total > items.length && (
      <p className="text-[11px] text-slate-400 font-bold">
        +{total - items.length} ayat lainnya tidak ditampilkan
      </p>
    )}
  </div>
);

const LayerBlock: React.FC<{ layer: DerivationLayer; idx: number; onOpen: Props['onOpenSurah'] }> = ({
  layer,
  idx,
  onOpen,
}) => {
  const tone = LAYER_TONE[idx] ?? LAYER_TONE[0];
  return (
    <div className={`rounded-2xl border-2 ${tone.box} p-3 sm:p-4 space-y-3`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-lg ${tone.badge} text-white text-xs font-black`}>
            {layer.step}
          </span>
          <span className="text-sm font-black text-slate-900">{layer.formula}</span>
          <span className="text-sm font-bold text-slate-700">· {layer.name}</span>
        </div>
        <span className="text-[11px] font-black text-slate-600">
          {layer.totalWithin} dalam surat · {layer.totalAcross} antar surat
        </span>
      </div>
      <p className="text-xs text-slate-600 font-medium">{layer.rule}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Side title="Turunan dalam surat" items={layer.withinSurah} total={layer.totalWithin} onOpen={onOpen} />
        <Side title="Turunan antar surat" items={layer.acrossSurahs} total={layer.totalAcross} onOpen={onOpen} />
      </div>
    </div>
  );
};

export const MasaniDerivationTree: React.FC<Props> = ({ derivation, onOpenSurah }) => {
  const totalWithin = derivation.layers.reduce((a, l) => a + l.totalWithin, 0);
  const totalAcross = derivation.layers.reduce((a, l) => a + l.totalAcross, 0);
  return (
    <div className="bg-white border-2 border-indigo-200 rounded-3xl p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <GitFork className="w-5 h-5 text-indigo-600" />
          Rincian Ayat Turunan Masani: QS. {derivation.surahName}
        </h3>
        <span className="text-[11px] font-black text-slate-600">
          Total turunan: {totalWithin} dalam surat · {totalAcross} antar surat
        </span>
      </div>

      {/* Akar */}
      <button
        type="button"
        onClick={() => onOpenSurah(derivation.surahNumber, 1)}
        className="w-full text-left p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 hover:border-amber-500 cursor-pointer space-y-1"
      >
        <div className="flex items-center justify-between text-xs font-black text-amber-900">
          <span>Akar (Pokok): QS. {derivation.surahName}:1</span>
          <span className="tabular-nums">Hisab {formatNumber(derivation.rootValue)}</span>
        </div>
        <p className="font-arabic text-xl text-slate-900 text-right" dir="rtl">
          {derivation.root.arabic}
        </p>
        <p className="text-xs text-slate-700 font-medium">{derivation.root.translation}</p>
      </button>

      {derivation.layers.map((layer, i) => (
        <LayerBlock key={layer.step} layer={layer} idx={i} onOpen={onOpenSurah} />
      ))}

      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
        Catatan: Hubungan pada pohon ini murni numerik (hisabul jumal). Setiap ayat hanya dicatat
        sekali, pada lapis terendah tempat ia pertama kali ditemukan. Kolom "induk" menunjukkan dari
        ayat mana turunan tersebut lahir.
      </p>
    </div>
  );
};

