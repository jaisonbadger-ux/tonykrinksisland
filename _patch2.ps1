$file = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)

function U([int]$cp) { return [System.Char]::ConvertFromUtf32($cp) }

$volcano = U(0x1F30B)
$brain   = U(0x1F9E0)
$inf     = [string][char]0x267E + [string][char]0xFE0F
$times   = [string][char]0xD7
$up      = [string][char]0x2B06
$galaxy  = U(0x1F30C)
$swirl   = U(0x1F300)
$boom    = U(0x1F4A5)

# Find the line with reqTotal:200 (g2 boost - last boost in the array)
$g2idx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Contains("reqTotal:200},")) {
        $g2idx = $i
        break
    }
}
Write-Host "g2 boost at line: $g2idx"

if ($g2idx -ge 0) {
    $newLines = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $g2idx + 1; $i++) { $newLines.Add($lines[$i]) }

    $newLines.Add("  " + "{id:'baa',icon:'" + $volcano + "', name:'Eruption',         desc:'Bajookie Volcano " + $times + "2',        cost:250000000,  type:'prod',  mult:2,  prod:'pa', reqN:1,   req:null,  reqTotal:null},")
    $newLines.Add("  " + "{id:'bab',icon:'" + $volcano + "', name:'Supervolcano',     desc:'Bajookie Volcano " + $times + "5',        cost:2500000000, type:'prod',  mult:5,  prod:'pa', reqN:10,  req:null,  reqTotal:null},")
    $newLines.Add("  " + "{id:'bba',icon:'" + $brain   + "', name:'Hive Mind',        desc:'Collective Consciousness " + $times + "2', cost:5000000000, type:'prod',  mult:2,  prod:'pb', reqN:1,   req:null,  reqTotal:null},")
    $newLines.Add("  " + "{id:'bbb',icon:'" + $brain   + "', name:'Omniscience',      desc:'Collective Consciousness " + $times + "5', cost:50000000000, type:'prod', mult:5,  prod:'pb', reqN:10,  req:null,  reqTotal:null},")
    $newLines.Add("  " + "{id:'bca',icon:'" + $inf     + "', name:'Loop Detected',    desc:'Infinite Loop " + $times + "2',            cost:100000000000, type:'prod', mult:2, prod:'pc', reqN:1,   req:null,  reqTotal:null},")
    $newLines.Add("  " + "{id:'bcb',icon:'" + $inf     + "', name:'Stack Overflow',   desc:'Infinite Loop " + $times + "5',            cost:1000000000000, type:'prod',mult:5, prod:'pc', reqN:10,  req:null,  reqTotal:null},")
    $newLines.Add("  " + "{id:'g3', icon:'" + $up      + "', name:'Bajookie Ascendancy', desc:'All producers " + $times + "5',         cost:1000000000000, type:'global',mult:5, prod:null, reqN:null, req:null, reqTotal:500},")
    $newLines.Add("  " + "{id:'g4', icon:'" + $galaxy  + "', name:'Island Singularity',  desc:'All producers " + $times + "10',        cost:100000000000000, type:'global',mult:10, prod:null, reqN:null, req:'g3', reqTotal:null},")
    $newLines.Add("  " + "{id:'c5', icon:'" + $swirl   + "', name:'Void Resonance',   desc:'+0.1 click per producer owned', cost:100000000, type:'click', mult:1, prod:null, reqN:null, req:'c4', reqTotal:null},")
    $newLines.Add("  " + "{id:'c6', icon:'" + $boom    + "', name:'Island Pulse',     desc:'" + $times + "100 click power', cost:10000000000, type:'click', mult:100, prod:null, reqN:null, req:'c5', reqTotal:null},")

    for ($i = $g2idx + 1; $i -lt $lines.Length; $i++) { $newLines.Add($lines[$i]) }

    [System.IO.File]::WriteAllLines($file, $newLines.ToArray(), [System.Text.Encoding]::UTF8)
    Write-Host "2 OK - inserted 10 boost lines after line $g2idx"
    Write-Host "New line count: $($newLines.Count)"
} else {
    Write-Host "2 FAIL - could not find g2 boost line"
}
