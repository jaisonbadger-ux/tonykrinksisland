$file = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)
Write-Host "Lines: $($lines.Length)"

# ── 1. Add CSS for combo bar, event banner, casino, leaderboard ──
# Find the .prompt CSS rule and insert new CSS before it
$promptCssIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "^/\* .* Terminal prompt") {
        $promptCssIdx = $i
        break
    }
}
Write-Host "Prompt CSS at: $promptCssIdx"

if ($promptCssIdx -ge 0) {
    $newLines = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $promptCssIdx; $i++) { $newLines.Add($lines[$i]) }

    $cssBlock = @"
/* ── Combo Bar ── */
#combo-wrap { margin: 8px auto 16px; max-width:160px; text-align:center; }
#combo-bar-bg { background:var(--border2); border:1px solid var(--border); height:6px; border-radius:3px; overflow:hidden; margin-bottom:4px; }
#combo-bar { height:100%; width:0%; transition:width 0.2s,background 0.3s; background:var(--green); border-radius:3px; }
#combo-label { font-size:10px; color:var(--dim); font-family:'Fira Code',monospace; }

/* ── Event Banner ── */
#event-banner { display:none; background:var(--surface); border:2px solid var(--gold); padding:10px 16px; margin-bottom:16px; border-radius:2px; display:none; align-items:center; gap:10px; flex-wrap:wrap; animation:eventPulse 2s ease-in-out infinite; }
@keyframes eventPulse { 0%,100%{border-color:var(--gold)} 50%{border-color:var(--blue2)} }
#event-icon { font-size:24px; }
#event-name { font-size:13px; font-weight:700; color:var(--gold); }
#event-desc { font-size:11px; color:var(--muted); flex:1; }
#event-timer { font-size:12px; color:var(--blue2); font-weight:600; min-width:40px; text-align:right; }

/* ── Era / Ascend ── */
#era-badge { display:none; background:var(--border2); border:1px solid var(--gold); color:var(--gold); font-size:10px; font-weight:700; padding:3px 10px; text-align:center; margin:8px 0 4px; letter-spacing:2px; }
#ascend-btn { display:none; width:100%; font-family:'Fira Code',monospace; font-size:12px; padding:10px; border:2px solid var(--gold); background:rgba(240,198,116,0.08); color:var(--gold); cursor:pointer; margin-bottom:12px; transition:all 0.2s; }
#ascend-btn:hover { background:rgba(240,198,116,0.2); box-shadow:0 0 20px rgba(240,198,116,0.3); }

/* ── Leaderboard ── */
.lb-row { display:flex; align-items:center; gap:10px; padding:9px 14px; border-bottom:1px solid var(--border2); font-size:12px; }
.lb-row:last-child { border-bottom:none; }
.lb-row.lb-me { background:rgba(88,166,255,0.08); border-left:3px solid var(--blue2); padding-left:11px; }
.lb-rank { font-size:11px; color:var(--dim); width:24px; text-align:right; flex-shrink:0; }
.lb-avatar { font-size:18px; flex-shrink:0; }
.lb-name { flex:1; font-weight:600; color:var(--text); }
.lb-val { color:var(--gold); font-weight:600; }
.lb-medal-1 { color:#FFD700; }
.lb-medal-2 { color:#C0C0C0; }
.lb-medal-3 { color:#CD7F32; }
#lb-my-stats { margin-top:12px; padding:12px 14px; border:1px solid var(--blue); background:rgba(88,166,255,0.05); font-size:11px; line-height:2; }

/* ── Casino ── */
.slot-machine { border:2px solid var(--gold); background:var(--bg); padding:20px; text-align:center; margin-bottom:16px; position:relative; }
.slot-machine.win-flash { animation:winFlash 0.5s ease 3; }
@keyframes winFlash { 0%,100%{border-color:var(--gold)} 50%{border-color:#fff; box-shadow:0 0 30px rgba(255,255,255,0.5)} }
.slot-reels { display:flex; justify-content:center; gap:12px; margin:16px 0; }
.reel { width:80px; height:90px; border:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:center; font-size:42px; border-radius:4px; overflow:hidden; position:relative; }
.reel.spinning { animation:reelSpin 0.3s linear infinite; }
@keyframes reelSpin { 0%{transform:translateY(0)} 100%{transform:translateY(-90px)} }
.bet-btns { display:flex; gap:6px; justify-content:center; flex-wrap:wrap; margin-bottom:12px; }
.bet-btn { font-family:'Fira Code',monospace; font-size:11px; padding:5px 10px; border:1px solid var(--border); background:var(--border2); color:var(--text); cursor:pointer; transition:all 0.15s; }
.bet-btn:hover,.bet-btn.active { border-color:var(--gold); color:var(--gold); background:rgba(240,198,116,0.08); }
.spin-btn { font-family:'Fira Code',monospace; font-size:14px; font-weight:700; padding:12px 32px; border:2px solid var(--gold); background:rgba(240,198,116,0.1); color:var(--gold); cursor:pointer; transition:all 0.2s; letter-spacing:2px; }
.spin-btn:hover:not(:disabled) { background:rgba(240,198,116,0.25); box-shadow:0 0 20px rgba(240,198,116,0.4); }
.spin-btn:disabled { opacity:0.4; cursor:not-allowed; }
.casino-stats { display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:11px; }
.casino-stat-box { background:var(--surface); border:1px solid var(--border); padding:10px; }
.casino-stat-box .val { font-size:16px; font-weight:700; color:var(--gold); margin-bottom:2px; }
.casino-stat-box .lbl { color:var(--muted); font-size:10px; }
.free-spins-badge { color:var(--green); font-size:11px; margin-top:8px; }
#jackpot-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:99999; align-items:center; justify-content:center; flex-direction:column; }
#jackpot-overlay.show { display:flex; }
.jackpot-text { font-family:'Press Start 2P',monospace; font-size:28px; color:var(--gold); text-shadow:0 0 30px rgba(240,198,116,0.8); animation:jackpotPulse 0.5s ease-in-out infinite; text-align:center; }
@keyframes jackpotPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }

"@
    foreach ($line in ($cssBlock -split "`n")) { $newLines.Add($line) }

    for ($i = $promptCssIdx; $i -lt $lines.Length; $i++) { $newLines.Add($lines[$i]) }

    $lines = $newLines.ToArray()
    Write-Host "CSS added. Lines now: $($lines.Length)"
} else {
    Write-Host "CSS insert point FAIL"
}

# ── 2. Add event banner + era badge + combo bar HTML in clicker section ──
# Find the coin-btn div and insert event banner BEFORE the clicker-layout
$clickerLayoutIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains('<div class="clicker-layout">')) {
        $clickerLayoutIdx = $i
        break
    }
}
Write-Host "clicker-layout at: $clickerLayoutIdx"

if ($clickerLayoutIdx -ge 0) {
    $newLines2 = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $clickerLayoutIdx; $i++) { $newLines2.Add($lines[$i]) }

    $newLines2.Add('  <div id="event-banner" style="display:none;">')
    $newLines2.Add('    <span id="event-icon"></span>')
    $newLines2.Add('    <span id="event-name"></span>')
    $newLines2.Add('    <span id="event-desc"></span>')
    $newLines2.Add('    <span id="event-timer"></span>')
    $newLines2.Add('  </div>')
    $newLines2.Add('')

    for ($i = $clickerLayoutIdx; $i -lt $lines.Length; $i++) { $newLines2.Add($lines[$i]) }
    $lines = $newLines2.ToArray()
    Write-Host "Event banner HTML added."
} else {
    Write-Host "Event banner insert FAIL"
}

# ── 3. Add combo bar below the coin-btn div ──
# Find the click-pw display line and insert combo bar + era badge after it
$clickPwIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains('id="click-pw"') -and $lines[$i].Contains('bajookie per click')) {
        $clickPwIdx = $i
        break
    }
}
Write-Host "click-pw line at: $clickPwIdx"

if ($clickPwIdx -ge 0) {
    $newLines3 = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $clickPwIdx + 1; $i++) { $newLines3.Add($lines[$i]) }

    $newLines3.Add('')
    $newLines3.Add('          <div id="era-badge">ERA <span id="era-num">1</span></div>')
    $newLines3.Add('          <button id="ascend-btn" onclick="triggerAscension()">&#11014; ASCEND THE ISLAND</button>')
    $newLines3.Add('')
    $newLines3.Add('          <div id="combo-wrap">')
    $newLines3.Add('            <div id="combo-bar-bg"><div id="combo-bar"></div></div>')
    $newLines3.Add('            <span id="combo-label"></span>')
    $newLines3.Add('          </div>')

    for ($i = $clickPwIdx + 1; $i -lt $lines.Length; $i++) { $newLines3.Add($lines[$i]) }
    $lines = $newLines3.ToArray()
    Write-Host "Combo bar + era badge HTML added."
} else {
    Write-Host "Combo bar insert FAIL"
}

[System.IO.File]::WriteAllLines($file, $lines, [System.Text.Encoding]::UTF8)
Write-Host "Saved. $($lines.Length) lines"
