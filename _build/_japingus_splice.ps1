$html = Get-Content 'C:\Users\TonyFlexico\tonykrinks_island.html' -Encoding UTF8
$js   = Get-Content 'C:\Users\TonyFlexico\_japingus.js' -Encoding UTF8
Write-Host "Input lines: $($html.Count)"

# Find </script> line (last one before </body>)
$scriptLine = -1
for ($i = $html.Count - 1; $i -ge 0; $i--) {
    if ($html[$i].Trim() -eq '</script>') {
        $scriptLine = $i
        break
    }
}
Write-Host "Inserting before line $($scriptLine + 1) (0-indexed $scriptLine)"

$before = $html[0..($scriptLine - 1)]
$after  = $html[$scriptLine..($html.Count - 1)]
$out    = $before + $js + $after

$out | Out-File 'C:\Users\TonyFlexico\tonykrinks_island.html' -Encoding UTF8 -NoNewline:$false
Write-Host "Done. Lines: $($out.Count)"
