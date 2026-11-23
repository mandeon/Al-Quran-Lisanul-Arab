import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="mt-16 border-t border-slate-200 bg-white py-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm font-semibold text-slate-500">
      <div>
        <div className="text-base font-extrabold text-slate-900">Alquran Counter</div>
        <p>Perhitungan Hisabul Jumal per huruf, per ayat, dan per surat.</p>
      </div>
      <a
        href="https://github.com/penggguna/QuranJSON"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
      >
        Sumber teks: QuranJSON <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  </footer>
);
