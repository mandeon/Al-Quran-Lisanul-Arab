import { useState, useEffect } from 'react';
import { ReadingProgress, TasbihState } from '../types/quran';

const STORAGE_KEY_PROGRESS = 'alquran_counter_progress_v1';
const STORAGE_KEY_TASBIH = 'alquran_counter_tasbih_v1';

export const DHIKR_PRESETS = [
  {
    label: 'Subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    meaning: 'Maha Suci Allah',
    target: 33,
  },
  {
    label: 'Alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    meaning: 'Segala puji bagi Allah',
    target: 33,
  },
  {
    label: 'Allahu Akbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    meaning: 'Allah Maha Besar',
    target: 33,
  },
  {
    label: 'Astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    meaning: 'Aku memohon ampun kepada Allah',
    target: 100,
  },
  {
    label: 'La ilaha illallah',
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    meaning: 'Tiada Tuhan selain Allah',
    target: 100,
  },
  {
    label: 'Shalawat Nabi',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ',
    meaning: 'Ya Allah limpahkanlah rahmat kepada junjungan kami Nabi Muhammad',
    target: 100,
  },
];

const DEFAULT_PROGRESS: ReadingProgress = {
  totalAyatRead: 0,
  readVerses: {},
  lastRead: null,
  bookmarkedVerses: {},
};

const DEFAULT_TASBIH: TasbihState = {
  count: 0,
  target: 33,
  dhikrLabel: 'Subhanallah',
  dhikrArabic: 'سُبْحَانَ اللَّهِ',
  dhikrMeaning: 'Maha Suci Allah',
  totalCompletedRounds: 0,
};

export function useQuranStorage() {
  const [progress, setProgress] = useState<ReadingProgress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROGRESS);
      return stored ? { ...DEFAULT_PROGRESS, ...JSON.parse(stored) } : DEFAULT_PROGRESS;
    } catch {
      return DEFAULT_PROGRESS;
    }
  });

  const [tasbih, setTasbih] = useState<TasbihState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TASBIH);
      return stored ? { ...DEFAULT_TASBIH, ...JSON.parse(stored) } : DEFAULT_TASBIH;
    } catch {
      return DEFAULT_TASBIH;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save reading progress', e);
    }
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASBIH, JSON.stringify(tasbih));
    } catch (e) {
      console.warn('Failed to save tasbih', e);
    }
  }, [tasbih]);

  const toggleAyatRead = (surahNumber: number, ayahNumber: number): boolean => {
    const key = `${surahNumber}:${ayahNumber}`;
    const isCurrentlyRead = Boolean(progress.readVerses[key]);
    const nextReadState = !isCurrentlyRead;

    setProgress((prev) => {
      const nextReadVerses = { ...prev.readVerses };
      if (nextReadState) {
        nextReadVerses[key] = true;
      } else {
        delete nextReadVerses[key];
      }

      const total = Object.keys(nextReadVerses).length;

      return {
        ...prev,
        readVerses: nextReadVerses,
        totalAyatRead: total,
      };
    });

    return nextReadState;
  };

  const isAyatRead = (surahNumber: number, ayahNumber: number): boolean => {
    return Boolean(progress.readVerses[`${surahNumber}:${ayahNumber}`]);
  };

  const setLastRead = (surahNumber: number, surahName: string, ayahNumber: number) => {
    setProgress((prev) => ({
      ...prev,
      lastRead: {
        surahNumber,
        surahName,
        ayahNumber,
        updatedAt: Date.now(),
      },
    }));
  };

  // Tasbih actions
  const incrementTasbih = () => {
    setTasbih((prev) => {
      const nextCount = prev.count + 1;
      let nextRounds = prev.totalCompletedRounds;
      if (prev.target > 0 && nextCount >= prev.target) {
        nextRounds += 1;
      }
      return {
        ...prev,
        count: nextCount,
        totalCompletedRounds: nextRounds,
      };
    });
  };

  const resetTasbih = () => {
    setTasbih((prev) => ({
      ...prev,
      count: 0,
    }));
  };

  const setDhikrPreset = (presetIndex: number) => {
    const selected = DHIKR_PRESETS[presetIndex];
    if (selected) {
      setTasbih((prev) => ({
        ...prev,
        count: 0,
        target: selected.target,
        dhikrLabel: selected.label,
        dhikrArabic: selected.arabic,
        dhikrMeaning: selected.meaning,
      }));
    }
  };

  const setCustomTarget = (target: number) => {
    setTasbih((prev) => ({
      ...prev,
      target: Math.max(0, target),
    }));
  };

  return {
    progress,
    toggleAyatRead,
    isAyatRead,
    setLastRead,
    tasbih,
    incrementTasbih,
    resetTasbih,
    setDhikrPreset,
    setCustomTarget,
  };
}
