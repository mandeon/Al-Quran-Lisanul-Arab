/**
 * Membangun src/data/abjad-stats.json berisi total Hisabul Jumal
 * per surat dan per ayat untuk seluruh 114 surat.
 *
 * Jalankan: npm run build:abjad
 * Sumber data: https://github.com/penggguna/QuranJSON (sama dengan aplikasi)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { abjadBreakdown, stripLeadingBismillah } from '../src/utils/abjad';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE_DIR = path.join(ROOT, 'scripts', '.cache');
const OUT_FILE = path.join(ROOT, 'src', 'data', 'abjad-stats.json');
const SOURCE = (n: number) =>
  `https://raw.githubusercontent.com/penggguna/QuranJSON/master/surah/${n}.json`;

interface RawSurah {
  number_of_surah: number;
  number_of_ayah: number;
  verses: { number: number; text: string }[];
}

async function loadSurah(n: number): Promise<RawSurah> {
  const file = path.join(CACHE_DIR, `${n}.json`);
  if (existsSync(file)) {
    return JSON.parse(await readFile(file, 'utf8'));
  }
  const res = await fetch(SOURCE(n));
  if (!res.ok) throw new Error(`Gagal unduh surat ${n}: HTTP ${res.status}`);
  const data = (await res.json()) as RawSurah & Record<string, unknown>;
  const slim: RawSurah = {
    number_of_surah: data.number_of_surah,
    number_of_ayah: data.number_of_ayah,
    verses: data.verses.map((v) => ({ number: v.number, text: v.text })),
  };
  await writeFile(file, JSON.stringify(slim));
  return slim;
}

async function main() {
  await mkdir(CACHE_DIR, { recursive: true });
  const surahs: { n: number; total: number; letters: number; ayat: number[] }[] = [];
  let stripped = 0;

  for (let n = 1; n <= 114; n++) {
    const s = await loadSurah(n);
    if (s.verses.length !== s.number_of_ayah) {
      throw new Error(`Surat ${n}: jumlah ayat ${s.verses.length} != ${s.number_of_ayah}`);
    }
    let total = 0;
    let letters = 0;
    const ayat = s.verses.map((v) => {
      const clean = stripLeadingBismillah(n, v.number, v.text);
      if (clean !== v.text) stripped++;
      const b = abjadBreakdown(clean);
      total += b.total;
      letters += b.letterCount;
      return b.total;
    });
    surahs.push({ n, total, letters, ayat });
    process.stdout.write(`\rSurat ${n}/114`);
  }

  await writeFile(OUT_FILE, JSON.stringify({ version: 1, surahs }));
  const grand = surahs.reduce((a, s) => a + s.total, 0);
  console.log(`\nSelesai. Basmalah dibuang dari ${stripped} ayat pertama.`);
  console.log(`Total ayat: ${surahs.reduce((a, s) => a + s.ayat.length, 0)}, total nilai: ${grand}`);
  console.log(`Al-Fatihah ayat 1 (Basmalah) = ${surahs[0].ayat[0]} (harus 786)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
