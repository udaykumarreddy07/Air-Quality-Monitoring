$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open('c:\Users\udayk\OneDrive\Documents\AIR WATCH\hasiniD3.docx')
$rng1 = $doc.Range()
if ($rng1.Find.Execute("CHAPTER 7")) {
    Write-Host "CHAPTER 7 page: $($rng1.Information(1))"
}
$rng2 = $doc.Range()
if ($rng2.Find.Execute("CHAPTER 8")) {
    Write-Host "CHAPTER 8 page: $($rng2.Information(1))"
}
$rng3 = $doc.Range()
if ($rng3.Find.Execute("REFERENCES")) {
    Write-Host "REFERENCES page: $($rng3.Information(1))"
}
$doc.Close(0)
$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null

