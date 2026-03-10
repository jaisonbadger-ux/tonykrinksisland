$html = Get-Content 'C:\Users\TonyFlexico\tonykrinks_island.html' -Encoding UTF8
Write-Host "Total lines: $($html.Count)"
for ($i = 0; $i -lt $html.Count; $i++) {
    if ($html[$i] -match '// .. JAPINGUS VIRTUAL PET') {
        Write-Host "Japingus start: line $($i+1) (0-indexed $i)"
    }
    if ($html[$i].Trim() -eq '</script>') {
        Write-Host "</script> at line $($i+1) (0-indexed $i)"
    }
}
