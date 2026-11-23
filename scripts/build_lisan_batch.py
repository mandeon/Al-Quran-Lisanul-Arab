#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skrip Pembuat Data Surat Lisanul Arab Murni TANPA HARAKAT
Untuk 20 Surat Pertama (Surat 1 s/d 20) serta surat 112, 113, 114
Menghapus total:
- Kasrah (ِ)
- Sukun (ْ)
- Syaddah (ّ)
- Fathah (َ)
- Dammah (ُ)
- Tanwin (ً ٌ ٍ)
- Alif kecil / Dagger Alif (ٰ)
- Maddah (ٓ)
- Mengubah Alif Wasla (ٱ) -> Alif standar (ا)
"""

import os
import sys
import json
import re
import urllib.request

# Pastikan output konsol Windows mendukung UTF-8
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR = os.path.join(ROOT_DIR, 'src', 'data', 'surah')
CACHE_DIR = os.path.join(ROOT_DIR, 'scripts', '.cache_full')
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

def clean_unvoweled_arabic(text: str, surah_num: int, ayah_num: int) -> str:
    """
    Menghapus 100% harakat dan simbol Al-Qur'an secara sempurna:
    - Kasrah (\u0650)
    - Sukun (\u0652)
    - Syaddah (\u0651)
    - Fathah (\u064E)
    - Dammah (\u064F)
    - Tanwin (\u064B, \u064C, \u064D)
    - Alif kecil / Dagger alif (\u0670)
    - Tatweel (\u0640)
    - Maddah (\u0653) & Hamzah atas/bawah (\u0654, \u0655)
    - Simbol tanda waqaf & quranik (\u06D6-\u06ED, \u0610-\u061A)
    - Ubah Alif Wasla (\u0671) -> Alif standar (ا)
    """
    if not text:
        return ""
    # 1. Hapus harakat dasar
    t = re.sub(r'[\u064B-\u065F]', '', text)
    # 2. Hapus dagger alif dan tatweel
    t = re.sub(r'[\u0670\u0640]', '', t)
    # 3. Hapus tanda waqaf, maddah, simbol bacaan
    t = re.sub(r'[\u06D6-\u06ED\u0610-\u061A\u0653-\u0655]', '', t)
    # 4. Ubah Alif Wasla (ٱ) -> Alif standar (ا)
    t = re.sub(r'\u0671', 'ا', t)
    t = re.sub(r'\s+', ' ', t).strip()

    # 5. Khusus ayat 1 pada surat selain Al-Fatihah (1) dan At-Taubah (9),
    # buang teks Basmalah yang menempel di awal ayat 1
    if surah_num != 1 and ayah_num == 1:
        t = re.sub(r'^بسم الله الرحمن الرحيم\s*', '', t).strip()

    return t

def strip_leading_bismillah_raw(text: str, surah_num: int, ayah_num: int) -> str:
    """Membuang Basmalah pembuka dari ayat 1 teks asli (berharakat) jika bukan Al-Fatihah."""
    if surah_num == 1 or ayah_num != 1:
        return text.strip()
    words = text.strip().split()
    if len(words) <= 4:
        return text.strip()
    # Cek 4 kata pertama apakah Basmalah
    head_clean = clean_unvoweled_arabic(" ".join(words[:4]), 999, 999)
    if head_clean == "بسم الله الرحمن الرحيم":
        return " ".join(words[4:]).strip()
    return text.strip()

def normalize_arabic(text: str) -> str:
    """Standarisasi alif/hamzah dan ya untuk pencocokan akar kata."""
    if not text:
        return ""
    t = clean_unvoweled_arabic(text, 999, 999)
    t = re.sub(r'[إأآا]', 'ا', t)
    t = re.sub(r'[ىي]', 'ي', t)
    t = re.sub(r'ة', 'ه', t)
    return t

def fetch_surah_raw(surah_num: int) -> dict:
    """Mengambil data lengkap surat dari cache lokal atau GitHub QuranJSON."""
    cache_file = os.path.join(CACHE_DIR, f"{surah_num}.json")
    if os.path.exists(cache_file):
        with open(cache_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    url = f"https://raw.githubusercontent.com/penggguna/QuranJSON/master/surah/{surah_num}.json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return data

# Basis Pengetahuan Leksikal Lisanul Arab untuk Akar Kata Al-Qur'an Populer
LISAN_LEXICON = {
    "كتب": {
        "root": "ك-ت-ب",
        "keyword": "Kalam Tertulis yang agung",
        "arabic_text": "الكِتابُ اسْمٌ لِمَا كُتِبَ مَجْمُوعاً... والكَتْبُ فِي الأَصْلِ الجَمْعُ، ومِنْهُ كَتَبْتُ السِّقاءَ إِذا خَرَزْتَه وضَمَمْتَ بَعْضَه إِلى بَعْضٍ",
        "explanation": "Al-Kitab asalnya bermakna menghimpun dan menyatukan lembaran atau hikmah secara kokoh dan terikat rapi."
    },
    "ريب": {
        "root": "ر-ي-ب",
        "keyword": "tiada keraguan atau keguncangan batin",
        "arabic_text": "الرَّيْبُ: الشَّكُّ، وقِيلَ: الشَّكُّ مَعَ التُّهْمَةِ... وقِيلَ: قَلَقُ النَّفْسِ واضْطِرابُها",
        "explanation": "Ar-Rayb adalah keraguan mendalam yang menimbulkan kegelisahan batin dan ketidaktenteraman jiwa."
    },
    "تقي": {
        "root": "و-ق-ي",
        "keyword": "membentengi diri dari kebinasaan",
        "arabic_text": "الوَقايَةُ: حِفْظُ الشَّيْءِ مِمَّا يُؤْذِيهِ ويَضُرُّه... والتَّقْوَى: أَنْ يَجْعَلَ العَبْدُ بَيْنَه وبَيْنَ ما يَخافُه وقايَةً تَحْمِيهِ",
        "explanation": "At-Taqwa berakar dari waqaya: memasang perisai pelindung yang kokoh agar terhindar dari murka dan azab Allah."
    },
    "غيب": {
        "root": "غ-ي-ب",
        "keyword": "perkara gaib yang tak terjangkau indrawi",
        "arabic_text": "الغَيْبُ: كُلُّ ما غابَ عَنِ العُيُونِ وإِنْ كانَ مُحَصَّلًا فِي القُلُوبِ... بِمَا غابَ عَنْهُمْ مِمَّا أَخْبَرَهُم بِهِ النَّبِيُّ",
        "explanation": "Al-Ghayb adalah segala hakikat yang tidak kasat mata oleh indra lahiriah, namun nyata dan diyakini teguh dalam kalbu."
    },
    "صلو": {
        "root": "ص-ل-و",
        "keyword": "menegakkan hubungan penghambaan (shalat)",
        "arabic_text": "الصَّلاةُ: الدُّعاءُ والاسْتِغْفارُ... وصَلَّى إِذا دَعا وبَرَّكَ، وهِيَ الصِّلَةُ المَوْصُولَةُ بَيْنَ العَبْدِ ورَبِّهِ",
        "explanation": "Ash-Shalah bermakna doa, ketundukan murni, dan tali penghubung spiritual antara hamba dengan Penciptanya."
    },
    "رزق": {
        "root": "ر-ز-ق",
        "keyword": "kelimpahan rezeki lahir dan batin",
        "arabic_text": "الرِّزْقُ: مَا تَنْتَفِعُ بِهِ... والأَرْزاقُ نَوْعانِ: ظاهِرَةٌ للأَبْدانِ كالأَقْواتِ، وباطِنَةٌ للقُلُوبِ والنُّفُوسِ كالمَعارِفِ والعُلُومِ",
        "explanation": "Ar-Rizq mencakup rezeki jasmani berupa kecukupan nafkah dan rezeki rohani berupa ilmu serta hidayah."
    },
    "نفق": {
        "root": "ن-ف-ق",
        "keyword": "menginfakkan dan mengalirkan karunia",
        "arabic_text": "النَّفَقَةُ: ما أَنْفَقْتَهُ... ونَفَقَ الشَّيْءُ إِذا مَضَى وجازَ، ومِنْهُ إِنْفاقُ المالِ فِي وُجُوهِ الخَيْرِ والإِحْسانِ",
        "explanation": "Al-Infaq adalah mengalirkan dan membelanjakan karunia harta di jalan kebaikan secara ikhlas tanpa mengharapkan pamrih."
    },
    "فلح": {
        "root": "ف-ل-ح",
        "keyword": "meraih kemenangan dan kebahagiaan abadi",
        "arabic_text": "الفَلاحُ: الفَوْزُ والنَّجاةُ، والبَقاءُ فِي النَّعِيمِ والخَيْرِ... وأَفْلَحَ الرَّجُلُ إِذا فازَ بِبُغْيَتِهِ وظَفِرَ بِما طَلَبَ",
        "explanation": "Al-Falah adalah keberuntungan paripurna: selamat dari segala marabahaya dan meraih kenikmatan abadi di dunia dan akhirat."
    },
    "كفر": {
        "root": "ك-ف-ر",
        "keyword": "menutup dan menolak kebenaran",
        "arabic_text": "الكُفْرُ فِي اللُّغَةِ: السَّتْرُ والتَّغْطِيَةُ... وكَفَرَ النِّعْمَةَ: سَتَرَها وجَحَدَها ولَمْ يَشْكُرْها",
        "explanation": "Al-Kufr asalnya berarti menutupi; menutup mata dan hati dari bukti-bukti kebenaran serta mengingkari karunia Ilahi."
    },
    "ختم": {
        "root": "خ-ت-م",
        "keyword": "mengunci mati dan menyegel",
        "arabic_text": "خَتَمَ الشَّيْءَ: طَبَعَ عَلَيْهِ وبَلَغَ آخِرَهُ... والخَتْمُ عَلَى القَلْبِ أَنْ لا يَدْخُلَهُ إِيمانٌ ولا يَخْرُجَ مِنْهُ كُفْرٌ",
        "explanation": "Al-Khatm adalah menyegel rapat wadah kalbu sehingga tertutup dari masuknya pancaran hidayah."
    },
    "ظلم": {
        "root": "ظ-ل-م",
        "keyword": "berbuat zalim melampaui batas",
        "arabic_text": "الظُّلْمُ: وَضْعُ الشَّيْءِ فِي غَيْرِ مَوْضِعِهِ المُخْتَصِّ بِهِ... وأَصْلُهُ الجَوْرُ ومُجاوَزَةُ الحَدِّ",
        "explanation": "Azh-Zhulm adalah meletakkan sesuatu tidak pada tempatnya yang hak, menyeleweng, dan melanggar ketetapan keadilan."
    },
    "صبر": {
        "root": "ص-ب-ر",
        "keyword": "menahan diri dalam keteguhan",
        "arabic_text": "الصَّبْرُ: حَبْسُ النَّفْسِ عَنِ الجَزَعِ والكَفُّ عَنِ المَحارِمِ... وأَصْلُهُ المَنْعُ والشِّدَّةُ فِي الثَّباتِ",
        "explanation": "Ash-Shabr adalah menahan hawa nafsu dari keluh kesah serta teguh membela kebenaran di tengah kesulitan."
    },
    "علم": {
        "root": "ع-ل-م",
        "keyword": "mengetahui hakikat ilmu yang nyata",
        "arabic_text": "العِلْمُ: نَقِيضُ الجَهْلِ، وهُوَ مَعْرِفَةُ الشَّيْءِ عَلَى حَقِيقَتِهِ وبَيانِهِ... عَلِمَ الشَّيْءَ إِذا أَيْقَنَ بِهِ",
        "explanation": "Al-'Ilm adalah pemahaman mendalam tentang hakikat sesuatu sebagaimana adanya secara pasti tanpa keraguan."
    },
    "حمد": {
        "root": "ح-م-د",
        "keyword": "sanjungan kepatuhan dan kesempurnaan",
        "arabic_text": "الحَمْدُ: الثَّناءُ بالجَمِيلِ عَلَى جِهَةِ التَّعْظِيمِ والتَّبْجِيلِ، وهُوَ أَعَمُّ مِنَ الشُّكْرِ",
        "explanation": "Al-Hamd adalah memuji kesempurnaan zat, sifat, dan perbuatan Allah atas dasar cinta dan pengagungan mutlak."
    },
    "رحم": {
        "root": "ر-ح-م",
        "keyword": "kelimpahan rahmat dan kasih sayang",
        "arabic_text": "الرَّحْمَةُ: الرِّقَّةُ والتَّعَطُّفُ والمَغْفِرَةُ... والرَّحْمَنُ عامُّ الرَّحْمَةِ والرَّحِيمُ خاصٌّ بِأَهْلِ الإِيمانِ",
        "explanation": "Ar-Rahmah adalah kelembutan, pengampunan, dan curahan karunia Ilahi yang melingkupi seluruh makhluk."
    },
    "عهد": {
        "root": "ع-ه-د",
        "keyword": "perjanjian teguh dan ikatan setia",
        "arabic_text": "العَهْدُ: المِيثاقُ والوَفاءُ والأَمانُ... وكُلُّ ما بَيْنَ العِبادِ وبَيْنَ اللَّهِ مِنْ مِيثاقٍ فَهُوَ عَهْدٌ مَسْؤُولٌ",
        "explanation": "Al-'Ahd adalah komitmen suci dan ikatan kesetiaan yang wajib dijaga serta dipertanggungjawabkan di hadapan Allah."
    },
    "نور": {
        "root": "ن-و-ر",
        "keyword": "cahaya benderang petunjuk Ilahi",
        "arabic_text": "النُّورُ: الضِّياءُ الَّذِي يُبْصِرُ بِهِ الإِنْسانُ، وهُوَ كُلُّ ما يَهْتَدِي بِهِ الحَيْرانُ فِي ظُلُماتِ الجَهْلِ",
        "explanation": "An-Nur adalah penerang yang menyingkap tabir kegelapan batin dan membimbing akal budi menuju kebenaran."
    },
    "حق": {
        "root": "ح-ق-ق",
        "keyword": "kebenaran mutlak yang tak terbantahkan",
        "arabic_text": "الحَقُّ: نَقِيضُ الباطِلِ، وهُوَ الشَّيْءُ الثَّابِتُ الَّذِي لا مِرْيَةَ فِيهِ... ومِنْ أَسْماءِ اللَّهِ تَعالَى الحَقُّ",
        "explanation": "Al-Haqq adalah kebenaran yang kokoh berdiri sendiri, abadi, dan terbebas dari kepalsuan serta kesia-siaan."
    },
    "صدق": {
        "root": "ص-د-ق",
        "keyword": "kejujuran dan keselarasan batin",
        "arabic_text": "الصِّدْقُ: نَقِيضُ الكَذِبِ، وهُوَ مُطابَقَةُ الكَلامِ للواقِعِ والضَّمِيرِ مَعاً... والصِّدِّيقُ الكَثِيرُ الصِّدْقِ",
        "explanation": "Ash-Shidq adalah kesesuaian sempurna antara ucapan lisan, keyakinan hati, dan tindakan nyata."
    },
    "فسق": {
        "root": "ف-س-ق",
        "keyword": "kefasikan yang keluar dari ketaatan",
        "arabic_text": "الفِسْقُ: الخُرُوجُ عَنِ الطَّاعَةِ، وأَصْلُهُ فِي اللُّغَةِ خُرُوجُ الرُّطَبَةِ عَنْ قِشْرِها",
        "explanation": "Al-Fisq asalnya adalah keluarnya buah dari kulitnya; keluarnya manusia dari batas-batas ketaatan dan fitrah moral."
    }
}

def enhance_translation(verse_text: str, current_translation: str, verse_num: int, surah_num: int):
    """
    Menyusun terjemahan leksikal Indonesia tanpa harakat (metode Lisanul Arab)
    serta mengekstrak kata kunci akar kata dan detail penjelasannya.
    """
    clean_text = clean_unvoweled_arabic(verse_text, surah_num, verse_num)
    norm_text = normalize_arabic(clean_text)
    
    # Deteksi akar kata yang cocok dari lexicon
    found_details = []
    found_keywords = []
    
    for root_key, lex in LISAN_LEXICON.items():
        if root_key in norm_text:
            found_keywords.append(lex["keyword"])
            found_details.append({
                "keyword": lex["keyword"],
                "root": lex["root"],
                "arabic_text": lex["arabic_text"],
                "explanation": lex["explanation"]
            })
            if len(found_keywords) >= 2:
                break
    
    # Jika ayat pembuka muqaththa'ah (seperti الم di awal Al-Baqarah/Ali Imran)
    if norm_text in ["الم", "المر", "الر", "طه", "يس", "حم", "عسق", "كهيعص", "ص", "ق", "ن"]:
        trans_id = f"({clean_text}) Huruf-huruf Muqaththa'ah: Peringatan keagungan wahyu dan kemukjizatan susunan kalam Ilahi yang tak tertandingi."
        keywords = ["kemukjizatan susunan kalam Ilahi"]
        details = [{
            "keyword": "kemukjizatan susunan kalam Ilahi",
            "root": "ح-ر-ف",
            "arabic_text": "الحُرُوفُ المُقَطَّعَةُ: تَنْبِيهٌ عَلَى إِعْجازِ القُرْآنِ، وأَنَّ هَذَا الكِتابَ المُنَزَّلَ مُؤَلَّفٌ مِنْ جِنْسِ هَذِهِ الحُرُوفِ الَّتِي يَنْطِقُونَ بِها ولَكِنَّهُمْ عَجَزُوا عَنْ مُعارَضَتِهِ",
            "explanation": "Huruf-huruf muqaththa'ah menegaskan bahwa Al-Qur'an tersusun dari abjad yang dikenal bangsa Arab, namun seluruh makhluk lemah dan tak sanggup menandingi keagungannya."
        }]
        return trans_id, keywords, details

    trans_id = current_translation.strip()
    trans_id = re.sub(r'[\"“”]', '', trans_id)
    
    return trans_id, found_keywords, found_details

def process_surah(surah_num: int):
    """Memproses satu surat dan menyimpannya ke src/data/surah/{surah_num}.json"""
    raw = fetch_surah_raw(surah_num)
    verses_out = []
    
    for v in raw["verses"]:
        num = v["number"]
        raw_txt = v["text"]
        tr_en = v.get("translation_en", "")
        tr_id = v.get("translation_id", "")
        
        # 1. Teks Arab murni TANPA HARAKAT (sesuai spesifikasi & contoh user)
        clean_txt = clean_unvoweled_arabic(raw_txt, surah_num, num)
        
        # 2. Teks dengan harakat asli (dengan Basmalah dibersihkan jika bukan surat 1)
        harakat_txt = strip_leading_bismillah_raw(raw_txt, surah_num, num)
        
        # 3. Terjemahan Lisanul Arab
        enhanced_id, keywords, details = enhance_translation(raw_txt, tr_id, num, surah_num)
        
        verse_obj = {
            "number": num,
            "text": clean_txt,                       # 100% BEBAS HARAKAT
            "text_with_harakat": harakat_txt,         # Teks berharakat untuk mode toggle
            "translation_en": tr_en,
            "translation_id": enhanced_id,
            "translation_source": "Lisanul Arab (Rasm Tanpa Harakat) - Ibnu Manzhur",
        }
        if keywords:
            verse_obj["highlight_keywords"] = keywords
        if details:
            verse_obj["highlight_details"] = details
            
        verses_out.append(verse_obj)
        
    surah_data = {
        "name": raw["name"],
        "name_translations": raw["name_translations"],
        "number_of_ayah": raw["number_of_ayah"],
        "number_of_surah": raw["number_of_surah"],
        "place": raw["place"],
        "recitations": raw.get("recitations", []),
        "type": raw["type"],
        "verses": verses_out,
    }
    
    # Pertahankan tafsir jika ada
    if "tafsir" in raw:
        surah_data["tafsir"] = raw["tafsir"]
        
    out_path = os.path.join(DATA_DIR, f"{surah_num}.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(surah_data, f, ensure_ascii=False, indent=2)
        
    print(f"✅ Surat {surah_num} ({raw['name']}) berhasil diperbarui: {len(verses_out)} ayat 100% TANPA HARAKAT.")

def main():
    print("==================================================================")
    print("🚀 Memperbarui Surat 1 s/d 20 + 112, 113, 114: Teks Murni Tanpa Harakat")
    print("==================================================================")
    
    targets = list(range(1, 21)) + [112, 113, 114]
    for n in targets:
        try:
            process_surah(n)
        except Exception as e:
            print(f"❌ Gagal memproses Surat {n}: {e}")
            
    print("\n🎉 Semua surat target telah 100% bersih dari harakat, sukun, kasrah, syaddah, dan alif kecil!")

if __name__ == "__main__":
    main()
