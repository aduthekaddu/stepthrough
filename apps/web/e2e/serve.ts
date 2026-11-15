import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'out');
const port = Number(process.env.PORT);
if (!Number.isInteger(port)) throw new Error('Set PORT to the port to serve out/ on');

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

function resolve(urlPath: string): string | null {
  const file = path.join(root, decodeURIComponent(urlPath));
  if (!file.startsWith(root)) return null;
  if (existsSync(file) && statSync(file).isDirectory())
    return resolve(path.join(urlPath, 'index.html'));
  return existsSync(file) ? file : null;
}

createServer((req, res) => {
  const file = resolve(new URL(req.url ?? '/', 'http://localhost').pathname);
  const status = file ? 200 : 404;
  const body = file ?? path.join(root, '404.html');
  res.writeHead(status, {
    'content-type': TYPES[path.extname(body)] ?? 'application/octet-stream',
  });
  createReadStream(body).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`Serving ${root} on http://127.0.0.1:${port}`));
