$file = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)

Write-Host "=== PRODS array (2100-2115) ==="
for ($i = 2100; $i -le 2115; $i++) { Write-Host "$i : $($lines[$i])" }

Write-Host ""
Write-Host "=== BOOSTS array start (2116-2140) ==="
for ($i = 2116; $i -le 2140; $i++) { Write-Host "$i : $($lines[$i])" }

Write-Host ""
Write-Host "=== BOOSTS array new entries - search for baa ==="
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains("baa") -or $lines[$i].Contains("bba") -or $lines[$i].Contains("'g3'") -or $lines[$i].Contains("'c5'") -or $lines[$i].Contains("'pa'")) {
        Write-Host "$i : $($lines[$i])"
    }
}

Write-Host ""
Write-Host "=== recalc function area ==="
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains("function recalc")) {
        for ($j = $i; $j -le $i+25; $j++) { Write-Host "$j : $($lines[$j])" }
        break
    }
}
