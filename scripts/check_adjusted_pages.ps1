$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open('c:\Users\udayk\OneDrive\Documents\AIR WATCH\hasiniD3.docx')

    # Find heading 6.11.1 in body
    $rng = $doc.Range()
    if ($rng.Find.Execute("6.11.1 Master Air Quality")) {
        Write-Host "6.11.1 Physical: $($rng.Information(1)), Adjusted (Printed): $($rng.Information(3))"
    }

    # Find Chapter 7
    $rng7 = $doc.Range()
    while ($rng7.Find.Execute("CHAPTER 7")) {
        Write-Host "CHAPTER 7 Physical: $($rng7.Information(1)), Adjusted (Printed): $($rng7.Information(3))"
    }

    # Find Chapter 8
    $rng8 = $doc.Range()
    while ($rng8.Find.Execute("CHAPTER 8")) {
        Write-Host "CHAPTER 8 Physical: $($rng8.Information(1)), Adjusted (Printed): $($rng8.Information(3))"
    }

    # Find References in body (skip TOC)
    $rngRef = $doc.Range()
    while ($rngRef.Find.Execute("REFERENCES")) {
        if ($rngRef.Information(1) -gt 10) {
            Write-Host "REFERENCES Physical: $($rngRef.Information(1)), Adjusted (Printed): $($rngRef.Information(3))"
        }
    }

    $doc.Close(0)
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null

