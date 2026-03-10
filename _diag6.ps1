$file = 'C:\Users\TonyFlexico\tonykrinks-island\index.html'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)

# Find all const/let/var declarations inside the main script (lines 1626-4182)
$scriptStart = 1625  # 0-indexed
$scriptEnd   = 4181  # 0-indexed
$decls = @{}

for ($i = $scriptStart; $i -le $scriptEnd; $i++) {
    $line = $lines[$i]
    if ($line -match '^\s*(const|let|var)\s+(\w+)') {
        $name = $Matches[2]
        if ($decls.ContainsKey($name)) {
            Write-Host "DUPLICATE: $name at lines $($decls[$name]+1) and $($i+1)"
        } else {
            $decls[$name] = $i
        }
    }
}

Write-Host ""
Write-Host "Total declarations found: $($decls.Count)"
Write-Host ""
Write-Host "=== Key auth vars check ==="
foreach ($v in @('_auth','_db','_currentUser','coins','totalEarned','clicks','owned','bought','pacts','globalMult','cps','clickPow','PRODS','BOOSTS','FIREBASE_CONFIG','AVATARS','_CLICK_MILESTONES')) {
    if ($decls.ContainsKey($v)) {
        Write-Host "$v => line $($decls[$v]+1)"
    } else {
        Write-Host "NOT FOUND: $v"
    }
}
