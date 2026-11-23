/**
 * Glosarium Indonesia → Arab berdasarkan entri LISANUL ARAB (Ibnu Manzhur)
 * yang sudah diverifikasi di repo Arabic-Dictionaries-OSINTAI
 * (lihat scripts/lisan_extract/*.txt dan highlight_details surat 1, 112, 113, 114).
 *
 * Setiap entri: kata Indonesia → kata Arab (bentuk dasar), akar, dan
 * makna menurut Lisan. Kata Arab inilah yang dipakai untuk mencari masani.
 * Hanya akar yang benar-benar ada di ekstrak Lisan yang dimasukkan.
 */

export interface LisanEntry {
  /** Kata kunci Indonesia (huruf kecil) */
  id: string[];
  /** Kata Arab yang dicari di mushaf */
  arabic: string;
  /** Akar kata (format Lisan, mis. ر-ح-م) */
  root: string;
  /** Nama entri di Lisanul Arab */
  entry: string;
  /** Makna menurut Lisanul Arab (ringkas, Bahasa Indonesia) */
  meaning: string;
}

export const LISAN_GLOSSARY: LisanEntry[] = [
  { id: ['allah'], arabic: 'الله', root: 'أ-ل-ه', entry: 'أله',
    meaning: 'Al-Ilah: Dia yang disembah; asal nama Allah adalah al-ilah.' },
  { id: ['ilah', 'sesembahan', 'yang disembah'], arabic: 'اله', root: 'أ-ل-ه', entry: 'أله',
    meaning: 'Ilah: segala yang dijadikan sesembahan.' },
  { id: ['rahmat', 'kasih', 'kasih sayang', 'sayang', 'penyayang', 'pengasih'], arabic: 'رحمة', root: 'ر-ح-م', entry: 'رحم',
    meaning: 'Ar-Rahmah: kelembutan dan kecondongan hati; rahmat Allah = kasih, kebaikan, dan rezeki-Nya.' },
  { id: ['rahman', 'maha pengasih'], arabic: 'رحمن', root: 'ر-ح-م', entry: 'رحم',
    meaning: 'Ar-Rahman: Pemilik rahmat tanpa batas; nama khusus bagi Allah.' },
  { id: ['rahim', 'maha penyayang'], arabic: 'رحيم', root: 'ر-ح-م', entry: 'رحم',
    meaning: 'Ar-Rahim: Yang berkasih kepada makhluk; boleh untuk selain Allah.' },
  { id: ['puji', 'pujian', 'memuji', 'hamd'], arabic: 'حمد', root: 'ح-م-د', entry: 'حمد',
    meaning: 'Al-Hamd: lawan celaan; lebih umum dari syukur.' },
  { id: ['tuhan', 'rabb', 'pemilik', 'pemelihara'], arabic: 'رب', root: 'ر-ب-ب', entry: 'ربب',
    meaning: 'Ar-Rabb: Pemilik segala sesuatu, pengatur dan pemeliharanya.' },
  { id: ['alam', 'semesta', 'seluruh makhluk'], arabic: 'علمين', root: 'ع-ل-م', entry: 'علم',
    meaning: "Al-'Alamin: jin dan manusia (Ibnu 'Abbas) atau seluruh makhluk (Qatadah)." },
  { id: ['ilmu', 'tahu', 'mengetahui', 'pengetahuan'], arabic: 'علم', root: 'ع-ل-م', entry: 'علم',
    meaning: "Al-'Ilm: pengetahuan; lawan dari kebodohan." },
  { id: ['raja', 'kerajaan', 'menguasai', 'penguasa'], arabic: 'ملك', root: 'م-ل-ك', entry: 'ملك',
    meaning: 'Al-Malik: Raja segala raja; milik-Nya kerajaan.' },
  { id: ['hari', 'siang hari'], arabic: 'يوم', root: 'ي-و-م', entry: 'يوم',
    meaning: 'Al-Yaum: rentang dari terbit hingga terbenamnya matahari.' },
  { id: ['agama', 'pembalasan', 'balasan', 'perhitungan', 'ketaatan', 'din'], arabic: 'دين', root: 'د-ي-ن', entry: 'دين',
    meaning: 'Ad-Din: balasan dan perhitungan; juga ketaatan.' },
  { id: ['sembah', 'menyembah', 'ibadah', 'hamba', 'abdi'], arabic: 'عبد', root: 'ع-ب-د', entry: 'عبد',
    meaning: "Al-'Ibadah: ketaatan disertai ketundukan; asal 'ubudiyyah adalah tunduk dan merendah." },
  { id: ['tolong', 'pertolongan', 'menolong', 'bantuan', 'penolong'], arabic: 'نستعين', root: 'ع-و-ن', entry: 'عون',
    meaning: "Al-'Aun: penyokong dalam suatu urusan; isti'anah = meminta pertolongan." },
  { id: ['petunjuk', 'hidayah', 'tunjuk', 'bimbingan'], arabic: 'هدى', root: 'ه-د-ي', entry: 'هدي',
    meaning: 'Al-Huda: lawan kesesatan, yaitu ar-rasyad (bimbingan benar).' },
  { id: ['jalan', 'shirath', 'sirat'], arabic: 'صرط', root: 'ص-ر-ط', entry: 'صرط',
    meaning: 'Ash-Shirath: jalan (ath-thariq); juga dibaca dengan sin.' },
  { id: ['lurus', 'tegak', 'berdiri', 'kaum'], arabic: 'مستقيم', root: 'ق-و-م', entry: 'قوم',
    meaning: 'Istiqamah: lurus dan tegak; dari akar qama (berdiri).' },
  { id: ['nikmat', 'karunia', 'kesenangan'], arabic: 'نعمة', root: 'ن-ع-م', entry: 'نعم',
    meaning: "Ni'mah: kelapangan hidup, ketenteraman dan harta; lawan kesengsaraan." },
  { id: ['murka', 'marah', 'kemarahan', 'dimurkai'], arabic: 'غضب', root: 'غ-ض-ب', entry: 'غضب',
    meaning: 'Al-Ghadhab: lawan dari ridha.' },
  { id: ['sesat', 'kesesatan', 'tersesat'], arabic: 'ضلل', root: 'ض-ل-ل', entry: 'ضلل',
    meaning: 'Adh-Dhalal: lawan dari petunjuk dan kebenaran.' },
  { id: ['esa', 'satu', 'tunggal', 'ahad'], arabic: 'احد', root: 'أ-ح-د', entry: 'أحد',
    meaning: 'Al-Ahad: Yang Tunggal, yang tidak terbilang bersama yang lain.' },
  { id: ['wahid', 'sendiri', 'menyendiri'], arabic: 'وحد', root: 'و-ح-د', entry: 'وحد',
    meaning: 'Al-Wahid: Yang Esa, tidak ada yang menyertai-Nya.' },
  { id: ['katakan', 'katakanlah', 'kata', 'ucapan', 'berkata', 'perkataan'], arabic: 'قل', root: 'ق-و-ل', entry: 'قول',
    meaning: 'Al-Qaul: ucapan yang tersusun dan bermakna.' },
  { id: ['tempat bergantung', 'bergantung', 'shamad', 'tuan'], arabic: 'صمد', root: 'ص-م-د', entry: 'صمد',
    meaning: 'Ash-Shamad: Tuan yang dituju (dalam segala kebutuhan).' },
  { id: ['anak', 'beranak', 'lahir', 'diperanakkan', 'melahirkan'], arabic: 'ولد', root: 'و-ل-د', entry: 'ولد',
    meaning: 'Al-Walad: anak, yang dilahirkan.' },
  { id: ['setara', 'sebanding', 'tandingan', 'sekufu'], arabic: 'كفوا', root: 'ك-ف-أ', entry: 'كفأ',
    meaning: "Al-Kuf': tandingan yang setara." },
  { id: ['berlindung', 'perlindungan', 'lindung'], arabic: 'اعوذ', root: 'ع-و-ذ', entry: 'عوذ',
    meaning: "Al-'Audz: berlindung dan berpegang erat." },
  { id: ['subuh', 'fajar', 'falaq', 'terbelah', 'belah'], arabic: 'فلق', root: 'ف-ل-ق', entry: 'فلق',
    meaning: 'Al-Falaq: yang terbelah; fajar/subuh.' },
  { id: ['jahat', 'kejahatan', 'buruk', 'keburukan'], arabic: 'شر', root: 'ش-ر-ر', entry: 'شرر',
    meaning: 'Asy-Syarr: lawan dari kebaikan.' },
  { id: ['cipta', 'ciptaan', 'menciptakan', 'makhluk', 'akhlak'], arabic: 'خلق', root: 'خ-ل-ق', entry: 'خلق',
    meaning: 'Al-Khalq: mengadakan sesuatu sesuai takaran (takdir).' },
  { id: ['malam', 'gelap', 'kegelapan'], arabic: 'غاسق', root: 'غ-س-ق', entry: 'غسق',
    meaning: 'Al-Ghasiq: yang mencurah dan menggelap (malam).' },
  { id: ['masuk', 'meliputi', 'merasuk'], arabic: 'وقب', root: 'و-ق-ب', entry: 'وقب',
    meaning: 'Waqaba: masuk dan merasuk.' },
  { id: ['tiup', 'meniup', 'hembus', 'sihir', 'penyihir'], arabic: 'نفثت', root: 'ن-ف-ث', entry: 'نفث',
    meaning: 'An-Nafts: lebih ringan dari meludah, menyerupai hembusan; an-naffatsat = para penyihir yang menyembur pada buhul.' },
  { id: ['buhul', 'ikatan', 'simpul', 'akad', 'janji'], arabic: 'عقد', root: 'ع-ق-د', entry: 'عقد',
    meaning: "Al-'Aqd: ikatan atau buhul yang disimpul." },
  { id: ['dengki', 'iri', 'pendengki', 'hasad'], arabic: 'حاسد', root: 'ح-س-د', entry: 'حسد',
    meaning: 'Al-Hasad: mengharap nikmat dan keutamaan orang lain berpindah kepadanya, atau tercabut dari orang itu.' },
  { id: ['manusia', 'orang', 'insan'], arabic: 'ناس', root: 'ن-و-س / أ-ن-س', entry: 'أنس / نوس',
    meaning: 'An-Nas: manusia.' },
  { id: ['bisikan', 'berbisik', 'was-was', 'waswas', 'godaan'], arabic: 'وسواس', root: 'و-س-و-س', entry: 'وسس',
    meaning: 'Al-Waswas: bisikan yang samar dan tidak jelas.' },
  { id: ['bersembunyi', 'mundur', 'sembunyi'], arabic: 'خناس', root: 'خ-ن-س', entry: 'خنس',
    meaning: 'Al-Khannas: yang mundur lalu bersembunyi.' },
  { id: ['dada', 'hati'], arabic: 'صدور', root: 'ص-د-ر', entry: 'صدر',
    meaning: 'Ash-Shadr: dada; bagian terdepan dari sesuatu.' },
  { id: ['jin', 'tersembunyi', 'gila', 'surga', 'kebun'], arabic: 'جنة', root: 'ج-ن-ن', entry: 'جنن',
    meaning: 'Al-Jinn: yang tersembunyi dari pandangan; akar janana = menutupi.' },
  { id: ['ada', 'jadi', 'menjadi', 'terjadi'], arabic: 'كان', root: 'ك-و-ن', entry: 'كون',
    meaning: 'Al-Kaun: ada, terjadi.' },
  { id: ['langit', 'nama', 'tinggi'], arabic: 'سماء', root: 'س-م-و', entry: 'سما',
    meaning: 'As-Sumuw: tinggi dan terangkat; darinya langit (sama) dan nama (ism).' },
];

function normalizeId(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Apakah input berisi huruf Arab? */
export function hasArabic(s: string): boolean {
  return /[\u0600-\u06FF]/.test(s);
}

export interface LisanMatch {
  input: string;
  entry: LisanEntry;
  /** kata Indonesia yang cocok */
  matched: string;
}

/**
 * Terjemahkan teks Indonesia ke kata Arab menurut glosarium Lisanul Arab.
 * Frasa panjang dicocokkan lebih dulu, lalu kata per kata.
 * Mengembalikan semua entri yang cocok (tanpa duplikat).
 */
export function translateIndonesianToLisan(text: string): LisanMatch[] {
  const norm = ` ${normalizeId(text)} `;
  if (!norm.trim()) return [];
  const keys: { k: string; e: LisanEntry }[] = [];
  LISAN_GLOSSARY.forEach((e) => e.id.forEach((k) => keys.push({ k, e })));
  keys.sort((a, b) => b.k.length - a.k.length);

  let rest = norm;
  const out: LisanMatch[] = [];
  const seen = new Set<string>();
  // Kata Indonesia yang sudah dipakai frasa lebih panjang tidak dicocokkan lagi,
  // tetapi satu kata yang sama boleh menghasilkan beberapa terjemahan Lisan.
  const consumed = new Set<string>();
  keys.forEach(({ k, e }) => {
    const needle = ` ${k} `;
    if (!rest.includes(needle) && !consumed.has(k)) return;
    if (!consumed.has(k)) {
      rest = rest.split(needle).join(' ');
      consumed.add(k);
    }
    if (seen.has(e.arabic)) return;
    seen.add(e.arabic);
    out.push({ input: text, entry: e, matched: k });
  });
  return out;
}

/** Saran kata Indonesia untuk ditampilkan */
export const LISAN_SUGGESTIONS = ['rahmat', 'tuhan', 'petunjuk', 'manusia', 'jalan', 'berlindung'];

