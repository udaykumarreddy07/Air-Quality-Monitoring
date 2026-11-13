param([string]$PptPath = "C:\Users\udayk\OneDrive\Documents\AIR WATCH\Air_Quality_Monitoring_Presentation.pptx")
try {
    $ppt = New-Object -ComObject PowerPoint.Application
    # Open read-only, untitled, visible=false
    $pres = $ppt.Presentations.Open($PptPath, 1, 0, 0)
    $count = $pres.Slides.Count
    Write-Host "SUCCESS: $PptPath opened with $count slides."
    $pres.Close()
    $ppt.Quit()
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
    if ($ppt) { $ppt.Quit() }
}

