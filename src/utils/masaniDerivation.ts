import stats from '../data/abjad-stats.json';
import { ALL_SURAHS, getBundledSurah } from './quranApi';

/**
 * Rincian AYAT TURUNAN Masani mengikuti pola Tsunai yang sudah ditetapkan:
 *   Lapis 1 (1 + 1 = 2)  : pasangan langsung, nilai hisab SAMA dengan ayat 1
 *   Lapis 2 (1 + 2 = 3)  : kelipatan 2, nilai 2× atau ½× nilai ayat 1
 *   Lapis 3 (1 + 3 = 4)  : deret aritmatika berawal ayat 1 (dalam surat) &
 *                          kelipatan 3, nilai 3× atau ⅓× ayat 1
 *   Lapis Lanjutan (1 + Banyak): turunan berantai, kembaran nilai dari
 *                          setiap ayat Lapis 1–3 di surat masing-masing
 * Setiap lapis dirinci DUA sisi: dalam surat & antar surat.
 */

interface SurahStat {
  n: number;
  ayat: number[];
}
const SURAH_STATS: SurahStat[] = (stats as { surahs: SurahStat[] }).surahs;

const VALUE_INDEX = new Map<number, { surah: number; ayah: number }[]>();
SURAH_STATS.forEach((s) =>
  s.ayat.forEach((v, i) => {
    const arr = VALUE_INDEX.get(v) ?? [];
    arr.push({ surah: s.n, ayah: i + 1 });
    VALUE_INDEX.set(v, arr);
  })
);

export interface DerivedAyah {
  surah: number;
  surahName: string;
  ayah: number;
  value: number;
  /** Alasan hubungan, mis. "= 786", "2 × 393", "deret +12" */
  relation: string;
  /** Ayat induk dari mana turunan ini lahir, mis. "1:1" */
  parent: string;
  arabic: string;
  translation: string;
}

export interface DerivationLayer {
  step: string;
  formula: string;
  name: string;
  rule: string;
  withinSurah: DerivedAyah[];
  acrossSurahs: DerivedAyah[];
  totalWithin: number;
  totalAcross: number;
}

export interface MasaniDerivation {
  surahNumber: number;
  surahName: string;
  rootValue: number;
  root: DerivedAyah;
  layers: DerivationLayer[];
}

/** Batas jumlah ayat yang ditampilkan per sisi per lapis */
const LIMIT = 24;

const nameOf = (n: number) => ALL_SURAHS[n - 1]?.name ?? `Surat ${n}`;
const valueOf = (s: number, a: number) => SURAH_STATS[s - 1]?.ayat[a - 1] ?? 0;
const fmt = (v: number) => v.toLocaleString('id-ID');
const key = (s: number, a: number) => `${s}:${a}`;

function mk(surah: number, ayah: number, relation: string, parent: string): DerivedAyah {
  const v = getBundledSurah(surah)?.verses?.[ayah - 1];
  return {
    surah,
    surahName: nameOf(surah),
    ayah,
    value: valueOf(surah, ayah),
    relation,
    parent,
    arabic: v?.text_with_harakat || v?.text || '',
    translation: v?.translation_id || '',
  };
}

function refsWithValue(v: number) {
  return Number.isInteger(v) && v > 0 ? VALUE_INDEX.get(v) ?? [] : [];
}

const cache = new Map<number, MasaniDerivation>();


export function getMasaniDerivation(surahNumber: number): MasaniDerivation | null {
  const hit = cache.get(surahNumber);
  if (hit) return hit;
  const stat = SURAH_STATS[surahNumber - 1];
  if (!stat || !stat.ayat.length) return null;

  const V = stat.ayat[0];
  const rootKey = key(surahNumber, 1);
  const used = new Set<string>([rootKey]);
  const root = mk(surahNumber, 1, `akar = ${fmt(V)}`, '-');

  // Ambil ayat dari daftar ref; tiap ayat hanya masuk SATU lapis (lapis terendah)
  const take = (refs: { surah: number; ayah: number }[], relation: string, parent: string) => {
    const out: DerivedAyah[] = [];
    refs.forEach((r) => {
      const k = key(r.surah, r.ayah);
      if (used.has(k)) return;
      used.add(k);
      out.push(mk(r.surah, r.ayah, relation, parent));
    });
    return out;
  };

  // LAPIS 1 — 1 + 1 = 2: nilai sama
  const l1 = take(refsWithValue(V), `= ${fmt(V)}`, rootKey);

  // LAPIS 2 — 1 + 2 = 3: kelipatan 2
  const l2 = [
    ...take(refsWithValue(V * 2), `2 × ${fmt(V)} = ${fmt(V * 2)}`, rootKey),
    ...take(refsWithValue(V / 2), `½ × ${fmt(V)} = ${fmt(V / 2)}`, rootKey),
  ];

  // LAPIS 3 — 1 + 3 = 4: deret aritmatika berawal ayat 1 (dalam surat)
  const l3: DerivedAyah[] = [];
  const vals = stat.ayat;
  for (let j = 1; j < vals.length && l3.length < LIMIT * 2; j++) {
    const d = vals[j] - V;
    if (d === 0) continue;
    for (let k = j + 1; k < vals.length; k++) {
      if (vals[k] - vals[j] !== d) continue;
      const rel = `deret ${d > 0 ? '+' : ''}${fmt(d)}: ${fmt(V)} → ${fmt(vals[j])} → ${fmt(vals[k])}`;
      const kj = key(surahNumber, j + 1);
      if (!used.has(kj)) {
        used.add(kj);
        l3.push(mk(surahNumber, j + 1, rel, rootKey));
      }
      const kk = key(surahNumber, k + 1);
      if (!used.has(kk)) {
        used.add(kk);
        l3.push(mk(surahNumber, k + 1, rel, kj));
      }
    }
  }
  // ...dan kelipatan 3 (dalam & antar surat)
  l3.push(
    ...take(refsWithValue(V * 3), `3 × ${fmt(V)} = ${fmt(V * 3)}`, rootKey),
    ...take(refsWithValue(V / 3), `⅓ × ${fmt(V)} = ${fmt(V / 3)}`, rootKey)
  );

  // LAPIS LANJUTAN — 1 + Banyak: rantai kembaran nilai dari tiap ayat turunan (dalam & antar surat)
  const lN: DerivedAyah[] = [];
  [...l1, ...l2, ...l3].forEach((p) => {
    lN.push(
      ...take(
        refsWithValue(p.value),
        `kembar ${p.surahName}:${p.ayah} (= ${fmt(p.value)})`,
        key(p.surah, p.ayah)
      )
    );
  });

  const layer = (
    step: string,
    formula: string,
    name: string,
    rule: string,
    items: DerivedAyah[]
  ): DerivationLayer => {
    const w = items.filter((d) => d.surah === surahNumber);
    const a = items.filter((d) => d.surah !== surahNumber);
    return {
      step,
      formula,
      name,
      rule,
      withinSurah: w.slice(0, LIMIT),
      acrossSurahs: a.slice(0, LIMIT),
      totalWithin: w.length,
      totalAcross: a.length,
    };
  };

  const result: MasaniDerivation = {
    surahNumber,
    surahName: nameOf(surahNumber),
    rootValue: V,
    root,
    layers: [
      layer('Lapis 1', '1 + 1 = 2', "Pasangan Langsung (Asy-Syaf'i / Genap)",
        `Ayat bernilai hisab sama persis dengan ayat 1 (${fmt(V)}).`, l1),
      layer('Lapis 2', '1 + 2 = 3', 'Kelipatan Dua (Al-Watr / Ganjil)',
        `Ayat bernilai 2× (${fmt(V * 2)}) atau ½× nilai ayat 1.`, l2),
      layer('Lapis 3', '1 + 3 = 4', 'Deret Aritmatika & Kelipatan Tiga',
        `Dalam surat: deret aritmatika yang berawal dari ayat 1. Juga nilai 3× (${fmt(V * 3)}) atau ⅓× ayat 1.`, l3),
      layer('Lapis Lanjutan', '1 + Banyak', 'Turunan Berantai (Pohon Faktorial)',
        'Rantai kembaran nilai dari setiap ayat Lapis 1–3, di surat mana pun ia berada.', lN),
    ],
  };
  cache.set(surahNumber, result);
  return result;
}
