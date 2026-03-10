$txt = [System.IO.File]::ReadAllText('C:\Users\TonyFlexico\tonykrinks-island\index.html', [System.Text.Encoding]::UTF8)
$idx = $txt.IndexOf('Bajookie Tide')
$ctx = $txt.Substring($idx - 30, 200)
$bytes = [System.Text.Encoding]::UTF8.GetBytes($ctx)
$hex = ($bytes | ForEach-Object { $_.ToString('X2') }) -join ' '
Write-Host $hex
Write-Host "---"
Write-Host $ctx
