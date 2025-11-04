// Utilitário para carregar e processar a configuração do calendário
import calendarConfigData from '../config/calendar-config.json'

// Criar mapas para acesso rápido por dia
const daysMap = new Map()
calendarConfigData.days.forEach(dayConfig => {
  daysMap.set(dayConfig.day, dayConfig)
})

/**
 * Obtém a configuração completa de um dia específico
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {object|null} Configuração do dia ou null se não existir
 */
export const getDayConfig = (day) => {
  return daysMap.get(day) || null
}

/**
 * Obtém a prenda de um dia específico
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {object|null} Prenda do dia ou null se não existir
 */
export const getDayGift = (day) => {
  const config = getDayConfig(day)
  return config ? config.gift : null
}

/**
 * Obtém o jogo de um dia específico
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {object|null} Jogo do dia ou null se não existir
 */
export const getDayGame = (day) => {
  const config = getDayConfig(day)
  return config ? config.game : null
}

/**
 * Obtém a configuração de um tipo de jogo específico
 * @param {string} gameType - Tipo de jogo (ex: "wordle", "t9-encoding")
 * @returns {object|null} Configuração do jogo ou null se não existir
 */
export const getGameConfig = (gameType) => {
  return calendarConfigData.games?.[gameType] || null
}

/**
 * Obtém os eventos da linha do tempo de um dia
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {array|null} Array de eventos ou null se não existir
 */
export const getDayGameEvents = (day) => {
  const game = getDayGame(day)
  return game?.events || null
}

/**
 * Obtém a palavra específica de um jogo de um dia (se definida)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {string|null} Palavra específica ou null se usar random
 */
export const getDayGameWord = (day) => {
  const game = getDayGame(day)
  return game?.word || null
}

/**
 * Obtém os números T9 de um dia (para jogos T9 encoding)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {string|null} Números T9 ou null se não existir
 */
export const getDayGameNumbers = (day) => {
  const game = getDayGame(day)
  return game?.numbers || null
}

/**
 * Obtém os prémios da roda de um dia (para jogos wheel)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {array|null} Array de prémios ou null se não existir
 */
export const getDayGamePrizes = (day) => {
  const game = getDayGame(day)
  return game?.prizes || null
}

/**
 * Obtém a frase T9 de um dia (para jogos T9 encoding com frases)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {string|null} Frase ou null se não existir
 */
export const getDayGamePhrase = (day) => {
  const game = getDayGame(day)
  return game?.phrase || null
}

/**
 * Obtém as perguntas do quiz de um dia (para jogos quiz)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {array|null} Array de perguntas ou null se não existir
 */
export const getDayGameQuestions = (day) => {
  const game = getDayGame(day)
  return game?.questions || null
}

/**
 * Obtém as perguntas trivia de um dia (para jogos trivia)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {array|null} Array de perguntas trivia ou null se não existir
 */
export const getDayGameTriviaQuestions = (day) => {
  const game = getDayGame(day)
  return game?.questions || null
}

/**
 * Obtém o número de rounds do jogo de reflexo de um dia
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {number} Número de rounds (padrão: 5)
 */
export const getDayGameRounds = (day) => {
  const game = getDayGame(day)
  return game?.rounds || 5
}

/**
 * Obtém os riddles de um dia (para jogos riddles)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {array|null} Array de riddles ou null se não existir
 */
export const getDayGameRiddles = (day) => {
  const game = getDayGame(day)
  return game?.riddles || null
}

/**
 * Obtém o texto codificado de um dia (para jogos cryptogram)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {string|null} Texto codificado ou null se não existir
 */
export const getDayGameEncodedText = (day) => {
  const game = getDayGame(day)
  return game?.encodedText || null
}

/**
 * Obtém o texto decodificado de um dia (para jogos cryptogram)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {string|null} Texto decodificado ou null se não existir
 */
export const getDayGameDecodedText = (day) => {
  const game = getDayGame(day)
  return game?.decodedText || null
}

/**
 * Obtém o tipo de cifra de um dia (para jogos cryptogram)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {string|null} Tipo de cifra (shift, custom, reverse) ou null
 */
export const getDayGameCipherType = (day) => {
  const game = getDayGame(day)
  return game?.cipherType || null
}

/**
 * Obtém a regra da cifra de um dia (para jogos cryptogram)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {object|null} Regra da cifra ou null
 */
export const getDayGameCipherRule = (day) => {
  const game = getDayGame(day)
  return game?.cipherRule || null
}

/**
 * Obtém o puzzle do sudoku de um dia (para jogos mini-sudoku)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {array|null} Grid do puzzle ou null se não existir
 */
export const getDayGameSudokuPuzzle = (day) => {
  const game = getDayGame(day)
  return game?.puzzle || null
}

/**
 * Obtém a solução do sudoku de um dia (para jogos mini-sudoku)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {string|null} Solução no formato "1234 | 1234 | 1234 | 1234" ou null
 */
export const getDayGameSudokuSolution = (day) => {
  const game = getDayGame(day)
  return game?.solution || null
}

/**
 * Obtém os números iniciais do sudoku de um dia (para jogos mini-sudoku)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {string|null} Números iniciais no formato "1004 | 0230 | 1034 | 1200" ou null
 */
export const getDayGameSudokuInitial = (day) => {
  const game = getDayGame(day)
  return game?.initial || null
}

/**
 * Obtém a dica do sudoku de um dia (para jogos mini-sudoku)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {string|null} Dica personalizada ou null
 */
export const getDayGameSudokuHint = (day) => {
  const game = getDayGame(day)
  return game?.hint || null
}

/**
 * Obtém as palavras de um dia (para jogos word-search)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {array|null} Array de palavras ou null se não existir
 */
export const getDayGameWords = (day) => {
  const game = getDayGame(day)
  return game?.words || null
}

/**
 * Obtém o tamanho da grelha de um dia (para jogos word-search)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {number} Tamanho da grelha (padrão: 12)
 */
export const getDayGameGridSize = (day) => {
  const game = getDayGame(day)
  return game?.gridSize || 12
}

/**
 * Obtém o número de corações alvo de um dia (para jogos catch-hearts)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {number} Número de corações alvo (padrão: 30)
 */
export const getDayGameTargetHearts = (day) => {
  const game = getDayGame(day)
  return game?.targetHearts || 30
}

/**
 * Obtém a duração do jogo de um dia (para jogos catch-hearts)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {number} Duração em segundos (padrão: 60)
 */
export const getDayGameDuration = (day) => {
  const game = getDayGame(day)
  return game?.gameDuration || 60
}

/**
 * Obtém o número máximo de tentativas de um dia (para jogos catch-hearts)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {number} Número máximo de tentativas (padrão: 3)
 */
export const getDayGameMaxAttempts = (day) => {
  const game = getDayGame(day)
  return game?.maxAttempts || 3
}

/**
 * Obtém a frase de um dia (para jogos scrambled-sentence)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {string|null} Frase ou null
 */
export const getDayGameSentence = (day) => {
  const game = getDayGame(day)
  return game?.sentence || null
}

/**
 * Obtém o tamanho do labirinto de um dia (para jogos maze-heart)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {number} Tamanho do labirinto (padrão: 15)
 */
export const getDayGameMazeSize = (day) => {
  const game = getDayGame(day)
  return game?.mazeSize || 15
}

/**
 * Obtém a dificuldade do labirinto de um dia (para jogos maze-heart)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {string} Dificuldade (easy, normal, hard, insane) - padrão: 'normal'
 */
export const getDayGameDifficulty = (day) => {
  const game = getDayGame(day)
  return game?.difficulty || 'normal'
}

/**
 * Obtém o fio correto de um dia (para jogos bomb-wire)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {string} Fio correto (vermelho, azul, verde) - padrão: 'verde'
 */
export const getDayGameCorrectWire = (day) => {
  const game = getDayGame(day)
  return game?.correctWire || 'verde'
}

/**
 * Obtém as regras/pistas de um dia (para jogos bomb-wire)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {array} Array de regras/pistas - padrão: []
 */
export const getDayGameRules = (day) => {
  const game = getDayGame(day)
  return game?.rules || []
}

/**
 * Obtém o tempo máximo de um dia (para jogos bomb-wire)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {number} Tempo máximo em segundos - padrão: 60
 */
export const getDayGameMaxTime = (day) => {
  const game = getDayGame(day)
  return game?.maxTime || 60
}

/**
 * Obtém as perguntas matemáticas de um dia (para jogos bomb-wire)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {array} Array de perguntas matemáticas - padrão: []
 */
export const getDayGameMathQuestions = (day) => {
  const game = getDayGame(day)
  return game?.mathQuestions || []
}

/**
 * Obtém o horário de abertura do jogo de um dia específico
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {string|null} Horário no formato "HH:mm" ou null
 */
export const getGameOpenTime = (day) => {
  const game = getDayGame(day)
  return game ? game.openTime : null
}

/**
 * Converte horário no formato "HH:mm" para Date no dia especificado
 * @param {number} day - Dia de dezembro (1-25)
 * @param {string} time - Horário no formato "HH:mm"
 * @returns {Date} Data/hora completa
 */
export const getGameOpenDateTime = (day, time = null) => {
  const openTime = time || getGameOpenTime(day)
  if (!openTime) return null

  const today = new Date()
  const currentYear = today.getFullYear()
  const [hours, minutes] = openTime.split(':').map(Number)

  // Se o horário é às 00:00, o jogo abre nesse dia
  // Se o horário é depois das 21:00, considera-se que abre no dia anterior às 21h (padrão antigo)
  // Se é outro horário, abre no próprio dia
  if (hours === 0 && minutes === 0) {
    const openDate = new Date(currentYear, 11, day) // Dezembro = mês 11
    openDate.setHours(hours, minutes, 0, 0)
    return openDate
  } else if (hours >= 21) {
    // Horário às 21h ou depois: abre no dia anterior
    const openDate = new Date(currentYear, 11, day)
    openDate.setDate(openDate.getDate() - 1)
    openDate.setHours(hours, minutes, 0, 0)
    return openDate
  } else {
    // Outros horários: abre no próprio dia
    const openDate = new Date(currentYear, 11, day)
    openDate.setHours(hours, minutes, 0, 0)
    return openDate
  }
}

/**
 * Verifica se um jogo já pode ser jogado (baseado no horário de abertura)
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {boolean}
 */
export const canPlayGame = (day) => {
  const game = getDayGame(day)
  if (!game) return false

  const openDateTime = getGameOpenDateTime(day, game.openTime)
  if (!openDateTime) return false

  const now = new Date()
  return now >= openDateTime
}

/**
 * Obtém todos os dias configurados
 * @returns {array} Array com todos os dias (1-25)
 */
export const getAllDays = () => {
  return calendarConfigData.days.map(d => d.day).sort((a, b) => a - b)
}

/**
 * Obtém todos os presentes (para compatibilidade com código antigo)
 * @returns {object} Objeto com formato { day: gift }
 */
export const getAllGifts = () => {
  const gifts = {}
  calendarConfigData.days.forEach(({ day, gift }) => {
    gifts[day] = gift
  })
  return gifts
}

/**
 * Obtém todos os jogos (para compatibilidade com código antigo)
 * @returns {object} Objeto com formato { day: game }
 */
export const getAllGames = () => {
  const games = {}
  calendarConfigData.days.forEach(({ day, game }) => {
    games[day] = game
  })
  return games
}

// Exportar também os dados completos se necessário
export default calendarConfigData
