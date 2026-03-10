$html   = Get-Content 'C:\Users\TonyFlexico\tonykrinks_island.html' -Encoding UTF8
$js     = Get-Content 'C:\Users\TonyFlexico\_clicker_replacement.js'  -Encoding UTF8
$before = $html[0..1048]
$after  = $html[1219..($html.Count - 1)]
$out    = $before + $js + $after
$out | Out-File 'C:\Users\TonyFlexico\tonykrinks_island.html' -Encoding UTF8 -NoNewline:$false
Write-Host "Done. Lines: $($out.Count)"
