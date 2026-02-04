# Unifile - Universal Offline File Converter

<p align="center">
  <img src="https://img.shields.io/badge/Privacy-100%25%20Offline-green?style=for-the-badge" alt="100% Offline">
  <img src="https://img.shields.io/badge/Platform-All%20Devices-blue?style=for-the-badge" alt="All Platforms">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/badge/Formats-80%2B-purple?style=for-the-badge" alt="80+ Formats">
</p>

**Unifile** is a powerful, privacy-focused universal file converter that runs entirely in your browser. Convert images, documents, audio, and video – all offline. No uploads, no servers, no tracking – your files never leave your device.

🔗 **Live Demo:** [https://sukantsondhi.com/unifile](https://sukantsondhi.com/unifile)

---

## ✨ Features

### 🔒 100% Private & Secure

- All processing happens locally in your browser
- Your files are **never uploaded** to any server
- Works completely offline after initial load
- No tracking, no analytics, no data collection

### 🖼️ Image Conversion (36 formats)

**Input Formats:**
- Popular: PNG, JPG, WebP, GIF, HEIC, AVIF
- Professional: PSD, RAW, CR2, CR3, NEF, DNG, ARW, RW2, ORF, SRF
- Legacy: BMP, ICO, TIFF, TIF, TGA, PCX, PBM, PGM, PPM, PNM
- Other: SVG, HEIF, JXL, HDR, EXR, JFIF, JPE, CUR, ICNS

**Output Formats:** PNG, JPG, WebP, GIF, BMP, ICO, AVIF, PDF

### 📄 Document Conversion (13 formats)

**Input Formats:** PDF, DOCX, TXT, MD (Markdown), HTML, RTF, CSV, TSV, JSON, XML, ODT, EPUB

**Output Formats:** PDF, TXT, HTML, Markdown

### 🎵 Audio Conversion (21 formats)

**Input Formats:** MP3, WAV, FLAC, AAC, OGG, M4A, OGA, OPUS, ALAC, WMA, AMR, AC3, AIFF, AIF, AIFC, AU, M4B, WEBA, MP2, MPC, VOC

**Output Formats:** MP3, WAV, OGG, AAC, M4A, FLAC, OPUS, WEBA

### 🎬 Video Conversion (22 formats)

**Input Formats:** MP4, WebM, AVI, MOV, MKV, WMV, FLV, F4V, MPG, MPEG, M4V, 3GP, 3G2, OGV, TS, MTS, M2TS, VOB, RM, RMVB, DIVX, MXF

**Output Formats:** MP4, WebM, AVI, MOV, GIF, MP3 (audio extraction)

### 🔗 Cross-Format Merging

- Merge **images + documents** into a single PDF
- Drag & drop reordering before merge
- Mix different file types in one operation

### 🎨 Modern User Interface

- Clean, intuitive tabbed design
- **Dark/Light mode toggle** with persistence
- **Responsive layout** - works on desktop, tablet, and mobile
- Visual file previews
- Progress indicators
- Colorful category indicators

### 📱 Cross-Platform

Works on all modern browsers across:

- ✅ Windows
- ✅ macOS
- ✅ Linux
- ✅ iOS (iPhone/iPad)
- ✅ Android
- ✅ ChromeOS

---

## 🚀 Quick Start

### Option 1: Use Online (Recommended)

Simply visit **[sukantsondhi.com/unifile](https://sukantsondhi.com/unifile)** – no installation required!

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/Sukantsondhi/unifile.git
cd unifile

# Serve with any HTTP server
# Using Python:
python -m http.server 8000

# Using Node.js:
npx serve

# Using PHP:
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Deploy to GitHub Pages

1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" → `main` → `/ (root)`
4. Your site will be live at `https://yourusername.github.io/unifile`

---

## 📖 How to Use

### Converting Files

1. Select a **category tab** (Images, Documents, Audio, Video)
2. Choose **"Convert"** mode
3. Drag and drop files into the drop zone (or click to browse)
4. Select your output format
5. Adjust quality if needed
6. Click **"Convert"** to download

### Merging Files

1. Select a category or use cross-format merge
2. Choose **"Merge"** mode
3. Drag and drop multiple files
4. Reorder files by dragging them in the list
5. Click **"Merge & Download"**
6. Your merged PDF will download automatically

---

## 🛠️ Technical Details

### Built With

- **Vanilla JavaScript** - No framework dependencies
- **[PDF-Lib](https://pdf-lib.js.org/)** - PDF creation and manipulation
- **[heic2any](https://github.com/nicholascostadev/heic2any)** - HEIC/HEIF conversion
- **[Showdown](https://github.com/showdownjs/showdown)** - Markdown to HTML conversion
- **Canvas API** - Image processing and format conversion
- **CSS Custom Properties** - Theming and dark/light mode
- **Drag and Drop API** - File reordering

### Browser Support

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome  | 60+             |
| Firefox | 55+             |
| Safari  | 11+             |
| Edge    | 79+             |
| Opera   | 47+             |

### Supported Formats Summary

| Category  | Input Formats | Output Formats |
| --------- | ------------- | -------------- |
| Images    | 36 formats    | 8 formats      |
| Documents | 13 formats    | 4 formats      |
| Audio     | 21 formats    | 8 formats      |
| Video     | 22 formats    | 6 formats      |
| **Total** | **92 formats**| **26 formats** |

---

## 🌐 Deployment Options

### GitHub Pages (Free)

Perfect for static hosting with custom domain support.

### Custom Domain with Cloudflare

If you're hosting your domain on Cloudflare:

1. Deploy to GitHub Pages first
2. In Cloudflare, create a CNAME record pointing to your GitHub Pages
3. Or use Cloudflare Pages for direct deployment

### Azure Static Web Apps

```bash
# Using Azure CLI
az staticwebapp create \
  --name unifile \
  --resource-group my-resource-group \
  --source https://github.com/Sukantsondhi/unifile \
  --branch main \
  --app-location "/" \
  --output-location "/"
```

### Netlify / Vercel

Simply connect your GitHub repository – no configuration needed.

---

## 📁 Project Structure

```
unifile/
├── index.html          # Main application
├── styles.css          # All styles (dark/light mode)
├── app.js              # Application logic
├── documentation.html  # Detailed documentation page
├── README.md           # This file
└── LICENSE             # MIT License
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contributions

- [ ] Full FFmpeg.wasm integration for video transcoding
- [ ] PDF splitting functionality
- [ ] PDF compression options
- [ ] Batch rename files before download
- [ ] PWA support for offline installation
- [ ] Localization/i18n support

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Sukant Sondhi**

- Website: [sukantsondhi.com](https://sukantsondhi.com)
- GitHub: [@Sukantsondhi](https://github.com/Sukantsondhi)
- Email: sukantsondhi@gmail.com

---

## 🙏 Acknowledgments

- [PDF-Lib](https://pdf-lib.js.org/) for excellent PDF manipulation
- [heic2any](https://github.com/nicholascostadev/heic2any) for HEIC conversion
- [Showdown](https://github.com/showdownjs/showdown) for Markdown parsing
- Icons inspired by [Feather Icons](https://feathericons.com/)

---

## ⭐ Support

If you found this project helpful, please consider giving it a star! ⭐

---

<p align="center">
  <strong>Your files. Your device. Your privacy.</strong><br>
  Made with ❤️ by Sukant Sondhi
</p>
