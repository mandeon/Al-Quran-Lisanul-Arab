const fs = require('fs');
const path = require('path');
const https = require('https');

function stripTashkeel(text) {
  if (!text) return '';
  return text
    // 1. Harakat dasar (fathatan, dammatan, kasratan, fathah, dammah, kasrah, shaddah, sukun, dsb)
    .replace(/[\u064B-\u065F]/g, '')
    // 2. Dagger alif (ٰ) & tatweel (ـ)
    .replace(/[\u0670\u0640]/g, '')
    // 3. Simbol Quranik, tanda waqaf, nomor tanda baca, maddah (U+06D6 - U+06ED, U+0610 - U+061A, U+0653 - U+0655)
    .replace(/[\u06D6-\u06ED\u0610-\u061A\u0653-\u0655]/g, '')
    // 4. Ubah Alif Wasla (ٱ) menjadi Alif standar (ا)
    .replace(/\u0671/g, 'ا')
    // 5. Bersihkan spasi ganda
    .replace(/\s+/g, ' ')
    .trim();
}

function fetchSurah(num) {
  const url = `https://raw.githubusercontent.com/penggguna/QuranJSON/master/surah/${num}.json`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for surah ${num}`));
      }
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const surahDir = path.resolve('src/data/surah');
  if (!fs.existsSync(surahDir)) {
    fs.mkdirSync(surahDir, { recursive: true });
  }

  console.log('Checking and processing all 114 surahs...');
  let totalVerses = 0;
  let totalStripped = 0;

  for (let n = 1; n <= 114; n++) {
    const filePath = path.join(surahDir, `${n}.json`);
    let data;

    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      // Fetch from repository
      process.stdout.write(`Fetching Surah ${n}... `);
      data = await fetchSurah(n);
      console.log('done.');
    }

    // Ensure all verses have clean text without harakat, original in text_with_harakat, and translation_id untouched
    let modified = false;
    data.verses = data.verses.map((v) => {
      totalVerses++;
      const origText = v.text_with_harakat || v.text;
      const cleanText = stripTashkeel(v.text);
      if (cleanText !== v.text || !v.text_with_harakat) {
        modified = true;
        totalStripped++;
      }
      return {
        ...v,
        text_with_harakat: origText,
        text: cleanText,
        // translation_id is preserved 100% as is!
      };
    });

    // Write back
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  console.log(`\nCOMPLETED! Processed all 114 surahs (${totalVerses} total verses).`);
  console.log('All 114 surahs are now bundled locally with 100% pure rasm (no harakat) and untouched translations.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
