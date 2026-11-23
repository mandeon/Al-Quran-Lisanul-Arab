import React from 'react';

// Curated list of significant Quranic keywords in Indonesian translation
// Arranged with multi-word terms first so regex matches greedily
export const IMPORTANT_KEYWORDS = [
  // Asma Allah & Sifat Utama
  'Yang Maha Pemurah lagi Maha Penyayang',
  'Yang Maha Pemurah',
  'Maha Pemurah',
  'Maha Penyayang',
  'Yang Maha Pengampun',
  'Maha Pengampun',
  'Maha Mengetahui',
  'Maha Mendengar',
  'Maha Melihat',
  'Maha Bijaksana',
  'Maha Kuasa',
  'Maha Tinggi',
  'Maha Suci',
  'Maha Adil',
  'Maha Agung',
  'Yang Maha Esa',
  'Tuhan semesta alam',
  'Hari Pembalasan',
  'Hari Kiamat',
  'Hari Kebangkitan',
  'Hari Akhir',
  'Jalan yang lurus',
  'Orang-orang yang beriman',
  'Orang-orang yang bertakwa',
  'Orang-orang yang kafir',
  'Orang-orang yang berbuat zalim',
  'Orang-orang yang sabar',
  'Orang-orang yang bersyukur',
  'Kehidupan akhirat',
  'Siksa yang pedih',
  'Ampunan dan rahmat',

  // Nama Ilahi & Gelar
  'Allah',
  'Tuhan',
  'Rabb',
  'Ilah',
  'Rasul',
  'Nabi',
  'Malaikat',
  'Al-Qur\'an',
  'Al-Kitab',
  'Kitab',
  'Wahyu',
  'Kalam',

  // Eskatologi & Gaib
  'Surga',
  'Neraka',
  'Pahala',
  'Azab',
  'Siksa',
  'Kiamat',
  'Akhirat',
  'Alam kubur',
  'Timbangan',
  'Arsy',

  // Ibadah & Sikap Batin
  'Petunjuk',
  'Hidayah',
  'Rahmat',
  'Ampunan',
  'Beriman',
  'Iman',
  'Takwa',
  'Bertakwa',
  'Mukmin',
  'Shalat',
  'Zakat',
  'Sujud',
  'Rukuk',
  'Doa',
  'Ibadah',
  'Menyembah',
  'Sabar',
  'Syukur',
  'Bersyukur',
  'Tawakal',
  'Ikhlas',
  'Taubat',
  'Hati',
  'Jiwa',
  'Kebenaran',
  'Kebaikan',
  'Kebajikan',
  'Pemberi rezeki',
  'Rezeki',

  // Peringatan
  'Dosa',
  'Kezaliman',
  'Zalim',
  'Kafir',
  'Kekafiran',
  'Munafik',
  'Fasik',
  'Iblis',
  'Setan',
  'Kesesatan',
  'Lalai',
];

// Helper to escape regex special characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights important Quranic keywords in an Indonesian translation text.
 * Uses an elegant pink-purple highlight palette ("pink agak ungu").
 */
export function renderHighlightedTranslation(
  text: string,
  extraQuery?: string
): React.ReactNode {
  if (!text) return null;

  // Build word list
  const terms = [...IMPORTANT_KEYWORDS];
  if (extraQuery && extraQuery.trim().length > 1) {
    terms.unshift(extraQuery.trim());
  }

  // Deduplicate and filter out empty
  const uniqueTerms = Array.from(new Set(terms.filter(Boolean)));

  // Sort descending by length so longer phrases are captured first
  uniqueTerms.sort((a, b) => b.length - a.length);

  // Construct regex pattern matching whole words or exact phrases
  const pattern = uniqueTerms.map(escapeRegExp).join('|');
  const regex = new RegExp(`(\\b(?:${pattern})\\b)`, 'gi');

  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => {
        if (!part) return null;

        // Check if this part matches one of our keywords (case-insensitive)
        const isKeyword = uniqueTerms.some(
          (term) => term.toLowerCase() === part.toLowerCase()
        );

        if (isKeyword) {
          return (
            <mark
              key={index}
              className="inline-block mx-0.5 px-1.5 py-0.5 rounded-md font-semibold text-purple-950 bg-pink-100/90 border border-pink-200/90 shadow-[0_1px_2px_rgba(219,39,119,0.12)] ring-1 ring-purple-200/50 transition-all hover:bg-pink-200/90 hover:scale-[1.02]"
              title={`Kata kunci tadabbur: ${part}`}
            >
              {part}
            </mark>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
