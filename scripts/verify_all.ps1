$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open('c:\Users\udayk\OneDrive\Documents\AIR WATCH\hasiniD3.docx')
    $pages = $doc.ComputeStatistics(2) # 2 = wdStatisticPages
    Write-Host "hasiniD3.docx opened successfully. Page count: $pages"
    $doc.Close(0) # 0 = wdDoNotSaveChanges
} catch {
    Write-Host "hasiniD3.docx Error: $($_.Exception.Message)"
}
try {
    $doc2 = $word.Documents.Open('c:\Users\udayk\OneDrive\Documents\AIR WATCH\Air_Quality_Monitoring_Report.docx')
    $pages2 = $doc2.ComputeStatistics(2)
    Write-Host "Air_Quality_Monitoring_Report.docx opened successfully. Page count: $pages2"
    $doc2.Close(0)
} catch {
    Write-Host "Air_Quality_Monitoring_Report.docx Error: $($_.Exception.Message)"
}
$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null

$ppt = New-Object -ComObject PowerPoint.Application
try {
    $pres = $ppt.Presentations.Open('c:\Users\udayk\OneDrive\Documents\AIR WATCH\Air_Quality_Monitoring_Presentation.pptx', [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
    Write-Host "Air_Quality_Monitoring_Presentation.pptx opened successfully. Slide count: $($pres.Slides.Count)"
    $pres.Close()
} catch {
    Write-Host "PowerPoint Error: $($_.Exception.Message)"
}
$ppt.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
