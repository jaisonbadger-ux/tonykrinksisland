$html = Get-Content 'C:\Users\TonyFlexico\tonykrinks_island.html' -Encoding UTF8
Write-Host "Input lines: $($html.Count)"

# ── New gif-strip (replaces lines 620-638, 0-indexed 619..637) ──
$gifStrip = @'
<!-- 90s GIF CHAOS STRIP -->
<div class="gif-strip">
  <span class="g g-spin" style="color:#ff0000;font-size:22px;">&#9733;</span>
  <span class="g g-rainbow">~*~ WELCOME TO THE ISLAND ~*~</span>
  <span class="g g-bounce" style="color:#ff6600;font-size:20px;font-weight:900;">^</span>
  <span class="g g-spin" style="animation-duration:0.5s;color:#ffff00;font-size:18px;">&#10022;</span>
  <span class="g g-zoom" style="color:#00ff00;font-size:18px;">&#9670;</span>
  <span class="g g-wobble" style="font-size:13px;color:#ffffff;font-weight:900;">--==[&gt;&gt;]==--</span>
  <span class="g g-spinrev" style="color:#ff00ff;font-size:22px;">&#9734;</span>
  <span class="g g-rainbow" style="animation-delay:0.5s">*** BAJOOKIE ZONE ***</span>
  <span class="g g-bounce" style="animation-delay:0.3s;color:#ff0000;font-size:22px;font-weight:900;">!</span>
  <span class="g g-spin" style="animation-duration:1.5s;color:#00ffff;font-size:18px;">&#9675;</span>
  <span class="g g-shake" style="color:#ffffff;font-size:16px;font-weight:900;">~&#126;~</span>
  <span class="g g-zoom" style="animation-delay:0.4s;color:#ff4466;font-size:20px;">&#9829;</span>
  <span class="g g-spinrev" style="animation-duration:0.6s;color:#ffff00;font-size:16px;">&#10023;</span>
  <span class="g g-rainbow" style="animation-delay:0.2s">*** EST. 2026 ***</span>
  <span class="g g-bounce" style="animation-delay:0.6s;color:#ff6600;font-size:20px;font-weight:900;">^</span>
  <span class="g g-spin" style="color:#ff0000;font-size:22px;">&#9733;</span>
</div>
'@

# ── New chaos row (replaces lines 645-659, 0-indexed 644..658) ──
$chaosRow = @'
  <!-- CHAOS ROW -->
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:16px;">
    <div class="under-con">
      <span style="animation:wobble 0.4s ease-in-out infinite;display:inline-block;font-weight:900;font-size:13px;">-=[!!]=-</span>
      <span>UNDER CONSTRUCTION &mdash; CHECK BACK NEVER</span>
      <span style="animation:wobble 0.4s ease-in-out infinite;display:inline-block;font-weight:900;font-size:13px;">-=[!!]=-</span>
    </div>
    <div style="display:flex;gap:10px;align-items:center;">
      <span class="new-badge">NEW!</span>
      <span style="animation:spin 0.6s linear infinite;display:inline-block;font-size:20px;color:#ffff00;">&#9733;</span>
      <span style="animation:bounce 0.8s ease-in-out infinite;display:inline-block;font-size:14px;font-weight:900;color:#ff6600;">/\/\</span>
      <span style="animation:spinrev 1s linear infinite;display:inline-block;font-size:20px;color:#ff00ff;">&#9670;</span>
      <span class="new-badge" style="background:#00cc00;color:#000;">HOT!</span>
    </div>
  </div>
'@

# ── New gif row in left column (replaces lines 693-700, 0-indexed 692..699) ──
$gifRow = @'
      <!-- GIF ROW -->
      <div style="display:flex;justify-content:space-around;align-items:center;padding:10px 0;border-top:1px solid var(--border);margin-top:4px;">
        <span style="animation:spin 0.7s linear infinite;display:inline-block;font-size:22px;color:#ff4444;font-weight:900;">&dagger;</span>
        <span style="animation:bounce 0.6s ease-in-out infinite;display:inline-block;font-size:14px;color:#ff6600;font-weight:900;">/\/\</span>
        <span style="animation:rainbow 1s linear infinite;font-size:11px;font-family:'Fira Code',monospace;font-weight:900;">YOU ARE BEING WATCHED</span>
        <span style="animation:bounce 0.9s ease-in-out infinite;animation-delay:0.3s;display:inline-block;font-size:14px;color:#ff6600;font-weight:900;">/\/\</span>
        <span style="animation:spinrev 0.7s linear infinite;display:inline-block;font-size:22px;color:#ff4444;font-weight:900;">&dagger;</span>
      </div>
'@

# ── Homer ASCII box (NEW — inserted after line 700, before line 701) ──
$homerBox = @'
      <!-- HOMER ASCII -->
      <div class="box" style="margin-top:8px;">
        <div class="box-header"><span>** homer.ascii **</span><span style="color:var(--yellow);">&nbsp;D'OH!</span></div>
        <div class="box-body" style="padding:0;background:#0a0e14;">
<pre class="ascii-art" style="padding:12px 0 8px;color:var(--gold);">   ___M___
  ( o   o )
  |  ---  |
  |   D   |
   \_____/
  =[HOMER J]=
   SIMPSON
"MMM...BAJOOKIE"</pre>
        </div>
      </div>
'@

# ── Bart chalkboard (NEW — inserted before line 751 which closes right column) ──
$bartBox = @'
      <!-- BART CHALKBOARD -->
      <div class="box">
        <div class="box-header"><span>// bart.chalkboard</span><span style="color:var(--green);">LIVE</span></div>
        <div class="box-body" style="padding:0;">
          <div class="chalkboard">
<pre style="font-family:'Courier New',monospace;font-size:10px;color:rgba(180,255,160,0.5);margin:0 0 4px;line-height:1.3;text-align:center;">  _/\/\_
 ( o  o )
 |  ~  |
  )   (
  | | |
  BART</pre>
            <span class="chalk-line">I will not sell bajookie.</span>
            <span class="chalk-line">I will not sell bajookie.</span>
            <span class="chalk-line">I will not sell bajookie.</span>
            <span class="chalk-line">I will not sell bajookie.</span>
            <span class="chalk-line">I will not sell bajookie.</span>
          </div>
        </div>
      </div>
'@

# ── Retro footer (NEW — inserted before line 901 which is </div><!-- /wrap -->) ──
$footer = @'

<!-- GEOCITIES FOOTER -->
<hr class="rainbow-hr">
<div class="geocities-footer">
  <pre class="ascii-art" style="font-size:9px;color:var(--gold);">~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~
        TONY KRINK'S ISLAND -- EST. MMXXVI
~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~</pre>
  <div class="award-row">
    <div class="award"><span class="award-icon">&#9733;</span>SITE OF<br>THE HOUR</div>
    <div class="award"><span class="award-icon">&#9670;</span>BEST<br>ISLAND</div>
    <div class="award"><span class="award-icon">&#9829;</span>BAJOOKIE<br>APPROVED</div>
    <div class="award"><span class="award-icon">&#9650;</span>TOP 10<br>GEOCITIES</div>
    <div class="award"><span class="award-icon" style="font-size:11px;font-family:'Courier New',monospace;">D'OH</span>HOMER<br>ENDORSED</div>
  </div>
  <div style="margin:10px 0;font-size:10px;color:var(--muted);">
    BEST VIEWED IN <span style="color:var(--blue2);">NETSCAPE NAVIGATOR 4.0</span>
    &nbsp;|&nbsp; RESOLUTION <span style="color:var(--blue2);">800&#215;600</span>
    &nbsp;|&nbsp; <span style="color:var(--blue2);">256 COLORS</span>
  </div>
  <div style="font-size:9px;color:var(--dim);letter-spacing:2px;margin-bottom:8px;">
    &copy; MCMXCVI&ndash;MMXXVI TONY KRINK'S ISLAND &nbsp;|&nbsp; ALL RIGHTS RESERVED (PROBABLY)
  </div>
  <div style="font-size:11px;margin-top:6px;">
    <span class="blink" style="color:var(--red);">&#9733;</span>
    &nbsp;YOU ARE VISITOR #<span id="footer-visitor" style="color:var(--green);font-weight:900;letter-spacing:2px;">000000</span>&nbsp;
    <span class="blink" style="color:var(--red);">&#9733;</span>
  </div>
</div>
'@

# Split into line arrays
$gifStripArr = $gifStrip  -split "`r?`n"
$chaosRowArr = $chaosRow  -split "`r?`n"
$gifRowArr   = $gifRow    -split "`r?`n"
$homerBoxArr = $homerBox  -split "`r?`n"
$bartBoxArr  = $bartBox   -split "`r?`n"
$footerArr   = $footer    -split "`r?`n"

# Assemble new file
# Original line numbers (1-indexed) → 0-indexed array positions:
#   gif-strip comment+div:  lines 620-638 → [619..637]
#   chaos row block:        lines 645-659 → [644..658]
#   gif row block:          lines 693-700 → [692..699]
#   homer insert after:     line 700 → after [699], before [700]
#   bart insert before:     line 751 → after [749], before [750]
#   footer insert before:   line 901 → after [899], before [900]

$out  = $html[0..618]       # lines 1-619  (header, CSS, ticker, nav, toast)
$out += $gifStripArr        # NEW gif-strip
$out += $html[638..643]     # lines 639-644 (empty + wrap open + empty + HOME comment + page-home + empty)
$out += $chaosRowArr        # NEW chaos row
$out += $html[659..691]     # lines 660-692 (two-col, LEFT, video, seinfeld boxes)
$out += $gifRowArr          # NEW gif row
$out += $homerBoxArr        # NEW homer box (insert)
$out += $html[700..749]     # lines 701-750 (close left col, RIGHT col with stats/clicker/board)
$out += $bartBoxArr         # NEW bart chalkboard (insert)
$out += $html[750..899]     # lines 751-900 (close right col, close two-col, close home, other pages)
$out += $footerArr          # NEW footer (insert)
$out += $html[900..($html.Count - 1)]  # lines 901-end (wrap close, script, body close)

$out | Out-File 'C:\Users\TonyFlexico\tonykrinks_island.html' -Encoding UTF8 -NoNewline:$false
Write-Host "Done. Lines: $($out.Count)"
