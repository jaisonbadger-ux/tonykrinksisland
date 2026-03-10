$htmlFile = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$authFile = 'C:\Users\TonyFlexico\tonykrinks-island\_auth.js'

$html = [System.IO.File]::ReadAllText($htmlFile, [System.Text.Encoding]::UTF8)
$auth = [System.IO.File]::ReadAllText($authFile, [System.Text.Encoding]::UTF8)

# Find the start of the old embedded auth block
$startMarker = '// FIREBASE AUTH + COMMUNAL CLOUD SYNC'
$startIdx = $html.IndexOf($startMarker)
Write-Host "Auth start at: $startIdx"

# Find the end of the old embedded auth block (last line of the avatar grid listener)
$endMarker = "document.addEventListener('DOMContentLoaded', _renderAvatarGrid);"
$endIdx = $html.IndexOf($endMarker, $startIdx)
Write-Host "Auth end at: $endIdx"

if ($startIdx -lt 0 -or $endIdx -lt 0) {
    Write-Host "FAIL: could not find splice markers"
    exit 1
}

# The end position should be AFTER the end marker line (include it + newline)
$endPos = $endIdx + $endMarker.Length
# Skip to end of that line
while ($endPos -lt $html.Length -and ($html[$endPos] -eq "`r" -or $html[$endPos] -eq "`n")) { $endPos++ }

Write-Host "Replacing chars $startIdx to $endPos"
Write-Host "Old block length: $($endPos - $startIdx)"
Write-Host "New auth length:  $($auth.Length)"

$newHtml = $html.Substring(0, $startIdx) + $auth.TrimEnd() + "`r`n" + $html.Substring($endPos)

[System.IO.File]::WriteAllText($htmlFile, $newHtml, [System.Text.Encoding]::UTF8)
Write-Host "Splice complete. New file length: $($newHtml.Length)"
