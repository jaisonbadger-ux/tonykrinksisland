$indexPath = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$authPath  = 'C:\Users\TonyFlexico\tonykrinks-island\_auth.js'
$enc = [System.Text.Encoding]::UTF8
$indexLines = [System.IO.File]::ReadAllLines($indexPath, $enc)
$authLines  = [System.IO.File]::ReadAllLines($authPath,  $enc)
# Find the line with "FIREBASE AUTH + COMMUNAL CLOUD SYNC"
$startLine = -1
for ($i = 0; $i -lt $indexLines.Length; $i++) {
    if ($indexLines[$i] -match 'FIREBASE AUTH \+ COMMUNAL CLOUD SYNC') {
        $startLine = $i
        break
    }
}
if ($startLine -lt 0) { Write-Error 'Auth block start not found'; exit 1 }
# Find the closing </script> after that point
$endLine = -1
for ($i = $startLine; $i -lt $indexLines.Length; $i++) {
    if ($indexLines[$i].Trim() -eq '</script>') {
        $endLine = $i
        break
    }
}
if ($endLine -lt 0) { Write-Error 'Auth block end not found'; exit 1 }
Write-Host "Auth block: lines $startLine to $endLine"
$before   = $indexLines[0..($startLine-1)]
$after    = $indexLines[$endLine..($indexLines.Length-1)]
$combined = $before + $authLines + $after
[System.IO.File]::WriteAllLines($indexPath, $combined, [System.Text.UTF8Encoding]::new($false))
Write-Host ('Done. Total lines: ' + $combined.Count)
