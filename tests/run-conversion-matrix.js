const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const INPUT_DIR = path.resolve(__dirname, 'assets', 'input');
const OUTPUT_DIR = path.resolve(__dirname, 'assets', 'output');
const RESULTS_MD = path.resolve(__dirname, 'conversion-test-results.md');
const RESULTS_JSON = path.resolve(__dirname, 'conversion-test-results.json');
const PORT = 4173;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};

const CATEGORY_INPUTS = {
  images: [
    'sample.png',
    'sample.jpg',
    'sample.jpeg',
    'sample.webp',
    'sample.gif',
    'sample.bmp',
    'sample.ico',
    'sample.svg',
    'sample.heic',
    'sample.heif',
  ],
  documents: [
    'sample.txt',
    'sample.md',
    'sample.html',
    'sample.htm',
    'sample.rtf',
    'sample.csv',
    'sample.tsv',
    'sample.json',
    'sample.xml',
  ],
};

function startStaticServer(rootDir, port) {
  const server = http.createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = path.join(rootDir, urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, ''));

      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      let stats;
      try {
        stats = await fsp.stat(filePath);
      } catch {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      const data = await fsp.readFile(filePath);
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'no-store',
      });
      res.end(data);
    } catch (error) {
      res.writeHead(500);
      res.end('Server Error');
    }
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, () => resolve(server));
  });
}

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function cleanOutputDir() {
  await ensureDir(OUTPUT_DIR);
  const files = await fsp.readdir(OUTPUT_DIR);
  await Promise.all(
    files.map((name) => fsp.rm(path.join(OUTPUT_DIR, name), { force: true }))
  );
}

async function collectOutputOptions(page) {
  return page.evaluate(() => {
    const select = document.getElementById('outputFormat');
    if (!select) return [];
    return Array.from(select.options)
      .map((opt) => opt.value)
      .filter(Boolean);
  });
}

async function setConvertMode(page) {
  await page.click('.mode-btn[data-mode="convert"]');
}

async function setMergeMode(page) {
  await page.click('.mode-btn[data-mode="merge"]');
}

async function setCategory(page, category) {
  await page.click(`.category-tab[data-category="${category}"]`);
}

async function runSingleConversion(page, category, inputFileName, outputFormat, results) {
  const inputPath = path.join(INPUT_DIR, inputFileName);
  const caseName = `${inputFileName} -> ${outputFormat}`;

  if (!fs.existsSync(inputPath)) {
    results.push({
      category,
      input: inputFileName,
      output: outputFormat,
      status: 'skipped',
      detail: 'Input file missing',
    });
    return;
  }

  let dialogMessage = null;
  const dialogHandler = async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.dismiss();
  };
  page.on('dialog', dialogHandler);

  try {
    await setConvertMode(page);
    await setCategory(page, category);
    await page.setInputFiles('#fileInput', inputPath);
    await page.selectOption('#outputFormat', outputFormat);

    const downloadPromise = page.waitForEvent('download', { timeout: 45000 });
    await page.click('#processBtn');
    const download = await downloadPromise;

    const inputLabel = inputFileName.replace(/\./g, '_');
    const safeName = `${inputLabel}__to__${outputFormat}__${download.suggestedFilename()}`;
    const savePath = path.join(OUTPUT_DIR, safeName);
    await download.saveAs(savePath);

    results.push({
      category,
      input: inputFileName,
      output: outputFormat,
      status: 'passed',
      detail: safeName,
    });
  } catch (error) {
    results.push({
      category,
      input: inputFileName,
      output: outputFormat,
      status: 'failed',
      detail: dialogMessage || error.message || String(error),
    });
  } finally {
    page.off('dialog', dialogHandler);
  }
}

async function runBatchZipFallbackTest(page, results) {
  const inputA = path.join(INPUT_DIR, 'sample.txt');
  const inputB = path.join(INPUT_DIR, 'sample.md');

  if (!fs.existsSync(inputA) || !fs.existsSync(inputB)) {
    results.push({
      category: 'batch',
      input: 'sample.txt + sample.md',
      output: 'zip',
      status: 'skipped',
      detail: 'Required batch input files missing',
    });
    return;
  }

  let dialogMessage = null;
  const dialogHandler = async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.dismiss();
  };
  page.on('dialog', dialogHandler);

  try {
    await page.evaluate(() => {
      window.showDirectoryPicker = async () => {
        throw new DOMException('Cancelled for automation', 'AbortError');
      };
    });

    await setConvertMode(page);
    await setCategory(page, 'documents');
    await page.setInputFiles('#fileInput', [inputA, inputB]);

    const downloadPromise = page.waitForEvent('download', { timeout: 45000 });
    await page.click('#processBtn');
    const download = await downloadPromise;

    const suggested = download.suggestedFilename();
    const savePath = path.join(OUTPUT_DIR, `batch_zip_fallback__${suggested}`);
    await download.saveAs(savePath);

    const ok = suggested.toLowerCase().endsWith('.zip');
    results.push({
      category: 'batch',
      input: 'sample.txt + sample.md',
      output: 'zip',
      status: ok ? 'passed' : 'failed',
      detail: ok ? suggested : `Expected ZIP, got: ${suggested}`,
    });
  } catch (error) {
    results.push({
      category: 'batch',
      input: 'sample.txt + sample.md',
      output: 'zip',
      status: 'failed',
      detail: dialogMessage || error.message || String(error),
    });
  } finally {
    page.off('dialog', dialogHandler);
  }
}

async function runSingleMerge(page, name, fileNames, results) {
  const inputPaths = fileNames.map((fileName) => path.join(INPUT_DIR, fileName));

  if (inputPaths.some((p) => !fs.existsSync(p))) {
    results.push({
      category: 'merge',
      input: fileNames.join(' + '),
      output: 'pdf',
      status: 'skipped',
      detail: `Missing input for ${name}`,
    });
    return;
  }

  let dialogMessage = null;
  const dialogHandler = async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.dismiss();
  };
  page.on('dialog', dialogHandler);

  try {
    await setMergeMode(page);
    await page.setInputFiles('#fileInput', inputPaths);

    const downloadPromise = page.waitForEvent('download', { timeout: 45000 });
    await page.click('#processBtn');
    const download = await downloadPromise;

    const suggested = download.suggestedFilename();
    const savePath = path.join(OUTPUT_DIR, `merge__${name}__${suggested}`);
    await download.saveAs(savePath);

    const ok = suggested.toLowerCase().endsWith('.pdf');
    results.push({
      category: 'merge',
      input: fileNames.join(' + '),
      output: 'pdf',
      status: ok ? 'passed' : 'failed',
      detail: ok ? savePath.split(path.sep).pop() : `Expected PDF, got: ${suggested}`,
    });
  } catch (error) {
    results.push({
      category: 'merge',
      input: fileNames.join(' + '),
      output: 'pdf',
      status: 'failed',
      detail: dialogMessage || error.message || String(error),
    });
  } finally {
    page.off('dialog', dialogHandler);
  }
}

async function runMergeTests(page, results) {
  await runSingleMerge(page, 'images', ['sample.png', 'sample.jpg'], results);
  await runSingleMerge(page, 'documents', ['sample.txt', 'sample.md'], results);
  await runSingleMerge(page, 'mixed', ['sample.png', 'sample.txt'], results);

  const convertedPdfName = 'sample_png__to__pdf__converted.pdf';
  const convertedPdfPath = path.join(OUTPUT_DIR, convertedPdfName);
  if (fs.existsSync(convertedPdfPath)) {
    const tempPdfInInput = path.join(INPUT_DIR, 'sample_from_conversion.pdf');
    await fsp.copyFile(convertedPdfPath, tempPdfInInput);
    await runSingleMerge(
      page,
      'pdf_plus_text',
      ['sample_from_conversion.pdf', 'sample.txt'],
      results,
    );
  } else {
    results.push({
      category: 'merge',
      input: 'sample_from_conversion.pdf + sample.txt',
      output: 'pdf',
      status: 'skipped',
      detail: 'Converted PDF artifact not found for merge-with-pdf test',
    });
  }
}

function toMarkdown(results, startedAt, endedAt) {
  const total = results.length;
  const passed = results.filter((r) => r.status === 'passed').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  const lines = [];
  lines.push('# Conversion Test Results');
  lines.push('');
  lines.push(`- Started: ${startedAt.toISOString()}`);
  lines.push(`- Finished: ${endedAt.toISOString()}`);
  lines.push(`- Total cases: ${total}`);
  lines.push(`- Passed: ${passed}`);
  lines.push(`- Failed: ${failed}`);
  lines.push(`- Skipped: ${skipped}`);
  lines.push('');
  lines.push('| Category | Input | Output | Status | Detail |');
  lines.push('| --- | --- | --- | --- | --- |');

  for (const row of results) {
    const detail = String(row.detail || '').replace(/\|/g, '\\|');
    lines.push(`| ${row.category} | ${row.input} | ${row.output} | ${row.status} | ${detail} |`);
  }

  lines.push('');
  lines.push('> This report is generated locally and intended to stay in the `tests/` folder.');
  return lines.join('\n');
}

async function run() {
  await ensureDir(INPUT_DIR);
  await ensureDir(OUTPUT_DIR);
  await cleanOutputDir();

  const startedAt = new Date();
  const results = [];
  const server = await startStaticServer(ROOT, PORT);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  try {
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();

    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle' });

    for (const category of Object.keys(CATEGORY_INPUTS)) {
      await setConvertMode(page);
      await setCategory(page, category);
      const outputs = await collectOutputOptions(page);

      for (const inputName of CATEGORY_INPUTS[category]) {
        for (const output of outputs) {
          await runSingleConversion(page, category, inputName, output, results);
        }
      }
    }

    await runBatchZipFallbackTest(page, results);
    await runMergeTests(page, results);

    await context.close();
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  const endedAt = new Date();
  const markdown = toMarkdown(results, startedAt, endedAt);
  await fsp.writeFile(RESULTS_MD, markdown, 'utf8');
  await fsp.writeFile(
    RESULTS_JSON,
    JSON.stringify(
      {
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        results,
      },
      null,
      2,
    ),
    'utf8',
  );

  const failed = results.filter((r) => r.status === 'failed').length;
  console.log(`Completed ${results.length} test cases. Failed: ${failed}`);
  console.log(`Markdown report: ${RESULTS_MD}`);
  console.log(`JSON report: ${RESULTS_JSON}`);
}

run().catch((error) => {
  console.error('Test runner failed:', error);
  process.exitCode = 1;
});
