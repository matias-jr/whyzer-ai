import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain',
  '.pdf':  'application/pdf',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

const server = createServer(async (req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  // Map /frames/ → ./public/frames/
  let filePath;
  if (urlPath.startsWith('/frames/')) {
    filePath = join(__dirname, 'public', urlPath);
  } else if (urlPath.startsWith('/brand_assets/')) {
    filePath = join(__dirname, urlPath);
  } else {
    // Try public/ first, then root
    const publicPath = join(__dirname, 'public', urlPath);
    try {
      await stat(publicPath);
      filePath = publicPath;
    } catch {
      filePath = join(__dirname, urlPath);
    }
  }

  try {
    const data = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found: ' + urlPath);
  }
});

server.listen(PORT, () => {
  console.log(`\n  Whyzer dev server running at http://localhost:${PORT}\n`);
});
