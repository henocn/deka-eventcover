const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../dist');
const outDir = path.resolve(__dirname, '../.qa');
const port = 6187;
const browserCandidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

function getFilePath(url) {
  const parsedUrl = new URL(url, `http://127.0.0.1:${port}`);
  const requestedPath = path.resolve(root, `.${decodeURIComponent(parsedUrl.pathname)}`);
  const relativePath = path.relative(root, requestedPath);

  if (
    !relativePath.startsWith('..') &&
    fs.existsSync(requestedPath) &&
    fs.statSync(requestedPath).isFile()
  ) {
    return requestedPath;
  }

  return path.join(root, 'index.html');
}

function createServer() {
  return http.createServer((req, res) => {
    const filePath = getFilePath(req.url || '/');
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  const server = createServer();

  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

  const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));
  const browser = await chromium.launch({ headless: true, executablePath });
  const url = `http://127.0.0.1:${port}/events/conference-institutionnelle`;

  const desktop = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await desktop.goto(url, { waitUntil: 'networkidle' });
  await desktop.locator('.photo-tile').first().click();
  await desktop.waitForSelector('.viewer');
  const viewerText = await desktop.locator('.viewer-caption').innerText();
  await desktop.screenshot({ path: path.join(outDir, 'participant-viewer.png'), fullPage: true });
  await desktop.locator('.viewer-close').click();
  await desktop.screenshot({ path: path.join(outDir, 'participant-desktop.png'), fullPage: true });
  const desktopText = await desktop.locator('body').innerText();

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  await mobile.goto(url, { waitUntil: 'networkidle' });
  await mobile.screenshot({ path: path.join(outDir, 'participant-mobile.png'), fullPage: true });
  const mobileText = await mobile.locator('body').innerText();

  const tablet = await browser.newPage({
    viewport: { width: 820, height: 1180 },
    isMobile: true,
  });
  await tablet.goto(url, { waitUntil: 'networkidle' });
  await tablet.screenshot({ path: path.join(outDir, 'participant-tablet.png'), fullPage: true });
  const tabletText = await tablet.locator('body').innerText();

  await browser.close();
  server.close();

  console.log(
    JSON.stringify(
      {
        desktopHasTitle: desktopText.includes('Conference institutionnelle'),
        desktopHasAlbums: desktopText.includes('Temps forts'),
        viewerHasCaption: viewerText.includes('Ouverture officielle'),
        mobileHasTitle: mobileText.includes('Conference institutionnelle'),
        mobileHasDocuments: mobileText.includes('Documents'),
        tabletHasTitle: tabletText.includes('Conference institutionnelle'),
        desktopScreenshot: path.join(outDir, 'participant-desktop.png'),
        viewerScreenshot: path.join(outDir, 'participant-viewer.png'),
        mobileScreenshot: path.join(outDir, 'participant-mobile.png'),
        tabletScreenshot: path.join(outDir, 'participant-tablet.png'),
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
