import rawSurahList from '../data/quran.json';
import { SurahDetail, SurahMeta } from '../types/quran';
import { stripTashkeel } from './abjad';

/**
 * Memastikan teks ayat 100% rasm murni tanpa harakat,
 * menyimpan teks berharakat di text_with_harakat,
 * dan menjaga terjemahan bahasa Indonesia dan tafsirnya tetap utuh 100%.
 */
export function sanitizeSurahDetail(data: SurahDetail): SurahDetail {
  if (!data || !data.verses) return data;
  return {
    ...data,
    verses: data.verses.map((v) => ({
      ...v,
      text_with_harakat: v.text_with_harakat || v.text,
      text: stripTashkeel(v.text),
      translation_id: v.translation_id,
      translation_en: v.translation_en,
    })),
  };
}

// In-memory cache for loaded surah details
const surahCache = new Map<number, SurahDetail>();

// Surahs bundled locally for offline instant loading (otomatis memuat semua file JSON di folder surah/)
const localSurahModules = import.meta.glob<any>('../data/surah/*.json', { eager: true });
const BUNDLED_SURAHS: Record<number, SurahDetail> = {};

Object.entries(localSurahModules).forEach(([filePath, mod]) => {
  const match = filePath.match(/[\\/](\d+)\.json$/);
  if (match) {
    const num = Number(match[1]);
    const rawData = (mod.default || mod) as SurahDetail;
    const sanitized = sanitizeSurahDetail(rawData);
    BUNDLED_SURAHS[num] = sanitized;
    surahCache.set(num, sanitized);
  }
});

export const ALL_SURAHS: SurahMeta[] = rawSurahList as SurahMeta[];

export const TOTAL_AYAT_IN_QURAN = ALL_SURAHS.reduce(
  (acc, s) => acc + s.number_of_ayah,
  0
); // 6236

/**
 * Get all 114 surahs ordered 1..114
 */
export function getAllSurahs(): SurahMeta[] {
  return ALL_SURAHS;
}

/**
 * Fetch detailed surah data (with verses in Arabic, English, and Indonesian translation)
 */
export async function getSurahDetail(surahNumber: number): Promise<SurahDetail> {
  // 1. Check in-memory cache
  if (surahCache.has(surahNumber)) {
    return surahCache.get(surahNumber)!;
  }

  // 2. Check bundled local files FIRST (agar pembaruan JSON lokal selalu diutamakan)
  if (BUNDLED_SURAHS[surahNumber]) {
    const detail = BUNDLED_SURAHS[surahNumber] as SurahDetail;
    surahCache.set(surahNumber, detail);
    return detail;
  }

  // 3. Check localStorage cache
  const cacheKey = `alquran_surah_v1_${surahNumber}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as SurahDetail;
      if (parsed && parsed.verses && parsed.verses.length > 0) {
        const sanitized = sanitizeSurahDetail(parsed);
        surahCache.set(surahNumber, sanitized);
        return sanitized;
      }
    }
  } catch {
    // ignore localStorage errors
  }

  // 4. Fetch from official QuranJSON repository
  const url = `https://raw.githubusercontent.com/penggguna/QuranJSON/master/surah/${surahNumber}.json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Gagal memuat surat nomor ${surahNumber} (HTTP ${response.status})`);
    }

    const rawData = (await response.json()) as SurahDetail;
    const data = sanitizeSurahDetail(rawData);

    // Cache locally
    surahCache.set(surahNumber, data);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch {
      // ignore quota exceeded
    }

    return data;
  } catch (error) {
    console.error(`Error fetching surah ${surahNumber}:`, error);
    // If network fails and we don't have it, throw friendly message
    throw new Error(
      `Tidak dapat memuat ayat untuk surat nomor ${surahNumber}. Periksa koneksi internet Anda atau coba lagi nanti.`
    );
  }
}

/**
 * Filter surahs based on keyword (name, meaning, number, type)
 */
export function searchSurahs(surahs: SurahMeta[], query: string): SurahMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return surahs;

  return surahs.filter((s) => {
    const num = s.number_of_surah.toString();
    const nameLatin = s.name.toLowerCase();
    const cleanLatin = nameLatin.replace(/[^a-z0-9]/g, '');
    const nameId = s.name_translations.id.toLowerCase();
    const nameEn = s.name_translations.en.toLowerCase();
    const nameAr = s.name_translations.ar;
    const cleanQuery = q.replace(/[^a-z0-9]/g, '');

    return (
      num === q ||
      nameLatin.includes(q) ||
      (cleanQuery.length > 0 && cleanLatin.includes(cleanQuery)) ||
      nameId.includes(q) ||
      nameEn.includes(q) ||
      nameAr.includes(q)
    );
  });
}
