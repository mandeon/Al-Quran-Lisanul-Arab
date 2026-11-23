import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Calculator, Sparkles, Check } from 'lucide-react';
import { abjadBreakdown, formatNumber } from '../utils/abjad';

interface AbjadDocsPageProps {
  onBack: () => void;
}

export const AbjadDocsPage: React.FC<AbjadDocsPageProps> = ({ onBack }) => {
  const [testText, setTestText] = useState('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');
  const breakdown = abjadBreakdown(testText);

  // Data sesuai tabel "SUSUNAN ABJAD HISABUL JUMAL" (Screenshot user)
  const satuan = [
    { num: 1, char: 'ا', name: 'Alif' },
    { num: 2, char: 'ب', name: 'Ba' },
    { num: 3, char: 'ج', name: 'Jim' },
    { num: 4, char: 'د', name: 'Dal' },
    { num: 5, char: 'ه', name: 'Ha' },
    { num: 6, char: 'و', name: 'Wau' },
    { num: 7, char: 'ز', name: 'Zai' },
    { num: 8, char: 'ح', name: 'Ha (besar)' },
    { num: 9, char: 'ط', name: 'Tha' },
  ];

  const puluhan = [
    { num: 10, char: 'ي', name: 'Ya' },
    { num: 20, char: 'ك', name: 'Kaf' },
    { num: 30, char: 'ل', name: 'Lam' },
    { num: 40, char: 'م', name: 'Mim' },
    { num: 50, char: 'ن', name: 'Nun' },
    { num: 60, char: 'س', name: 'Sin' },
    { num: 70, char: 'ع', name: "'Ain" },
    { num: 80, char: 'ف', name: 'Fa' },
    { num: 90, char: 'ص', name: 'Shad' },
  ];

  const ratusan = [
    { num: 100, char: 'ق', name: 'Qaf' },
    { num: 200, char: 'ر', name: 'Ra' },
    { num: 300, char: 'ش', name: 'Syin' },
    { num: 400, char: 'ت', name: 'Ta' },
    { num: 500, char: 'ث', name: 'Tsa' },
    { num: 600, char: 'خ', name: 'Kha' },
    { num: 700, char: 'ذ', name: 'Dzal' },
    { num: 800, char: 'ض', name: 'Dhad' },
    { num: 900, char: 'ظ', name: 'Zha' },
    { num: 1000, char: 'غ', name: 'Ghain' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8">
      {/* Tombol Kembali */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 font-extrabold text-sm transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Utama</span>
        </button>
        <span className="text-xs font-bold text-slate-400">
          Dokumentasi Hisabul Jumal (Abjadiyah)
        </span>
      </div>

      {/* Lembar Dokumen Tabel Utama */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        <div className="text-center border-b border-slate-100 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold mb-3 border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kaidah Hitungan Huruf Hijaiyah</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight underline decoration-emerald-500 decoration-4 underline-offset-8">
            SUSUNAN ABJAD HISABUL JUMAL
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto mt-4 leading-relaxed">
            Sistem penomoran abjad Arab klasik di mana setiap huruf hijaiyah memiliki bobot angka tertentu, terbagi ke dalam <strong>Satuan (1–9)</strong>, <strong>Puluhan (10–90)</strong>, dan <strong>Ratusan hingga Ribuan (100–1000)</strong>.
          </p>
        </div>

        {/* 1. ANGKA SATUAN */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <h2 className="text-lg font-black text-slate-900">
              Angka Satuan : (1 – 9)
            </h2>
          </div>
          <div className="overflow-x-auto pb-1">
            <table className="w-full border-collapse border-2 border-slate-700 text-center font-bold">
              <thead>
                <tr className="bg-emerald-100/80 text-slate-900 text-base sm:text-lg">
                  {satuan.map((s) => (
                    <th key={s.num} className="border-2 border-slate-700 py-2 sm:py-2.5 px-2">
                      {s.num}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white text-slate-900 font-arabic text-2xl sm:text-3xl">
                  {satuan.map((s) => (
                    <td key={s.num} className="border-2 border-slate-700 py-3 sm:py-4 px-2" dir="rtl">
                      {s.char}
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-50 text-slate-500 text-[11px] sm:text-xs">
                  {satuan.map((s) => (
                    <td key={s.num} className="border border-slate-300 py-1 px-1">
                      {s.name}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. ANGKA PULUHAN */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <h2 className="text-lg font-black text-slate-900">
              Angka Puluhan : (10 – 90)
            </h2>
          </div>
          <div className="overflow-x-auto pb-1">
            <table className="w-full border-collapse border-2 border-slate-700 text-center font-bold">
              <thead>
                <tr className="bg-amber-100/80 text-slate-900 text-base sm:text-lg">
                  {puluhan.map((s) => (
                    <th key={s.num} className="border-2 border-slate-700 py-2 sm:py-2.5 px-2">
                      {s.num}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white text-slate-900 font-arabic text-2xl sm:text-3xl">
                  {puluhan.map((s) => (
                    <td key={s.num} className="border-2 border-slate-700 py-3 sm:py-4 px-2" dir="rtl">
                      {s.char}
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-50 text-slate-500 text-[11px] sm:text-xs">
                  {puluhan.map((s) => (
                    <td key={s.num} className="border border-slate-300 py-1 px-1">
                      {s.name}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. ANGKA RATUSAN */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500" />
            <h2 className="text-lg font-black text-slate-900">
              Angka Ratusan : (100 – 1000)
            </h2>
          </div>
          <div className="overflow-x-auto pb-1">
            <table className="w-full border-collapse border-2 border-slate-700 text-center font-bold">
              <thead>
                <tr className="bg-sky-100/80 text-slate-900 text-base sm:text-lg">
                  {ratusan.map((s) => (
                    <th key={s.num} className="border-2 border-slate-700 py-2 sm:py-2.5 px-2">
                      {s.num}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white text-slate-900 font-arabic text-2xl sm:text-3xl">
                  {ratusan.map((s) => (
                    <td key={s.num} className="border-2 border-slate-700 py-3 sm:py-4 px-2" dir="rtl">
                      {s.char}
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-50 text-slate-500 text-[11px] sm:text-xs">
                  {ratusan.map((s) => (
                    <td key={s.num} className="border border-slate-300 py-1 px-1">
                      {s.name}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* KAIDAH & ATURAN PENGHITUNGAN */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Aturan & Ketentuan Penghitungan Rasm Mushaf:
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 font-medium">
            <li className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Semua bentuk alif (ا, أ, إ, آ, ٱ) dan hamzah (ء) dihitung bernilai <strong>1</strong>.</span>
            </li>
            <li className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Ta Marbuthah (ة) dihitung mengikuti bentuk dasarnya Ha bernilai <strong>5</strong>.</span>
            </li>
            <li className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Varian Wau berhamzah (ؤ) = <strong>6</strong>, Ya berhamzah & alif maqsura (ئ, ى) = <strong>10</strong>.</span>
            </li>
            <li className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Tanda baca (fathah, kasrah, dhammah, sukun, tasydid, waqaf) <strong>tidak dihitung</strong> karena bukan huruf rasm tertulis.</span>
            </li>
          </ul>
        </div>

        {/* SIMULASI / KALKULATOR TEKS LANGSUNG */}
        <div className="bg-emerald-50/60 border-2 border-emerald-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-700" />
                Uji Coba Kalkulasi Teks Arab / Ayat
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Ketik teks Arab apa saja untuk melihat rincian penjumlahan hisabnya secara otomatis.
              </p>
            </div>
            <div className="bg-white border border-emerald-300 rounded-xl px-4 py-2 text-right">
              <span className="text-[11px] font-bold text-slate-400 block">Total Nilai Hisab:</span>
              <span className="text-2xl font-black text-emerald-900 tabular-nums">
                {formatNumber(breakdown.total)}
              </span>
            </div>
          </div>

          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full p-3.5 bg-white border-2 border-emerald-300 rounded-xl font-arabic text-2xl text-right text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
            dir="rtl"
            placeholder="Ketik teks Arab di sini..."
          />

          {/* Rincian Huruf yang Dihitung */}
          <div className="flex flex-wrap gap-2 pt-1" dir="rtl">
            {breakdown.words.flatMap((w) => w.letters).map((l, idx) => (
              <div
                key={idx}
                className="bg-white border border-emerald-200 rounded-lg p-2 text-center min-w-[42px] shadow-2xs"
              >
                <div className="font-arabic text-xl font-bold text-slate-900">{l.char}</div>
                <div className="text-xs font-black text-emerald-700 tabular-nums border-t border-slate-100 pt-1 mt-1">
                  {l.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
