export interface SurahMeta {
  number_of_surah: number;
  name: string;
  name_translations: {
    ar: string;
    en: string;
    id: string;
  };
  number_of_ayah: number;
  place: string;
  type: 'Makkiyah' | 'Madaniyah' | string;
  recitation?: string;
}

export interface VerseHighlightDetail {
  keyword: string;
  root: string;
  arabic_text: string;
  explanation: string;
}

export interface Verse {
  number: number;
  text: string;
  text_with_harakat?: string;
  translation_en: string;
  translation_id: string;
  translation_source?: string;
  highlight_keywords?: string[];
  highlight_details?: VerseHighlightDetail[];
}

export interface Reciter {
  name: string;
  audio_url: string;
}

export interface SurahDetail {
  number_of_surah: number;
  name: string;
  name_translations: {
    ar: string;
    en: string;
    id: string;
  };
  number_of_ayah: number;
  place: string;
  type: string;
  recitations?: Reciter[];
  recitation?: string;
  verses: Verse[];
}

export type FilterKey =
  | 'sameAyahCount'
  | 'sameTotal'
  | 'internalDup'
  | 'Makkiyah'
  | 'Madaniyah'
  | 'juz30';

export interface ReadingProgress {
  totalAyatRead: number;
  readVerses: Record<string, boolean>; // key: `${surahNumber}:${ayahNumber}`
  lastRead: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    updatedAt: number;
  } | null;
  bookmarkedVerses: Record<string, boolean>;
}

export interface TasbihState {
  count: number;
  target: number;
  dhikrLabel: string;
  dhikrArabic: string;
  dhikrMeaning: string;
  totalCompletedRounds: number;
}
