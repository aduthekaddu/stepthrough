import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

/** Serves the static export in `out/` the way a static host would, for Playwright. */
const root = join(import.meta.dirname, '..', 'out');
const port = Number(process.env.PORT ?? process.argv[2]);
if (!Number.isInteger(port) || port <= 0) throw new Error('pass a port: PORT=4173 or argv[2]');

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function resolve(url: string): string | null {
  const path = normalize(decodeURIComponent(new URL(url, 'http://local').pathname));
  for (const candidate of [path, join(path, 'index.html'), `${path}.html`]) {
    const file = join(root, candidate);
    if (file.startsWith(root) && existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

createServer((req, res) => {
  const file = resolve(req.url ?? '/');
  const status = file ? 200 : 404;
  const body = file ?? join(root, '404.html');
  res.writeHead(status, { 'content-type': TYPES[extname(body)] ?? 'application/octet-stream' });
  createReadStream(body).pipe(res);
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
