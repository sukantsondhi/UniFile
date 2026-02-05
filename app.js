/**
 * Unifile - Universal Offline File Converter
 * Built by Sukant Sondhi
 *
 * A fully client-side file processing application.
 * Supports images, documents, audio, and video.
 * All operations happen locally in your browser.
 */

// ========================================
// Format Definitions
// ========================================
const FORMATS = {
  images: {
    input: [
      "png",
      "jpg",
      "jpeg",
      "webp",
      "gif",
      "bmp",
      "ico",
      "svg",
      "tiff",
      "tif",
      "heic",
      "heif",
      "avif",
      "jxl",
      "psd",
      "raw",
      "cr2",
      "nef",
      "dng",
      "hdr",
      "exr",
      "tga",
      "pcx",
      "pbm",
      "pgm",
      "ppm",
      "pnm",
      "jfif",
      "jpe",
      "cur",
      "icns",
      "arw",
      "rw2",
      "orf",
      "cr3",
      "srf",
    ],
    output: ["png", "jpg", "webp", "gif", "bmp", "ico", "avif", "pdf"],
    popular: ["png", "jpg", "webp", "gif", "heic", "avif"],
    mimeTypes: {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
      bmp: "image/bmp",
      ico: "image/x-icon",
      avif: "image/avif",
      svg: "image/svg+xml",
    },
  },
  documents: {
    input: [
      "pdf",
      "txt",
      "md",
      "html",
      "htm",
      "rtf",
      "csv",
      "tsv",
      "json",
      "xml",
      "docx",
      "odt",
      "epub",
    ],
    output: ["pdf", "txt", "html", "md"],
    popular: ["pdf", "docx", "txt", "md", "html"],
    mimeTypes: {
      pdf: "application/pdf",
      txt: "text/plain",
      html: "text/html",
      md: "text/markdown",
      json: "application/json",
      csv: "text/csv",
    },
  },
  audio: {
    input: [
      "mp3",
      "wav",
      "flac",
      "ogg",
      "oga",
      "opus",
      "aac",
      "alac",
      "m4a",
      "wma",
      "amr",
      "ac3",
      "aiff",
      "aif",
      "aifc",
      "au",
      "m4b",
      "weba",
      "mp2",
      "mpc",
      "voc",
    ],
    output: ["mp3", "wav", "ogg", "aac", "m4a", "flac", "opus", "weba"],
    popular: ["mp3", "wav", "flac", "aac", "ogg", "m4a"],
    mimeTypes: {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      flac: "audio/flac",
      aac: "audio/aac",
      m4a: "audio/m4a",
      weba: "audio/webm",
    },
  },
  video: {
    input: [
      "mp4",
      "webm",
      "avi",
      "mov",
      "mkv",
      "wmv",
      "flv",
      "f4v",
      "mpg",
      "mpeg",
      "m4v",
      "3gp",
      "3g2",
      "ogv",
      "ts",
      "mts",
      "m2ts",
      "vob",
      "rm",
      "rmvb",
      "divx",
      "mxf",
    ],
    output: ["mp4", "webm", "avi", "mov", "gif", "mp3"],
    popular: ["mp4", "webm", "avi", "mov", "mkv"],
    mimeTypes: {
      mp4: "video/mp4",
      webm: "video/webm",
      avi: "video/x-msvideo",
      mov: "video/quicktime",
      mkv: "video/x-matroska",
    },
  },
};

// ========================================
// App State
// ========================================
const state = {
  files: [],
  category: "images",
  mode: "convert",
  outputFormat: "png",
  quality: 90,
  bitrate: 192,
  draggedItem: null,
  ffmpegLoaded: false,
  ffmpegLoading: false,
};

// ========================================
// DOM Elements
// ========================================
const elements = {
  dropZone: document.getElementById("dropZone"),
  fileInput: document.getElementById("fileInput"),
  fileList: document.getElementById("fileList"),
  fileListContainer: document.getElementById("fileListContainer"),
  fileCount: document.getElementById("fileCount"),
  processBtn: document.getElementById("processBtn"),
  processBtnText: document.getElementById("processBtnText"),
  progressContainer: document.getElementById("progressContainer"),
  progressFill: document.getElementById("progressFill"),
  progressText: document.getElementById("progressText"),
  progressStatus: document.getElementById("progressStatus"),
  progressPercent: document.getElementById("progressPercent"),
  conversionOptions: document.getElementById("conversionOptions"),
  outputFormat: document.getElementById("outputFormat"),
  qualitySlider: document.querySelector(".quality-slider"),
  qualityValue: document.getElementById("qualityValue"),
  qualityInput: document.getElementById("quality"),
  bitrateInput: document.getElementById("bitrateInput"),
  bitrateSlider: document.getElementById("bitrate"),
  bitrateValue: document.getElementById("bitrateValue"),
  qualityOptions: document.getElementById("qualityOptions"),
  clearAllBtn: document.getElementById("clearAllBtn"),
  addMoreBtn: document.getElementById("addMoreBtn"),
  modeButtons: document.querySelectorAll(".mode-btn"),
  categoryTabs: document.querySelectorAll(".category-tab"),
  formatsTabs: document.querySelectorAll(".formats-tab"),
  supportedFormats: document.getElementById("supportedFormats"),
  detectedFormatValue: document.getElementById("detectedFormatValue"),
  formatNote: document.getElementById("formatNote"),
  ffmpegNotice: document.getElementById("ffmpegNotice"),
};

// ========================================
// Utility Functions
// ========================================

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileExtension(filename) {
  return filename.split(".").pop().toLowerCase();
}

function detectCategory(extension) {
  for (const [category, formats] of Object.entries(FORMATS)) {
    if (formats.input.includes(extension)) {
      return category;
    }
  }
  return "images"; // Default
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Ensure we have valid dimensions
      if (img.width === 0 || img.height === 0) {
        // Try to get natural dimensions
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          resolve(img);
        } else {
          reject(new Error("Image has zero dimensions"));
        }
      } else {
        resolve(img);
      }
    };
    img.onerror = (e) => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

// Escape HTML special characters
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Simple CSV parser
function parseCSV(content, delimiter = ",") {
  const rows = [];
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    if (line.trim() === "") continue;

    const row = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        row.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

async function convertHeicToJpeg(file) {
  try {
    const blob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: state.quality / 100,
    });
    return Array.isArray(blob) ? blob[0] : blob;
  } catch (error) {
    console.error("HEIC conversion error:", error);
    throw new Error("Failed to convert HEIC file.");
  }
}

// ========================================
// File Management
// ========================================

async function addFiles(fileList) {
  const newFiles = [];

  for (const file of fileList) {
    const ext = getFileExtension(file.name);
    const category = detectCategory(ext);

    // Auto-switch category based on first file if no files yet (only in convert mode)
    if (
      state.files.length === 0 &&
      newFiles.length === 0 &&
      state.mode === "convert"
    ) {
      switchCategory(category);
    }

    const fileData = {
      id: generateId(),
      file: file,
      name: file.name,
      size: file.size,
      extension: ext,
      category: category,
      preview: null,
    };

    // Generate preview for images
    if (
      category === "images" &&
      !["heic", "heif", "psd", "raw", "cr2", "nef"].includes(ext)
    ) {
      try {
        fileData.preview = await readFileAsDataURL(file);
      } catch (e) {
        console.warn("Could not generate preview for:", file.name);
      }
    }

    newFiles.push(fileData);
  }

  state.files = [...state.files, ...newFiles];

  // Update detected format display
  if (state.files.length > 0) {
    const formats = [
      ...new Set(state.files.map((f) => f.extension.toUpperCase())),
    ];
    elements.detectedFormatValue.textContent = formats.join(", ");
  }

  updateUI();
}

function removeFile(id) {
  state.files = state.files.filter((f) => f.id !== id);
  updateUI();
}

function clearAllFiles() {
  state.files = [];
  elements.detectedFormatValue.textContent = "--";
  updateUI();
}

function moveFile(fromIndex, toIndex) {
  const files = [...state.files];
  const [movedFile] = files.splice(fromIndex, 1);
  files.splice(toIndex, 0, movedFile);
  state.files = files;
  updateUI();
}

// ========================================
// Category & Mode Switching
// ========================================

function switchCategory(category) {
  state.category = category;

  // Update active tab
  elements.categoryTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.category === category);
  });

  // Update file input accept attribute
  const formats = FORMATS[category].input;
  elements.fileInput.accept = formats.map((f) => `.${f}`).join(",");

  // Update supported formats display
  updateSupportedFormats();

  // Update output format dropdown
  updateOutputFormats();

  // Update quality/bitrate visibility
  updateQualityControls();

  // Clear files when switching category
  if (state.files.length > 0) {
    const filesInCategory = state.files.filter((f) => f.category === category);
    if (filesInCategory.length === 0) {
      clearAllFiles();
    }
  }
}

function switchMode(mode) {
  state.mode = mode;

  elements.modeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  // In merge mode, allow all file types for cross-category merging
  if (mode === "merge") {
    const allFormats = [
      ...FORMATS.images.input,
      ...FORMATS.documents.input,
      ...FORMATS.audio.input,
      ...FORMATS.video.input,
    ];
    elements.fileInput.accept = allFormats.map((f) => `.${f}`).join(",");

    // Update output format to merge-compatible formats
    elements.outputFormat.innerHTML = `
      <option value="pdf">PDF (Universal)</option>
    `;
    state.outputFormat = "pdf";
  } else {
    // Restore category-specific formats
    const formats = FORMATS[state.category].input;
    elements.fileInput.accept = formats.map((f) => `.${f}`).join(",");
    updateOutputFormats();
  }

  updateUI();
}

function updateSupportedFormats() {
  const formats = FORMATS[state.category];
  const popular = formats.popular || formats.input.slice(0, 6);
  const others = formats.input.filter((f) => !popular.includes(f));

  let html = popular
    .map((f) => `<span class="format-badge popular">${f.toUpperCase()}</span>`)
    .join("");

  if (others.length > 0) {
    html += `<span class="format-badge more">+${others.length} more</span>`;
  }

  elements.supportedFormats.innerHTML = html;
}

function updateOutputFormats() {
  const formats = FORMATS[state.category].output;

  elements.outputFormat.innerHTML = formats
    .map((f) => `<option value="${f}">${f.toUpperCase()}</option>`)
    .join("");

  state.outputFormat = formats[0];
}

function updateQualityControls() {
  const category = state.category;
  const format = state.outputFormat;

  // Show quality slider for images
  const showQuality =
    category === "images" && ["jpg", "webp", "avif"].includes(format);
  elements.qualitySlider.classList.toggle("hidden", !showQuality);

  // Show bitrate slider for audio
  const showBitrate = category === "audio";
  elements.bitrateInput.classList.toggle("hidden", !showBitrate);
}

// ========================================
// UI Updates
// ========================================

function updateUI() {
  renderFileList();
  updateVisibility();
  updateProcessButton();
}

function renderFileList() {
  elements.fileList.innerHTML = "";
  elements.fileCount.textContent = state.files.length;

  state.files.forEach((fileData, index) => {
    const li = createFileListItem(fileData, index);
    elements.fileList.appendChild(li);
  });
}

function createFileListItem(fileData, index) {
  const li = document.createElement("li");
  li.className = "file-item";
  li.draggable = true;
  li.dataset.id = fileData.id;
  li.dataset.index = index;

  // Get icon based on category
  const iconSvg = getCategoryIcon(fileData.category);

  li.innerHTML = `
        <span class="drag-handle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="6" r="1"></circle>
                <circle cx="9" cy="12" r="1"></circle>
                <circle cx="9" cy="18" r="1"></circle>
                <circle cx="15" cy="6" r="1"></circle>
                <circle cx="15" cy="12" r="1"></circle>
                <circle cx="15" cy="18" r="1"></circle>
            </svg>
        </span>
        <div class="file-icon ${fileData.category}">${iconSvg}</div>
        <div class="file-info">
            <div class="file-name" title="${fileData.name}">${fileData.name}</div>
            <div class="file-meta">
                <span class="file-size">${formatFileSize(fileData.size)}</span>
                <span class="file-format">${fileData.extension}</span>
            </div>
        </div>
        ${fileData.preview ? `<img class="file-preview" src="${fileData.preview}" alt="Preview">` : ""}
        <button class="remove-btn" title="Remove file">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

  // Event listeners
  li.querySelector(".remove-btn").onclick = (e) => {
    e.stopPropagation();
    removeFile(fileData.id);
  };

  li.addEventListener("dragstart", handleDragStart);
  li.addEventListener("dragend", handleDragEnd);
  li.addEventListener("dragover", handleDragOver);
  li.addEventListener("drop", handleDrop);
  li.addEventListener("dragenter", handleDragEnter);
  li.addEventListener("dragleave", handleDragLeave);

  return li;
}

function getCategoryIcon(category) {
  const icons = {
    images: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
        </svg>`,
    documents: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>`,
    audio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
        </svg>`,
    video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>`,
  };
  return icons[category] || icons.images;
}

function updateVisibility() {
  const hasFiles = state.files.length > 0;

  elements.fileListContainer.classList.toggle("hidden", !hasFiles);
  elements.processBtn.classList.toggle("hidden", !hasFiles);
  elements.conversionOptions.classList.toggle("hidden", !hasFiles);

  updateQualityControls();
}

function updateProcessButton() {
  const count = state.files.length;
  const format = state.outputFormat.toUpperCase();

  if (state.mode === "merge") {
    const formats = [
      ...new Set(state.files.map((f) => f.extension.toUpperCase())),
    ];
    const formatText =
      formats.length > 1 ? `${formats.length} formats` : formats[0] || "files";
    elements.processBtnText.textContent = `Merge ${count} Files (${formatText}) → ${format}`;
  } else {
    elements.processBtnText.textContent = `Convert ${count} File${count > 1 ? "s" : ""} to ${format}`;
  }
}

function showProgress(show, status = "Processing...", text = "", percent = 0) {
  elements.progressContainer.classList.toggle("hidden", !show);
  elements.processBtn.classList.toggle("hidden", show);
  elements.progressStatus.textContent = status;
  elements.progressText.textContent = text;
  elements.progressPercent.textContent = `${Math.round(percent)}%`;
  elements.progressFill.style.width = `${percent}%`;
}

// ========================================
// Drag and Drop (File List Reordering)
// ========================================

function handleDragStart(e) {
  state.draggedItem = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragEnd() {
  this.classList.remove("dragging");
  document.querySelectorAll(".file-item").forEach((item) => {
    item.classList.remove("drag-over");
  });
  state.draggedItem = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDragEnter(e) {
  e.preventDefault();
  if (this !== state.draggedItem) {
    this.classList.add("drag-over");
  }
}

function handleDragLeave() {
  this.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove("drag-over");

  if (state.draggedItem && this !== state.draggedItem) {
    const fromIndex = parseInt(state.draggedItem.dataset.index);
    const toIndex = parseInt(this.dataset.index);
    moveFile(fromIndex, toIndex);
  }
}

// ========================================
// Drag and Drop (File Upload)
// ========================================

function setupDropZone() {
  const dropZone = elements.dropZone;

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(
      eventName,
      () => {
        dropZone.classList.add("drag-over");
      },
      false,
    );
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(
      eventName,
      () => {
        dropZone.classList.remove("drag-over");
      },
      false,
    );
  });

  dropZone.addEventListener(
    "drop",
    async (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        await addFiles(files);
      }
    },
    false,
  );

  // Click to open file explorer
  dropZone.addEventListener("click", () => {
    elements.fileInput.click();
  });

  // Add cursor pointer style
  dropZone.style.cursor = "pointer";
}

// ========================================
// Image Processing
// ========================================

async function processImages() {
  const results = [];
  const errors = [];
  const total = state.files.length;

  for (let i = 0; i < state.files.length; i++) {
    const fileData = state.files[i];
    showProgress(true, "Converting...", fileData.name, ((i + 1) / total) * 100);

    try {
      let imageSrc;

      // Handle HEIC
      if (["heic", "heif"].includes(fileData.extension)) {
        try {
          const jpegBlob = await convertHeicToJpeg(fileData.file);
          imageSrc = URL.createObjectURL(jpegBlob);
        } catch (heicError) {
          console.warn(
            `HEIC conversion failed for ${fileData.name}:`,
            heicError,
          );
          errors.push(fileData.name);
          continue;
        }
      } else {
        imageSrc = fileData.preview || (await readFileAsDataURL(fileData.file));
      }

      let img;
      try {
        img = await loadImage(imageSrc);
      } catch (loadError) {
        console.warn(`Could not load image ${fileData.name}:`, loadError);
        errors.push(fileData.name);
        if (imageSrc.startsWith("blob:")) URL.revokeObjectURL(imageSrc);
        continue;
      }

      const canvas = document.createElement("canvas");

      // Handle ICO sizing
      if (state.outputFormat === "ico") {
        canvas.width = 256;
        canvas.height = 256;
      } else {
        canvas.width = img.width || 800;
        canvas.height = img.height || 600;
      }

      const ctx = canvas.getContext("2d");

      // White background for JPEG (to handle transparency)
      if (state.outputFormat === "jpg" || state.outputFormat === "jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw image
      if (state.outputFormat === "ico") {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(img, 0, 0);
      }

      const mimeType =
        FORMATS.images.mimeTypes[state.outputFormat] || "image/png";
      const quality = ["jpg", "jpeg", "webp", "avif"].includes(
        state.outputFormat,
      )
        ? state.quality / 100
        : undefined;

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
          mimeType,
          quality,
        );
      });

      results.push({
        blob,
        name: fileData.name.replace(/\.[^.]+$/, `.${state.outputFormat}`),
      });

      if (imageSrc.startsWith("blob:")) URL.revokeObjectURL(imageSrc);
    } catch (error) {
      console.error(`Error converting ${fileData.name}:`, error);
      errors.push(fileData.name);
    }
  }

  // Notify user of any errors
  if (errors.length > 0 && results.length > 0) {
    console.warn(
      `Failed to convert ${errors.length} file(s): ${errors.join(", ")}`,
    );
  }

  return results;
}

async function mergeImagesToPdf() {
  const { PDFDocument } = PDFLib;
  const mergedPdf = await PDFDocument.create();
  const total = state.files.length;

  for (let i = 0; i < state.files.length; i++) {
    const fileData = state.files[i];
    showProgress(true, "Merging...", fileData.name, ((i + 1) / total) * 100);

    try {
      // Always convert via canvas for reliability - this ensures consistent results
      const { imageBytes, width, height, format } =
        await convertFileToImageBytes(fileData);

      let image;
      if (format === "jpeg") {
        image = await mergedPdf.embedJpg(imageBytes);
      } else {
        image = await mergedPdf.embedPng(imageBytes);
      }

      // Use the actual embedded image dimensions from pdf-lib
      const imgWidth = image.width;
      const imgHeight = image.height;

      // Create page with image dimensions (limit to reasonable size)
      const maxDim = 3000;
      let pageWidth = imgWidth;
      let pageHeight = imgHeight;

      if (pageWidth > maxDim || pageHeight > maxDim) {
        const scale = Math.min(maxDim / pageWidth, maxDim / pageHeight);
        pageWidth = Math.round(pageWidth * scale);
        pageHeight = Math.round(pageHeight * scale);
      }

      const page = mergedPdf.addPage([pageWidth, pageHeight]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });

      console.log(`Added ${fileData.name} to PDF: ${pageWidth}x${pageHeight}`);
    } catch (error) {
      console.error(`Error processing ${fileData.name}:`, error);
    }
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}

// Convert any image file to bytes that can be embedded in PDF
async function convertFileToImageBytes(fileData) {
  // First, read the file and draw it to canvas
  // This handles ALL formats consistently including GIF, WEBP, BMP, etc.

  const dataUrl = await readFileAsDataURL(fileData.file);

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        if (!width || !height || width <= 0 || height <= 0) {
          reject(new Error(`Invalid image dimensions: ${width}x${height}`));
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        // White background (important for transparency and JPEG conversion)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);

        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG for smaller file size and better compatibility
        const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const base64 = jpegDataUrl.split(",")[1];

        if (!base64) {
          reject(new Error("Failed to convert canvas to data URL"));
          return;
        }

        // Decode base64 to bytes
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        resolve({
          imageBytes: bytes,
          width: width,
          height: height,
          format: "jpeg",
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${fileData.name}`));
    };

    img.src = dataUrl;
  });
}

// ========================================
// Document Processing
// ========================================

async function processDocuments() {
  const results = [];
  const errors = [];
  const total = state.files.length;

  for (let i = 0; i < state.files.length; i++) {
    const fileData = state.files[i];
    showProgress(true, "Converting...", fileData.name, ((i + 1) / total) * 100);

    try {
      let content = await readFileAsText(fileData.file);
      let outputContent;
      let mimeType;

      // Convert based on input and output format
      if (state.outputFormat === "html") {
        if (fileData.extension === "md") {
          // Markdown to HTML
          const converter = new showdown.Converter();
          outputContent = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${fileData.name}</title>
<style>body{font-family:system-ui;max-width:800px;margin:40px auto;padding:20px;line-height:1.6}</style>
</head>
<body>${converter.makeHtml(content)}</body>
</html>`;
        } else if (fileData.extension === "txt") {
          outputContent = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${fileData.name}</title></head>
<body><pre>${escapeHtml(content)}</pre></body>
</html>`;
        } else if (fileData.extension === "json") {
          let formattedJson;
          try {
            formattedJson = JSON.stringify(JSON.parse(content), null, 2);
          } catch (e) {
            formattedJson = content;
          }
          outputContent = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${fileData.name}</title>
<style>pre{background:#f5f5f5;padding:20px;overflow:auto}</style>
</head>
<body><pre>${escapeHtml(formattedJson)}</pre></body>
</html>`;
        } else if (
          fileData.extension === "csv" ||
          fileData.extension === "tsv"
        ) {
          // Convert CSV/TSV to HTML table
          const delimiter = fileData.extension === "tsv" ? "\t" : ",";
          const rows = parseCSV(content, delimiter);
          let tableHtml = "<table border='1' cellpadding='8' cellspacing='0'>";
          rows.forEach((row, idx) => {
            const tag = idx === 0 ? "th" : "td";
            tableHtml +=
              "<tr>" +
              row
                .map((cell) => `<${tag}>${escapeHtml(cell)}</${tag}>`)
                .join("") +
              "</tr>";
          });
          tableHtml += "</table>";
          outputContent = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${fileData.name}</title>
<style>table{border-collapse:collapse;width:100%}th,td{text-align:left}th{background:#f0f0f0}</style>
</head>
<body>${tableHtml}</body>
</html>`;
        } else {
          outputContent = content;
        }
        mimeType = "text/html";
      } else if (state.outputFormat === "txt") {
        // Strip HTML tags if HTML
        if (fileData.extension === "html" || fileData.extension === "htm") {
          const doc = new DOMParser().parseFromString(content, "text/html");
          outputContent = doc.body.textContent || "";
        } else if (fileData.extension === "json") {
          try {
            outputContent = JSON.stringify(JSON.parse(content), null, 2);
          } catch (e) {
            outputContent = content;
          }
        } else if (
          fileData.extension === "csv" ||
          fileData.extension === "tsv"
        ) {
          // Convert CSV/TSV to readable text
          const delimiter = fileData.extension === "tsv" ? "\t" : ",";
          const rows = parseCSV(content, delimiter);
          outputContent = rows.map((row) => row.join(" | ")).join("\n");
        } else {
          outputContent = content;
        }
        mimeType = "text/plain";
      } else if (state.outputFormat === "md") {
        // Basic conversion to markdown
        if (fileData.extension === "txt") {
          outputContent = content;
        } else if (fileData.extension === "json") {
          try {
            outputContent =
              "```json\n" +
              JSON.stringify(JSON.parse(content), null, 2) +
              "\n```";
          } catch (e) {
            outputContent = "```\n" + content + "\n```";
          }
        } else if (
          fileData.extension === "csv" ||
          fileData.extension === "tsv"
        ) {
          // Convert CSV/TSV to markdown table
          const delimiter = fileData.extension === "tsv" ? "\t" : ",";
          const rows = parseCSV(content, delimiter);
          if (rows.length > 0) {
            outputContent = "| " + rows[0].join(" | ") + " |\n";
            outputContent +=
              "| " + rows[0].map(() => "---").join(" | ") + " |\n";
            for (let i = 1; i < rows.length; i++) {
              outputContent += "| " + rows[i].join(" | ") + " |\n";
            }
          } else {
            outputContent = content;
          }
        } else {
          outputContent = content;
        }
        mimeType = "text/markdown";
      } else if (state.outputFormat === "pdf") {
        // Text to PDF
        const { PDFDocument, StandardFonts, rgb } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const lines = content.split("\n");
        const fontSize = 12;
        const margin = 50;
        const pageWidth = 612;
        const pageHeight = 792;
        const maxWidth = pageWidth - margin * 2;
        const lineHeight = fontSize * 1.5;

        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

        for (const line of lines) {
          if (y < margin + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }

          page.drawText(line.substring(0, 80), {
            x: margin,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          y -= lineHeight;
        }

        const pdfBytes = await pdfDoc.save();
        results.push({
          blob: new Blob([pdfBytes], { type: "application/pdf" }),
          name: fileData.name.replace(/\.[^.]+$/, ".pdf"),
        });
        continue;
      }

      results.push({
        blob: new Blob([outputContent], { type: mimeType }),
        name: fileData.name.replace(/\.[^.]+$/, `.${state.outputFormat}`),
      });
    } catch (error) {
      console.error(`Error converting ${fileData.name}:`, error);
      errors.push(fileData.name);
    }
  }

  // Notify about errors
  if (errors.length > 0 && results.length > 0) {
    console.warn(
      `Failed to convert ${errors.length} file(s): ${errors.join(", ")}`,
    );
  }

  return results;
}

async function mergeDocumentsToPdf() {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const mergedPdf = await PDFDocument.create();
  const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const total = state.files.length;

  for (let i = 0; i < state.files.length; i++) {
    const fileData = state.files[i];
    showProgress(true, "Merging...", fileData.name, ((i + 1) / total) * 100);

    try {
      if (fileData.extension === "pdf") {
        // Merge existing PDF using robust approach
        try {
          await mergePdfIntoDocument(mergedPdf, fileData.file, fileData.name);
        } catch (pdfError) {
          console.error(`Could not merge PDF ${fileData.name}:`, pdfError);
          // Add a placeholder page for corrupted/protected PDFs
          const page = mergedPdf.addPage([612, 792]);
          page.drawText(`Could not process: ${fileData.name}`, {
            x: 50,
            y: 700,
            size: 12,
            font: font,
            color: rgb(0.6, 0.3, 0.1),
          });
          page.drawText(`Error: ${pdfError.message || "Unknown error"}`, {
            x: 50,
            y: 670,
            size: 10,
            font: font,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      } else {
        // Convert text to PDF page
        let content = await readFileAsText(fileData.file);

        // Handle different formats
        if (fileData.extension === "json") {
          try {
            content = JSON.stringify(JSON.parse(content), null, 2);
          } catch (e) {
            // Keep original content if JSON parsing fails
          }
        } else if (["html", "htm"].includes(fileData.extension)) {
          const doc = new DOMParser().parseFromString(content, "text/html");
          content = doc.body.textContent || content;
        } else if (fileData.extension === "md") {
          // Strip basic markdown formatting
          content = content
            .replace(/#{1,6}\s/g, "")
            .replace(/\*\*(.+?)\*\*/g, "$1")
            .replace(/\*(.+?)\*/g, "$1")
            .replace(/\[(.+?)\]\(.+?\)/g, "$1");
        }

        const lines = content.split("\n");
        const fontSize = 11;
        const margin = 50;
        const pageHeight = 792;
        const lineHeight = fontSize * 1.4;
        const maxCharsPerLine = 85;

        let page = mergedPdf.addPage([612, pageHeight]);
        let y = pageHeight - margin;

        // Add filename header
        page.drawText(fileData.name, {
          x: margin,
          y: y,
          size: 10,
          font: font,
          color: rgb(0.4, 0.4, 0.4),
        });
        y -= lineHeight * 2;

        for (const line of lines) {
          // Word wrap long lines
          const wrappedLines = [];
          if (line.length > maxCharsPerLine) {
            for (let j = 0; j < line.length; j += maxCharsPerLine) {
              wrappedLines.push(line.substring(j, j + maxCharsPerLine));
            }
          } else {
            wrappedLines.push(line);
          }

          for (const wrappedLine of wrappedLines) {
            if (y < margin + lineHeight) {
              page = mergedPdf.addPage([612, pageHeight]);
              y = pageHeight - margin;
            }

            // Sanitize text for PDF (remove special characters that cause issues)
            const sanitized = wrappedLine.replace(/[\x00-\x1F\x7F]/g, "");

            try {
              page.drawText(sanitized, {
                x: margin,
                y: y,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
              });
            } catch (e) {
              // Skip lines with unsupported characters
            }
            y -= lineHeight;
          }
        }
      }
    } catch (error) {
      console.error(`Error processing ${fileData.name}:`, error);
    }
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}

// ========================================
// Universal Merge (Cross-Category)
// ========================================

async function mergeAllToPdf() {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const mergedPdf = await PDFDocument.create();
  const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const total = state.files.length;
  let successCount = 0;

  for (let i = 0; i < state.files.length; i++) {
    const fileData = state.files[i];
    showProgress(
      true,
      "Merging...",
      `${fileData.name} (${i + 1}/${total})`,
      ((i + 1) / total) * 100,
    );

    try {
      // Handle based on file category/type
      if (fileData.category === "images") {
        // Embed image as PDF page
        await addImageToPdf(mergedPdf, fileData);
        successCount++;
      } else if (fileData.extension === "pdf") {
        // Merge existing PDF pages using robust approach
        try {
          await mergePdfIntoDocument(mergedPdf, fileData.file, fileData.name);
          successCount++;
        } catch (pdfError) {
          console.error(`Could not merge PDF ${fileData.name}:`, pdfError);
          // Add a placeholder page for corrupted/protected PDFs
          const page = mergedPdf.addPage([612, 792]);
          page.drawText(`Could not process: ${fileData.name}`, {
            x: 50,
            y: 700,
            size: 12,
            font: font,
            color: rgb(0.6, 0.3, 0.1),
          });
          page.drawText(`Error: ${pdfError.message || "Unknown error"}`, {
            x: 50,
            y: 670,
            size: 10,
            font: font,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      } else if (fileData.category === "documents") {
        // Convert text document to PDF pages
        await addTextToPdf(mergedPdf, fileData, font);
        successCount++;
      } else {
        // For audio/video, add info page
        const page = mergedPdf.addPage([612, 792]);
        page.drawText(`[${fileData.category.toUpperCase()}] ${fileData.name}`, {
          x: 50,
          y: 700,
          size: 14,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        });
        page.drawText(`Size: ${formatFileSize(fileData.size)}`, {
          x: 50,
          y: 670,
          size: 12,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
        });
        page.drawText("(Audio/Video files cannot be embedded in PDF)", {
          x: 50,
          y: 640,
          size: 10,
          font: font,
          color: rgb(0.6, 0.6, 0.6),
        });
        successCount++;
      }
    } catch (error) {
      console.error(`Error processing ${fileData.name}:`, error);
      // Only add error page for truly unrecoverable errors
      try {
        const page = mergedPdf.addPage([612, 792]);
        page.drawText(`Could not process: ${fileData.name}`, {
          x: 50,
          y: 700,
          size: 12,
          font: font,
          color: rgb(0.7, 0.3, 0.1),
        });
        const errorMsg = error.message || "Unknown error";
        page.drawText(`Reason: ${errorMsg.substring(0, 60)}`, {
          x: 50,
          y: 670,
          size: 10,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
        });
      } catch (pageError) {
        console.error("Failed to add error page:", pageError);
      }
    }
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}

// Robust PDF merging function with multiple fallback approaches
async function mergePdfIntoDocument(targetPdf, sourceFile, fileName) {
  const { PDFDocument } = PDFLib;

  // Read the file as Uint8Array
  const fileBytes = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      resolve(new Uint8Array(arrayBuffer));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(sourceFile);
  });

  console.log(`Loading PDF: ${fileName}, size: ${fileBytes.length} bytes`);

  // First try: Direct pdf-lib merging (fastest, preserves vectors)
  let directMergeSucceeded = false;
  try {
    const sourcePdf = await PDFDocument.load(fileBytes, {
      ignoreEncryption: true,
      updateMetadata: false,
    });
    const pageCount = sourcePdf.getPageCount();
    console.log(`PDF ${fileName} has ${pageCount} pages (pdf-lib)`);

    if (pageCount > 0) {
      const pageIndices = sourcePdf.getPageIndices();
      const copiedPages = await targetPdf.copyPages(sourcePdf, pageIndices);

      for (const page of copiedPages) {
        targetPdf.addPage(page);
      }

      console.log(
        `Successfully merged ${pageCount} pages from ${fileName} (direct method)`,
      );
      directMergeSucceeded = true;
      return;
    }
  } catch (directError) {
    console.warn(
      `Direct PDF merge failed for ${fileName}:`,
      directError.message,
    );
  }

  // Fallback: Use PDF.js to render pages as images (handles protected/complex PDFs)
  if (typeof pdfjsLib !== "undefined") {
    console.log(`Trying PDF.js fallback for ${fileName}`);
    try {
      await mergePdfViaRendering(targetPdf, fileBytes, fileName);
      return;
    } catch (renderError) {
      console.error(`PDF.js rendering failed for ${fileName}:`, renderError);
    }
  }

  throw new Error("Could not merge PDF - all methods failed");
}

// Fallback: Render PDF pages to images using PDF.js, then embed
async function mergePdfViaRendering(targetPdf, pdfBytes, fileName) {
  // Try multiple loading strategies for protected/complex PDFs
  let pdfDoc = null;
  const loadingOptions = [
    { data: pdfBytes },
    { data: pdfBytes, password: "" },
    { data: pdfBytes, disableAutoFetch: true },
    { data: pdfBytes, disableStream: true },
    { data: pdfBytes, isEvalSupported: false },
  ];

  for (const options of loadingOptions) {
    try {
      const loadingTask = pdfjsLib.getDocument(options);

      // Handle password-protected PDFs
      loadingTask.onPassword = (updateCallback, reason) => {
        console.log(`PDF ${fileName} requires password, trying empty...`);
        updateCallback("");
      };

      pdfDoc = await loadingTask.promise;
      console.log(
        `PDF.js loaded ${fileName} with options:`,
        Object.keys(options).join(", "),
      );
      break;
    } catch (loadError) {
      console.warn(
        `PDF.js load attempt failed for ${fileName}:`,
        loadError.message,
      );
      continue;
    }
  }

  if (!pdfDoc) {
    throw new Error("PDF.js could not load the document with any strategy");
  }

  const numPages = pdfDoc.numPages;
  console.log(`PDF.js loaded ${fileName}: ${numPages} pages`);

  if (numPages === 0) {
    throw new Error("PDF has no pages");
  }

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum);

      // Render at 2x scale for good quality (increase for bank statements)
      const scale = 2.5;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      const ctx = canvas.getContext("2d");
      // White background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render with high quality settings
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        enableWebGL: false,
        renderInteractiveForms: true,
      };

      await page.render(renderContext).promise;

      // Convert canvas to JPEG with high quality
      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const base64 = jpegDataUrl.split(",")[1];

      if (!base64) {
        console.error(`Failed to render page ${pageNum} of ${fileName}`);
        continue;
      }

      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Embed in target PDF
      const image = await targetPdf.embedJpg(bytes);

      // Create page with original dimensions (not scaled)
      const pageWidth = viewport.width / scale;
      const pageHeight = viewport.height / scale;

      const newPage = targetPdf.addPage([pageWidth, pageHeight]);
      newPage.drawImage(image, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });

      console.log(`Rendered page ${pageNum}/${numPages} of ${fileName}`);
    } catch (pageError) {
      console.error(
        `Error rendering page ${pageNum} of ${fileName}:`,
        pageError,
      );
      // Continue with other pages even if one fails
    }
  }

  console.log(
    `Successfully rendered and merged ${numPages} pages from ${fileName}`,
  );
}

async function addImageToPdf(pdfDoc, fileData) {
  try {
    // Use the same reliable canvas conversion for all image types
    const { imageBytes, width, height, format } =
      await convertFileToImageBytes(fileData);

    let image;
    if (format === "jpeg") {
      image = await pdfDoc.embedJpg(imageBytes);
    } else {
      image = await pdfDoc.embedPng(imageBytes);
    }

    // Use the actual embedded image dimensions from pdf-lib
    const imgWidth = image.width;
    const imgHeight = image.height;

    // Create page with image dimensions (limit to reasonable size)
    const maxDim = 3000;
    let pageWidth = imgWidth;
    let pageHeight = imgHeight;

    if (pageWidth > maxDim || pageHeight > maxDim) {
      const scale = Math.min(maxDim / pageWidth, maxDim / pageHeight);
      pageWidth = Math.round(pageWidth * scale);
      pageHeight = Math.round(pageHeight * scale);
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });

    console.log(
      `Added image ${fileData.name} to PDF: ${pageWidth}x${pageHeight}`,
    );
  } catch (error) {
    console.error(`Failed to embed image ${fileData.name}:`, error);
    throw new Error(`Failed to embed image: ${error.message}`);
  }
}

// Helper function to convert any image via canvas
async function convertImageViaCanvas(file, pdfDoc, outputType = "png") {
  try {
    const dataUrl = await readFileAsDataURL(file);
    const img = await loadImage(dataUrl);

    // Use naturalWidth/naturalHeight as fallback
    const width = img.naturalWidth || img.width || 800;
    const height = img.naturalHeight || img.height || 600;

    if (width === 0 || height === 0) {
      throw new Error("Image has invalid dimensions");
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    // Fill white background for JPEG (transparency issues)
    if (outputType === "jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0, width, height);

    // Convert canvas to blob synchronously using toDataURL
    const mimeType = outputType === "jpeg" ? "image/jpeg" : "image/png";
    const quality = outputType === "jpeg" ? 0.92 : 1.0;
    const dataURL = canvas.toDataURL(mimeType, quality);

    // Extract base64 data
    const base64Data = dataURL.split(",")[1];
    if (!base64Data) {
      throw new Error("Failed to convert canvas to data URL");
    }

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Embed in PDF
    let image;
    if (outputType === "jpeg") {
      image = await pdfDoc.embedJpg(bytes);
    } else {
      image = await pdfDoc.embedPng(bytes);
    }

    return image;
  } catch (error) {
    console.error("convertImageViaCanvas error:", error);
    throw error;
  }
}

async function addTextToPdf(pdfDoc, fileData, font) {
  const { rgb } = PDFLib;
  let content = await readFileAsText(fileData.file);

  // Convert markdown to plain text (strip basic formatting)
  if (fileData.extension === "md") {
    content = content
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1");
  }

  // Convert HTML to plain text
  if (["html", "htm"].includes(fileData.extension)) {
    const doc = new DOMParser().parseFromString(content, "text/html");
    content = doc.body.textContent || "";
  }

  const lines = content.split("\n");
  const fontSize = 11;
  const margin = 50;
  const pageWidth = 612;
  const pageHeight = 792;
  const lineHeight = fontSize * 1.4;
  const maxCharsPerLine = 85;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Add filename header
  page.drawText(fileData.name, {
    x: margin,
    y: y,
    size: 10,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= lineHeight * 2;

  for (const line of lines) {
    // Word wrap long lines
    const wrappedLines = [];
    if (line.length > maxCharsPerLine) {
      for (let i = 0; i < line.length; i += maxCharsPerLine) {
        wrappedLines.push(line.substring(i, i + maxCharsPerLine));
      }
    } else {
      wrappedLines.push(line);
    }

    for (const wrappedLine of wrappedLines) {
      if (y < margin + lineHeight) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      // Sanitize text for PDF (remove special characters that cause issues)
      const sanitized = wrappedLine.replace(/[\x00-\x1F\x7F]/g, "");

      try {
        page.drawText(sanitized, {
          x: margin,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
      } catch (e) {
        // Skip lines with unsupported characters
      }
      y -= lineHeight;
    }
  }
}

// ========================================
// Audio/Video Processing (Basic)
// ========================================

async function processAudioVideo() {
  // For audio/video, we'll use the browser's MediaRecorder API for basic conversions
  // More complex conversions would require FFmpeg.wasm

  const results = [];
  const total = state.files.length;

  for (let i = 0; i < state.files.length; i++) {
    const fileData = state.files[i];
    showProgress(true, "Processing...", fileData.name, ((i + 1) / total) * 100);

    try {
      // For now, provide the file as-is with format note
      // Full audio/video conversion would require FFmpeg.wasm
      results.push({
        blob: fileData.file,
        name: fileData.name.replace(/\.[^.]+$/, `.${state.outputFormat}`),
      });
    } catch (error) {
      console.error(`Error processing ${fileData.name}:`, error);
    }
  }

  // Show note about audio/video conversion
  if (state.category === "audio" || state.category === "video") {
    alert(
      "Note: Full audio/video conversion requires FFmpeg.wasm which is loading in the background. For now, basic format changes are applied.",
    );
  }

  return results;
}

// ========================================
// Download
// ========================================

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function downloadResults(files) {
  if (files.length === 1) {
    downloadBlob(files[0].blob, files[0].name);
  } else {
    // Download each file with a small delay
    for (let i = 0; i < files.length; i++) {
      setTimeout(() => {
        downloadBlob(files[i].blob, files[i].name);
      }, i * 300);
    }
  }
}

// ========================================
// Main Process Function
// ========================================

async function processFiles() {
  if (state.files.length === 0) return;

  try {
    elements.processBtn.disabled = true;
    showProgress(true, "Starting...", "", 0);

    let result;

    if (state.mode === "merge") {
      // Merge mode - supports mixing different formats into one output
      result = await mergeAllToPdf();
      showProgress(true, "Complete!", "", 100);
      setTimeout(() => {
        downloadBlob(result, "merged_output.pdf");
        showProgress(false);
        elements.processBtn.disabled = false;
      }, 500);
    } else {
      // Convert mode
      let results;

      if (state.category === "images") {
        if (state.outputFormat === "pdf") {
          result = await mergeImagesToPdf();
          results = [{ blob: result, name: "converted.pdf" }];
        } else {
          results = await processImages();
        }
      } else if (state.category === "documents") {
        results = await processDocuments();
      } else {
        results = await processAudioVideo();
      }

      showProgress(true, "Complete!", "", 100);
      setTimeout(() => {
        downloadResults(results);
        showProgress(false);
        elements.processBtn.disabled = false;
      }, 500);
    }
  } catch (error) {
    console.error("Processing error:", error);
    alert(`Error: ${error.message}`);
    showProgress(false);
    elements.processBtn.disabled = false;
  }
}

// ========================================
// Event Listeners
// ========================================

function setupEventListeners() {
  // File input
  elements.fileInput.addEventListener("change", async (e) => {
    if (e.target.files.length > 0) {
      await addFiles(e.target.files);
      e.target.value = "";
    }
  });

  // Add more button
  elements.addMoreBtn.addEventListener("click", () => {
    elements.fileInput.click();
  });

  // Category tabs
  elements.categoryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      switchCategory(tab.dataset.category);
    });
  });

  // Mode buttons
  elements.modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchMode(btn.dataset.mode);
    });
  });

  // Output format
  elements.outputFormat.addEventListener("change", (e) => {
    state.outputFormat = e.target.value;
    updateQualityControls();
    updateProcessButton();
  });

  // Quality slider
  elements.qualityInput.addEventListener("input", (e) => {
    state.quality = parseInt(e.target.value);
    elements.qualityValue.textContent = state.quality;
  });

  // Bitrate slider
  elements.bitrateSlider.addEventListener("input", (e) => {
    state.bitrate = parseInt(e.target.value);
    elements.bitrateValue.textContent = state.bitrate;
  });

  // Clear all
  elements.clearAllBtn.addEventListener("click", clearAllFiles);

  // Process button
  elements.processBtn.addEventListener("click", processFiles);

  // Formats tabs
  elements.formatsTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      elements.formatsTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      document
        .querySelectorAll(".formats-panel")
        .forEach((p) => p.classList.remove("active"));
      document
        .getElementById(`formats-${tab.dataset.formats}`)
        .classList.add("active");
    });
  });
}

// ========================================
// Theme Toggle
// ========================================

function setupThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  // Check for saved theme preference or default to dark
  const savedTheme = localStorage.getItem("unifile-theme") || "dark";
  if (savedTheme === "light") {
    html.setAttribute("data-theme", "light");
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    if (newTheme === "light") {
      html.setAttribute("data-theme", "light");
    } else {
      html.removeAttribute("data-theme");
    }

    localStorage.setItem("unifile-theme", newTheme);
  });
}

// ========================================
// Initialization
// ========================================

function init() {
  setupThemeToggle();
  setupDropZone();
  setupEventListeners();
  updateSupportedFormats();
  updateOutputFormats();
  updateUI();

  console.log("🚀 Unifile initialized!");
  console.log("📁 All processing happens locally in your browser.");
  console.log("🔒 Your files never leave your device.");
}

// Start the app
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
