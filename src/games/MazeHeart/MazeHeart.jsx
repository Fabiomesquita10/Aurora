import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import './MazeHeart.css'

/**
 * Dificuldades:
 * - size: nº de células por lado (mais = labirinto maior)
 * - cellSize: pixels por célula (menor = corredores mais estreitos no ecrã)
 * - playerSize: diâmetro do coração (relativamente grande dificulta)
 * - collisionFactor: 1.0 = colisão justa; <1 é permissivo; >1 é mais punitivo
 * - heartHitboxFactor: raio extra para “agarrar” o coração (1.0 = sem ajuda)
 * - extraPathsFactor: fração de células extra abertas (mais = mais atalhos, menos = mais becos)
 * - ensurePath: ‘regen’ tenta regenerar até ter caminho; ‘fallback’ abre corredor direto se falhar (só no limite)
 */
const DIFFICULTY_PRESETS = {
  easy:   { size: 15, cellSize: 70, playerSize: 32, collisionFactor: 0.6, heartHitboxFactor: 1.6, extraPathsFactor: 0.15, ensurePath: 'fallback' },
  normal: { size: 19, cellSize: 58, playerSize: 30, collisionFactor: 0.85, heartHitboxFactor: 1.2, extraPathsFactor: 0.08, ensurePath: 'regen' },
  hard:   { size: 23, cellSize: 46, playerSize: 30, collisionFactor: 1.0, heartHitboxFactor: 1.0, extraPathsFactor: 0.04, ensurePath: 'regen' },
  insane: { size: 29, cellSize: 40, playerSize: 28, collisionFactor: 1.1, heartHitboxFactor: 0.9, extraPathsFactor: 0.02, ensurePath: 'regen' },
}

function MazeHeart({ mazeSize, difficulty = 'normal', day, onWin, onComplete, onGameAttempt }) {
  // Recalcular configurações quando difficulty ou mazeSize mudam
  const gameConfig = useMemo(() => {
    const cfgBase = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.hard
    const size = mazeSize || cfgBase.size
    return {
      cfgBase,
      size,
      cellSize: cfgBase.cellSize,
      playerSize: cfgBase.playerSize,
      collisionFactor: cfgBase.collisionFactor,
      heartHitboxFactor: cfgBase.heartHitboxFactor,
      extraPathsFactor: cfgBase.extraPathsFactor,
      ensurePathMode: cfgBase.ensurePath
    }
  }, [difficulty, mazeSize])
  
  const { cfgBase, size, cellSize, playerSize, collisionFactor, heartHitboxFactor, extraPathsFactor, ensurePathMode } = gameConfig

  const canvasRef = useRef(null)
  const [gameStatus, setGameStatus] = useState('waiting') // waiting, playing, won, lost
  const [attempts, setAttempts] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 })
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [walls, setWalls] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)

  // ---------- utils ----------
  const bfsHasPath = (grid, start, end) => {
    const q = [start]
    const visited = new Set([`${start.x},${start.y}`])
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]]

    while (q.length) {
      const { x, y } = q.shift()
      if (x === end.x && y === end.y) return true
      for (const [dx,dy] of dirs) {
        const nx = x + dx, ny = y + dy
        const key = `${nx},${ny}`
        if (
          nx >= 0 && ny >= 0 &&
          nx < size && ny < size &&
          grid[ny][nx] === 0 &&
          !visited.has(key)
        ) {
          visited.add(key)
          q.push({ x: nx, y: ny })
        }
      }
    }
    return false
  }

  // Gera um labirinto e **garante** que é solucionável
  const generateMaze = useCallback(() => {
    const buildOnce = () => {
      // 1) grid cheio de paredes
      const grid = Array.from({ length: size }, () => Array(size).fill(1))

      // 2) DFS (backtracker) a saltar 2
      const startCell = { x: 1, y: 1 }
      const stack = [startCell]
      grid[startCell.y][startCell.x] = 0
      const directions = [
        { dx: 0, dy: -2 }, { dx: 0, dy: 2 },
        { dx: -2, dy: 0 }, { dx: 2, dy: 0 }
      ]

      while (stack.length) {
        const current = stack[stack.length - 1]
        // vizinhos em ordem aleatória (ligeiro viés para mudar direção → caminhos mais longos)
        const shuffled = directions
          .map(d => ({ ...d, r: Math.random() }))
          .sort((a,b) => a.r - b.r)

        const candidates = []
        for (const dir of shuffled) {
          const nx = current.x + dir.dx
          const ny = current.y + dir.dy
          if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && grid[ny][nx] === 1) {
            candidates.push({ x: nx, y: ny, dir })
          }
        }

        if (candidates.length) {
          const next = candidates[0] // escolher o 1º após shuffle dá “caminhos” mais longos
          grid[next.y][next.x] = 0
          grid[current.y + next.dir.dy / 2][current.x + next.dir.dx / 2] = 0
          stack.push({ x: next.x, y: next.y })
        } else {
          stack.pop()
        }
      }

      // 3) Garantir que start/end estão conectados ao labirinto
      const start = { x: 1, y: 0 }
      const end   = { x: size - 2, y: size - 1 }
      
      // Conectar início: garantir caminho do (1,0) para (1,1) que é onde começa o DFS
      grid[start.y][start.x] = 0
      grid[1][1] = 0 // O DFS começa aqui, garantir que está aberto
      grid[0][1] = 0 // Conectar (0,1) também
      
      // Conectar fim: garantir caminho do (size-2, size-1) para o labirinto
      grid[end.y][end.x] = 0
      const endConnectY = size - 2
      const endConnectX = size - 2
      if (grid[endConnectY] && grid[endConnectY][endConnectX] === 1) {
        // Se a célula acima do fim está fechada, abri-la
        grid[endConnectY][endConnectX] = 0
        // Garantir que está conectada ao labirinto
        if (endConnectY > 1 && grid[endConnectY - 1] && grid[endConnectY - 1][endConnectX] === 1) {
          grid[endConnectY - 1][endConnectX] = 0
        }
      }

      // Área segura no início - garantir que está toda conectada
      ;[[0,1],[1,0],[1,1],[1,2],[2,1],[0,0],[0,2],[2,0],[2,2]].forEach(([gy,gx]) => {
        if (gy >= 0 && gy < size && gx >= 0 && gx < size) grid[gy][gx] = 0
      })

      // 4) menos atalhos = mais becos → mais difícil
      const additionalPaths = Math.floor(size * extraPathsFactor)
      for (let i = 0; i < additionalPaths; i++) {
        const x = Math.floor(Math.random() * (size - 2)) + 1
        const y = Math.floor(Math.random() * (size - 2)) + 1
        if (grid[y][x] === 1) {
          const canCarve =
            (grid[y - 1]?.[x] === 0) ||
            (grid[y + 1]?.[x] === 0) ||
            (grid[y]?.[x - 1] === 0) ||
            (grid[y]?.[x + 1] === 0)
          if (canCarve) grid[y][x] = 0
        }
      }

      return { grid, start, end }
    }

    // tentar regenerar até ter caminho
    let tries = 0
    let maze = buildOnce()
    while (!bfsHasPath(maze.grid, maze.start, maze.end) && tries < 60) {
      tries++
      maze = buildOnce()
    }

    // fallback extremo - SEMPRE garantir caminho se não existir
    if (!bfsHasPath(maze.grid, maze.start, maze.end)) {
      let { grid, start, end } = maze
      
      // Primeiro tentar conectar usando o caminho mais curto pelo labirinto
      // Conectar início ao primeiro caminho acessível
      const q = [{ x: start.x, y: start.y }]
      const visited = new Set([`${start.x},${start.y}`])
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]]
      let foundPath = false
      
      // BFS para encontrar caminho a partir do início
      while (q.length && !foundPath) {
        const { x, y } = q.shift()
        if (y > 2 && grid[y] && grid[y][x] === 0) {
          foundPath = true
          // Garantir caminho do start até aqui
          let cx = start.x, cy = start.y
          while (cy < y) {
            grid[cy][cx] = 0
            if (cy + 1 < size && grid[cy + 1]) grid[cy + 1][cx] = 0
            cy++
          }
          break
        }
        for (const [dx,dy] of dirs) {
          const nx = x + dx, ny = y + dy
          const key = `${nx},${ny}`
          if (
            nx >= 0 && ny >= 0 &&
            nx < size && ny < size &&
            !visited.has(key)
          ) {
            visited.add(key)
            q.push({ x: nx, y: ny })
          }
        }
      }
      
      // Se ainda não tem caminho, criar um corredor direto
      if (!bfsHasPath(grid, start, end)) {
        let x = start.x, y = start.y
        grid[y][x] = 0
        // Primeiro ir para baixo até perto do fim
        while (y < size - 3) {
          y++
          grid[y] = grid[y] || []
          grid[y][x] = 0
        }
        // Depois ir horizontalmente até perto do fim
        while (x !== end.x) {
          x += (end.x > x ? 1 : -1)
          grid[y][x] = 0
        }
        // Finalmente ir até ao fim
        while (y !== end.y) {
          y += (end.y > y ? 1 : -1)
          grid[y] = grid[y] || []
          grid[y][x] = 0
        }
      }
      
      maze = { grid, start, end }
      
      // Verificação final - se ainda não tem caminho, algo está muito errado
      if (!bfsHasPath(grid, start, end)) {
        console.warn('Aviso: Fallback falhou, forçando caminho mínimo')
        // Forçar caminho absoluto
        for (let y = start.y; y <= end.y; y++) {
          grid[y] = grid[y] || []
          for (let x = Math.min(start.x, end.x); x <= Math.max(start.x, end.x); x++) {
            grid[y][x] = 0
          }
        }
      }
    }

    // converter em rectângulos de parede
    const wallRects = []
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (maze.grid[i][j] === 1) {
          wallRects.push({ x: j * cellSize, y: i * cellSize, width: cellSize, height: cellSize })
        }
      }
    }

    return { ...maze, walls: wallRects }
  }, [size, cellSize, extraPathsFactor, ensurePathMode])

  const generateMazeRef = useRef(generateMaze)
  useEffect(() => { generateMazeRef.current = generateMaze }, [generateMaze])

  // Reset quando a dificuldade ou mazeSize mudam
  useEffect(() => {
    if (gameStatus === 'playing') {
      setGameStatus('waiting')
      setAttempts(0)
      setStartTime(null)
      setIsDrawing(false)
    }
  }, [difficulty, mazeSize])

  // Inicialização / reinícios
  useEffect(() => {
    if (gameStatus === 'waiting' || gameStatus === 'lost') {
      const maze = generateMazeRef.current()
      const startPos = {
        x: maze.start.x * cellSize + cellSize / 2,
        y: maze.start.y * cellSize + cellSize / 2
      }
      setWalls(maze.walls)
      setStartPosition(startPos)
      setCurrentPosition(startPos)
      setTargetPosition({
        x: maze.end.x * cellSize + cellSize / 2,
        y: maze.end.y * cellSize + cellSize / 2
      })
    }
  }, [gameStatus, cellSize, difficulty, mazeSize, size, extraPathsFactor, ensurePathMode])

  // Colisão mais “apertada”
  const checkCollision = useCallback((x, y) => {
    const collisionSize = playerSize * collisionFactor
    const playerRect = {
      x: x - collisionSize / 2,
      y: y - collisionSize / 2,
      width: collisionSize,
      height: collisionSize
    }
    for (const w of walls) {
      if (
        playerRect.x < w.x + w.width &&
        playerRect.x + playerRect.width > w.x &&
        playerRect.y < w.y + w.height &&
        playerRect.y + playerRect.height > w.y
      ) return true
    }
    const canvas = canvasRef.current
    if (!canvas) return false
    const m = 2
    if (
      playerRect.x < m || playerRect.y < m ||
      playerRect.x + playerRect.width > canvas.width - m ||
      playerRect.y + playerRect.height > canvas.height - m
    ) return true
    return false
  }, [walls, playerSize, collisionFactor])

  const checkWin = useCallback((x, y) => {
    const d = Math.hypot(x - targetPosition.x, y - targetPosition.y)
    return d < cellSize / 2
  }, [targetPosition, cellSize])

  const getEventCoordinates = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    let clientX, clientY
    if (e.touches?.[0]) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }
  }, [])

  const isInsideHeart = useCallback((x, y) => {
    const d = Math.hypot(x - currentPosition.x, y - currentPosition.y)
    const r = (playerSize / 2) * heartHitboxFactor
    return d <= r
  }, [currentPosition, playerSize, heartHitboxFactor])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // caminho (claro)
    ctx.fillStyle = '#ecf0f1'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // paredes
    ctx.fillStyle = '#2c3e50'
    for (const w of walls) ctx.fillRect(w.x, w.y, w.width, w.height)

    // destino
    ctx.fillStyle = '#e74c3c'
    ctx.beginPath()
    ctx.arc(targetPosition.x, targetPosition.y, cellSize / 2 - 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = '20px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('❤️', targetPosition.x, targetPosition.y)

    // hitbox (visual suave)
    const hitR = (playerSize / 2) * heartHitboxFactor
    ctx.fillStyle = 'rgba(233, 30, 99, 0.09)'
    ctx.beginPath()
    ctx.arc(currentPosition.x, currentPosition.y, hitR, 0, Math.PI * 2)
    ctx.fill()

    // jogador
    ctx.fillStyle = '#e91e63'
    ctx.beginPath()
    ctx.arc(currentPosition.x, currentPosition.y, playerSize / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `${playerSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('❤️', currentPosition.x, currentPosition.y)
  }, [walls, targetPosition, currentPosition, cellSize, playerSize, heartHitboxFactor])

  useEffect(() => {
    if (gameStatus === 'playing' && canvasRef.current && walls.length) {
      drawCanvas()
    }
  }, [gameStatus, drawCanvas, currentPosition, walls])

  const handleMouseMove = useCallback((e) => {
    if (gameStatus !== 'playing') return
    const coords = getEventCoordinates(e)
    if (!coords) return
    const { x, y } = coords
    if (!checkCollision(x, y)) {
      setCurrentPosition({ x, y })
      if (checkWin(x, y)) {
        setGameStatus('won')
        const elapsedTime = Math.round((Date.now() - startTime) / 1000)
        setTimeout(() => {
          if (onGameAttempt && day) {
            onGameAttempt('maze-heart', day, {
              won: true, attempts: attempts + 1, errors: 0, score: null,
              metadata: { timeSeconds: elapsedTime, mazeSize: size }
            })
          }
        }, 0)
        if (onWin) setTimeout(() => onWin(attempts + 1), 500)
        if (onComplete) setTimeout(() => onComplete(attempts + 1, true), 500)
      }
    } else {
      setAttempts(a => a + 1)
      setCurrentPosition(startPosition)
      setIsDrawing(false)
    }
  }, [gameStatus, startTime, attempts, checkCollision, checkWin, onGameAttempt, day, onWin, onComplete, size, startPosition, getEventCoordinates])

  const handleMouseDown = (e) => {
    e.preventDefault()
    if (gameStatus !== 'playing') return
    const coords = getEventCoordinates(e)
    if (coords && isInsideHeart(coords.x, coords.y)) {
      setIsDrawing(true)
      handleMouseMove(e)
    }
  }
  const handleMouseUp = (e) => { e.preventDefault(); setIsDrawing(false); canvasRef.current && (canvasRef.current.style.cursor = 'default') }
  const handleMouseLeave = () => { setIsDrawing(false); canvasRef.current && (canvasRef.current.style.cursor = 'default') }

  const startGame = () => {
    setGameStatus('playing'); setStartTime(Date.now()); setAttempts(0); drawCanvas()
  }
  const resetGame = () => {
    setGameStatus('waiting'); setAttempts(0); setStartTime(null); setIsDrawing(false)
  }

  if (gameStatus === 'waiting') {
    return (
      <div className="maze-heart-container">
        <div className="maze-heart-start-screen">
          <h2>💝 Labirinto do Coração</h2>
          <p className="maze-heart-instruction">Guia o coração até ao outro sem tocar nas paredes ou bordas!</p>
          <p className="maze-heart-size-info">
            Dificuldade: <b>{difficulty}</b> — Labirinto {size}×{size}
          </p>
          <button onClick={startGame} className="maze-heart-start-button">Começar</button>
        </div>
      </div>
    )
  }

  if (gameStatus === 'won') {
    const elapsedTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 0
    return (
      <div className="maze-heart-container">
        <div className="maze-heart-result">
          <h2>🎉 Parabéns! Chegaste ao destino!</h2>
          <p>Tempo: {elapsedTime}s</p>
          <p>Tentativas: {attempts}</p>
          <button onClick={resetGame} className="maze-heart-reset-button">Tentar Novamente</button>
        </div>
      </div>
    )
  }

  if (gameStatus === 'lost') {
    const elapsedTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 0
    return (
      <div className="maze-heart-container">
        <div className="maze-heart-result">
          <h2>💔 Tocaste numa parede!</h2>
          <p>Tempo: {elapsedTime}s</p>
          <p>Tentativas: {attempts}</p>
          <button onClick={startGame} className="maze-heart-reset-button">Tentar Novamente</button>
        </div>
      </div>
    )
  }

  const canvasWidth = size * cellSize
  const canvasHeight = size * cellSize

  return (
    <div className="maze-heart-container">
      <div className="maze-heart-header">
        <h2>💝 Labirinto do Coração</h2>
        <div className="maze-heart-stats">
          <span>Tentativas: {attempts}</span>
          {startTime && <span>Tempo: {Math.round((Date.now() - startTime) / 1000)}s</span>}
        </div>
      </div>

      <div className="maze-heart-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => {
            if (gameStatus === 'playing') {
              const coords = getEventCoordinates(e)
              if (coords) {
                const canvas = canvasRef.current
                if (canvas) {
                  if (isInsideHeart(coords.x, coords.y)) canvas.style.cursor = 'pointer'
                  else if (isDrawing) canvas.style.cursor = 'pointer'
                  else canvas.style.cursor = 'default'
                }
              }
              if (isDrawing) handleMouseMove(e)
            }
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={(e) => {
            e.preventDefault()
            if (gameStatus === 'playing') {
              const coords = getEventCoordinates(e)
              if (coords && isInsideHeart(coords.x, coords.y)) {
                setIsDrawing(true)
                handleMouseMove(e)
              }
            }
          }}
          onTouchMove={(e) => { e.preventDefault(); if (isDrawing && gameStatus === 'playing') handleMouseMove(e) }}
          onTouchEnd={(e) => { e.preventDefault(); setIsDrawing(false) }}
          className="maze-heart-canvas"
        />
      </div>
    </div>
  )
}

export default MazeHeart
