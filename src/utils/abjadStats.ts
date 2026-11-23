import stats from '../data/abjad-stats.json';
import { ALL_SURAHS } from './quranApi';

/**
 * Statistik Hisabul Jumal pra-hitung (lihat scripts/build-abjad.ts).
 * Dipakai untuk filter & peta kesamaan di landing page tanpa memuat 114 file surat.
 */
interface SurahStat {
  n: number;
  total: number;
  letters: number;
  ayat: number[];
}

const SURAH_STATS: SurahStat[] = (stats as { surahs: SurahStat[] }).surahs;

export interface AyahRef {
  surah: number;
  ayah: number;
}

export interface DuplicateGroup {
  value: number;
  ayat: number[];
}

export function getSurahStat(n: number): SurahStat | undefined {
  return SURAH_STATS[n - 1];
}

export const GRAND_TOTAL = SURAH_STATS.reduce((a, s) => a + s.total, 0);
export const GRAND_LETTERS = SURAH_STATS.reduce((a, s) => a + s.letters, 0);

function groupBy(keyOf: (n: number) => number): Map<number, number[]> {
  const map = new Map<number, number[]>();
  for (let n = 1; n <= 114; n++) {
    const k = keyOf(n);
    const arr = map.get(k) ?? [];
    arr.push(n);
    map.set(k, arr);
  }
  // Hanya grup yang berisi lebih dari satu surat
  for (const [k, v] of map) if (v.length < 2) map.delete(k);
  return map;
}

/** Grup surat yang jumlah ayatnya sama, key = jumlah ayat */
export const SAME_AYAH_COUNT_GROUPS = groupBy((n) => ALL_SURAHS[n - 1].number_of_ayah);

/** Grup surat yang total hisabnya sama, key = total */
export const SAME_TOTAL_GROUPS = groupBy((n) => SURAH_STATS[n - 1].total);

const sameAyahCountLookup = new Map<number, number[]>();
SAME_AYAH_COUNT_GROUPS.forEach((list) =>
  list.forEach((n) => sameAyahCountLookup.set(n, list.filter((x) => x !== n)))
);
const sameTotalLookup = new Map<number, number[]>();
SAME_TOTAL_GROUPS.forEach((list) =>
  list.forEach((n) => sameTotalLookup.set(n, list.filter((x) => x !== n)))
);

/** Surat lain dengan jumlah ayat sama */
export function surahsWithSameAyahCount(n: number): number[] {
  return sameAyahCountLookup.get(n) ?? [];
}

/** Surat lain dengan total hisab sama */
export function surahsWithSameTotal(n: number): number[] {
  return sameTotalLookup.get(n) ?? [];
}

/** Grup ayat bernilai sama di dalam satu surat */
const internalDupCache = new Map<number, DuplicateGroup[]>();
export function internalDuplicates(n: number): DuplicateGroup[] {
  const cached = internalDupCache.get(n);
  if (cached) return cached;
  const stat = SURAH_STATS[n - 1];
  const map = new Map<number, number[]>();
  stat?.ayat.forEach((v, i) => {
    const arr = map.get(v) ?? [];
    arr.push(i + 1);
    map.set(v, arr);
  });
  const groups = Array.from(map.entries())
    .filter(([, a]) => a.length > 1)
    .map(([value, ayat]) => ({ value, ayat }))
    .sort((a, b) => a.ayat[0] - b.ayat[0]);
  internalDupCache.set(n, groups);
  return groups;
}

/** Index global: nilai ayat -> semua ayat (lintas surat) dengan nilai itu */
const VALUE_INDEX = new Map<number, AyahRef[]>();
SURAH_STATS.forEach((s) =>
  s.ayat.forEach((v, i) => {
    const arr = VALUE_INDEX.get(v) ?? [];
    arr.push({ surah: s.n, ayah: i + 1 });
    VALUE_INDEX.set(v, arr);
  })
);

/** Ayat di surat LAIN yang nilainya sama dengan nilai ini */
export function ayatInOtherSurahsWithValue(value: number, exceptSurah: number): AyahRef[] {
  return (VALUE_INDEX.get(value) ?? []).filter((r) => r.surah !== exceptSurah);
}

/** Daftar surat yang memiliki ayat kembar, beserta grupnya */
export const SURAHS_WITH_INTERNAL_DUPLICATES = Array.from({ length: 114 }, (_, i) => i + 1)
  .map((n) => ({ surah: n, groups: internalDuplicates(n) }))
  .filter((x) => x.groups.length > 0);
