$content = Get-Content index.html -Raw

Write-Host "Checking updates to index.html:"
Write-Host ""

if ($content.Contains("card-graphic")) { Write-Host "✓ Service cards updated with card-graphic" } else { Write-Host "✗ Service cards NOT updated" }
if ($content.Contains("dashboard-bars")) { Write-Host "✓ Hero collage updated with dashboard" } else { Write-Host "✗ Hero collage NOT updated" }
if ($content.Contains("orbit-logos")) { Write-Host "✓ Orbiting logos animation added" } else { Write-Host "✗ Orbiting logos NOT added" }
if ($content.Contains("build-panel")) { Write-Host "✗ Build-panel still exists" } else { Write-Host "✓ Build-panel successfully deleted" }
