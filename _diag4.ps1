$file = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)

Write-Host "=== Clicker page area (1207-1260) ==="
for ($i = 1207; $i -le 1260; $i++) { Write-Host "$i : $($lines[$i])" }

Write-Host ""
Write-Host "=== Lines around click-pw / combo bar / era badge ==="
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains('click-pw') -or $lines[$i].Contains('combo-wrap') -or $lines[$i].Contains('era-badge') -or $lines[$i].Contains('event-banner')) {
        Write-Host "$i : $($lines[$i])"
    }
}

Write-Host ""
Write-Host "=== Lines around script opening (1623-1632) ==="
for ($i = 1623; $i -le 1632; $i++) { Write-Host "$i : $($lines[$i])" }
