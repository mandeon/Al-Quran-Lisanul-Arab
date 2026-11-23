import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { findWordMasani } from '../utils/masaniWord';
import { WordMasaniResultView } from './WordMasaniResultView';

interface Props {
  onOpenSurah: (surahNumber: number, focusAyah?: number) => void;
}

const EXAMPLES = ['الله', 'رحمن', 'رب', 'نور', 'صبر', 'قلب'];

export const WordMasaniSearch: React.FC<Props> = ({ onOpenSurah }) => {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const result = useMemo(() => (query ? findWordMasani(query) : null), [query]);
  const run = (q: string) => setQuery(q.trim());

  return (
    <div className="bg-white border-2 border-indigo-300 rounded-3xl p-4 sm:p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-600" />
          Cari Masani Sebuah Kata di Seluruh Al-Qur'an
        </h3>
        <p className="text-xs text-slate-600 font-medium">
          Tulis satu kata Arab (boleh dengan atau tanpa harakat), lalu tekan Cari. Sistem mencari
          kemunculan kata itu, kata lain yang nilai hisabnya sama (masani kata), dan ayat yang
          nilainya sama, di seluruh 114 surat.
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
            dir="rtl"
            lang="ar"
            placeholder="اكتب كلمة… (contoh: الله)"
            aria-label="Kata yang dicari"
            className="w-full font-arabic text-2xl px-4 py-2.5 pr-4 pl-10 rounded-2xl border-2 border-indigo-300 focus:border-indigo-600 focus:outline-none bg-indigo-50/40"
          />
          {input && (
            <button
              type="button"
              onClick={() => {
                setInput('');
                setQuery('');
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
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
        <span>Contoh:</span>
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
      </div>

      {query && !result && (
        <p className="text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
          Tidak ada huruf Arab yang terbaca. Silakan ketik kata dengan huruf Arab.
        </p>
      )}

      {result && <WordMasaniResultView result={result} onOpen={onOpenSurah} />}
    </div>
  );
};
