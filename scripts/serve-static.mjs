import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const root = join(process.cwd(), 'dist/static');
if (!existsSync(root)) throw new Error('dist/static missing; run npm run build first');

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  let file = join(root, decodeURIComponent(url.pathname));
  if (!extname(file)) file = join(file, 'index.html');
  const missing = !existsSync(file) || statSync(file).isDirectory();
  if (missing) file = join(root, '404.html');
  res.setHeader('content-type', contentType(file));
  res.statusCode = missing && !url.pathname.startsWith('/404') ? 404 : 200;
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.end(readFileSync(file));
});

server.listen(port, host, () => {
  console.log(`Serving dist/static at http://${host}:${port}`);
});

function contentType(file) {
  if (file.endsWith('.css')) return 'text/css';
  if (file.endsWith('.js')) return 'text/javascript';
  if (file.endsWith('.xml')) return 'application/xml';
  if (file.endsWith('.txt')) return 'text/plain';
  return 'text/html; charset=utf-8';
}
