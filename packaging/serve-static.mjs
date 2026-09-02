import { createReadStream, promises as fs } from 'node:fs'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'

const root = resolve(process.argv[2] ?? 'app-dist')
const port = Number(process.argv[3] ?? 8080)
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', 'http://localhost')
    const pathname = decodeURIComponent(requestUrl.pathname)
    const relativePath = pathname === '/' ? 'index.html' : `.${pathname}`
    let filePath = resolve(root, relativePath)
    if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end('Forbidden')
      return
    }
    const stats = await fs.stat(filePath)
    if (stats.isDirectory()) filePath = resolve(filePath, 'index.html')
    const finalStats = await fs.stat(filePath)
    response.writeHead(200, {
      'Content-Length': finalStats.size,
      'Content-Type':
        contentTypes[extname(filePath)] ?? 'application/octet-stream',
    })
    createReadStream(filePath).pipe(response)
  } catch {
    response.writeHead(404).end('Not found')
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`json-render-ai local delivery: http://127.0.0.1:${port}`)
})
