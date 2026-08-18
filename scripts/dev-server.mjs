import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import contactHandler from '../api/contact.js';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT || 5500);

function loadEnvFile(fileName) {
  const filePath = join(projectRoot, fileName);
  if (!existsSync(filePath)) return;

  const contents = readFileSync(filePath, 'utf8');
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function safeFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  let pathname = decoded === '/' ? '/index.html' : decoded;
  if (pathname.endsWith('/')) pathname += 'index.html';

  const candidate = normalize(join(projectRoot, pathname));
  const rootWithSep = projectRoot.endsWith(sep) ? projectRoot : `${projectRoot}${sep}`;
  if (candidate !== projectRoot && !candidate.startsWith(rootWithSep)) return null;
  return candidate;
}

async function handleContact(req, res) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  const request = new Request(`http://localhost:${port}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : body,
  });

  const response = await contactHandler.fetch(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const responseBody = Buffer.from(await response.arrayBuffer());
  res.end(responseBody);
}

function sendFile(req, res, filePath) {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Not found');
    return;
  }

  const stat = statSync(filePath);
  const type = mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream';
  const range = req.headers.range;

  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', 'no-store');

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;
      if (start <= end && start < stat.size) {
        res.statusCode = 206;
        res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
        res.setHeader('Content-Length', end - start + 1);
        createReadStream(filePath, { start, end }).pipe(res);
        return;
      }
    }
    res.statusCode = 416;
    res.setHeader('Content-Range', `bytes */${stat.size}`);
    res.end();
    return;
  }

  res.setHeader('Content-Length', stat.size);
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(filePath).pipe(res);
}

const server = createServer(async (req, res) => {
  try {
    if (req.url?.startsWith('/api/contact')) {
      await handleContact(req, res);
      return;
    }

    const filePath = safeFilePath(req.url || '/');
    if (!filePath) {
      res.statusCode = 400;
      res.end('Bad request');
      return;
    }
    sendFile(req, res, filePath);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.statusCode = 500;
    res.end('Internal server error');
  }
});

server.listen(port, () => {
  console.log(`Professional Site v2: http://localhost:${port}/`);
  console.log(`Português:            http://localhost:${port}/pt-br/`);
  console.log('Press Ctrl+C to stop.');
  if (!process.env.RESEND_API_KEY) {
    console.log('Contact form: visual test works; real email requires RESEND_API_KEY in .env.local.');
  } else {
    console.log('Contact form: Resend configuration detected.');
  }
});
