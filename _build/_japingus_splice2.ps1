$html = Get-Content 'C:\Users\TonyFlexico\tonykrinks_island.html' -Encoding UTF8
$js   = Get-Content 'C:\Users\TonyFlexico\_japingus.js' -Encoding UTF8
Write-Host "Input lines: $($html.Count)"

# Old Japingus block: 0-indexed 2075 to 2467 (inclusive)
$before = $html[0..2074]
$after  = $html[2468..($html.Count - 1)]
$out    = $before + $js + $after

$out | Out-File 'C:\Users\TonyFlexico\tonykrinks_island.html' -Encoding UTF8 -NoNewline:$false
Write-Host "Done. Lines: $($out.Count)"
