$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open('c:\Users\udayk\OneDrive\Documents\AIR WATCH\hasiniD3.docx')
    $pages = $doc.ComputeStatistics(2)
    Write-Host "SUCCESS: hasiniD3.docx opened with $pages pages."

    # Find page of Section 6.11
    $rng611 = $doc.Range()
    if ($rng611.Find.Execute("6.11 STORED TELEMETRY DATASET")) {
        Write-Host "6.11 Page: $($rng611.Information(1))"
    } else {
        $rng611 = $doc.Range()
        if ($rng611.Find.Execute("6.11 Stored Telemetry")) {
            Write-Host "6.11 Page: $($rng611.Information(1))"
        }
    }

    # Find page of Chapter 7
    $rng7 = $doc.Range()
    if ($rng7.Find.Execute("CHAPTER 7")) {
        Write-Host "Chapter 7 Page: $($rng7.Information(1))"
    }

    # Find page of Chapter 8
    $rng8 = $doc.Range()
    if ($rng8.Find.Execute("CHAPTER 8")) {
        Write-Host "Chapter 8 Page: $($rng8.Information(1))"
    }

    $doc.Close(0)
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null

