$html = Get-Content 'C:\Users\TonyFlexico\tonykrinks_island.html' -Encoding UTF8
$js   = Get-Content 'C:\Users\TonyFlexico\_seinfeld_replacement.js' -Encoding UTF8
Write-Host "Input lines: $($html.Count)"

# Seinfeld section: lines 972-1098 (0-indexed 971..1097)
$before = $html[0..970]
$after  = $html[1098..($html.Count - 1)]
$out    = $before + $js + $after

$out | Out-File 'C:\Users\TonyFlexico\tonykrinks_island.html' -Encoding UTF8 -NoNewline:$false
Write-Host "Done. Lines: $($out.Count)"
