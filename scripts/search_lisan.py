#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skrip Pencari Akar Kata di Kitab Lisanul Arab (Ibnu Manzhur)
Folder sumber: Arabic-Dictionaries/Lisan/Lisan_*.txt

Penggunaan:
    python scripts/search_lisan.py <akar_kata>
    python scripts/search_lisan.py صمد
    python scripts/search_lisan.py فلق --lines 30
    python scripts/search_lisan.py   (mode interaktif)
"""

import sys
import os
import glob
import re
import argparse

# Pastikan output konsol Windows mendukung UTF-8
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def normalize_arabic(text: str) -> str:
    """Menghilangkan harakat, tatweel, dan standarisasi alif/hamzah untuk pencarian fleksibel."""
    if not text:
        return ""
    # Hapus harakat
    t = re.sub(r'[\u064B-\u065F\u0670]', '', text)
    # Hapus tatweel
    t = re.sub(r'\u0640', '', t)
    # Standarisasi alif
    t = re.sub(r'[إأآا]', 'ا', t)
    # Standarisasi ya / alif maqsura
    t = re.sub(r'[ىي]', 'ي', t)
    # Standarisasi ta marbutah
    t = re.sub(r'ة', 'ه', t)
    return t.strip()

def strip_tashkeel(text: str) -> str:
    """Menghapus harakat saja tanpa mengubah huruf."""
    return re.sub(r'[\u064B-\u065F\u0670\u0640]', '', text)

def find_lisan_dir() -> str:
    """Mencari lokasi folder Arabic-Dictionaries/Lisan."""
    candidates = [
        os.path.abspath('Arabic-Dictionaries/Lisan'),
        os.path.abspath('../Arabic-Dictionaries/Lisan'),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Arabic-Dictionaries', 'Lisan'))
    ]
    for c in candidates:
        if os.path.isdir(c):
            return c
    raise FileNotFoundError("Folder 'Arabic-Dictionaries/Lisan' tidak ditemukan!")

def search_root(root: str, max_lines: int = 35):
    lisan_dir = find_lisan_dir()
    files = sorted(
        glob.glob(os.path.join(lisan_dir, 'Lisan_*.txt')),
        key=lambda x: int(re.search(r'\d+', os.path.basename(x)).group())
    )

    clean_root = strip_tashkeel(root).strip()
    norm_root = normalize_arabic(clean_root)

    # Pemetaan huruf akhir (Bab) ke jilid Lisan untuk pencarian instan (<0.2 detik)
    bab_to_volume = {
        'ء': [1], 'أ': [1], 'إ': [1], 'ا': [1], 'ب': [1], 'ت': [2], 'ث': [2],
        'ج': [2], 'ح': [2], 'خ': [3], 'د': [3], 'ذ': [3], 'ر': [4, 5], 'ز': [5],
        'س': [6], 'ش': [6], 'ص': [7], 'ض': [7], 'ط': [7], 'ظ': [7], 'ع': [8],
        'غ': [8], 'ف': [9], 'ق': [10], 'ك': [10], 'ل': [11], 'م': [12],
        'ن': [13], 'ه': [13], 'و': [14, 15], 'ي': [14, 15], 'ى': [14, 15]
    }

    last_char = clean_root[-1] if clean_root else ''
    priority_vols = bab_to_volume.get(last_char, [])

    priority_files = []
    other_files = []
    for f in files:
        vol_num = int(re.search(r'\d+', os.path.basename(f)).group())
        if vol_num in priority_vols:
            priority_files.append(f)
        else:
            other_files.append(f)
    ordered_files = priority_files + other_files

    print(f"\n=======================================================")
    print(f"🔍 Mencari akar kata: [{root}] (Pembersihan: [{clean_root}])")
    print(f"📁 Sumber: {lisan_dir} (Jilid Prioritas: {priority_vols or 'Semua'})")
    print(f"=======================================================\n")

    matches = []

    # Pola regex untuk entri kamus: diawali kata akar diikuti titik dua
    entry_pattern = re.compile(rf'^(?:\[.*?\]\s*)?({re.escape(clean_root)}|{re.escape(norm_root)})\s*:', re.IGNORECASE)

    for file_path in ordered_files:
        fname = os.path.basename(file_path)
        with open(file_path, 'r', encoding='utf-8', errors='replace') as fp:
            for idx, line in enumerate(fp):
                line_stripped = line.strip()
                if not line_stripped:
                    continue
                # Cepat: periksa apakah ada tanda ':' di awal
                if ':' not in line_stripped[:15]:
                    continue

                line_no_harakat = strip_tashkeel(line_stripped)
                line_norm = normalize_arabic(line_stripped)

                # Cek kecocokan kepala entri utama
                is_entry = False
                if line_no_harakat.startswith(f"{clean_root}:") or line_norm.startswith(f"{norm_root}:"):
                    is_entry = True
                elif entry_pattern.match(line_no_harakat) or entry_pattern.match(line_norm):
                    is_entry = True

                if is_entry:
                    snippet_lines = [line_stripped]
                    for _ in range(max_lines - 1):
                        next_l = fp.readline()
                        if not next_l:
                            break
                        if next_l.strip():
                            snippet_lines.append(next_l.strip())
                    snippet = "\n".join(snippet_lines)
                    matches.append({
                        "file": fname,
                        "file_path": file_path,
                        "line_number": idx + 1,
                        "matched_line": line_stripped,
                        "snippet": snippet
                    })
                    break  # Sudah menemukan entri utama di file ini
        if matches and priority_vols:
            break  # Jika sudah ketemu di jilid prioritas, langsung selesai!

    if not matches:
        print(f"⚠️  Entri eksak '{clean_root}:' tidak ditemukan di awal baris.")
        print("🔎 Mencoba pencarian kemunculan kata di seluruh teks kitab...")
        
        fallback_matches = []
        for file_path in files:
            fname = os.path.basename(file_path)
            with open(file_path, 'r', encoding='utf-8', errors='replace') as fp:
                for idx, line in enumerate(fp):
                    if f"{clean_root}:" in strip_tashkeel(line):
                        fallback_matches.append({
                            "file": fname,
                            "line_number": idx + 1,
                            "matched_line": line.strip()[:200]
                        })
                        if len(fallback_matches) >= 5:
                            break
            if len(fallback_matches) >= 5:
                break
        
        if fallback_matches:
            print(f"\nDitemukan {len(fallback_matches)} kemungkinan kemunculan terkait:")
            for m in fallback_matches:
                print(f" - [{m['file']} Baris {m['line_number']}]: {m['matched_line']}")
        else:
            print("❌ Akar kata tersebut tidak ditemukan di seluruh jilid Lisanul Arab.")
        return []

    print(f"✅ Ditemukan {len(matches)} entri utama di Lisanul Arab:\n")
    for i, m in enumerate(matches, 1):
        print(f"--- [Hasil #{i}] {m['file']} | Baris {m['line_number']} ---")
        print(f"Ref: {m['file']}:{m['line_number']}")
        print(f"\n{m['snippet']}\n")
        print("-" * 55)

    return matches

def main():
    parser = argparse.ArgumentParser(description="Pencari Akar Kata di Kitab Lisanul Arab")
    parser.add_argument('root', nargs='?', help="Akar kata bahasa Arab (contoh: صمد, فلق, ولد)")
    parser.add_argument('--lines', '-n', type=int, default=30, help="Jumlah baris kutipan yang ditampilkan (default: 30)")
    args = parser.parse_args()

    if args.root:
        search_root(args.root, max_lines=args.lines)
    else:
        # Mode interaktif
        print("=== Pencari Akar Kata Lisanul Arab (Mode Interaktif) ===")
        print("Ketik akar kata (contoh: صمد, وحد, فلق, عوذ) atau 'exit' untuk keluar.")
        while True:
            try:
                user_input = input("\nMasukkan akar kata: ").strip()
                if not user_input or user_input.lower() in ('exit', 'quit', 'q'):
                    break
                search_root(user_input, max_lines=args.lines)
            except (KeyboardInterrupt, EOFError):
                break

if __name__ == '__main__':
    main()
