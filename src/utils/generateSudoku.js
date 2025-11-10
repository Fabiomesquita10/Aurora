/**
 * Gera um puzzle de Mini Sudoku 4x4 aleatório
 * @returns {object} { solution, initial } - Solução completa e puzzle inicial
 */

const GRID_SIZE = 4
const ICONS = ['🎄', '❤️', '⭐', '🎁']

// Converter ícone para número (1-4)
const iconToNumber = (icon) => {
  const index = ICONS.indexOf(icon)
  return index >= 0 ? index + 1 : 0
}

// Converter número para ícone
const numberToIcon = (num) => {
  const n = parseInt(num)
  if (n >= 1 && n <= 4) {
    return ICONS[n - 1]
  }
  return null
}

// Verificar se um valor pode ser colocado numa posição
const isValidPlacement = (grid, row, col, value) => {
  // Verificar linha
  for (let c = 0; c < GRID_SIZE; c++) {
    if (grid[row][c] === value) return false
  }
  
  // Verificar coluna
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r][col] === value) return false
  }
  
  // Verificar bloco 2x2
  const blockRow = Math.floor(row / 2) * 2
  const blockCol = Math.floor(col / 2) * 2
  for (let r = blockRow; r < blockRow + 2; r++) {
    for (let c = blockCol; c < blockCol + 2; c++) {
      if (grid[r][c] === value) return false
    }
  }
  
  return true
}

// Resolver sudoku usando backtracking
const solveSudoku = (grid) => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === null) {
        // Tentar cada ícone
        const shuffledIcons = [...ICONS].sort(() => Math.random() - 0.5)
        for (const icon of shuffledIcons) {
          if (isValidPlacement(grid, row, col, icon)) {
            grid[row][col] = icon
            if (solveSudoku(grid)) {
              return true
            }
            grid[row][col] = null // Backtrack
          }
        }
        return false
      }
    }
  }
  return true
}

// Converter grid para string no formato "1234 | 1234 | 1234 | 1234"
const gridToString = (grid) => {
  return grid.map(row => {
    return row.map(cell => {
      if (cell === null) return '0'
      return iconToNumber(cell).toString()
    }).join('')
  }).join(' | ')
}

/**
 * Gera um puzzle de Mini Sudoku 4x4 aleatório
 * @param {number} difficulty - Número de células a remover (6-10 é bom para 4x4)
 * @returns {object} { solution, initial } - Solução e puzzle inicial
 */
export const generateRandomSudoku = (difficulty = 8) => {
  // Criar grid vazio
  const solution = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  
  // Preencher algumas células aleatórias para começar
  const numStartCells = 2 + Math.floor(Math.random() * 3) // 2-4 células iniciais
  const startPositions = []
  
  for (let i = 0; i < numStartCells; i++) {
    let row, col
    do {
      row = Math.floor(Math.random() * GRID_SIZE)
      col = Math.floor(Math.random() * GRID_SIZE)
    } while (solution[row][col] !== null)
    
    // Escolher um ícone válido
    const shuffledIcons = [...ICONS].sort(() => Math.random() - 0.5)
    for (const icon of shuffledIcons) {
      if (isValidPlacement(solution, row, col, icon)) {
        solution[row][col] = icon
        startPositions.push({ row, col })
        break
      }
    }
  }
  
  // Resolver o sudoku
  solveSudoku(solution)
  
  // Criar puzzle inicial removendo células aleatórias
  const initial = solution.map(row => [...row])
  const cellsToRemove = Math.min(difficulty, GRID_SIZE * GRID_SIZE - numStartCells)
  const positions = []
  
  // Criar lista de todas as posições
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!startPositions.some(p => p.row === r && p.col === c)) {
        positions.push({ row: r, col: c })
      }
    }
  }
  
  // Remover células aleatórias
  const shuffledPositions = positions.sort(() => Math.random() - 0.5)
  for (let i = 0; i < Math.min(cellsToRemove, shuffledPositions.length); i++) {
    const { row, col } = shuffledPositions[i]
    initial[row][col] = null
  }
  
  return {
    solution: gridToString(solution),
    initial: gridToString(initial),
    puzzle: null, // Não usado, mas mantido para compatibilidade
    hint: null
  }
}

