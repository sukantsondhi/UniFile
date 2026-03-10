$inputDir = 'tests/assets/input'

# Text/document samples
Set-Content -Path "$inputDir/sample.txt" -Value "UniFile test sample text`nLine 2"
Set-Content -Path "$inputDir/sample.md" -Value "# UniFile Test`n`n- alpha`n- beta"
Set-Content -Path "$inputDir/sample.html" -Value "<!doctype html><html><body><h1>UniFile</h1><p>HTML sample</p></body></html>"
Set-Content -Path "$inputDir/sample.htm" -Value "<!doctype html><html><body><h2>UniFile HTM</h2></body></html>"
Set-Content -Path "$inputDir/sample.csv" -Value "name,score`nA,10`nB,20"
Set-Content -Path "$inputDir/sample.tsv" -Value "name`tscore`nA`t10`nB`t20"
Set-Content -Path "$inputDir/sample.json" -Value "{`"name`": `"UniFile`", `"ok`": true}"
Set-Content -Path "$inputDir/sample.xml" -Value "<root><name>UniFile</name><ok>true</ok></root>"
Set-Content -Path "$inputDir/sample.rtf" -Value "{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}} \\f0\\fs24 UniFile RTF sample}"

# Simple SVG sample
Set-Content -Path "$inputDir/sample.svg" -Value '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#667eea"/><text x="10" y="45" fill="white" font-size="16">UniFile</text></svg>'

# Generate png/jpg/jpeg/gif/bmp using System.Drawing
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 120,80
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::FromArgb(102,126,234))
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$font = New-Object System.Drawing.Font('Arial', 14)
$g.DrawString('UniFile', $font, $brush, 15, 28)

$bmp.Save((Join-Path $inputDir 'sample.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save((Join-Path $inputDir 'sample.jpg'), [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Save((Join-Path $inputDir 'sample.jpeg'), [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Save((Join-Path $inputDir 'sample.gif'), [System.Drawing.Imaging.ImageFormat]::Gif)
$bmp.Save((Join-Path $inputDir 'sample.bmp'), [System.Drawing.Imaging.ImageFormat]::Bmp)

$g.Dispose(); $brush.Dispose(); $font.Dispose(); $bmp.Dispose()

# Download browser-relevant sample binaries
Invoke-WebRequest -Uri 'https://www.google.com/favicon.ico' -OutFile "$inputDir/sample.ico"
Invoke-WebRequest -Uri 'https://www.gstatic.com/webp/gallery/1.webp' -OutFile "$inputDir/sample.webp"
Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/alexcorvi/heic2any/master/demo/1.heic' -OutFile "$inputDir/sample.heic"

# HEIF placeholder using same HEIC bytes (extension-level coverage)
Copy-Item "$inputDir/sample.heic" "$inputDir/sample.heif" -Force
