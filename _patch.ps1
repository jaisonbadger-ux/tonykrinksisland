$file = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$txt = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

function U([int]$cp) { return [System.Char]::ConvertFromUtf32($cp) }

$n = "`n"
if ($txt.Contains("`r`n")) { $n = "`r`n"; Write-Host "CRLF file" } else { Write-Host "LF file" }

$volcano   = U(0x1F30B)
$brain     = U(0x1F9E0)
$inf       = [string][char]0x267E + [string][char]0xFE0F
$wave      = U(0x1F30A)
$times     = [string][char]0xD7
$up        = [string][char]0x2B06
$galaxy    = U(0x1F30C)
$swirl     = U(0x1F300)
$boom      = U(0x1F4A5)

# 1. New producers
$find1 = "base:5000000,   cps:2000 }," + $n + "];"
$rep1  = "base:5000000,   cps:2000  }," + $n +
"  {id:'pa', icon:'" + $volcano + "', name:'Bajookie Volcano',          base:25000000,    cps:8000  }," + $n +
"  {id:'pb', icon:'" + $brain   + "', name:'Collective Consciousness',  base:500000000,   cps:25000 }," + $n +
"  {id:'pc', icon:'" + $inf     + "', name:'Infinite Bajookie Loop',    base:10000000000, cps:100000}," + $n +
"];"
if ($txt.Contains($find1)) { $txt = $txt.Replace($find1, $rep1); Write-Host "1 OK" }
else { Write-Host "1 FAIL" ; Write-Host $txt.IndexOf("cps:2000") }

# 2. New boosts
$find2 = "name:'Bajookie Tide',    desc:'All producers " + $times + "3',          cost:1000000000, type:'global',mult:3,  prod:null, reqN:null, req:null,  reqTotal:200},"
$rep2  = $find2 + $n +
"  {id:'baa',icon:'" + $volcano + "', name:'Eruption',         desc:'Bajookie Volcano " + $times + "2',        cost:250000000,  type:'prod',  mult:2,  prod:'pa', reqN:1,   req:null,  reqTotal:null}," + $n +
"  {id:'bab',icon:'" + $volcano + "', name:'Supervolcano',     desc:'Bajookie Volcano " + $times + "5',        cost:2500000000, type:'prod',  mult:5,  prod:'pa', reqN:10,  req:null,  reqTotal:null}," + $n +
"  {id:'bba',icon:'" + $brain   + "', name:'Hive Mind',        desc:'Collective Consciousness " + $times + "2', cost:5000000000, type:'prod',  mult:2,  prod:'pb', reqN:1,   req:null,  reqTotal:null}," + $n +
"  {id:'bbb',icon:'" + $brain   + "', name:'Omniscience',      desc:'Collective Consciousness " + $times + "5', cost:50000000000, type:'prod', mult:5,  prod:'pb', reqN:10,  req:null,  reqTotal:null}," + $n +
"  {id:'bca',icon:'" + $inf     + "', name:'Loop Detected',    desc:'Infinite Loop " + $times + "2',            cost:100000000000, type:'prod', mult:2, prod:'pc', reqN:1,   req:null,  reqTotal:null}," + $n +
"  {id:'bcb',icon:'" + $inf     + "', name:'Stack Overflow',   desc:'Infinite Loop " + $times + "5',            cost:1000000000000, type:'prod',mult:5, prod:'pc', reqN:10,  req:null,  reqTotal:null}," + $n +
"  {id:'g3', icon:'" + $up      + "',  name:'Bajookie Ascendancy', desc:'All producers " + $times + "5',        cost:1000000000000, type:'global',mult:5, prod:null, reqN:null, req:null, reqTotal:500}," + $n +
"  {id:'g4', icon:'" + $galaxy  + "', name:'Island Singularity',  desc:'All producers " + $times + "10',        cost:100000000000000, type:'global',mult:10, prod:null, reqN:null, req:'g3', reqTotal:null}," + $n +
"  {id:'c5', icon:'" + $swirl   + "', name:'Void Resonance',   desc:'+0.1 click per producer owned', cost:100000000, type:'click', mult:1, prod:null, reqN:null, req:'c4', reqTotal:null}," + $n +
"  {id:'c6', icon:'" + $boom    + "', name:'Island Pulse',     desc:'" + $times + "100 click power', cost:10000000000, type:'click', mult:100, prod:null, reqN:null, req:'c5', reqTotal:null},"
if ($txt.Contains($find2)) { $txt = $txt.Replace($find2, $rep2); Write-Host "2 OK" }
else {
    Write-Host "2 FAIL - finding Bajookie Tide..."
    $idx2 = $txt.IndexOf("Bajookie Tide")
    Write-Host "idx=$idx2"
    if ($idx2 -ge 0) { Write-Host $txt.Substring([Math]::Max(0,$idx2-20), 160) }
}

# 3. recalc
$find3 = "  cps      *= globalMult;" + $n + "  clickPow *= globalMult;" + $n + "}"
$rep3  = "  cps      *= globalMult;" + $n + "  clickPow *= globalMult;" + $n +
"  if (bought.c5) {" + $n +
"    const totalOwned = Object.values(owned).reduce((s,v) => s + v, 0);" + $n +
"    clickPow += totalOwned * 0.1;" + $n +
"  }" + $n +
"  cps      *= (window._eventCpsMultiplier   ?? 1);" + $n +
"  clickPow *= (window._eventClickMultiplier ?? 1);" + $n +
"}"
if ($txt.Contains($find3)) { $txt = $txt.Replace($find3, $rep3); Write-Host "3 OK" }
else {
    Write-Host "3 FAIL - searching..."
    $idx3 = $txt.IndexOf("clickPow *= globalMult;")
    Write-Host "clickPow idx=$idx3"
    if ($idx3 -ge 0) {
        $ctx = $txt.Substring([Math]::Max(0, $idx3-30), 100)
        $ctx = $ctx -replace "`r","[CR]" -replace "`n","[LF]"
        Write-Host $ctx
    }
}

[System.IO.File]::WriteAllText($file, $txt, [System.Text.Encoding]::UTF8)
Write-Host "Done. $($txt.Length) chars"
