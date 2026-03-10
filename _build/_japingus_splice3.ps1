$html = Get-Content 'C:\Users\TonyFlexico\tonykrinks_island.html' -Encoding UTF8
$js   = Get-Content 'C:\Users\TonyFlexico\_japingus.js' -Encoding UTF8
Write-Host "Input lines: $($html.Count)"

# Old Japingus: 0-indexed 2071 to 2621 (before </script> at 2622)
$before = $html[0..2070]
$after  = $html[2622..($html.Count - 1)]
$out    = $before + $js + $after

$out | Out-File 'C:\Users\TonyFlexico\tonykrinks_island.html' -Encoding UTF8 -NoNewline:$false
Write-Host "Done. Lines: $($out.Count)"
