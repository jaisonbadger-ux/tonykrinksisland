$file  = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)

# Find "BEST VIEWED IN" line in footer
$footerIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains('BEST VIEWED IN')) { $footerIdx = $i; break }
}
Write-Host "Footer idx: $footerIdx"

# Find geocities-footer div
$geoFooterIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains('class="geocities-footer"')) { $geoFooterIdx = $i; break }
}
Write-Host "Geocities footer div idx: $geoFooterIdx"

$nl = New-Object System.Collections.Generic.List[string]

# Add CSS before the prompt CSS block
$promptIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "^\.prompt \{") { $promptIdx = $i; break }
}
Write-Host "Prompt CSS at: $promptIdx"

for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($i -eq $promptIdx) {
        $nl.Add('.donate-btn { display:inline-flex; align-items:center; gap:6px; background:var(--surface); border:1px solid #f7931a; color:#f7931a; padding:5px 12px; font-size:11px; font-family:''Fira Code'',monospace; text-decoration:none; transition:all 0.15s; border-radius:2px; }')
        $nl.Add('.donate-btn:hover { background:rgba(247,147,26,0.12); text-decoration:none; box-shadow:0 0 12px rgba(247,147,26,0.3); }')
        $nl.Add('')
    }
    $nl.Add($lines[$i])
}
$lines = $nl.ToArray()

# Recompute footer index
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains('BEST VIEWED IN')) { $footerIdx = $i; break }
}
Write-Host "Footer idx after CSS add: $footerIdx"

# Insert donation block after "BEST VIEWED IN" line
$nl2 = New-Object System.Collections.Generic.List[string]
for ($i = 0; $i -lt $lines.Length; $i++) {
    $nl2.Add($lines[$i])
    if ($i -eq $footerIdx) {
        $nl2.Add('  <div style="margin:14px 0 0;">')
        $nl2.Add('    <a class="donate-btn" href="lightning:roastedfighter98@walletofsatoshi.com">')
        $nl2.Add('      &#9889; tip the island (bitcoin lightning)')
        $nl2.Add('    </a>')
        $nl2.Add('    <div style="font-size:10px;color:var(--dim);margin-top:6px;">lightning address: <span style="color:#f7931a;">roastedfighter98@walletofsatoshi.com</span></div>')
        $nl2.Add('  </div>')
    }
}
$lines = $nl2.ToArray()

# Also add a small donation badge in the header meta area
$headerMetaIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains('class="header-meta"')) { $headerMetaIdx = $i; break }
}
Write-Host "Header meta idx: $headerMetaIdx"

if ($headerMetaIdx -ge 0) {
    $nl3 = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $lines.Length; $i++) {
        $nl3.Add($lines[$i])
        if ($i -eq $headerMetaIdx) {
            # Insert donate badge inside header-meta (after opening div)
            $nl3.Add('    <a class="donate-btn" href="lightning:roastedfighter98@walletofsatoshi.com" title="tip the island via bitcoin lightning">&#9889; tip</a>')
        }
    }
    $lines = $nl3.ToArray()
}

[System.IO.File]::WriteAllLines($file, $lines, [System.Text.Encoding]::UTF8)
Write-Host "Donation link added. Total lines: $($lines.Length)"
