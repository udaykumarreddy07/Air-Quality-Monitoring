$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open('c:\Users\udayk\OneDrive\Documents\AIR WATCH\hasiniD3.docx')

    # Find heading 6.11.1 in body
    $rng = $doc.Range()
    if ($rng.Find.Execute("6.11.1 Master Air Quality")) {
        Write-Host "6.11.1 Page: $($rng.Information(1))"
    }

    # Find Chapter 7
    $rng7 = $doc.Range()
    # Find all occurrences of CHAPTER 7
    $ch7Pages = @()
    while ($rng7.Find.Execute("CHAPTER 7")) {
        $ch7Pages += $rng7.Information(1)
    }
    Write-Host "CHAPTER 7 occurrences on pages: $($ch7Pages -join ', ')"

    # Find Chapter 8
    $rng8 = $doc.Range()
    $ch8Pages = @()
    while ($rng8.Find.Execute("CHAPTER 8")) {
        $ch8Pages += $rng8.Information(1)
    }
    Write-Host "CHAPTER 8 occurrences on pages: $($ch8Pages -join ', ')"

    # Find References
    $rngRef = $doc.Range()
    $refPages = @()
    while ($rngRef.Find.Execute("REFERENCES")) {
        $refPages += $rngRef.Information(1)
    }
    Write-Host "REFERENCES occurrences on pages: $($refPages -join ', ')"

    $doc.Close(0)
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null

