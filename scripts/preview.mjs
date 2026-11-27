import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { site } from '../src/site.js'
const root = resolve('dist')
const index = process.argv.indexOf('--port')
const port = Number(index >= 0 ? process.argv[index + 1] : site.port)
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' }
await stat(resolve(root, 'index.html'))
createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end() }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    if (!pathname.startsWith(site.base)) { res.writeHead(302, { Location: site.base }); return res.end() }
    let file = resolve(root, './' + pathname.slice(site.base.length))
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403); return res.end() }
    let status = 200
    try { if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html') } catch { /* handled below */ }
    let data
    try { data = await readFile(file) } catch { status = 404; file = resolve(root, '404.html'); data = await readFile(file) }
    res.writeHead(status, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Length': data.length, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex' })
    res.end(req.method === 'HEAD' ? undefined : data)
  } catch { res.writeHead(400); res.end('Bad request') }
}).listen(port, '127.0.0.1', () => console.log(`${site.name}: http://127.0.0.1:${port}${site.base}`))
