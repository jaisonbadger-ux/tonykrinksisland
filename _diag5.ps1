$file = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)

# Check end of script
Write-Host "=== Last 15 lines of script (4167-4182) ==="
for ($i = 4167; $i -lt [Math]::Min(4185, $lines.Length); $i++) { Write-Host "$i : $($lines[$i])" }

Write-Host ""
Write-Host "=== _patchDoClick area in spliced auth (search) ==="
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains('_patchDoClick') -or $lines[$i].Contains('_comboCount') -or $lines[$i].Contains('comboMult')) {
        Write-Host "$i : $($lines[$i])"
    }
}

Write-Host ""
Write-Host "=== Check pac4 / pac5 in game code ==="
for ($i = 2280; $i -le 2310; $i++) { Write-Host "$i : $($lines[$i])" }

Write-Host ""
Write-Host "=== showTab function area ==="
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains('function showTab')) {
        for ($j = $i; $j -le $i+12; $j++) { Write-Host "$j : $($lines[$j])" }
        break
    }
}

Write-Host ""
Write-Host "=== initGame function ==="
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains('function initGame')) {
        for ($j = $i; $j -le $i+10; $j++) { Write-Host "$j : $($lines[$j])" }
        break
    }
}
