import React, { useState, useEffect } from 'react'
import './MiniSudoku.css'

function MiniSudoku({ puzzle, solution, initial, hint, day, onWin, onComplete, onGameAttempt }) {
  const GRID_SIZE = 4
  const ICONS = ['🎄', '❤️', '⭐', '🎁']
  
  // Converter número (1-4) para ícone
  const numberToIcon = (num) => {
    const n = parseInt(num)
    if (n >= 1 && n <= 4) {
      return ICONS[n - 1]
    }
    return null
  }
  
  // Converter string "1234 | 1234 | 1234 | 1234" para grid 4x4
  // Se for initial (tem 0s), 0 = null (vazio)
  const parseGridString = (str, isInitial = false) => {
    if (!str) return null
    const rows = str.split('|').map(s => s.trim())
    if (rows.length !== GRID_SIZE) {
      return null
    }
    
    const parsed = rows.map((row) => {
      const cells = row.split('').map((num) => {
        const n = parseInt(num)
        if (isNaN(n)) {
          return null
        }
        if (isInitial && n === 0) {
          return null // 0 significa vazio na initial
        }
        return numberToIcon(n)
      })
      if (cells.length !== GRID_SIZE) {
        return null
      }
      return cells
    }).filter(row => row !== null)
    
    if (parsed.length !== GRID_SIZE) {
      return null
    }
    
    return parsed
  }
  
  // Gerar grid inicial a partir de initial string ou puzzle antigo
  const generateInitialGrid = () => {
    // Se tiver initial string, usar ela (0s viram null)
    if (initial) {
      const parsed = parseGridString(initial, true)
      if (parsed) {
        return parsed
      }
    }
    
    // Se tiver puzzle antigo (array), usar ele
    if (puzzle && Array.isArray(puzzle)) {
      return puzzle.map(row => row.map(cell => cell || null))
    }
    
    // Default vazio
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  }
  
  // Guardar solução correta
  const [correctSolution, setCorrectSolution] = useState(null)

  const [initialGrid, setInitialGrid] = useState(() => {
    // Função auxiliar para parsear na inicialização
    const parseInit = () => {
      if (initial) {
        const rows = initial.split('|').map(s => s.trim())
        if (rows.length === GRID_SIZE) {
          return rows.map(row => {
            return row.split('').map(num => {
              const n = parseInt(num)
              if (n === 0) return null
              return numberToIcon(n)
            })
          })
        }
      }
      return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
    }
    return parseInit()
  })
  
  const [grid, setGrid] = useState(() => {
    // Usar a mesma lógica do initialGrid
    const parseInit = () => {
      if (initial) {
        const rows = initial.split('|').map(s => s.trim())
        if (rows.length === GRID_SIZE) {
          return rows.map(row => {
            return row.split('').map(num => {
              const n = parseInt(num)
              if (n === 0) return null
              return numberToIcon(n)
            })
          })
        }
      }
      return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
    }
    return parseInit()
  })
  
  const [gameStatus, setGameStatus] = useState('playing')
  const [attempts, setAttempts] = useState(0)
  const [errors, setErrors] = useState(0)
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedIcon, setSelectedIcon] = useState(null)
  const [startTime, setStartTime] = useState(Date.now())

  useEffect(() => {
    const newInitialGrid = generateInitialGrid()
    
    // Criar deep copy para garantir que não há referências partilhadas
    const gridCopy = newInitialGrid.map(row => [...row])
    
    setInitialGrid(gridCopy)
    setGrid(gridCopy.map(row => [...row]))
    
    // Atualizar solução correta
    if (solution) {
      const parsed = parseGridString(solution)
      if (parsed) {
        // Criar deep copy da solução também
        const solutionCopy = parsed.map(row => [...row])
        setCorrectSolution(solutionCopy)
      } else {
        setCorrectSolution(null)
      }
    } else {
      setCorrectSolution(null)
    }
    
    // Reset tempo, tentativas e erros quando puzzle muda
    setStartTime(Date.now())
    setAttempts(0)
    setErrors(0)
    setGameStatus('playing')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle, solution, initial])

  const isInitialCell = (row, col) => {
    return initialGrid[row][col] !== null && initialGrid[row][col] !== undefined
  }

  const handleCellClick = (row, col) => {
    if (gameStatus !== 'playing' || isInitialCell(row, col)) return
    
    setSelectedCell({ row, col })
    
    if (selectedIcon) {
      handlePlaceIcon(row, col, selectedIcon)
      setSelectedIcon(null)
    }
  }

  const handleIconSelect = (icon) => {
    setSelectedIcon(icon)
  }

  const handlePlaceIcon = (row, col, icon) => {
    if (isInitialCell(row, col)) return
    
    const newGrid = grid.map(r => [...r])
    newGrid[row][col] = icon
    setGrid(newGrid)
    setSelectedCell(null)
    setAttempts(prev => prev + 1)
    
    // Verificar se está completo
    if (isGridComplete(newGrid)) {
      checkSolution(newGrid)
    }
  }

  const isGridComplete = (g) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!g[i][j]) return false
      }
    }
    return true
  }

  const checkSolution = (g) => {
    let isValid = true
    
    // Se tiver solução configurada, comparar diretamente
    if (correctSolution) {
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          if (g[i][j] !== correctSolution[i][j]) {
            isValid = false
            break
          }
        }
        if (!isValid) break
      }
    } else {
      // Se não tiver solução configurada, verificar regras do Sudoku 4x4:
      // 1. Cada linha deve ter todos os ícones únicos
      // 2. Cada coluna deve ter todos os ícones únicos
      // 3. Cada bloco 2x2 deve ter todos os ícones únicos
      
      // Verificar linhas
      for (let i = 0; i < GRID_SIZE; i++) {
        const row = g[i]
        const unique = [...new Set(row.filter(cell => cell !== null))]
        if (unique.length !== GRID_SIZE) {
          isValid = false
          break
        }
        // Verificar se tem todos os ícones
        const hasAllIcons = ICONS.every(icon => row.includes(icon))
        if (!hasAllIcons) {
          isValid = false
          break
        }
      }
      
      if (isValid) {
        // Verificar colunas
        for (let j = 0; j < GRID_SIZE; j++) {
          const col = g.map(row => row[j])
          const unique = [...new Set(col.filter(cell => cell !== null))]
          if (unique.length !== GRID_SIZE) {
            isValid = false
            break
          }
          const hasAllIcons = ICONS.every(icon => col.includes(icon))
          if (!hasAllIcons) {
            isValid = false
            break
          }
        }
      }
      
      if (isValid) {
        // Verificar blocos 2x2
        const blocks = [
          [[0, 0], [0, 1], [1, 0], [1, 1]],
          [[0, 2], [0, 3], [1, 2], [1, 3]],
          [[2, 0], [2, 1], [3, 0], [3, 1]],
          [[2, 2], [2, 3], [3, 2], [3, 3]],
        ]
        
        for (const block of blocks) {
          const blockCells = block.map(([r, c]) => g[r][c])
          const unique = [...new Set(blockCells.filter(cell => cell !== null))]
          if (unique.length !== GRID_SIZE) {
            isValid = false
            break
          }
          const hasAllIcons = ICONS.every(icon => blockCells.includes(icon))
          if (!hasAllIcons) {
            isValid = false
            break
          }
        }
      }
    }
    
    if (isValid) {
      setGameStatus('won')
      
      const elapsedTime = Math.round((Date.now() - startTime) / 1000) // Tempo em segundos
      
      setTimeout(() => {
        if (onGameAttempt && day) {
          onGameAttempt('mini-sudoku', day, {
            won: true,
            attempts: attempts + 1,
            errors: errors,
            score: null,
            metadata: {
              timeSeconds: elapsedTime,
            },
          })
        }
      }, 0)
      
      if (onWin) {
        setTimeout(() => onWin(attempts + 1), 500)
      }
      if (onComplete) {
        setTimeout(() => onComplete(attempts + 1, true), 500)
      }
    } else {
      const newErrors = errors + 1
      setErrors(newErrors)
      const elapsedTime = Math.round((Date.now() - startTime) / 1000) // Tempo em segundos
      
      // Registar tentativa com erro (mas ainda está a jogar, não perdido)
      // Nota: Só registamos quando perder completamente (se houver limite) ou quando ganhar
      // Por agora, vamos registar se houver muitas tentativas de verificação erradas
      
      alert('A solução não está correta! Verifica as regras do Sudoku.')
    }
  }

  const handleSubmit = () => {
    if (!isGridComplete(grid)) {
      alert('Por favor, preenche todas as células!')
      return
    }
    checkSolution(grid)
  }

  const handleReset = () => {
    setGrid(initialGrid.map(row => row.map(cell => cell || null)))
    setGameStatus('playing')
    setAttempts(0)
    setErrors(0)
    setSelectedCell(null)
    setSelectedIcon(null)
    setStartTime(Date.now()) // Reset tempo quando reseta
  }

  if (gameStatus === 'won') {
    return (
      <div className="sudoku-container">
        <div className="sudoku-result">
          <h2>🎉 Parabéns! Sudoku Completo!</h2>
          <p>Resolveste em {attempts} tentativa{attempts > 1 ? 's' : ''}!</p>
          <button onClick={handleReset} className="sudoku-reset-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sudoku-container">
      <div className="sudoku-header">
        <h2>🧩 Mini Sudoku (4x4)</h2>
        <p className="sudoku-instruction">
          Preenche a grelha: cada linha, coluna e bloco 2x2 deve ter todos os ícones únicos!
        </p>
        {hint && (
          <p className="sudoku-hint">
            💡 Dica: {hint}
          </p>
        )}
        <div className="sudoku-stats">
          <span>Tentativas: {attempts}</span>
          {errors > 0 && <span className="errors">Erros: {errors}</span>}
        </div>
      </div>

      <div className="sudoku-game-area">
        <div className="sudoku-grid">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="sudoku-row">
              {row.map((cell, colIdx) => {
                const isInitial = isInitialCell(rowIdx, colIdx)
                const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx
                return (
                  <div
                    key={colIdx}
                    className={`sudoku-cell ${isInitial ? 'initial' : 'editable'} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                  >
                    {cell || ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="sudoku-icons-picker">
          <h3>Seleciona um ícone:</h3>
          <div className="icons-grid">
            {ICONS.map(icon => (
              <button
                key={icon}
                className={`icon-button ${selectedIcon === icon ? 'selected' : ''}`}
                onClick={() => handleIconSelect(icon)}
              >
                {icon}
              </button>
            ))}
          </div>
          {selectedIcon && (
            <p className="icon-hint">Clica numa célula vazia para colocar {selectedIcon}</p>
          )}
        </div>

        <button
          className="sudoku-submit-button"
          onClick={handleSubmit}
          disabled={gameStatus !== 'playing' || !isGridComplete(grid)}
        >
          Verificar Solução
        </button>
      </div>
    </div>
  )
}

export default MiniSudoku

