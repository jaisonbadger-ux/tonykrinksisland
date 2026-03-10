$file = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)
Write-Host "Lines: $($lines.Length)"

# ── 1. Add nav tabs ──
$miningTabIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains("showTab('mining',this)")) {
        $miningTabIdx = $i
        break
    }
}
Write-Host "Mining tab at: $miningTabIdx"

if ($miningTabIdx -ge 0) {
    $newLines = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $miningTabIdx + 1; $i++) { $newLines.Add($lines[$i]) }
    $newLines.Add('  <button class="nav-tab" onclick="showTab(''leaderboard'',this)">~/leaderboard</button>')
    $newLines.Add('  <button class="nav-tab" onclick="showTab(''casino'',this)">~/bajookie-casino</button>')
    for ($i = $miningTabIdx + 1; $i -lt $lines.Length; $i++) { $newLines.Add($lines[$i]) }
    $lines = $newLines.ToArray()
    Write-Host "Nav tabs added. Lines: $($lines.Length)"
} else { Write-Host "Nav tab FAIL" }

# ── 2. Update showTab() ──
$showTabIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains("if (id === 'mining')")) {
        $showTabIdx = $i
        break
    }
}
Write-Host "showTab mining line at: $showTabIdx"

if ($showTabIdx -ge 0) {
    $newLines2 = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $showTabIdx + 1; $i++) { $newLines2.Add($lines[$i]) }
    $newLines2.Add("  if (id === 'leaderboard') { if (typeof _loadLeaderboard === 'function') _loadLeaderboard('earners'); }")
    $newLines2.Add("  if (id === 'casino')      { if (typeof _initCasino === 'function') _initCasino(); }")
    for ($i = $showTabIdx + 1; $i -lt $lines.Length; $i++) { $newLines2.Add($lines[$i]) }
    $lines = $newLines2.ToArray()
    Write-Host "showTab updated. Lines: $($lines.Length)"
} else { Write-Host "showTab FAIL" }

# ── 3. Add leaderboard + casino pages before GEOCITIES FOOTER ──
$geoIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains("GEOCITIES FOOTER")) {
        $geoIdx = $i
        break
    }
}
Write-Host "GEOCITIES FOOTER at: $geoIdx"

if ($geoIdx -ge 0) {
    $newLines3 = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $geoIdx; $i++) { $newLines3.Add($lines[$i]) }

    # LEADERBOARD PAGE
    $newLines3.Add('')
    $newLines3.Add('<!-- ═══════════════════ LEADERBOARD ═══════════════════ -->')
    $newLines3.Add('<div id="page-leaderboard" class="page">')
    $newLines3.Add('  <div style="margin-bottom:16px;font-size:11px;color:var(--muted);">')
    $newLines3.Add('    <span class="prompt">leaderboard</span> &nbsp;&mdash;&nbsp; top contributors to the island. updated live.')
    $newLines3.Add('  </div>')
    $newLines3.Add('')
    $newLines3.Add('  <div class="box" style="margin-bottom:16px;">')
    $newLines3.Add('    <div class="box-header"><span>&#127758; island totals</span><span id="lb-era-display" style="color:var(--gold);"></span></div>')
    $newLines3.Add('    <div class="box-body">')
    $newLines3.Add('      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;">')
    $newLines3.Add('        <div><div style="font-size:18px;font-weight:700;color:var(--gold);" id="lb-total-coins">-</div><div style="font-size:10px;color:var(--muted);">total coins earned</div></div>')
    $newLines3.Add('        <div><div style="font-size:18px;font-weight:700;color:var(--blue2);" id="lb-total-clicks">-</div><div style="font-size:10px;color:var(--muted);">total clicks</div></div>')
    $newLines3.Add('        <div><div style="font-size:18px;font-weight:700;color:var(--green);" id="lb-total-visits">-</div><div style="font-size:10px;color:var(--muted);">total visitors</div></div>')
    $newLines3.Add('        <div><div style="font-size:18px;font-weight:700;color:var(--pink);" id="lb-era">1</div><div style="font-size:10px;color:var(--muted);">current era</div></div>')
    $newLines3.Add('      </div>')
    $newLines3.Add('    </div>')
    $newLines3.Add('  </div>')
    $newLines3.Add('')
    $newLines3.Add('  <div class="box">')
    $newLines3.Add('    <div class="upg-tab-bar">')
    $newLines3.Add('      <button class="upg-tab active" onclick="lbTab(''earners'',this)">&#128176; TOP EARNERS</button>')
    $newLines3.Add('      <button class="upg-tab" onclick="lbTab(''clickers'',this)">&#128070; TOP CLICKERS</button>')
    $newLines3.Add('      <button class="upg-tab" onclick="lbTab(''feeders'',this)">&#128062; JAPINGUS FEEDERS</button>')
    $newLines3.Add('      <button class="upg-tab" onclick="lbTab(''rollers'',this)">&#127920; HIGH ROLLERS</button>')
    $newLines3.Add('    </div>')
    $newLines3.Add('    <div id="lb-list" style="min-height:200px;"></div>')
    $newLines3.Add('  </div>')
    $newLines3.Add('')
    $newLines3.Add('  <div id="lb-my-stats" style="display:none;"></div>')
    $newLines3.Add('</div>')
    $newLines3.Add('')

    # CASINO PAGE
    $newLines3.Add('<!-- ═══════════════════ CASINO ═══════════════════ -->')
    $newLines3.Add('<div id="page-casino" class="page">')
    $newLines3.Add('  <div style="margin-bottom:16px;font-size:11px;color:var(--muted);">')
    $newLines3.Add('    <span class="prompt">bajookie-casino</span> &nbsp;&mdash;&nbsp; spend your bajookie coins. the house always wins. mostly.')
    $newLines3.Add('  </div>')
    $newLines3.Add('')
    $newLines3.Add('  <div class="two-col">')
    $newLines3.Add('    <div>')
    $newLines3.Add('      <!-- SLOT MACHINE -->')
    $newLines3.Add('      <div class="box slot-machine" id="slot-machine">')
    $newLines3.Add('        <div class="box-header"><span id="slot-tier-label">&#127920; CLASSIC SLOT</span><span id="slot-balance-display" style="color:var(--gold);">0 coins</span></div>')
    $newLines3.Add('        <div class="box-body" style="text-align:center;">')
    $newLines3.Add('          <div class="bet-btns" style="margin-top:8px;">')
    $newLines3.Add('            <button class="bet-btn active" onclick="setBet(10,this)">10</button>')
    $newLines3.Add('            <button class="bet-btn" onclick="setBet(50,this)">50</button>')
    $newLines3.Add('            <button class="bet-btn" onclick="setBet(100,this)">100</button>')
    $newLines3.Add('            <button class="bet-btn" onclick="setBet(500,this)">500</button>')
    $newLines3.Add('            <button class="bet-btn" onclick="setBet(1000,this)">1K</button>')
    $newLines3.Add('            <button class="bet-btn" onclick="setBet(10000,this)">10K</button>')
    $newLines3.Add('          </div>')
    $newLines3.Add('          <div class="slot-reels">')
    $newLines3.Add('            <div class="reel" id="reel-0">&#128993;</div>')
    $newLines3.Add('            <div class="reel" id="reel-1">&#128993;</div>')
    $newLines3.Add('            <div class="reel" id="reel-2">&#128993;</div>')
    $newLines3.Add('          </div>')
    $newLines3.Add('          <div style="font-size:12px;color:var(--muted);margin-bottom:12px;">bet: <span id="bet-display" style="color:var(--gold);font-weight:700;">10</span> coins</div>')
    $newLines3.Add('          <button class="spin-btn" id="spin-btn" onclick="spinSlots()">&#9654; SPIN</button>')
    $newLines3.Add('          <div class="free-spins-badge" id="free-spins-display"></div>')
    $newLines3.Add('          <div style="font-size:11px;color:var(--dim);margin-top:10px;" id="spin-result"></div>')
    $newLines3.Add('          <div style="font-size:10px;color:var(--muted);margin-top:8px;" id="slot-jap-bonus"></div>')
    $newLines3.Add('        </div>')
    $newLines3.Add('      </div>')
    $newLines3.Add('')
    $newLines3.Add('      <!-- PAYTABLE -->')
    $newLines3.Add('      <div class="box">')
    $newLines3.Add('        <div class="box-header"><span>&#128218; paytable</span><span style="font-size:10px;color:var(--dim);">3 match = full pay &bull; 2 match = half</span></div>')
    $newLines3.Add('        <div class="box-body" style="font-size:11px;">')
    $newLines3.Add('          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">')
    $newLines3.Add('            <div>&#128993; Bajookie &mdash; <span style="color:var(--gold);">&#215;2</span></div>')
    $newLines3.Add('            <div>&#129398; Jerry &mdash; <span style="color:var(--gold);">&#215;3</span></div>')
    $newLines3.Add('            <div>&#128062; Japingus &mdash; <span style="color:var(--gold);">&#215;5</span></div>')
    $newLines3.Add('            <div>&#127815; Drain Gang &mdash; <span style="color:var(--gold);">&#215;8</span></div>')
    $newLines3.Add('            <div>&#128140; Newman &mdash; <span style="color:var(--gold);">&#215;15</span></div>')
    $newLines3.Add('            <div>&#128165; Kramer &mdash; <span style="color:var(--gold);">&#215;20</span></div>')
    $newLines3.Add('            <div>&#128371; Void &mdash; <span style="color:var(--gold);">&#215;50</span></div>')
    $newLines3.Add('            <div style="color:var(--gold);font-weight:700;">&#11088; JACKPOT &mdash; <span style="color:var(--yellow);">&#215;500</span></div>')
    $newLines3.Add('          </div>')
    $newLines3.Add('          <div style="margin-top:8px;color:var(--muted);">&#128062;&#128062;&#128062; anywhere = free spin</div>')
    $newLines3.Add('        </div>')
    $newLines3.Add('      </div>')
    $newLines3.Add('    </div>')
    $newLines3.Add('')
    $newLines3.Add('    <!-- STATS PANEL -->')
    $newLines3.Add('    <div>')
    $newLines3.Add('      <div class="box" style="margin-bottom:12px;">')
    $newLines3.Add('        <div class="box-header"><span>&#128200; your stats</span></div>')
    $newLines3.Add('        <div class="box-body">')
    $newLines3.Add('          <div class="casino-stats">')
    $newLines3.Add('            <div class="casino-stat-box"><div class="val" id="cs-wagered">0</div><div class="lbl">total wagered</div></div>')
    $newLines3.Add('            <div class="casino-stat-box"><div class="val" id="cs-won">0</div><div class="lbl">total won</div></div>')
    $newLines3.Add('            <div class="casino-stat-box"><div class="val" id="cs-profit" style="color:var(--green);">0</div><div class="lbl">net profit/loss</div></div>')
    $newLines3.Add('            <div class="casino-stat-box"><div class="val" id="cs-winrate">0%</div><div class="lbl">win rate</div></div>')
    $newLines3.Add('            <div class="casino-stat-box"><div class="val" id="cs-biggest">0</div><div class="lbl">biggest win</div></div>')
    $newLines3.Add('            <div class="casino-stat-box"><div class="val" id="cs-jackpots">0</div><div class="lbl">jackpots hit</div></div>')
    $newLines3.Add('          </div>')
    $newLines3.Add('        </div>')
    $newLines3.Add('      </div>')
    $newLines3.Add('')
    $newLines3.Add('      <div class="box" style="margin-bottom:12px;">')
    $newLines3.Add('        <div class="box-header"><span>&#127758; island casino stats</span></div>')
    $newLines3.Add('        <div class="box-body" style="font-size:12px;">')
    $newLines3.Add('          <div class="stat-row"><span>total wagered (island)</span><span id="ci-wagered">-</span></div>')
    $newLines3.Add('          <div class="stat-row"><span>jackpots (island)</span><span id="ci-jackpots">-</span></div>')
    $newLines3.Add('        </div>')
    $newLines3.Add('      </div>')
    $newLines3.Add('')
    $newLines3.Add('      <div class="box">')
    $newLines3.Add('        <div class="box-header"><span>&#127981; slot tiers</span></div>')
    $newLines3.Add('        <div class="box-body" style="font-size:11px;line-height:2;">')
    $newLines3.Add('          <div id="tier-classic" style="color:var(--green);">&#9733; CLASSIC &mdash; standard RTP 92%</div>')
    $newLines3.Add('          <div id="tier-drain" style="color:var(--dim);">&#9734; DRAIN GANG MACHINE &mdash; unlock at 10K bets</div>')
    $newLines3.Add('          <div id="tier-void" style="color:var(--dim);">&#9734; VOID SLOT &mdash; unlock at 1M bets, high variance</div>')
    $newLines3.Add('        </div>')
    $newLines3.Add('      </div>')
    $newLines3.Add('    </div>')
    $newLines3.Add('  </div>')
    $newLines3.Add('</div>')
    $newLines3.Add('')

    # JACKPOT OVERLAY
    $newLines3.Add('<!-- Jackpot overlay -->')
    $newLines3.Add('<div id="jackpot-overlay">')
    $newLines3.Add('  <div class="jackpot-text">&#11088; BAJOOKIE JACKPOT! &#11088;</div>')
    $newLines3.Add('  <div style="color:var(--gold);font-size:20px;margin:16px 0;" id="jackpot-amount"></div>')
    $newLines3.Add('  <button onclick="document.getElementById(''jackpot-overlay'').classList.remove(''show'')" style="font-family:''Fira Code'',monospace;padding:10px 24px;border:1px solid var(--gold);background:none;color:var(--gold);cursor:pointer;font-size:14px;">COLLECT</button>')
    $newLines3.Add('</div>')
    $newLines3.Add('')

    for ($i = $geoIdx; $i -lt $lines.Length; $i++) { $newLines3.Add($lines[$i]) }
    $lines = $newLines3.ToArray()
    Write-Host "Pages added. Lines: $($lines.Length)"
} else {
    Write-Host "GEOCITIES FOOTER not found"
}

[System.IO.File]::WriteAllLines($file, $lines, [System.Text.Encoding]::UTF8)
Write-Host "Saved. $($lines.Length) lines"
