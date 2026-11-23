import React, { useMemo, useState } from 'react';
import { Search, X, Languages } from 'lucide-react';
import { findWordMasani } from '../utils/masaniWord';
import { WordMasaniResultView } from './WordMasaniResultView';
import {
  hasArabic,
  translateIndonesianToLisan,
  LisanMatch,
  LISAN_SUGGESTIONS,
} from '../utils/lisanGlossary';

interface Props {
  onOpenSurah: (surahNumber: number, focusAyah?: number) => void;
}

const EXAMPLES = ['الله', 'رحمن', 'رب', 'نور', 'صبر', 'قلب'];

export const WordMasaniSearch: React.FC<Props> = ({ onOpenSurah }) => {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [translations, setTranslations] = useState<LisanMatch[] | null>(null);
  const [indoQuery, setIndoQuery] = useState('');
  const result = useMemo(() => (query ? findWordMasani(query) : null), [query]);
  const activeLisan = translations?.find((t) => t.entry.arabic === query) ?? null;

  const run = (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    if (hasArabic(q)) {
      // Kata Arab langsung dicari masaninya
      setTranslations(null);
      setIndoQuery('');
      setQuery(q);
      return;
    }
    // Kata Indonesia → terjemahkan ke Arab menurut Lisanul Arab
    const found = translateIndonesianToLisan(q);
    setIndoQuery(q);
    setTranslations(found);
    setQuery(found[0]?.entry.arabic ?? '');
  };

  return (
    <div className="bg-white border-2 border-indigo-300 rounded-3xl p-4 sm:p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-600" />
          Cari Masani Sebuah Kata di Seluruh Al-Qur'an
        </h3>
        <p className="text-xs text-slate-600 font-medium">
          Tulis kata Arab, <strong>atau kata Bahasa Indonesia</strong> (mis. "rahmat", "petunjuk"),
          lalu tekan Cari. Kata Indonesia diterjemahkan dulu ke kata Arab menurut makna Lisanul Arab
          (Ibnu Manzhur), lalu dicari kemunculannya, masani katanya, dan ayat yang nilainya sama, di
          seluruh 114 surat.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
        }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <div className="relative flex-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            dir={hasArabic(input) ? 'rtl' : 'ltr'}
            placeholder="Tulis kata Arab atau Indonesia… (contoh: الله / rahmat)"
            aria-label="Kata yang dicari"
            className={`w-full px-4 py-2.5 pr-10 rounded-2xl border-2 border-indigo-300 focus:border-indigo-600 focus:outline-none bg-indigo-50/40 ${
              hasArabic(input) ? 'font-arabic text-2xl' : 'text-base font-semibold'
            }`}
          />
          {input && (
            <button
              type="button"
              onClick={() => {
                setInput('');
                setQuery('');
                setTranslations(null);
                setIndoQuery('');
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Hapus"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm cursor-pointer"
        >
          Cari Masani
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-500">
        <span>Contoh Arab:</span>
        {EXAMPLES.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => {
              setInput(w);
              run(w);
            }}
            className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-100 font-arabic text-lg text-slate-800 cursor-pointer"
          >
            {w}
          </button>
        ))}
        <span className="ml-2">Contoh Indonesia:</span>
        {LISAN_SUGGESTIONS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => {
              setInput(w);
              run(w);
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-900 cursor-pointer"
          >
            {w}
          </button>
        ))}
      </div>

      {/* TERJEMAHAN INDONESIA → ARAB MENURUT LISANUL ARAB */}
      {translations && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-3 sm:p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-900">
            <Languages className="w-4 h-4" />
            Terjemahan "{indoQuery}" ke Bahasa Arab menurut Lisanul Arab (Ibnu Manzhur)
          </div>
          {translations.length === 0 ? (
            <p className="text-xs font-semibold text-rose-700">
              Kata "{indoQuery}" belum ada di glosarium Lisanul Arab aplikasi ini. Coba kata lain
              (mis. rahmat, tuhan, petunjuk, manusia, jalan) atau tulis langsung dalam huruf Arab.
            </p>
          ) : (
            <>
              <p className="text-[11px] font-bold text-amber-800">
                {translations.length} padanan ditemukan. Klik salah satu untuk mencari masaninya:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {translations.map((t) => (
                  <button
                    key={t.entry.arabic}
                    type="button"
                    onClick={() => setQuery(t.entry.arabic)}
                    className={`text-left p-2.5 rounded-xl border-2 cursor-pointer transition-colors ${
                      t.entry.arabic === query
                        ? 'border-indigo-600 bg-white shadow-xs'
                        : 'border-amber-200 bg-white/70 hover:border-amber-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black text-slate-500">
                        "{t.matched}" → akar {t.entry.root}
                      </span>
                      <span className="font-arabic text-2xl text-slate-900" dir="rtl">
                        {t.entry.arabic}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{t.entry.meaning}</p>
                    <p className="text-[11px] text-slate-400 font-bold">
                      Lisanul Arab, entri {t.entry.entry}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeLisan && (
        <p className="text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2">
          Menampilkan masani untuk "{indoQuery}" ={' '}
          <span className="font-arabic text-base">{activeLisan.entry.arabic}</span> (akar{' '}
          {activeLisan.entry.root}).
        </p>
      )}

      {query && !result && !translations && (
        <p className="text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
          Tidak ada huruf Arab yang terbaca. Silakan ketik kata dengan huruf Arab.
        </p>
      )}

      {result && <WordMasaniResultView result={result} onOpen={onOpenSurah} />}
    </div>
  );
};
