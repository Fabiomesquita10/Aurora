import React, { useState, useEffect, useRef } from 'react'
import './Puzzle.css'

function Puzzle({ gridSize = 3, imageUrl, difficulty = 'medium', day, onWin, onComplete, onGameAttempt }) {
  const [tiles, setTiles] = useState([])
  const [emptyIndex, setEmptyIndex] = useState(null)
  const [gameStatus, setGameStatus] = useState('waiting') // waiting, playing, won
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef(null)
  const canvasRef = useRef(null)

  // Tamanho padrão da imagem (pode ser ajustado)
  const IMAGE_SIZE = 400

  // Carregar imagem e preparar tiles
  useEffect(() => {
    if (imageUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        imageRef.current = img
        setImageLoaded(true)
        initializeTiles()
      }
      img.onerror = () => {
        console.error('Erro ao carregar imagem:', imageUrl)
        alert('Erro ao carregar a imagem. Verifica se o caminho está correto.')
      }
      img.src = imageUrl
    }
  }, [imageUrl, gridSize])

  // Inicializar tiles quando a imagem carregar
  useEffect(() => {
    if (imageLoaded && gameStatus === 'waiting') {
      initializeTiles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageLoaded, gridSize, difficulty])

  // Verificar vitória
  useEffect(() => {
    if (gameStatus === 'playing' && tiles.length > 0 && emptyIndex !== null) {
      if (isSolved()) {
        setGameStatus('won')
        const elapsedTime = Math.round((Date.now() - startTime) / 1000)
        
        if (onGameAttempt && day) {
          onGameAttempt('puzzle-tiles', day, {
            won: true,
            attempts: 1,
            errors: 0,
            score: null,
            metadata: {
              timeSeconds: elapsedTime,
              moves: moves,
              gridSize: gridSize,
              difficulty: difficulty
            }
          }).catch(err => {
            console.warn('Erro ao registar tentativa:', err)
          })
        }
        
        if (onWin) {
          setTimeout(() => onWin(1), 500)
        }
        if (onComplete) {
          setTimeout(() => onComplete(1, true), 500)
        }
      }
    }
  }, [tiles, gameStatus, moves, startTime, gridSize, onWin, onComplete, onGameAttempt, day])

  const initializeTiles = () => {
    if (!imageRef.current) return

    const totalTiles = gridSize * gridSize
    const tileSize = IMAGE_SIZE / gridSize
    const newTiles = []

    // Obter dimensões da imagem original
    const img = imageRef.current
    const imgWidth = img.naturalWidth || img.width
    const imgHeight = img.naturalHeight || img.height
    
    // Calcular dimensões para manter aspect ratio (crop center)
    let sourceX = 0
    let sourceY = 0
    let sourceWidth = imgWidth
    let sourceHeight = imgHeight
    
    // Se a imagem não é quadrada, fazer crop central
    if (imgWidth !== imgHeight) {
      const minSize = Math.min(imgWidth, imgHeight)
      sourceWidth = minSize
      sourceHeight = minSize
      sourceX = (imgWidth - minSize) / 2
      sourceY = (imgHeight - minSize) / 2
    }

    // Criar canvas temporário para cortar a imagem
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = IMAGE_SIZE
    tempCanvas.height = IMAGE_SIZE
    const tempCtx = tempCanvas.getContext('2d')
    
    // Desenhar imagem no canvas (redimensionar mantendo proporção, crop center)
    tempCtx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,  // Source (crop)
      0, 0, IMAGE_SIZE, IMAGE_SIZE                  // Destination (resize)
    )

    // Criar tiles com posições corretas
    for (let i = 0; i < totalTiles - 1; i++) {
      const row = Math.floor(i / gridSize)
      const col = i % gridSize
      const x = col * tileSize
      const y = row * tileSize

      // Criar canvas para cada tile
      const tileCanvas = document.createElement('canvas')
      tileCanvas.width = tileSize
      tileCanvas.height = tileSize
      const tileCtx = tileCanvas.getContext('2d')
      
      // Copiar parte da imagem para o tile (cortar exatamente a região correta)
      tileCtx.drawImage(
        tempCanvas,
        x, y, tileSize, tileSize,  // Source (crop from temp canvas)
        0, 0, tileSize, tileSize   // Destination (fit to tile canvas)
      )

      newTiles.push({
        id: i,
        correctPosition: i,
        currentPosition: i,
        imageData: tileCanvas.toDataURL()
      })
    }

    // Embaralhar baseado na dificuldade
    const { shuffledTiles, finalEmptyIndex } = shuffleBasedOnDifficulty(newTiles, difficulty, totalTiles - 1, gridSize)

    setTiles(shuffledTiles)
    setEmptyIndex(finalEmptyIndex)
    setMoves(0)
  }

  // Embaralhar baseado na dificuldade usando "reverse solving"
  const shuffleBasedOnDifficulty = (tiles, difficulty, emptyIndex, gridSize) => {
    // Definir número de movimentos baseado na dificuldade
    const difficultyMoves = {
      easy: { min: 3, max: 5 },
      medium: { min: 10, max: 20 },
      hard: { min: 30, max: 50 }
    }

    const moves = difficultyMoves[difficulty] || difficultyMoves.medium
    const targetMoves = Math.floor(Math.random() * (moves.max - moves.min + 1)) + moves.min

    // Começar com o puzzle resolvido
    const solvedTiles = tiles.map((tile, index) => ({
      ...tile,
      currentPosition: tile.correctPosition
    }))
    let currentEmptyIndex = emptyIndex
    let shuffledTiles = [...solvedTiles]

    // Fazer movimentos aleatórios válidos para trás (simular embaralhamento)
    for (let i = 0; i < targetMoves; i++) {
      const validMoves = getValidMoves(shuffledTiles, currentEmptyIndex, gridSize)
      
      if (validMoves.length === 0) break // Se não há movimentos válidos, parar
      
      // Escolher um movimento aleatório
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
      
      // Fazer o movimento (trocar tile com espaço vazio)
      const tileToMove = shuffledTiles.find(t => t.currentPosition === randomMove)
      if (tileToMove) {
        const oldEmpty = currentEmptyIndex
        currentEmptyIndex = tileToMove.currentPosition
        tileToMove.currentPosition = oldEmpty
      }
    }

    // Verificar se é solucionável (deve sempre ser, pois começamos resolvido)
    if (!isSolvable(shuffledTiles)) {
      // Se por algum motivo não for solucionável, fazer um movimento extra
      const validMoves = getValidMoves(shuffledTiles, currentEmptyIndex, gridSize)
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
        const tileToMove = shuffledTiles.find(t => t.currentPosition === randomMove)
        if (tileToMove) {
          const oldEmpty = currentEmptyIndex
          currentEmptyIndex = tileToMove.currentPosition
          tileToMove.currentPosition = oldEmpty
        }
      }
    }

    // IMPORTANTE: Retornar tanto os tiles embaralhados quanto o emptyIndex atualizado
    return {
      shuffledTiles,
      finalEmptyIndex: currentEmptyIndex
    }
  }

  // Obter movimentos válidos (tiles adjacentes ao espaço vazio)
  const getValidMoves = (tiles, emptyIndex, gridSize) => {
    const emptyRow = Math.floor(emptyIndex / gridSize)
    const emptyCol = emptyIndex % gridSize
    const validMoves = []

    // Verificar 4 direções (cima, baixo, esquerda, direita)
    const directions = [
      { row: emptyRow - 1, col: emptyCol },     // Cima
      { row: emptyRow + 1, col: emptyCol },     // Baixo
      { row: emptyRow, col: emptyCol - 1 },     // Esquerda
      { row: emptyRow, col: emptyCol + 1 }      // Direita
    ]

    directions.forEach(dir => {
      if (dir.row >= 0 && dir.row < gridSize && dir.col >= 0 && dir.col < gridSize) {
        const position = dir.row * gridSize + dir.col
        const tile = tiles.find(t => t.currentPosition === position)
        if (tile) {
          validMoves.push(position)
        }
      }
    })

    return validMoves
  }

  // Verificar se o puzzle é solucionável (usando inversões)
  const isSolvable = (tilesArray) => {
    const inversions = countInversions(tilesArray)
    // Para grid 3x3 e 4x4: solucionável se inversões for par
    return inversions % 2 === 0
  }

  const countInversions = (tilesArray) => {
    let inversions = 0
    for (let i = 0; i < tilesArray.length; i++) {
      for (let j = i + 1; j < tilesArray.length; j++) {
        if (tilesArray[i].correctPosition > tilesArray[j].correctPosition) {
          inversions++
        }
      }
    }
    return inversions
  }

  const isSolved = () => {
    // Verificar se todos os tiles estão na posição correta
    // E também verificar se o espaço vazio está na última posição
    const allTilesCorrect = tiles.every(tile => tile.currentPosition === tile.correctPosition)
    const emptyInLastPosition = emptyIndex === (gridSize * gridSize - 1)
    return allTilesCorrect && emptyInLastPosition
  }

  const getEmptyNeighbors = (index) => {
    if (emptyIndex === null || emptyIndex === undefined) return false
    if (index === emptyIndex) return false // O próprio espaço vazio não é clicável
    
    const emptyRow = Math.floor(emptyIndex / gridSize)
    const emptyCol = emptyIndex % gridSize
    const tileRow = Math.floor(index / gridSize)
    const tileCol = index % gridSize

    // Verificar se está adjacente (horizontal ou vertical APENAS, não diagonal)
    const rowDiff = Math.abs(tileRow - emptyRow)
    const colDiff = Math.abs(tileCol - emptyCol)
    
    // Está adjacente se: diferença de linha = 1 e mesma coluna, OU diferença de coluna = 1 e mesma linha
    // NÃO pode ser diagonal (rowDiff === 1 && colDiff === 1)
    const isAdjacent = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)

    return isAdjacent
  }

  const handleTileClick = (tileIndex) => {
    if (gameStatus !== 'playing') return
    if (emptyIndex === null || emptyIndex === undefined) return

    // tileIndex é o índice no array de tiles, não a posição atual
    const tile = tiles[tileIndex]
    if (!tile) return

    const currentPos = tile.currentPosition
    
    // Verificar novamente se o tile está adjacente ao espaço vazio (não diagonal)
    if (!getEmptyNeighbors(currentPos)) {
      return // Não está adjacente, não fazer nada
    }

    // Verificar se não é movimento diagonal (proteção extra)
    const emptyRow = Math.floor(emptyIndex / gridSize)
    const emptyCol = emptyIndex % gridSize
    const tileRow = Math.floor(currentPos / gridSize)
    const tileCol = currentPos % gridSize
    
    const rowDiff = Math.abs(tileRow - emptyRow)
    const colDiff = Math.abs(tileCol - emptyCol)
    
    // Se for diagonal, não permitir movimento
    if (rowDiff === 1 && colDiff === 1) {
      return
    }

    // Mover tile para posição vazia
    const newTiles = tiles.map(t => {
      if (t.id === tile.id) {
        return { ...t, currentPosition: emptyIndex }
      }
      return t
    })

    setTiles(newTiles)
    setEmptyIndex(currentPos)
    setMoves(prev => prev + 1)
  }

  const startGame = () => {
    setGameStatus('playing')
    setStartTime(Date.now())
    setMoves(0)
  }

  const resetGame = () => {
    setGameStatus('waiting')
    setMoves(0)
    setStartTime(null)
    initializeTiles()
  }

  const renderTile = (tile, index) => {
    // Verificar se está na posição correta comparando a posição atual com a posição correta
    const isInCorrectPosition = tile.currentPosition === tile.correctPosition
    // Verificar se é clicável - recalcular sempre para garantir que está atualizado
    const isClickable = gameStatus === 'playing' && emptyIndex !== null && getEmptyNeighbors(tile.currentPosition)
    const tileSize = IMAGE_SIZE / gridSize

    return (
      <div
        key={tile.id}
        className={`puzzle-tile ${isClickable ? 'clickable' : ''} ${isInCorrectPosition ? 'correct' : ''}`}
        style={{
          width: `${tileSize}px`,
          height: `${tileSize}px`
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (isClickable && gameStatus === 'playing') {
            handleTileClick(index)
          }
        }}
      >
        <img
          src={tile.imageData}
          alt={`Tile ${tile.id}`}
          draggable="false"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'cover',
            pointerEvents: 'none', // Prevenir que a imagem bloqueie o click
            userSelect: 'none'
          }}
        />
        {isInCorrectPosition && (
          <div className="tile-check">✓</div>
        )}
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className="puzzle-container">
        <div className="puzzle-error">
          <h2>🧩 Puzzle de Imagem</h2>
          <p>Por favor, fornece uma URL ou caminho para a imagem.</p>
          <p className="puzzle-info">
            Coloca a imagem na pasta: <code>src/games/Puzzle/image.jpg</code>
          </p>
        </div>
      </div>
    )
  }

  if (!imageLoaded) {
    return (
      <div className="puzzle-container">
        <div className="puzzle-loading">
          <h2>🧩 Puzzle de Imagem</h2>
          <p>A carregar imagem...</p>
        </div>
      </div>
    )
  }

  if (gameStatus === 'waiting') {
    return (
      <div className="puzzle-container">
        <div className="puzzle-start-screen">
          <h2>🧩 Puzzle de Imagem</h2>
          <p className="puzzle-instruction">
            Monta a imagem trocando as peças! Clica numa peça adjacente ao espaço vazio para a moveres.
          </p>
          <p className="puzzle-size-info">
            Tamanho: <b>{gridSize}×{gridSize}</b> | Dificuldade: <b>{difficulty === 'easy' ? 'Fácil' : difficulty === 'hard' ? 'Difícil' : 'Médio'}</b>
          </p>
          <button onClick={startGame} className="puzzle-start-button">
            Começar
          </button>
        </div>
      </div>
    )
  }

  if (gameStatus === 'won') {
    const elapsedTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 0
    return (
      <div className="puzzle-container">
        <div className="puzzle-result">
          <h2>🎉 Parabéns! Completaste o puzzle!</h2>
          <p>Moves: {moves}</p>
          <p>Tempo: {elapsedTime}s</p>
          <button onClick={resetGame} className="puzzle-reset-button">
            Jogar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="puzzle-container">
      <div className="puzzle-header">
        <h2>🧩 Puzzle de Imagem</h2>
        <div className="puzzle-stats">
          <span>Moves: {moves}</span>
          {startTime && (
            <span>Tempo: {Math.round((Date.now() - startTime) / 1000)}s</span>
          )}
        </div>
      </div>

      <div className="puzzle-board" style={{ width: `${IMAGE_SIZE}px`, height: `${IMAGE_SIZE}px` }}>
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          // Renderizar espaço vazio
          if (index === emptyIndex) {
            return (
              <div
                key={`empty-${index}`}
                className="puzzle-tile empty"
                style={{
                  width: `${IMAGE_SIZE / gridSize}px`,
                  height: `${IMAGE_SIZE / gridSize}px`
                }}
              />
            )
          }
          
          // Encontrar tile que está nesta posição
          const tile = tiles.find(t => t.currentPosition === index)
          if (tile) {
            const tileArrayIndex = tiles.indexOf(tile)
            return renderTile(tile, tileArrayIndex)
          }
          
          // Se não há tile nesta posição e não é o espaço vazio, algo está errado
          // Mas não renderizar nada para evitar erros
          return (
            <div
              key={`missing-${index}`}
              className="puzzle-tile empty"
              style={{
                width: `${IMAGE_SIZE / gridSize}px`,
                height: `${IMAGE_SIZE / gridSize}px`,
                backgroundColor: 'rgba(255,0,0,0.2)' // Debug: mostrar em vermelho se faltar tile
              }}
            />
          )
        })}
      </div>

      <div className="puzzle-controls">
        <button onClick={resetGame} className="puzzle-reset-button">
          Reiniciar
        </button>
      </div>
    </div>
  )
}

export default Puzzle

