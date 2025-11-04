import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function writeJsonPlugin() {
  return {
    name: 'write-json-plugin',
    configureServer(server) {
      // Middleware para escrever JSON
      server.middlewares.use((req, res, next) => {
        if ((req.url === '/api/write-game-attempts' || req.url === '/api/write-user-state') && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              let filePath
              
              if (req.url === '/api/write-game-attempts') {
                filePath = path.join(__dirname, 'src', 'config', 'game-attempts.json')
              } else if (req.url === '/api/write-user-state') {
                filePath = path.join(__dirname, 'src', 'config', 'user-state.json')
              }
              
              // Garantir que o diretório existe
              const dir = path.dirname(filePath)
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
              }
              
              // Escrever no ficheiro
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
              
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.statusCode = 200
              res.end(JSON.stringify({ success: true, message: 'Ficheiro atualizado com sucesso' }))
            } catch (error) {
              console.error('Erro ao escrever ficheiro JSON:', error)
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.statusCode = 500
              res.end(JSON.stringify({ success: false, error: error.message }))
            }
          })
        } else {
          next()
        }
      })
    }
  }
}

