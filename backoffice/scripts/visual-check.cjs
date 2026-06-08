const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../dist');
const outDir = path.resolve(__dirname, '../.qa');
const port = 6287;
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
  const url = `http://127.0.0.1:${port}`;

  const login = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await login.goto(url, { waitUntil: 'networkidle' });
  await login.screenshot({ path: path.join(outDir, 'backoffice-login.png'), fullPage: true });
  const loginText = await login.locator('body').innerText();

  const dashboard = await browser.newPage({ viewport: { width: 1440, height: 940 } });
  await dashboard.addInitScript(() => {
    window.localStorage.setItem('deka.backoffice.token', 'visual-check-token');
    window.localStorage.setItem(
      'deka.backoffice.user',
      JSON.stringify({
        id: 1,
        fullName: 'Administrateur Demo',
        email: 'admin@example.com',
        role: 'super_admin',
      })
    );
    const demoEvents = [
      {
        id: 1,
        title: 'Conference institutionnelle',
        slug: 'conference-institutionnelle',
        description: 'Selection officielle des photos et documents partages avec les participants.',
        location: 'Auditorium principal',
        startsAt: new Date().toISOString(),
        accessCode: null,
        isPublished: true,
        albums: [{ id: 1 }],
      },
    ];
    window.fetch = async (url) => {
      const value = String(url);
      if (value.includes('/api/admin/events/1/stats')) {
        return new Response(JSON.stringify({ data: { albumsCount: 1, mediaCount: 12, viewsCount: 87, downloadsCount: 24 } }), { status: 200 });
      }
      if (value.includes('/api/admin/events/1/qrcode')) {
        return new Response(JSON.stringify({ data: { publicUrl: 'http://localhost:5173/events/conference-institutionnelle', qrCodeDataUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E' } }), { status: 200 });
      }
      if (value.includes('/api/admin/events')) {
        return new Response(JSON.stringify({ data: demoEvents }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: {} }), { status: 200 });
    };
  });
  await dashboard.goto(url, { waitUntil: 'networkidle' });
  await dashboard.screenshot({ path: path.join(outDir, 'backoffice-dashboard.png'), fullPage: true });
  const dashboardText = await dashboard.locator('body').innerText();
  await dashboard.locator('.project-link').first().click();
  await dashboard.waitForSelector('.details-page');
  await dashboard.screenshot({ path: path.join(outDir, 'backoffice-details.png'), fullPage: true });
  const detailsText = await dashboard.locator('body').innerText();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobile.addInitScript(() => {
    window.localStorage.setItem('deka.backoffice.token', 'visual-check-token');
    window.localStorage.setItem(
      'deka.backoffice.user',
      JSON.stringify({
        id: 1,
        fullName: 'Administrateur Demo',
        email: 'admin@example.com',
        role: 'super_admin',
      })
    );
    window.fetch = async (url) => {
      const value = String(url);
      if (value.includes('/api/admin/events')) {
        return new Response(JSON.stringify({ data: [] }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: {} }), { status: 200 });
    };
  });
  await mobile.goto(url, { waitUntil: 'networkidle' });
  await mobile.screenshot({ path: path.join(outDir, 'backoffice-mobile.png'), fullPage: true });
  const mobileText = await mobile.locator('body').innerText();

  await browser.close();
  server.close();

  console.log(
    JSON.stringify(
      {
        loginHasBrand: loginText.includes('Deka.') && loginText.includes('EventCover Admin'),
        dashboardHasTitle: dashboardText.includes('Evenements'),
        dashboardHasTable: dashboardText.includes('Mes evenements'),
        detailsHasTitle: detailsText.includes('PROJECT DETAILS'),
        mobileHasTitle: mobileText.includes('Evenements'),
        loginScreenshot: path.join(outDir, 'backoffice-login.png'),
        dashboardScreenshot: path.join(outDir, 'backoffice-dashboard.png'),
        detailsScreenshot: path.join(outDir, 'backoffice-details.png'),
        mobileScreenshot: path.join(outDir, 'backoffice-mobile.png'),
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
