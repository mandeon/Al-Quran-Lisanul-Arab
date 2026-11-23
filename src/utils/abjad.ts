/**
 * Hisabul Jumal (Abjad) calculator.
 *
 * Nilai mengikuti tabel "Susunan Abjad Hisabul Jumal":
 *   Satuan  : ا1 ب2 ج3 د4 ه5 و6 ز7 ح8 ط9
 *   Puluhan : ي10 ك20 ل30 م40 ن50 س60 ع70 ف80 ص90
 *   Ratusan : ق100 ر200 ش300 ت400 ث500 خ600 ذ700 ض800 ظ900 غ1000
 *
 * Aturan varian huruf (konvensi yang dipakai):
 *   - Semua bentuk alif (ا أ إ آ ٱ) dan hamzah tunggal (ء) = 1
 *   - ؤ dihitung sebagai و (6), ئ dan ى dihitung sebagai ي (10)
 *   - ة (ta marbuthah) dihitung sebagai ه (5)
 *   - Harakat, tanda waqaf, alif kecil (ٰ), wau/ya kecil (ۥ ۦ) tidak dihitung
 *     karena bukan huruf tertulis (rasm).
 * Validasi: بسم الله الرحمن الرحيم = 786 (19 huruf).
 */

export interface AbjadLetter {
  /** Huruf dasar yang dihitung (bentuk tabel) */
  base: string;
  /** Karakter asli di teks */
  char: string;
  value: number;
}

export interface AbjadWord {
  text: string;
  letters: AbjadLetter[];
  total: number;
}

export interface AbjadVerseBreakdown {
  words: AbjadWord[];
  total: number;
  letterCount: number;
  /** Frekuensi per huruf dasar: huruf -> { count, value, subtotal } */
  frequency: { base: string; value: number; count: number; subtotal: number }[];
}

export const ABJAD_TABLE: { group: string; items: { letter: string; value: number }[] }[] = [
  {
    group: 'Satuan',
    items: [
      { letter: 'ا', value: 1 },
      { letter: 'ب', value: 2 },
      { letter: 'ج', value: 3 },
      { letter: 'د', value: 4 },
      { letter: 'ه', value: 5 },
      { letter: 'و', value: 6 },
      { letter: 'ز', value: 7 },
      { letter: 'ح', value: 8 },
      { letter: 'ط', value: 9 },
    ],
  },
  {
    group: 'Puluhan',
    items: [
      { letter: 'ي', value: 10 },
      { letter: 'ك', value: 20 },
      { letter: 'ل', value: 30 },
      { letter: 'م', value: 40 },
      { letter: 'ن', value: 50 },
      { letter: 'س', value: 60 },
      { letter: 'ع', value: 70 },
      { letter: 'ف', value: 80 },
      { letter: 'ص', value: 90 },
    ],
  },
  {
    group: 'Ratusan',
    items: [
      { letter: 'ق', value: 100 },
      { letter: 'ر', value: 200 },
      { letter: 'ش', value: 300 },
      { letter: 'ت', value: 400 },
      { letter: 'ث', value: 500 },
      { letter: 'خ', value: 600 },
      { letter: 'ذ', value: 700 },
      { letter: 'ض', value: 800 },
      { letter: 'ظ', value: 900 },
      { letter: 'غ', value: 1000 },
    ],
  },
];

const BASE_VALUES: Record<string, number> = {};
ABJAD_TABLE.forEach((g) => g.items.forEach((i) => (BASE_VALUES[i.letter] = i.value)));

/** Varian karakter -> huruf dasar */
const VARIANTS: Record<string, string> = {
  'أ': 'ا',
  'إ': 'ا',
  'آ': 'ا',
  'ٱ': 'ا',
  'ٲ': 'ا',
  'ٳ': 'ا',
  'ء': 'ا',
  'ؤ': 'و',
  'ئ': 'ي',
  'ى': 'ي',
  'ی': 'ي', // Farsi yeh
  'ک': 'ك', // Farsi kaf
  'ة': 'ه',
  'ہ': 'ه',
};

/** Kembalikan huruf dasar bila karakter dihitung, selain itu null */
export function toBaseLetter(char: string): string | null {
  if (BASE_VALUES[char] !== undefined) return char;
  const v = VARIANTS[char];
  return v ?? null;
}

export function letterValue(char: string): number {
  const base = toBaseLetter(char);
  return base ? BASE_VALUES[base] : 0;
}

/** Total nilai sebuah teks */
export function abjadTotal(text: string): number {
  let sum = 0;
  for (const ch of text.normalize('NFC')) sum += letterValue(ch);
  return sum;
}

/** Kerangka huruf (hanya huruf yang dihitung, bentuk dasar) */
export function letterSkeleton(text: string): string {
  let out = '';
  for (const ch of text.normalize('NFC')) {
    const b = toBaseLetter(ch);
    if (b) out += b;
  }
  return out;
}

/** Rincian lengkap per kata & per huruf */
export function abjadBreakdown(text: string): AbjadVerseBreakdown {
  const words: AbjadWord[] = [];
  const freq = new Map<string, { base: string; value: number; count: number; subtotal: number }>();
  let total = 0;
  let letterCount = 0;

  for (const rawWord of text.normalize('NFC').split(/\s+/)) {
    if (!rawWord) continue;
    const letters: AbjadLetter[] = [];
    let wordTotal = 0;
    for (const ch of rawWord) {
      const base = toBaseLetter(ch);
      if (!base) continue;
      const value = BASE_VALUES[base];
      letters.push({ base, char: ch, value });
      wordTotal += value;
      const f = freq.get(base) ?? { base, value, count: 0, subtotal: 0 };
      f.count += 1;
      f.subtotal += value;
      freq.set(base, f);
    }
    // Lewati token tanpa huruf (mis. tanda waqaf berdiri sendiri)
    if (letters.length === 0) continue;
    words.push({ text: rawWord, letters, total: wordTotal });
    total += wordTotal;
    letterCount += letters.length;
  }

  const frequency = Array.from(freq.values()).sort((a, b) => a.value - b.value);
  return { words, total, letterCount, frequency };
}

const BISMILLAH_SKELETON = 'بسماللهالرحمنالرحيم';

/**
 * Data sumber menempelkan Basmalah di awal ayat 1 untuk surat selain Al-Fatihah.
 * Basmalah tersebut bukan bagian dari ayat 1 (kecuali Al-Fatihah), jadi dibuang
 * agar hitungan ayat akurat. At-Taubah (9) tidak memiliki Basmalah.
 */
export function stripLeadingBismillah(surahNumber: number, ayahNumber: number, text: string): string {
  if (surahNumber === 1 || ayahNumber !== 1) return text;
  const words = text.trim().split(/\s+/);
  if (words.length <= 4) return text;
  const head = letterSkeleton(words.slice(0, 4).join(''));
  if (head === BISMILLAH_SKELETON) {
    return words.slice(4).join(' ');
  }
  return text;
}

/**
 * Menghapus semua harakat (tashkeel), tanwin, sukun, shaddah, tanda waqaf,
 * dagger alif, dan simbol quranik untuk menghasilkan teks Arab rasm tanpa harakat (gundul).
 */
export function stripTashkeel(text: string): string {
  if (!text) return '';
  return text
    // Harakat dasar (fathatan, dammatan, kasratan, fathah, dammah, kasrah, shaddah, sukun, dsb)
    .replace(/[\u064B-\u065F]/g, '')
    // Dagger alif (ٰ) & tatweel (ـ)
    .replace(/[\u0670\u0640]/g, '')
    // Simbol Quranik, tanda waqaf, nomor tanda baca, maddah (U+06D6 - U+06ED, U+0610 - U+061A, U+0653 - U+0655)
    .replace(/[\u06D6-\u06ED\u0610-\u061A\u0653-\u0655]/g, '')
    // Ubah Alif Wasla (ٱ) menjadi Alif standar (ا)
    .replace(/\u0671/g, 'ا')
    // Bersihkan spasi ganda
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatNumber(n: number): string {
  return n.toLocaleString('id-ID');
}
