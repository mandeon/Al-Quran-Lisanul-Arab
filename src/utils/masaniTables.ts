import stats from '../data/abjad-stats.json';
import { ALL_SURAHS } from './quranApi';

/**
 * Daftar LENGKAP pasangan Masani (ayat bernilai hisab sama) untuk ditampilkan
 * dalam bentuk tabel, beserta jumlah totalnya:
 *   - Tabel 1: Masani ANTAR SURAT  (dua ayat di surat berbeda)
 *   - Tabel 2: Masani DALAM SATU SURAT (dua ayat di surat yang sama)
 */

interface SurahStat {
  n: number;
  ayat: number[];
}
const SURAH_STATS: SurahStat[] = (stats as { surahs: SurahStat[] }).surahs;

export interface MasaniPairRow {
  value: number;
  aSurah: number;
  aSurahName: string;
  aAyah: number;
  bSurah: number;
  bSurahName: string;
  bAyah: number;
}

export interface MasaniPairTable {
  rows: MasaniPairRow[];
  /** Jumlah total pasangan (baris) pada tabel ini */
  totalPairs: number;
  /** Jumlah nilai hisab berbeda yang terlibat */
  totalValues: number;
  /** Jumlah ayat berbeda yang terlibat */
  totalAyat: number;
  /** Jumlah surat berbeda yang terlibat */
  totalSurahs: number;
}

const nameOf = (n: number) => ALL_SURAHS[n - 1]?.name ?? `Surat ${n}`;

/** value -> semua ayat di seluruh mushaf dengan nilai itu */
const VALUE_INDEX = new Map<number, { surah: number; ayah: number }[]>();
SURAH_STATS.forEach((s) =>
  s.ayat.forEach((v, i) => {
    const arr = VALUE_INDEX.get(v) ?? [];
    arr.push({ surah: s.n, ayah: i + 1 });
    VALUE_INDEX.set(v, arr);
  })
);

function buildTable(rows: MasaniPairRow[]): MasaniPairTable {
  const values = new Set<number>();
  const ayat = new Set<string>();
  const surahs = new Set<number>();
  rows.forEach((r) => {
    values.add(r.value);
    ayat.add(`${r.aSurah}:${r.aAyah}`);
    ayat.add(`${r.bSurah}:${r.bAyah}`);
    surahs.add(r.aSurah);
    surahs.add(r.bSurah);
  });
  return {
    rows,
    totalPairs: rows.length,
    totalValues: values.size,
    totalAyat: ayat.size,
    totalSurahs: surahs.size,
  };
}

const acrossCache = new Map<number, MasaniPairTable>();
const withinCache = new Map<number, MasaniPairTable>();

/**
 * Tabel LENGKAP Masani ANTAR SURAT.
 * @param surahNumber jika diisi, hanya pasangan yang menyinggung surat ini.
 */
export function getAcrossSurahPairTable(surahNumber?: number): MasaniPairTable {
  const ck = surahNumber ?? 0;
  const hit = acrossCache.get(ck);
  if (hit) return hit;

  const rows: MasaniPairRow[] = [];
  VALUE_INDEX.forEach((refs, value) => {
    if (refs.length < 2) return;
    for (let i = 0; i < refs.length; i++) {
      for (let j = i + 1; j < refs.length; j++) {
        const a = refs[i];
        const b = refs[j];
        if (a.surah === b.surah) continue; // ini masani dalam surat
        if (surahNumber && a.surah !== surahNumber && b.surah !== surahNumber) continue;
        // Surat yang dipilih selalu ditaruh di kolom kiri
        const flip = Boolean(surahNumber) && b.surah === surahNumber;
        const x = flip ? b : a;
        const y = flip ? a : b;
        rows.push({
          value,
          aSurah: x.surah,
          aSurahName: nameOf(x.surah),
          aAyah: x.ayah,
          bSurah: y.surah,
          bSurahName: nameOf(y.surah),
          bAyah: y.ayah,
        });
      }
    }
  });

  rows.sort(
    (p, q) =>
      p.aSurah - q.aSurah ||
      p.aAyah - q.aAyah ||
      p.bSurah - q.bSurah ||
      p.bAyah - q.bAyah
  );

  const table = buildTable(rows);
  acrossCache.set(ck, table);
  return table;
}

/**
 * Tabel LENGKAP Masani DALAM SATU SURAT.
 * @param surahNumber jika diisi, hanya pasangan di dalam surat ini.
 */
export function getWithinSurahPairTable(surahNumber?: number): MasaniPairTable {
  const ck = surahNumber ?? 0;
  const hit = withinCache.get(ck);
  if (hit) return hit;

  const rows: MasaniPairRow[] = [];
  const scope = surahNumber
    ? SURAH_STATS.filter((s) => s.n === surahNumber)
    : SURAH_STATS;

  scope.forEach((s) => {
    const byValue = new Map<number, number[]>();
    s.ayat.forEach((v, i) => {
      const arr = byValue.get(v) ?? [];
      arr.push(i + 1);
      byValue.set(v, arr);
    });
    byValue.forEach((ayat, value) => {
      if (ayat.length < 2) return;
      for (let i = 0; i < ayat.length; i++) {
        for (let j = i + 1; j < ayat.length; j++) {
          rows.push({
            value,
            aSurah: s.n,
            aSurahName: nameOf(s.n),
            aAyah: ayat[i],
            bSurah: s.n,
            bSurahName: nameOf(s.n),
            bAyah: ayat[j],
          });
        }
      }
    });
  });

  rows.sort((p, q) => p.aSurah - q.aSurah || p.aAyah - q.aAyah || p.bAyah - q.bAyah);

  const table = buildTable(rows);
  withinCache.set(ck, table);
  return table;
}
