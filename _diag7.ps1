$file = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)

# Find ALL let/const pacts, r, results, data, fmtFn declarations
$targets = @('let pacts','const pacts','let r ','const r ','let results','const results','let fmtFn','const fmtFn','let data','const data')
foreach ($t in $targets) {
    for ($i = 1625; $i -lt 4182; $i++) {
        if ($lines[$i].Contains($t)) { Write-Host "Line $($i+1): $($lines[$i].Trim())" }
    }
}

Write-Host ""
Write-Host "=== Lines 2150-2165 ==="
for ($i = 2150; $i -le 2165; $i++) { Write-Host "$($i+1): $($lines[$i])" }

Write-Host ""
Write-Host "=== Lines 2200-2215 ==="
for ($i = 2200; $i -le 2215; $i++) { Write-Host "$($i+1): $($lines[$i])" }
