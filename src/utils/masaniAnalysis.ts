import stats from '../data/abjad-stats.json';
import { ALL_SURAHS } from './quranApi';
import { AyahRef } from './abjadStats';

export interface SurahStat {
  n: number;
  total: number;
  letters: number;
  ayat: number[];
}

const SURAH_STATS: SurahStat[] = (stats as { surahs: SurahStat[] }).surahs;

// Map: Value -> Array of { surah, ayah }
const VALUE_INDEX = new Map<number, AyahRef[]>();
SURAH_STATS.forEach((s) =>
  s.ayat.forEach((v, i) => {
    const arr = VALUE_INDEX.get(v) ?? [];
    arr.push({ surah: s.n, ayah: i + 1 });
    VALUE_INDEX.set(v, arr);
  })
);

export interface CrossSurahMatchGroup {
  value: number;
  totalOccurrences: number;
  distinctSurahsCount: number;
  refs: AyahRef[];
}

/**
 * Temukan semua kemunculan nilai hisab di seluruh 114 surat Al-Qur'an.
 */
export function getMatchesForValue(value: number): AyahRef[] {
  return VALUE_INDEX.get(value) ?? [];
}

/**
 * Daftar nilai hisab yang muncul di lebih dari 1 surat (lintas surat).
 */
export function getTopCrossSurahMatches(): CrossSurahMatchGroup[] {
  const groups: CrossSurahMatchGroup[] = [];

  VALUE_INDEX.forEach((refs, value) => {
    const surahSet = new Set(refs.map((r) => r.surah));
    if (surahSet.size > 1) {
      groups.push({
        value,
        totalOccurrences: refs.length,
        distinctSurahsCount: surahSet.size,
        refs,
      });
    }
  });

  return groups.sort((a, b) => b.totalOccurrences - a.totalOccurrences);
}

/**
 * Cek apakah ayat tertentu (misal Al-Baqarah: 47 & 122) memiliki nilai yang sama di surat lain atau di surat yang sama.
 */
export function analyzeAyahMasani(surahNumber: number, ayahNumber: number) {
  const stat = SURAH_STATS[surahNumber - 1];
  if (!stat || !stat.ayat[ayahNumber - 1]) return null;

  const value = stat.ayat[ayahNumber - 1];
  const allRefs = VALUE_INDEX.get(value) ?? [];

  const sameSurah = allRefs.filter((r) => r.surah === surahNumber && r.ayah !== ayahNumber);
  const otherSurahs = allRefs.filter((r) => r.surah !== surahNumber);

  return {
    value,
    surahNumber,
    ayahNumber,
    surahName: ALL_SURAHS[surahNumber - 1]?.name ?? `Surat ${surahNumber}`,
    sameSurahMatches: sameSurah,
    otherSurahMatches: otherSurahs,
    totalMatches: allRefs.length,
  };
}

export interface Factor2Pair {
  surah: number;
  ayahA: number;
  valueA: number;
  ayahB: number;
  valueB: number;
}

/**
 * Temukan pasangan ayat dalam surat di mana valueB = 2 * valueA (kelipatan 2 faktorial).
 */
export function getExact2xPairs(targetSurah?: number): Factor2Pair[] {
  const list: Factor2Pair[] = [];
  const surahsToScan = targetSurah
    ? SURAH_STATS.filter((s) => s.n === targetSurah)
    : SURAH_STATS;

  surahsToScan.forEach((s) => {
    const vals = s.ayat;
    for (let i = 0; i < vals.length; i++) {
      for (let j = i + 1; j < vals.length; j++) {
        const a = vals[i];
        const b = vals[j];
        if (b === 2 * a) {
          list.push({ surah: s.n, ayahA: i + 1, valueA: a, ayahB: j + 1, valueB: b });
        } else if (a === 2 * b) {
          list.push({ surah: s.n, ayahA: j + 1, valueA: b, ayahB: i + 1, valueB: a });
        }
      }
    }
  });

  return list;
}

export interface ArithmeticTriplet {
  surah: number;
  ayahs: [number, number, number];
  values: [number, number, number];
  diff: number;
}

/**
 * Deteksi deret barisan aritmatika (Ayat B - Ayat A = Ayat C - Ayat B).
 */
export function getArithmeticTriplets(targetSurah?: number): ArithmeticTriplet[] {
  const triplets: ArithmeticTriplet[] = [];
  const surahsToScan = targetSurah
    ? SURAH_STATS.filter((s) => s.n === targetSurah)
    : SURAH_STATS;

  surahsToScan.forEach((s) => {
    const vals = s.ayat;
    for (let i = 0; i < vals.length; i++) {
      for (let j = i + 1; j < vals.length; j++) {
        for (let k = j + 1; k < vals.length; k++) {
          const a = vals[i];
          const b = vals[j];
          const c = vals[k];
          if (b - a === c - b && b - a !== 0) {
            triplets.push({
              surah: s.n,
              ayahs: [i + 1, j + 1, k + 1],
              values: [a, b, c],
              diff: b - a,
            });
          }
        }
      }
    }
  });

  return triplets;
}

/**
 * Statistik ayat kelipatan 2 (Genap vs Ganjil) seluruh Al-Qur'an.
 */
export function getWholeQuranEvenOddStats() {
  let even = 0;
  let odd = 0;
  SURAH_STATS.forEach((s) =>
    s.ayat.forEach((v) => {
      if (v % 2 === 0) even++;
      else odd++;
    })
  );
  return {
    totalAyat: even + odd,
    evenCount: even,
    oddCount: odd,
    evenPercentage: ((even / (even + odd)) * 100).toFixed(1),
    oddPercentage: ((odd / (even + odd)) * 100).toFixed(1),
  };
}

/**
 * Struktur Kaidah Tsunai / Masani Berlapis (1+1=2, 1+2=3, 1+3=4, 1+Banyak)
 */
export interface TsunaiLayer {
  step: string; // "Lapis 1", "Lapis 2", "Lapis 3", "Lapis Lanjutan"
  formula: string; // "1 + 1 = 2", "1 + 2 = 3", "1 + 3 = 4", "1 + Banyak"
  name: string;
  description: string;
  detail: string;
}

/**
 * Pohon Masani: Penjelasan Berpasangan Tematik & Cabang Ranting Faktorial Ayat.
 */
export interface MasaniConceptTree {
  id: string;
  surahNumber: number;
  surahName: string;
  title: string;
  theme: string;
  verseAnchor: string;
  anchorSurah: number;
  anchorAyah: number;
  anchorArabic: string;
  anchorTranslation: string;
  anchorKeywords?: string[];
  description: string;
  tsunaiLayers?: TsunaiLayer[];
  // Kaitan dengan Genap & Ganjil (Asy-Syaf'i wal Watr) seperti di Gambar User
  evenOddFormula?: {
    quranVerse: string;
    pairFormula: string;
    totalFormula: string;
    explanation: string;
  };
  branches: {
    sideA: {
      name: string;
      arabic: string;
      surahRef: number;
      ayahRef: number;
      surahName: string;
      quote: string;
      highlightWords?: string[];
      children: {
        label: string;
        surahRef: number;
        ayahRef: number;
        surahName: string;
        note: string;
        highlightWords?: string[];
      }[];
    };
    sideB: {
      name: string;
      arabic: string;
      surahRef: number;
      ayahRef: number;
      surahName: string;
      quote: string;
      highlightWords?: string[];
      children: {
        label: string;
        surahRef: number;
        ayahRef: number;
        surahName: string;
        note: string;
        highlightWords?: string[];
      }[];
    };
  };
}

/**
 * Basis Data Pohon Masani Khusus (Termasuk Diagram User: Zakat, Infaq, Sedekah).
 */
export const CURATED_MASANI_TREES: Record<number, MasaniConceptTree> = {
  // 2. AL-BAQARAH — KONSEP ZAKAT, INFAQ & SEDEKAH (DARI DIAGRAM USER)
  2: {
    id: 'zakat-infaq-sedekah',
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    title: 'Konsep Zakat: Infaq ↔ Sedekah & Asy-Syaf\'i wal Watr',
    theme: 'Pensucian Harta & Jiwa dalam Surat Al-Baqarah',
    verseAnchor: 'QS. Al-Baqarah: 43, 261, 271',
    anchorSurah: 2,
    anchorAyah: 43,
    anchorArabic: 'وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ وَٱرْكَعُوا۟ مَعَ ٱلرَّٰكِعِينَ',
    anchorTranslation: 'Dan laksanakanlah shalat, tunaikanlah zakat, dan rukuklah beserta orang-orang yang rukuk.',
    anchorKeywords: ['shalat', 'zakat', 'rukuk'],
    description:
      'Zakat bermakna menyucikan jiwa dengan mengeluarkan harta. Turunan Masani-nya terbelah menjadi dua cara: Infaq (zakat bebas, lapang/sempit) dan Sedekah (terikat fardhu, waktu, dan penerima tertentu).',
    evenOddFormula: {
      quranVerse: 'وَٱلشَّفْعِ وَٱلْوَتْرِ — Demi yang genap dan yang ganjil (QS. Al-Fajr: 3)',
      pairFormula: 'Infaq + Sedekah = 2 Cabang (Genap / Asy-Syaf\'i)',
      totalFormula: 'Zakat + (Infaq + Sedekah) = 3 Pilar (Ganjil / Al-Watr)',
      explanation:
        'Pola bilangan genap dan ganjil berpasangan sempurna: 2 turunan cara pengeluaran harta (Infaq & Sedekah) membentuk bilangan genap (2), dan ketika digabung dengan Zakat induknya menghasilkan bilangan ganjil (3).',
    },
    branches: {
      sideA: {
        name: 'Infaq (Zakat Bebas Dilakukan Siapapun)',
        arabic: 'الْإِنْفَاق',
        surahRef: 2,
        ayahRef: 261,
        surahName: 'Al-Baqarah',
        quote: 'Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji...',
        highlightWords: ['menginfakkan', 'jalan Allah', 'berlipat ganda'],
        children: [
          {
            label: 'Dalam Keadaan Lapang Maupun Sempit',
            surahRef: 3,
            ayahRef: 134,
            surahName: 'Ali \'Imran',
            note: 'QS. Ali \'Imran: 134 — Orang yang berinfak, baik di waktu lapang maupun sempit',
            highlightWords: ['berinfak', 'lapang', 'sempit'],
          },
          {
            label: 'Mencari Keridhaan Allah dengan Keteguhan',
            surahRef: 2,
            ayahRef: 265,
            surahName: 'Al-Baqarah',
            note: 'QS. Al-Baqarah: 265 — Menafkahkan harta untuk mencari keridhaan Allah',
            highlightWords: ['menafkahkan', 'keridhaan Allah'],
          },
          {
            label: 'Menginfakkan Sebagian Rezeki Terus-Menerus',
            surahRef: 2,
            ayahRef: 3,
            surahName: 'Al-Baqarah',
            note: 'QS. Al-Baqarah: 3 — Menafkahkan sebagian rezeki yang Kami anugerahkan',
            highlightWords: ['menafkahkan', 'rezeki'],
          },
        ],
      },
      sideB: {
        name: 'Sedekah (Zakat Fardhu & Hak Tertentu)',
        arabic: 'الصَّدَقَة',
        surahRef: 2,
        ayahRef: 271,
        surahName: 'Al-Baqarah',
        quote: 'Jika kamu menampakkan sedekah-sedekahmu, maka itu baik. Dan jika kamu menyembunyikannya dan memberikannya kepada orang-orang fakir, maka itu lebih baik bagimu...',
        highlightWords: ['sedekah', 'fakir', 'menghapus kesalahan'],
        children: [
          {
            label: 'Terikat 8 Golongan Mustahiq (Asnaf)',
            surahRef: 9,
            ayahRef: 60,
            surahName: 'At-Taubah',
            note: 'QS. At-Taubah: 60 — Sesungguhnya zakat-zakat itu hanyalah untuk orang fakir, miskin...',
            highlightWords: ['zakat', 'fakir', 'miskin', 'asnaf'],
          },
          {
            label: 'Pembersih Harta & Penyuci Jiwa',
            surahRef: 9,
            ayahRef: 103,
            surahName: 'At-Taubah',
            note: 'QS. At-Taubah: 103 — Ambillah zakat dari harta mereka guna membersihkan dan menyucikan mereka',
            highlightWords: ['zakat', 'membersihkan', 'menyucikan'],
          },
          {
            label: 'Balasan Berlipat Ganda bagi Orang Bersedekah',
            surahRef: 57,
            ayahRef: 18,
            surahName: 'Al-Hadid',
            note: 'QS. Al-Hadid: 18 — Laki-laki dan perempuan yang bersedekah, dilipatgandakan pahalanya',
            highlightWords: ['bersedekah', 'dilipatgandakan'],
          },
        ],
      },
    },
  },

  // 1. AL-FATIHAH
  1: {
    id: 'fatihah-jalan-lurus',
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    title: 'Kaidah Masani Al-Fatihah: Yang Diberi Nikmat ↔ Dimurkai & Sesat',
    theme: 'Pembagian Jalan Hidup Manusia (As-Sab\'ul Matsani)',
    verseAnchor: 'QS. Al-Fatihah: 6-7',
    anchorSurah: 1,
    anchorAyah: 6,
    anchorArabic: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
    anchorTranslation: 'Tunjukilah kami jalan yang lurus, (yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.',
    anchorKeywords: ['jalan yang lurus', 'diberi nikmat', 'dimurkai', 'sesat'],
    description:
      'Al-Fatihah adalah As-Sab\'ul Matsani (tujuh ayat yang berpasangan). Ayat 6–7 membelah jalan manusia menjadi 2 kutub: Jalan orang yang diberi nikmat (Sisi A) berhadapan dengan jalan orang yang dimurkai dan tersesat (Sisi B).',
    evenOddFormula: {
      quranVerse: 'وَلَقَدْ ءَاتَيْنَٰكَ سَبْعًا مِّنَ ٱلْمَثَانِى — Dan sungguh, Kami telah memberikan kepadamu tujuh (ayat) yang dibaca berulang-ulang (QS. Al-Hijr: 87)',
      pairFormula: 'Jalan Dimurkai + Jalan Sesat = 2 Jalan Kebinasaan (Genap)',
      totalFormula: 'Jalan Lurus + (Dimurkai + Sesat) = 3 Muara Takdir (Ganjil)',
      explanation: 'Tujuh ayat Al-Fatihah (bilangan ganjil) merangkum dua golongan besar manusia yang saling berpasangan secara harmonis.',
    },
    branches: {
      sideA: {
        name: 'Yang Diberi Nikmat (An\'amta \'Alaihim)',
        arabic: 'أَنْعَمْتَ عَلَيْهِمْ',
        surahRef: 4,
        ayahRef: 69,
        surahName: 'An-Nisa\'',
        quote: 'Dan barangsiapa menaati Allah dan Rasul-Nya, mereka akan bersama para nabi, shiddiqin, syuhada, dan orang-orang saleh...',
        highlightWords: ['menaati', 'nabi', 'shiddiqin', 'syuhada', 'orang saleh'],
        children: [
          { label: 'Para Nabi & Pembawa Petunjuk', surahRef: 19, ayahRef: 58, surahName: 'Maryam', note: 'QS. Maryam: 58 — Mereka itulah orang yang telah diberi nikmat oleh Allah dari para nabi', highlightWords: ['diberi nikmat', 'para nabi'] },
          { label: 'Ketetapan Hati Meniti Jalan Lurus', surahRef: 6, ayahRef: 153, surahName: 'Al-An\'am', note: 'QS. Al-An\'am: 153 — Dan inilah jalan-Ku yang lurus, maka ikutilah', highlightWords: ['jalan lurus', 'ikutilah'] },
        ],
      },
      sideB: {
        name: 'Yang Dimurkai & Tersesat (Al-Maghdhubi & Adh-Dhaallin)',
        arabic: 'الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        surahRef: 2,
        ayahRef: 90,
        surahName: 'Al-Baqarah',
        quote: 'Maka mereka kembali dengan membawa kemurkaan di atas kemurkaan...',
        highlightWords: ['kemurkaan', 'ingkar'],
        children: [
          { label: 'Mengetahui Kebenaran tapi Membangkang', surahRef: 5, ayahRef: 60, surahName: 'Al-Ma\'idah', note: 'QS. Al-Ma\'idah: 60 — Orang yang dilaknat Allah dan dimurkai-Nya', highlightWords: ['dilaknat', 'dimurkai'] },
          { label: 'Tersesat Tanpa Petunjuk Ilmu', surahRef: 18, ayahRef: 104, surahName: 'Al-Kahf', note: 'QS. Al-Kahf: 104 — Orang yang sia-sia perbuatannya dalam kehidupan dunia sedang mereka mengira berbuat sebaik-baiknya', highlightWords: ['sia-sia', 'tersesat'] },
        ],
      },
    },
  },

  // 28. AL-QASHASH — WAKTU MALAM & SIANG
  28: {
    id: 'waktu-malam-siang',
    surahNumber: 28,
    surahName: 'Al-Qashash',
    title: 'Konsep Waktu di Dunia: Malam ↔ Siang',
    theme: 'Keteraturan Kosmos & Keseimbangan Waktu Hidup Manusia',
    verseAnchor: 'QS. Al-Qashash: 71-73',
    anchorSurah: 28,
    anchorAyah: 71,
    anchorArabic: 'قُلْ أَرَءَيْتُمْ إِن جَعَلَ ٱللَّهُ عَلَيْكُمُ ٱلَّيْلَ سَرْمَدًا إِلَىٰ يَوْمِ ٱلْقِيَٰمَةِ مَنْ إِلَٰهٌ غَيْرُ ٱللَّهِ يَأْتِيكُم بِضِيَآءٍ',
    anchorTranslation: 'Katakanlah: Terangkanlah kepadaku, jika Allah menjadikan untukmu malam itu terus-menerus sampai hari kiamat, siapakah tuhan selain Allah yang akan mendatangkan cahaya kepadamu?',
    anchorKeywords: ['malam', 'cahaya', 'kiamat', 'tuhan selain Allah'],
    description:
      'Metode Masani mempertemukan dua sisi waktu berpasangan: Waktu di dunia dibagi menjadi Malam dan Siang. Dari masing-masing cabang, ayat-ayat Al-Qur\'an memperinci fungsi dan turunannya seperti ranting pohon faktorial.',
    evenOddFormula: {
      quranVerse: 'وَٱلشَّفْعِ وَٱلْوَتْرِ — Demi yang genap dan yang ganjil (QS. Al-Fajr: 3)',
      pairFormula: 'Malam + Siang = 2 Fase Hari (Genap)',
      totalFormula: 'Waktu Induk + (Malam + Siang) = 3 Realitas (Ganjil)',
      explanation: 'Siklus waktu 24 jam terbelah menjadi sepasang (genap), mencerminkan hikmah penciptaan berpasangan.',
    },
    branches: {
      sideA: {
        name: 'Malam (Al-Lail)',
        arabic: 'اللَّيْل',
        surahRef: 28,
        ayahRef: 71,
        surahName: 'Al-Qashash',
        quote: 'Katakanlah: Bagaimanakah pendapatmu jika Allah menjadikan untukmu malam itu terus-menerus sampai hari kiamat...',
        highlightWords: ['malam terus-menerus', 'cahaya'],
        children: [
          { label: 'Ketenangan & Istirahat (Sakan)', surahRef: 10, ayahRef: 67, surahName: 'Yunus', note: 'QS. Yunus: 67 — Agar kamu beristirahat padanya', highlightWords: ['beristirahat', 'malam'] },
          { label: 'Keheningan Shalat Malam (Qiyamullail)', surahRef: 73, ayahRef: 2, surahName: 'Al-Muzzammil', note: 'QS. Al-Muzzammil: 2 — Bangunlah pada malam hari untuk shalat', highlightWords: ['bangunlah', 'malam hari'] },
          { label: 'Kegelapan yang Menutupi (Ghasyiyah)', surahRef: 92, ayahRef: 1, surahName: 'Al-Lail', note: 'QS. Al-Lail: 1 — Demi malam apabila menutupi cahaya siang', highlightWords: ['demi malam', 'menutupi'] },
        ],
      },
      sideB: {
        name: 'Siang (An-Nahar)',
        arabic: 'النَّهَار',
        surahRef: 28,
        ayahRef: 73,
        surahName: 'Al-Qashash',
        quote: 'Dan karena rahmat-Nya, Dia jadikan untukmu malam dan siang, agar kamu beristirahat padanya dan mencari sebagian karunia-Nya...',
        highlightWords: ['malam dan siang', 'beristirahat', 'mencari karunia'],
        children: [
          { label: 'Mencari Karunia Rezeki (Ma\'isyah)', surahRef: 78, ayahRef: 11, surahName: 'An-Naba', note: 'QS. An-Naba: 11 — Dan Kami jadikan siang untuk mencari penghidupan', highlightWords: ['siang', 'penghidupan'] },
          { label: 'Terang Membuka Penglihatan (Mubshiran)', surahRef: 17, ayahRef: 12, surahName: 'Al-Isra', note: 'QS. Al-Isra: 12 — Dan Kami jadikan tanda siang itu terang benderang', highlightWords: ['tanda siang', 'terang'] },
          { label: 'Cahaya Matahari Pagi (Dhuha)', surahRef: 91, ayahRef: 1, surahName: 'Asy-Syams', note: 'QS. Asy-Syams: 1 — Demi matahari dan cahayanya di pagi hari', highlightWords: ['matahari', 'cahaya pagi'] },
        ],
      },
    },
  },

  // 56. AL-WAQI'AH — SURGA & NERAKA
  56: {
    id: 'balasan-surga-neraka',
    surahNumber: 56,
    surahName: 'Al-Waqi\'ah',
    title: 'Konsep Balasan Amal: Surga ↔ Neraka',
    theme: 'Eskatologi & Keadilan Pembalasan Amal Manusia',
    verseAnchor: 'QS. Al-Waqi\'ah: 27 & 41',
    anchorSurah: 56,
    anchorAyah: 27,
    anchorArabic: 'وَأَصْحَٰبُ ٱلْيَمِينِ مَآ أَصْحَٰبُ ٱلْيَمِينِ فِى سِدْرٍ مَّخْضُودٍ',
    anchorTranslation: 'Dan golongan kanan, alangkah bahagianya golongan kanan itu. Berada di antara pohon bidara yang tidak berduri.',
    anchorKeywords: ['golongan kanan', 'berbahagia', 'pohon bidara'],
    description:
      'Keseimbangan berpasangan dalam Al-Qur\'an antara kabar gembira (Basyir) dan peringatan (Nadzir), di mana setiap kenikmatan surga selalu diimbangi penjelasan ancaman neraka sebagai penjelasan berpasangan.',
    evenOddFormula: {
      quranVerse: 'وَٱلشَّفْعِ وَٱلْوَتْرِ — Demi yang genap dan yang ganjil (QS. Al-Fajr: 3)',
      pairFormula: 'Surga + Neraka = 2 Tempat Kembali Akhirat (Genap)',
      totalFormula: 'Muqarrabun + (Surga + Neraka) = 3 Golongan Al-Waqi\'ah (Ganjil)',
      explanation: 'Dalam QS. Al-Waqi\'ah: 7, manusia dibagi menjadi tiga golongan (ganjil): As-Sabiqun, Ashabul Yamin, dan Ashabul Syimal.',
    },
    branches: {
      sideA: {
        name: 'Golongan Kanan / Surga (Ashabul Yamin)',
        arabic: 'أَصْحَابُ الْيَمِينِ',
        surahRef: 56,
        ayahRef: 27,
        surahName: 'Al-Waqi\'ah',
        quote: 'Dan golongan kanan, alangkah bahagianya golongan kanan itu. Berada di antara pohon bidara yang tidak berduri...',
        highlightWords: ['golongan kanan', 'berbahagia', 'tanpa duri'],
        children: [
          { label: 'Pohon Pisang Bersusun & Naungan Luas', surahRef: 56, ayahRef: 28, surahName: 'Al-Waqi\'ah', note: 'QS. Al-Waqi\'ah: 28 — Dan pohon pisang yang bersusun-susun', highlightWords: ['pohon pisang', 'bersusun'] },
          { label: 'Air Mengalir & Buah Berlimpah Ruah', surahRef: 56, ayahRef: 31, surahName: 'Al-Waqi\'ah', note: 'QS. Al-Waqi\'ah: 31 — Dan air yang tercurah tanpa henti', highlightWords: ['air tercurah', 'buah berlimpah'] },
          { label: 'Kedamaian Penuh Kesejahteraan (Salam)', surahRef: 56, ayahRef: 26, surahName: 'Al-Waqi\'ah', note: 'QS. Al-Waqi\'ah: 26 — Hanya ucapan salam penuh kedamaian', highlightWords: ['salam', 'damai'] },
        ],
      },
      sideB: {
        name: 'Golongan Kiri / Neraka (Ashabul Syimal)',
        arabic: 'أَصْحَابُ الشِّمَالِ',
        surahRef: 56,
        ayahRef: 41,
        surahName: 'Al-Waqi\'ah',
        quote: 'Dan golongan kiri, siapakah golongan kiri itu? Dalam siksaan angin yang amat panas dan air yang mendidih...',
        highlightWords: ['golongan kiri', 'angin amat panas', 'air mendidih'],
        children: [
          { label: 'Angin Membakar & Naungan Asap Hitam', surahRef: 56, ayahRef: 42, surahName: 'Al-Waqi\'ah', note: 'QS. Al-Waqi\'ah: 42 — Dan naungan asap yang hitam panas', highlightWords: ['angin membakar', 'asap hitam'] },
          { label: 'Pohon Zaqqum Makanan Para Pendosa', surahRef: 56, ayahRef: 52, surahName: 'Al-Waqi\'ah', note: 'QS. Al-Waqi\'ah: 52 — Benar-benar memakan dari pohon Zaqqum', highlightWords: ['memakan', 'pohon Zaqqum'] },
          { label: 'Minum Membakar Laksana Unta Haus', surahRef: 56, ayahRef: 55, surahName: 'Al-Waqi\'ah', note: 'QS. Al-Waqi\'ah: 55 — Meminum air mendidih laksana unta kehausan', highlightWords: ['air mendidih', 'kehausan'] },
        ],
      },
    },
  },

  // 89. AL-FAJR — ASY-SYAF'I WAL WATR (GENAP & GANJIL)
  89: {
    id: 'fajr-syaf-watr',
    surahNumber: 89,
    surahName: 'Al-Fajr',
    title: 'Konsep Makro Masani: Sumpah Genap & Ganjil',
    theme: 'Kaidah Bilangan Asy-Syaf\'i wal Watr dalam Al-Qur\'an',
    verseAnchor: 'QS. Al-Fajr: 1-4',
    anchorSurah: 89,
    anchorAyah: 3,
    anchorArabic: 'وَٱلشَّفْعِ وَٱلْوَتْرِ وَٱلَّيْلِ إِذَا يَسْرِ',
    anchorTranslation: 'Demi yang genap dan yang ganjil, dan demi malam apabila berlalu.',
    anchorKeywords: ['genap', 'ganjil', 'malam'],
    description:
      'Sumpah Allah atas segala ciptaan yang berpasangan (genap / Asy-Syaf\'i) dan ketunggalan Sang Khaliq serta bilangan-bilangan witir (ganjil / Al-Watr). Ini adalah dasar kaidah pembagian Masani di seluruh Al-Qur\'an.',
    evenOddFormula: {
      quranVerse: 'وَٱلشَّفْعِ وَٱلْوَتْرِ (QS. Al-Fajr: 3)',
      pairFormula: 'Ciptaan Berpasangan = Asy-Syaf\'i (Genap: 2, 4, 6...)',
      totalFormula: 'Ke-Esaan Allah (Ahad) = Al-Watr (Ganjil: 1, 3, 5...)',
      explanation: 'Seluruh makhluk diciptakan berpasang-pasangan, sementara Allah Maha Ganjil (Tunggal) dan mencintai yang ganjil (HR. Bukhari).',
    },
    branches: {
      sideA: {
        name: 'Asy-Syaf\'i (Segala yang Diciptakan Berpasangan)',
        arabic: 'الشَّفْع',
        surahRef: 51,
        ayahRef: 49,
        surahName: 'Adz-Dzariyat',
        quote: 'Dan segala sesuatu Kami ciptakan berpasang-pasangan agar kamu mengingat kebesaran Allah.',
        highlightWords: ['berpasang-pasangan', 'mengingat kebesaran Allah'],
        children: [
          { label: 'Pasangan Jantan dan Betina', surahRef: 53, ayahRef: 45, surahName: 'An-Najm', note: 'QS. An-Najm: 45 — Dan Dialah yang menciptakan pasangan laki-laki dan perempuan', highlightWords: ['pasangan', 'laki-laki dan perempuan'] },
          { label: 'Pasangan Siang dan Malam', surahRef: 36, ayahRef: 37, surahName: 'Yasin', note: 'QS. Yasin: 37 — Suatu tanda bagi mereka adalah malam; Kami tanggalkan siang daripadanya', highlightWords: ['malam', 'siang'] },
        ],
      },
      sideB: {
        name: 'Al-Watr (Ketunggalan Sang Pencipta & Nilai Ganjil)',
        arabic: 'الْوَتْر',
        surahRef: 112,
        ayahRef: 1,
        surahName: 'Al-Ikhlas',
        quote: 'Katakanlah: Dialah Allah, Yang Maha Esa.',
        highlightWords: ['Maha Esa', 'tempat bergantung'],
        children: [
          { label: 'Allah Mencintai Bilangan Ganjil (Witir)', surahRef: 89, ayahRef: 3, surahName: 'Al-Fajr', note: 'Hadits: "Sesungguhnya Allah itu Witir (Ganjil) dan menyukai yang witir"', highlightWords: ['witir', 'ganjil'] },
          { label: 'Jiwa Tenang yang Kembali kepada Rabb-Nya', surahRef: 89, ayahRef: 27, surahName: 'Al-Fajr', note: 'QS. Al-Fajr: 27 — Wahai jiwa yang tenang! Kembalilah kepada Tuhanmu', highlightWords: ['jiwa yang tenang', 'kembalilah'] },
        ],
      },
    },
  },

  // 92. AL-LAIL — DERMAWAN & TAKWA VS KIKIR & RASA CUKUP
  92: {
    id: 'lail-dermawan-kikir',
    surahNumber: 92,
    surahName: 'Al-Lail',
    title: 'Konsep Usaha Manusia: Memberi & Bertakwa ↔ Kikir & Merasa Cukup',
    theme: 'Dua Cabang Perjalanan Amal Manusia (Al-Lail)',
    verseAnchor: 'QS. Al-Lail: 5-11',
    anchorSurah: 92,
    anchorAyah: 4,
    anchorArabic: 'إِنَّ سَعْيَكُمْ لَشَتَّىٰ فَأَمَّا مَنْ أَعْطَىٰ وَٱتَّقَىٰ',
    anchorTranslation: 'Sungguh, usahamu memang beraneka ragam. Adapun orang yang memberikan (hartanya) dan bertakwa...',
    anchorKeywords: ['usahamu beraneka ragam', 'memberikan', 'bertakwa'],
    description:
      'Surat Al-Lail merangkum jalan takdir amal manusia ke dalam sepasang cabang simetris: Orang yang gemar memberi dan bertakwa dimudahkan menuju jalan kemudahan, sedangkan yang kikir dan merasa kaya dimudahkan menuju jalan kesukaran.',
    evenOddFormula: {
      quranVerse: 'وَٱلشَّفْعِ وَٱلْوَتْرِ (QS. Al-Fajr: 3)',
      pairFormula: 'Jalan Kemudahan (Yusra) + Jalan Kesukaran (\'Usra) = 2 Muara Takdir (Genap)',
      totalFormula: 'Usaha Manusia + (Yusra + \'Usra) = 3 Hakikat Ikhtiar (Ganjil)',
      explanation: 'Dua cabang jalan hidup yang kontras ini memperlihatkan keadilan Allah dalam membalas amal setiap hamba.',
    },
    branches: {
      sideA: {
        name: 'Yang Memberi & Bertakwa (Man A\'tha Wat-Taqa)',
        arabic: 'مَنْ أَعْطَىٰ وَاتَّقَىٰ',
        surahRef: 92,
        ayahRef: 5,
        surahName: 'Al-Lail',
        quote: 'Maka barangsiapa memberikan (hartanya di jalan Allah) dan bertakwa, serta membenarkan adanya pahala yang terbaik...',
        highlightWords: ['memberikan harta', 'bertakwa', 'pahala terbaik'],
        children: [
          { label: 'Dimudahkan Menuju Kemudahan (Yusra)', surahRef: 92, ayahRef: 7, surahName: 'Al-Lail', note: 'QS. Al-Lail: 7 — Maka akan Kami mudahkan baginya jalan menuju kemudahan', highlightWords: ['jalan kemudahan'] },
          { label: 'Jauh dari Siksa Api Neraka', surahRef: 92, ayahRef: 17, surahName: 'Al-Lail', note: 'QS. Al-Lail: 17 — Dan kelak akan dijauhkan darinya orang yang paling bertakwa', highlightWords: ['dijauhkan', 'paling bertakwa'] },
        ],
      },
      sideB: {
        name: 'Yang Kikir & Merasa Cukup (Man Bakhila Wastaghna)',
        arabic: 'مَنْ بَخِلَ وَاسْتَغْنَىٰ',
        surahRef: 92,
        ayahRef: 8,
        surahName: 'Al-Lail',
        quote: 'Dan adapun orang yang kikir dan merasa dirinya cukup, serta mendustakan pahala yang terbaik...',
        highlightWords: ['kikir', 'merasa cukup', 'mendustakan'],
        children: [
          { label: 'Dimudahkan Menuju Jalan Kesukaran (\'Usra)', surahRef: 92, ayahRef: 10, surahName: 'Al-Lail', note: 'QS. Al-Lail: 10 — Maka akan Kami mudahkan baginya jalan menuju kesukaran', highlightWords: ['jalan kesukaran'] },
          { label: 'Harta yang Tak Berguna Saat Binasa', surahRef: 92, ayahRef: 11, surahName: 'Al-Lail', note: 'QS. Al-Lail: 11 — Dan hartanya tidak bermanfaat baginya apabila ia telah binasa', highlightWords: ['harta tidak bermanfaat', 'binasa'] },
        ],
      },
    },
  },
};

function ensureTsunaiLayers(tree: MasaniConceptTree): MasaniConceptTree {
  if (tree.tsunaiLayers && tree.tsunaiLayers.length > 0) {
    return tree;
  }

  // Khusus Al-Baqarah (2) Sesuai Diagram Pengguna: Zakat, Infaq & Sedekah
  if (tree.surahNumber === 2) {
    return {
      ...tree,
      tsunaiLayers: [
        {
          step: 'Lapis 1',
          formula: '1 + 1 = 2',
          name: 'Mentsunaikan 2 Pilar Berpasangan (Asy-Syaf\'i / Genap)',
          description: 'Dari 1 Ayat Pokok (Zakat di QS. 2:43), melahirkan 2 cabang berpasangan simetris: Infaq (QS. 2:261) + Sedekah (QS. 2:271) = 2 cabang cara menunaikan.',
          detail: '1 Infaq + 1 Sedekah = 2 Bentuk Pengeluaran Harta (Bilangan Genap / Asy-Syaf\'i)',
        },
        {
          step: 'Lapis 2',
          formula: '1 + 2 = 3',
          name: 'Kesatuan Pokok & Cabang (Al-Watr / Ganjil)',
          description: '1 Zakat Induk + (1 Infaq + 1 Sedekah) = 3 Pilar yang saling menerangkan dalam syariat.',
          detail: '1 Pokok Pensucian Harta + 2 Cara Pelaksanaan = 3 Pilar Kokoh (Bilangan Ganjil / Al-Watr)',
        },
        {
          step: 'Lapis 3',
          formula: '1 + 3 = 4',
          name: 'Percabangan Sasaran Syariat & Mustahiq',
          description: 'Pilar Sedekah melompat mencabangkan aturan hukum: 8 Golongan Asnaf Penerima (QS. 9:60) dan Sedekah Sunnah / Jariyah (QS. 57:18).',
          detail: '1 Induk + 3 Sasaran Rincian Syariat = 4 Dimensi Keadilan Sosial',
        },
        {
          step: 'Lapis Lanjutan',
          formula: '1 + Banyak',
          name: 'Pohon Faktorial Seluruh Al-Qur\'an',
          description: 'Penjelasan Masani meluas ke ayat-ayat di surat lain: infaq saat lapang/sempit (Ali \'Imran: 134), larangan mengungkit sedekah (Al-Baqarah: 264), dan zakat pembersih jiwa (At-Taubah: 103).',
          detail: 'Faktorial penjelas ayat beranak-pinak melengkapi seluruh tuntunan syariat di dalam mushaf.',
        },
      ],
    };
  }

  const sideAName = tree.branches.sideA.name.split('(')[0].trim();
  const sideBName = tree.branches.sideB.name.split('(')[0].trim();

  return {
    ...tree,
    tsunaiLayers: [
      {
        step: 'Lapis 1',
        formula: '1 + 1 = 2',
        name: 'Mentsunaikan 2 Pilar (Asy-Syaf\'i / Genap)',
        description: `Dari 1 Ayat Pokok (${tree.verseAnchor}), terurai menjadi 2 pilar berpasangan simetris: ${sideAName} (1) + ${sideBName} (1) = 2 cabang.`,
        detail: `1 ${sideAName} + 1 ${sideBName} = 2 Pilar Masani (Bilangan Genap / Asy-Syaf\'i)`,
      },
      {
        step: 'Lapis 2',
        formula: '1 + 2 = 3',
        name: 'Kesatuan Pokok & Ranting (Al-Watr / Ganjil)',
        description: `1 Ayat Induk + (2 Cabang Penjelas) = 3 Pilar yang saling menerangkan dalam Surat ${tree.surahName}.`,
        detail: `1 Pokok Hikmah + 2 Pilar Penjelas = 3 Pondasi (Bilangan Ganjil / Al-Watr)`,
      },
      {
        step: 'Lapis 3',
        formula: '1 + 3 = 4',
        name: 'Percabangan Ranting Syariat / Adab',
        description: `Cabang penjelas merinci tuntunan amal: rincian pada ${tree.branches.sideA.children[0]?.label ?? 'tuntunan pertama'} dan ${tree.branches.sideB.children[0]?.label ?? 'tuntunan kedua'}.`,
        detail: `1 Induk + 3 Rincian Sasaran Amal = 4 Penjelasan Hukum`,
      },
      {
        step: 'Lapis Lanjutan',
        formula: '1 + Banyak',
        name: 'Pohon Faktorial Seluruh Al-Qur\'an',
        description: `Pola Masani terus beranak-pinak melahirkan kaitan ayat-ayat penguat di seluruh 114 surat Al-Qur'an.`,
        detail: `Faktorial penjelas ayat meluas secara harmonis ke seluruh mushaf.`,
      },
    ],
  };
}

/**
 * Pembuat Pohon Masani Dinamis untuk SEMUA 114 SURAT:
 * Jika surat tersebut memiliki pohon kurasi khusus, tampilkan yang khusus.
 * Jika tidak, buatkan pohon tematik Masani yang selaras dengan pesan utama surat tersebut.
 */
export function getMasaniTreeForSurah(surahNumber: number): MasaniConceptTree {
  if (CURATED_MASANI_TREES[surahNumber]) {
    return ensureTsunaiLayers(CURATED_MASANI_TREES[surahNumber]);
  }

  const meta = ALL_SURAHS[surahNumber - 1];
  const name = meta?.name ?? `Surat ${surahNumber}`;
  const totalAyah = meta?.number_of_ayah ?? 10;

  // Pasangan tematik default yang mewakili pesan tiap surat
  const dynamicTree: MasaniConceptTree = {
    id: `surah-${surahNumber}`,
    surahNumber,
    surahName: name,
    title: `Pohon Konsep Masani: QS. ${name} (Surat ke-${surahNumber})`,
    theme: `Keseimbangan Pesan Berpasangan dalam Surat ${name}`,
    verseAnchor: `QS. ${name}: 1–${Math.min(3, totalAyah)}`,
    anchorSurah: surahNumber,
    anchorAyah: 1,
    anchorArabic: `بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ — ${meta?.name_translations.ar ?? ''}`,
    anchorTranslation: `Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Renungan pesan berpasangan (Masani) dalam Surat ${name}.`,
    anchorKeywords: ['Maha Pengasih', 'Maha Penyayang', name],
    description: `Surat ${name} (${totalAyah} ayat) tersusun atas prinsip Matsani (penjelasan berpasangan). Di dalamnya terdapat perpaduan antara kabar gembira (Sisi A) dan peringatan kesungguhan (Sisi B).`,
    tsunaiLayers: [],
    evenOddFormula: {
      quranVerse: 'وَٱلشَّفْعِ وَٱلْوَتْرِ — Demi yang genap dan yang ganjil (QS. Al-Fajr: 3)',
      pairFormula: `Cabang Harapan + Cabang Peringatan = 2 Sisi Masani Surat ${name} (Genap)`,
      totalFormula: `Pesan Tauhid + (Harapan + Peringatan) = 3 Pondasi Hikmah (Ganjil)`,
      explanation: `Setiap surat Al-Qur'an memadukan harapan rahmat Allah dan kehati-hatian atas larangan-Nya, membentuk keseimbangan 2 pilar yang berpasangan.`,
    },
    branches: {
      sideA: {
        name: `Kabar Gembira & Rahmat (At-Tarsyih)`,
        arabic: 'الرَّحْمَةُ وَالْبُشْرَى',
        surahRef: surahNumber,
        ayahRef: 1,
        surahName: name,
        quote: `Segala bentuk rahmat, petunjuk, dan janji kebaikan bagi orang yang beriman dalam Surat ${name}...`,
        highlightWords: ['rahmat', 'petunjuk', 'kebaikan', 'beriman'],
        children: [
          {
            label: `Ketaatan dan Keimanan yang Diterima`,
            surahRef: surahNumber,
            ayahRef: Math.max(1, Math.floor(totalAyah / 3)),
            surahName: name,
            note: `Meneguhkan hati orang beriman agar senantiasa teguh dalam jalan Allah`,
            highlightWords: ['beriman', 'ketaatan'],
          },
          {
            label: `Pahala & Kesudahan yang Baik`,
            surahRef: surahNumber,
            ayahRef: totalAyah,
            surahName: name,
            note: `Janji kemenangan dan surga bagi hamba yang bertakwa`,
            highlightWords: ['pahala', 'surga', 'bertakwa'],
          },
        ],
      },
      sideB: {
        name: `Peringatan & Keadilan Hukum (Al-Indzar)`,
        arabic: 'الْإِنْذَارُ وَالْعَدْل',
        surahRef: surahNumber,
        ayahRef: Math.min(totalAyah, Math.floor(totalAyah / 2) || 1),
        surahName: name,
        quote: `Peringatan bagi orang yang melampaui batas dan lalai dari mengingat hari pembalasan dalam Surat ${name}...`,
        highlightWords: ['peringatan', 'keadilan', 'hari pembalasan'],
        children: [
          {
            label: `Larangan Melampaui Batas`,
            surahRef: surahNumber,
            ayahRef: Math.min(totalAyah, Math.floor(totalAyah / 2) + 1),
            surahName: name,
            note: `Peringatan agar manusia tidak terpedaya oleh tipu daya dunia`,
            highlightWords: ['peringatan', 'larangan'],
          },
          {
            label: `Pertanggungjawaban Setiap Jiwa`,
            surahRef: surahNumber,
            ayahRef: Math.min(totalAyah, totalAyah - 1 || 1),
            surahName: name,
            note: `Setiap manusia akan menuai hasil dari apa yang telah dikerjakannya`,
            highlightWords: ['pertanggungjawaban', 'amal'],
          },
        ],
      },
    },
  };

  return ensureTsunaiLayers(dynamicTree);
}

export const MASANI_CONCEPT_TREES: MasaniConceptTree[] = Object.values(CURATED_MASANI_TREES);
