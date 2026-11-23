import { ALL_SURAHS, getBundledSurah } from './quranApi';
import { abjadTotal, letterSkeleton, stripLeadingBismillah, stripTashkeel } from './abjad';
import { getMatchesForValue } from './masaniAnalysis';

/**
 * Pencarian MASANI KATA di seluruh 114 surat.
 * Kata yang diketik pengguna dibandingkan dengan setiap kata dalam mushaf:
 *   1. Kemunculan kata (kerangka huruf sama persis / mengandung kata tsb)
 *   2. Masani kata: kata LAIN yang nilai hisabnya sama dengan kata yang diketik
 *   3. Ayat yang TOTAL nilai hisabnya sama dengan nilai kata yang diketik
 * Perbandingan memakai kerangka huruf (rasm tanpa harakat, varian alif/ya/ta
 * marbuthah disatukan) sehingga harakat yang diketik tidak berpengaruh.
 */

export interface WordHit {
  surah: number;
  surahName: string;
  ayah: number;
  wordIndex: number; // posisi kata dalam ayat (mulai 1)
  word: string;
  value: number;
}

export interface WordGroup {
  skeleton: string;
  word: string; // contoh tulisan
  value: number;
  count: number;
  hits: WordHit[];
}

export interface WordMasaniResult {
  query: string;
  skeleton: string;
  value: number;
  letterCount: number;
  exact: WordHit[];
  contains: WordHit[];
  sameValueWords: WordGroup[];
  sameValueWordTotal: number;
  sameValueAyat: { surah: number; surahName: string; ayah: number }[];
  surahsWithWord: number;
}

interface IndexedWord extends WordHit {
  skeleton: string;
}

let WORD_INDEX: IndexedWord[] | null = null;

/** Bangun indeks semua kata dalam mushaf (sekali saja, lalu disimpan). */
function getWordIndex(): IndexedWord[] {
  if (WORD_INDEX) return WORD_INDEX;
  const out: IndexedWord[] = [];
  for (let s = 1; s <= 114; s++) {
    const detail = getBundledSurah(s);
    if (!detail?.verses) continue;
    const surahName = ALL_SURAHS[s - 1]?.name ?? `Surat ${s}`;
    detail.verses.forEach((v) => {
      const text = stripLeadingBismillah(s, v.number, stripTashkeel(v.text));
      let pos = 0;
      text.split(/\s+/).forEach((w) => {
        const sk = letterSkeleton(w);
        if (!sk) return;
        pos++;
        out.push({
          surah: s,
          surahName,
          ayah: v.number,
          wordIndex: pos,
          word: w,
          value: abjadTotal(w),
          skeleton: sk,
        });
      });
    });
  }
  WORD_INDEX = out;
  return out;
}

const strip = ({ skeleton: _s, ...rest }: IndexedWord): WordHit => rest;

export function findWordMasani(query: string): WordMasaniResult | null {
  const clean = stripTashkeel(query.trim());
  const skeleton = letterSkeleton(clean.replace(/\s+/g, ''));
  if (!skeleton) return null;
  const value = abjadTotal(clean);
  const index = getWordIndex();

  const exact: WordHit[] = [];
  const contains: WordHit[] = [];
  const groups = new Map<string, WordGroup>();
  let sameValueWordTotal = 0;

  index.forEach((w) => {
    if (w.skeleton === skeleton) {
      exact.push(strip(w));
    } else if (w.skeleton.includes(skeleton)) {
      contains.push(strip(w));
    }
    if (w.value === value && w.skeleton !== skeleton) {
      sameValueWordTotal++;
      const g = groups.get(w.skeleton) ?? {
        skeleton: w.skeleton,
        word: w.word,
        value: w.value,
        count: 0,
        hits: [],
      };
      g.count++;
      g.hits.push(strip(w));
      groups.set(w.skeleton, g);
    }
  });

  const sameValueWords = Array.from(groups.values()).sort((a, b) => b.count - a.count);

  const sameValueAyat = getMatchesForValue(value).map((r) => ({
    surah: r.surah,
    surahName: ALL_SURAHS[r.surah - 1]?.name ?? `Surat ${r.surah}`,
    ayah: r.ayah,
  }));

  const surahSet = new Set([...exact, ...contains].map((h) => h.surah));

  return {
    query,
    skeleton,
    value,
    letterCount: skeleton.length,
    exact,
    contains,
    sameValueWords,
    sameValueWordTotal,
    sameValueAyat,
    surahsWithWord: surahSet.size,
  };
}
