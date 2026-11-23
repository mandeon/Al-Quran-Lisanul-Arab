# Ekstraktor entri Lisanul Arab (Ibnu Manzhur) dari repo OSINTAI/Arabic-Dictionaries
# Pemakaian: powershell -ExecutionPolicy Bypass -File scripts\extract_lisan_entries.ps1
# Output: scripts\lisan_extract\<root>.txt  (entri lengkap + nomor jilid & baris)
param(
  [int]$MaxChars = 60000
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$lisanDir = Join-Path $root 'Arabic-Dictionaries-OSINTAI\Lisan'
$outDir = Join-Path $PSScriptRoot 'lisan_extract'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding($false)
$Roots = [IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'lisan_roots.txt'), $utf8) | Where-Object { $_.Trim() } | ForEach-Object { $_.Trim() }

$headRe = [regex]'^[\s\.،؛]*([\u0621-\u0652\u0670\u0640]{1,14})\s?:'
$bareRe = [regex]'^[\s\.،؛]*([\u0621-\u064A]{2,5}):'
$want = @{}
foreach ($r in $Roots) { $want[$r] = New-Object System.Text.StringBuilder }

$files = Get-ChildItem $lisanDir -Filter 'Lisan_*.txt' | Sort-Object { [int]($_.BaseName -replace '\D','') }
foreach ($f in $files) {
  $vol = [int]($f.BaseName -replace '\D','')
  $current = $null; $n = 0
  foreach ($line in [IO.File]::ReadLines($f.FullName)) {
    $n++
    if ($line.StartsWith([string][char]0x0641 + [char]0x0635 + [char]0x0644 + ' ')) { $current = $null; continue }
    $m = $headRe.Match($line)
    if ($m.Success) {
      $hw = [regex]::Replace($m.Groups[1].Value, '[\u064B-\u0652\u0670\u0640]', '')
      if ($want.ContainsKey($hw)) {
        $current = $hw
        [void]$want[$hw].AppendLine("=== [Lisan_$vol.txt : baris $n] ===")
      } elseif ($bareRe.IsMatch($line) -and -not $hw.StartsWith([string][char]0x0627 + [char]0x0644)) {
        $current = $null
      }
    }
    if ($current -and $want[$current].Length -lt $MaxChars) { [void]$want[$current].AppendLine($line) }
  }
}

$summary = @()
foreach ($k in $want.Keys) {
  $txt = $want[$k].ToString()
  [IO.File]::WriteAllText((Join-Path $outDir "$k.txt"), $txt, $utf8)
  $summary += "$k`t$($txt.Length)"
}
[IO.File]::WriteAllLines((Join-Path $outDir '_summary.txt'), [string[]]$summary, $utf8)
