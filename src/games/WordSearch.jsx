import React, { useState, useEffect, useRef } from 'react'
import './WordSearch.css'

function WordSearch({ words, gridSize = 12, day, onWin, onComplete, onGameAttempt }) {
  const [grid, setGrid] = useState([])
  const [selectedCells, setSelectedCells] = useState([])
  const [foundWords, setFoundWords] = useState([])
  const [foundWordPositions, setFoundWordPositions] = useState([]) // Guardar posições das palavras encontradas
  const [gameStatus, setGameStatus] = useState('playing')
  const [attempts, setAttempts] = useState(0)
  const [startCell, setStartCell] = useState(null)
  const [startTime, setStartTime] = useState(Date.now())
  const gridRef = useRef(null)

  // Palavras padrão se não fornecidas
  const defaultWords = ['AMOR', 'SONHO', 'BEIJO', 'PAIXAO', 'FELIZ']
  const wordsList = words || defaultWords

  // Gerar grelha com palavras
  useEffect(() => {
    if (wordsList && wordsList.length > 0) {
      generateGrid()
      setStartTime(Date.now()) // Reset tempo quando gera nova grelha
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordsList, gridSize])

  const generateGrid = () => {
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''))
    const placedWords = []
    
    // Tentar colocar cada palavra
    wordsList.forEach(word => {
      let placed = false
      let attempts = 0
      const maxAttempts = 50
      
      while (!placed && attempts < maxAttempts) {
        attempts++
        
        // Direções: horizontal, vertical, diagonal
        const direction = Math.floor(Math.random() * 4)
        // 0: horizontal, 1: vertical, 2: diagonal \, 3: diagonal /
        
        let row, col
        
        switch (direction) {
          case 0: // Horizontal
            row = Math.floor(Math.random() * gridSize)
            col = Math.floor(Math.random() * (gridSize - word.length))
            break
          case 1: // Vertical
            row = Math.floor(Math.random() * (gridSize - word.length))
            col = Math.floor(Math.random() * gridSize)
            break
          case 2: // Diagonal \
            row = Math.floor(Math.random() * (gridSize - word.length))
            col = Math.floor(Math.random() * (gridSize - word.length))
            break
          case 3: // Diagonal /
            row = Math.floor(Math.random() * (gridSize - word.length)) + word.length - 1
            col = Math.floor(Math.random() * (gridSize - word.length))
            break
        }
        
        // Verificar se pode colocar a palavra
        let canPlace = true
        const positions = []
        
        for (let i = 0; i < word.length; i++) {
          let r, c
          switch (direction) {
            case 0:
              r = row
              c = col + i
              break
            case 1:
              r = row + i
              c = col
              break
            case 2:
              r = row + i
              c = col + i
              break
            case 3:
              r = row - i
              c = col + i
              break
          }
          
          positions.push([r, c])
          
          if (newGrid[r][c] && newGrid[r][c] !== word[i]) {
            canPlace = false
            break
          }
        }
        
        if (canPlace) {
          positions.forEach(([r, c], idx) => {
            newGrid[r][c] = word[idx]
          })
          placedWords.push({ word, positions, direction })
          placed = true
        }
      }
    })
    
    // Preencher células vazias com letras aleatórias
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (!newGrid[i][j]) {
          newGrid[i][j] = letters[Math.floor(Math.random() * letters.length)]
        }
      }
    }
    
    setGrid(newGrid)
  }

  const getCellCoordinates = (row, col) => {
    return { row, col }
  }

  const handleCellMouseDown = (row, col) => {
    if (gameStatus !== 'playing') return
    setStartCell({ row, col })
    setSelectedCells([{ row, col }])
  }

  const handleCellMouseEnter = (row, col) => {
    if (!startCell || gameStatus !== 'playing') return
    
    const newSelected = []
    const startRow = startCell.row
    const startCol = startCell.col
    
    // Determinar direção baseada no primeiro movimento
    const deltaRow = row - startRow
    const deltaCol = col - startCol
    
    if (deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)) {
      // Direção válida
      const maxDist = Math.max(Math.abs(deltaRow), Math.abs(deltaCol))
      const dirRow = deltaRow === 0 ? 0 : deltaRow / Math.abs(deltaRow)
      const dirCol = deltaCol === 0 ? 0 : deltaCol / Math.abs(deltaCol)
      
      for (let i = 0; i <= maxDist; i++) {
        const r = startRow + dirRow * i
        const c = startCol + dirCol * i
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          newSelected.push({ row: r, col: c })
        }
      }
    }
    
    setSelectedCells(newSelected)
  }

  const handleCellMouseUp = () => {
    if (!startCell) {
      setStartCell(null)
      setSelectedCells([])
      return
    }
    
    if (selectedCells.length > 0) {
      checkWord()
    }
    
    setStartCell(null)
    setSelectedCells([])
  }

  const checkWord = () => {
    if (selectedCells.length === 0) return
    
    setAttempts(prev => {
      const currentAttempts = prev + 1
      
      // Construir palavra a partir das células selecionadas
      const word = selectedCells
        .map(cell => grid[cell.row][cell.col])
        .join('')
      
      // Verificar palavra e inverso
      const reversedWord = word.split('').reverse().join('')
      
      const foundWord = wordsList.find(w => 
        w.toUpperCase() === word || w.toUpperCase() === reversedWord
      )
      
      if (foundWord && !foundWords.includes(foundWord.toUpperCase())) {
        // Guardar as posições desta palavra encontrada
        const wordPositions = selectedCells.map(cell => ({ row: cell.row, col: cell.col }))
        
        setFoundWords(prev => {
          const newFound = [...prev, foundWord.toUpperCase()]
          
          // Adicionar posições à lista de posições encontradas
          setFoundWordPositions(prevPos => [...prevPos, ...wordPositions])
          
          if (newFound.length === wordsList.length) {
            // Todas as palavras encontradas!
            setGameStatus('won')
            
            const elapsedTime = Math.round((Date.now() - startTime) / 1000) // Tempo em segundos
            
            setTimeout(() => {
              if (onGameAttempt && day) {
                onGameAttempt('word-search', day, {
                  won: true,
                  attempts: currentAttempts,
                  errors: 0,
                  score: wordsList.length,
                  metadata: {
                    timeSeconds: elapsedTime,
                  },
                })
              }
            }, 0)
            
            if (onWin) {
              setTimeout(() => onWin(currentAttempts), 500)
            }
            if (onComplete) {
              setTimeout(() => onComplete(currentAttempts, true), 500)
            }
          }
          
          return newFound
        })
      }
      
      return currentAttempts
    })
  }

  const isCellSelected = (row, col) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col)
  }

  const isCellFound = (row, col) => {
    // Verificar se esta célula faz parte de uma palavra encontrada
    return foundWordPositions.some(pos => pos.row === row && pos.col === col)
  }

  const handleReset = () => {
    setFoundWords([])
    setFoundWordPositions([]) // Reset posições encontradas
    setGameStatus('playing')
    setAttempts(0)
    setSelectedCells([])
    setStartCell(null)
    setStartTime(Date.now()) // Reset tempo quando reseta
    if (wordsList && wordsList.length > 0) {
      generateGrid()
    }
  }

  if (gameStatus === 'won') {
    return (
      <div className="wordsearch-container">
        <div className="wordsearch-result">
          <h2>🎉 Parabéns! Encontraste todas as palavras!</h2>
          <p>Encontraste {wordsList.length} palavra{wordsList.length > 1 ? 's' : ''} em {attempts} tentativa{attempts > 1 ? 's' : ''}!</p>
          <button onClick={handleReset} className="wordsearch-reset-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="wordsearch-container">
      <div className="wordsearch-header">
        <h2>🔍 Caça Palavras</h2>
        <p className="wordsearch-instruction">
          Encontra todas as palavras na grelha! Podes selecionar na horizontal, vertical ou diagonal.
        </p>
        <div className="wordsearch-stats">
          <span>Palavras encontradas: {foundWords.length}/{wordsList.length}</span>
          <span>Tentativas: {attempts}</span>
        </div>
      </div>

      <div className="wordsearch-game-area">
        <div className="wordsearch-words-list">
          <h3>Palavras para encontrar:</h3>
          <div className="words-grid">
            {wordsList.map((word, idx) => (
              <span
                key={idx}
                className={`word-item ${foundWords.includes(word.toUpperCase()) ? 'found' : ''}`}
              >
                {word.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        <div
          ref={gridRef}
          className="wordsearch-grid"
          onMouseLeave={handleCellMouseUp}
        >
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="wordsearch-row">
              {row.map((cell, colIdx) => (
                <div
                  key={colIdx}
                  className={`wordsearch-cell ${isCellSelected(rowIdx, colIdx) ? 'selected' : ''} ${isCellFound(rowIdx, colIdx) ? 'found' : ''}`}
                  onMouseDown={() => handleCellMouseDown(rowIdx, colIdx)}
                  onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                  onMouseUp={handleCellMouseUp}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WordSearch

