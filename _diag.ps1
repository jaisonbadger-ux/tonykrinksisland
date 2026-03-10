$file = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)
Write-Host "Total lines: $($lines.Length)"

$markers = @('<html','</html>','<head','</head>','<body','</body>','<script','</script>','initGame','function recalc','function doClick','const PRODS','const BOOSTS','FIREBASE AUTH','page-clicker','page-leaderboard','page-casino','GEOCITIES')
foreach ($m in $markers) {
    $found = $false
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i].Contains($m)) {
            Write-Host "$m => line $i"
            $found = $true
            break
        }
    }
    if (-not $found) { Write-Host "MISSING: $m" }
}
