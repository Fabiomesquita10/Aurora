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
        // Endpoint para fazer backup da pasta config
        if (req.url === '/api/backup-config' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const gameDay = data.gameDay
              
              if (!gameDay) {
                res.setHeader('Content-Type', 'application/json')
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.statusCode = 400
                res.end(JSON.stringify({ success: false, error: 'gameDay é obrigatório' }))
                return
              }
              
              const configDir = path.join(__dirname, 'src', 'config')
              const backupDir = path.join(__dirname, 'src', 'config', 'backups')
              
              // Criar diretório de backups se não existir
              if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true })
              }
              
              // Verificar se já existe um backup para este dia de jogo e apagá-lo
              const existingBackups = fs.readdirSync(backupDir)
                .filter(item => {
                  const itemPath = path.join(backupDir, item)
                  return fs.statSync(itemPath).isDirectory()
                })
              
              // Procurar backups que correspondem ao mesmo dia de jogo
              // Formato esperado: backup-YYYY-MM-DDTHH-MM-SS-day-N
              const dayPattern = `-day-${gameDay}`
              existingBackups.forEach(backupName => {
                if (backupName.includes(dayPattern)) {
                  const oldBackupPath = path.join(backupDir, backupName)
                  console.log(`🗑️ Apagando backup anterior para o dia ${gameDay}: ${backupName}`)
                  fs.rmSync(oldBackupPath, { recursive: true, force: true })
                }
              })
              
              // Criar nome do backup com data do backup + dia do jogo
              const now = new Date()
              const backupDate = now.toISOString().split('T')[0] // YYYY-MM-DD
              const backupTime = now.toISOString().split('T')[1].replace(/[:.]/g, '-').slice(0, -5) // HH-MM-SS
              const backupName = `backup-${backupDate}T${backupTime}-day-${gameDay}`
              const backupPath = path.join(backupDir, backupName)
              
              // Criar diretório do backup
              fs.mkdirSync(backupPath, { recursive: true })
              
              // Listar ficheiros JSON na pasta config
              const files = fs.readdirSync(configDir).filter(file => file.endsWith('.json') && !file.startsWith('backup'))
              
              // Copiar cada ficheiro
              const copiedFiles = []
              files.forEach(file => {
                const sourcePath = path.join(configDir, file)
                const destPath = path.join(backupPath, file)
                fs.copyFileSync(sourcePath, destPath)
                copiedFiles.push(file)
              })
              
              // Limitar número de backups (manter apenas os últimos 50)
              const allBackups = fs.readdirSync(backupDir)
                .filter(item => {
                  const itemPath = path.join(backupDir, item)
                  return fs.statSync(itemPath).isDirectory()
                })
                .sort()
                .reverse()
              
              if (allBackups.length > 50) {
                allBackups.slice(50).forEach(oldBackup => {
                  const oldBackupPath = path.join(backupDir, oldBackup)
                  fs.rmSync(oldBackupPath, { recursive: true, force: true })
                })
              }
              
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.statusCode = 200
              res.end(JSON.stringify({ 
                success: true, 
                message: 'Backup criado com sucesso',
                backupName,
                files: copiedFiles,
                gameDay
              }))
            } catch (error) {
              console.error('Erro ao criar backup:', error)
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.statusCode = 500
              res.end(JSON.stringify({ success: false, error: error.message }))
            }
          })
          return
        }
        
        if ((req.url === '/api/write-game-attempts' || req.url === '/api/write-user-state' || req.url === '/api/write-accounts') && req.method === 'POST') {
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
              } else if (req.url === '/api/write-accounts') {
                filePath = path.join(__dirname, 'src', 'config', 'accounts.json')
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

