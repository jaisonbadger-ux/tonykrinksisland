$file = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)

# Show all <script and </script> tags with line numbers
Write-Host "=== SCRIPT TAGS ==="
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '<script|</script') {
        Write-Host "Line $i : $($lines[$i].Trim())"
    }
}

Write-Host ""
Write-Host "=== Lines around FIREBASE AUTH (3045-3055) ==="
for ($i = 3045; $i -le 3055; $i++) {
    Write-Host "Line $i : $($lines[$i])"
}

Write-Host ""
Write-Host "=== Lines 968-975 (head/body transition) ==="
for ($i = 968; $i -le 975; $i++) {
    Write-Host "Line $i : $($lines[$i])"
}
