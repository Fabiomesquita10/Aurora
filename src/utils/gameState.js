import { useState, useEffect, useRef } from 'react'
import { getAllGifts } from './calendarConfig'
import { loadGameAttempts, saveGameAttempts, addGameAttempt as saveGameAttempt, clearGameAttempts, removeDuplicateAttempts } from './gameAttemptsStorage'
import { loadUserState, saveUserState, clearUserState } from './userStateStorage'
import { createConfigBackup } from './configBackup'
import { getProfileKey, getCurrentProfile } from './userProfiles'

const STORAGE_KEYS = {
  POINTS: 'aurora_points',
  UNLOCKED_DAYS: 'aurora_unlocked_days',
  WON_GAMES: 'aurora_won_games',
  PURCHASED_ITEMS: 'aurora_purchased_items',
  LAST_DAILY_DATE: 'aurora_last_daily_date',
  DAILY_WORDLE_ATTEMPTS: 'aurora_daily_wordle_attempts',
  GAME_ATTEMPTS: 'aurora_game_attempts', // Registos completos de todos os jogos
}

// Função auxiliar para parse seguro de JSON
const safeJsonParse = (value, defaultValue) => {
  if (!value || value === 'undefined' || value === 'null') {
    return defaultValue
  }
  try {
    return JSON.parse(value)
  } catch (e) {
    console.warn('Erro ao fazer parse do localStorage:', e)
    return defaultValue
  }
}

// Inicializar estado padrão
const getInitialState = () => {
  // Tentar carregar do localStorage primeiro (sincronizado com JSON)
  // Usar getProfileKey para obter a chave correta do perfil atual
  const storageKey = getProfileKey('user_state_json')
  const stored = localStorage.getItem(storageKey)
  let userState = null
  if (stored) {
    try {
      userState = JSON.parse(stored)
    } catch (e) {
      console.warn('Erro ao fazer parse do user state:', e)
    }
  }
  
  const localPoints = parseInt(localStorage.getItem(STORAGE_KEYS.POINTS) || '0') || 0
  
  // Carregar game attempts (pode ser async, mas para inicialização usamos sync)
  // Tentar carregar do localStorage primeiro (sincronizado)
  let gameAttempts = []
  try {
    const storageKey = getProfileKey('game_attempts_json')
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      gameAttempts = JSON.parse(stored)
    }
  } catch (e) {
    console.warn('Erro ao carregar game attempts:', e)
  }
  
  // Calcular pontos totais: soma dos scores dos gameAttempts - pontos gastos na loja
  const spentPoints = userState?.spentPoints ?? 0
  const totalScore = gameAttempts
    .filter(attempt => attempt.score !== null && attempt.score !== undefined)
    .reduce((sum, attempt) => sum + (attempt.score || 0), 0)
  const calculatedPoints = Math.max(0, totalScore - spentPoints)
  
  return {
    points: calculatedPoints, // Pontos calculados dinamicamente
    spentPoints: spentPoints, // Pontos gastos na loja
    unlockedDays: userState?.unlockedDays ?? safeJsonParse(localStorage.getItem(STORAGE_KEYS.UNLOCKED_DAYS), []),
    wonGames: userState?.wonGames ?? safeJsonParse(localStorage.getItem(STORAGE_KEYS.WON_GAMES), []),
    purchasedItems: userState?.purchasedItems ?? safeJsonParse(localStorage.getItem(STORAGE_KEYS.PURCHASED_ITEMS), []),
    lastDailyDate: userState?.lastDailyDate ?? localStorage.getItem(STORAGE_KEYS.LAST_DAILY_DATE) ?? null,
    dailyWordleAttempts: userState?.dailyWordleAttempts ?? safeJsonParse(localStorage.getItem(STORAGE_KEYS.DAILY_WORDLE_ATTEMPTS), []),
    gameAttempts: gameAttempts,
  }
}

// Hook para usar o estado do jogo
export const useGameState = () => {
  const [state, setState] = useState(getInitialState)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar estado do JSON quando o componente monta ou quando o perfil muda
  useEffect(() => {
    const loadStateFromJSON = async () => {
      try {
        setIsLoading(true)
        
        // Forçar reload do JSON para garantir que temos os dados mais recentes
        const userState = await loadUserState(true)
        
        // Carregar game attempts do JSON (async)
        const gameAttempts = await loadGameAttempts()
        
        // Calcular pontos totais
        const spentPoints = userState?.spentPoints ?? 0
        const totalScore = gameAttempts
          .filter(attempt => attempt.score !== null && attempt.score !== undefined)
          .reduce((sum, attempt) => sum + (attempt.score || 0), 0)
        const calculatedPoints = Math.max(0, totalScore - spentPoints)
        
        // Atualizar estado com dados do JSON
        setState({
          points: calculatedPoints,
          spentPoints: spentPoints,
          unlockedDays: userState?.unlockedDays || [],
          wonGames: userState?.wonGames || [],
          purchasedItems: userState?.purchasedItems || [],
          lastDailyDate: userState?.lastDailyDate || null,
          dailyWordleAttempts: userState?.dailyWordleAttempts || [],
          gameAttempts: gameAttempts || []
        })
        
        setIsLoading(false)
      } catch (e) {
        console.warn('Erro ao carregar estado do JSON:', e)
        setIsLoading(false)
      }
    }
    
    loadStateFromJSON()
    
    // Escutar mudanças de perfil via storage event
    const handleStorageChange = (e) => {
      if (e.key === 'aurora_current_profile') {
        loadStateFromJSON()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Também escutar mudanças locais (mesma aba)
    const checkProfileChange = () => {
      const currentProfile = getCurrentProfile()
      const lastProfileId = localStorage.getItem('aurora_last_profile_id')
      if (currentProfile?.id !== lastProfileId) {
        localStorage.setItem('aurora_last_profile_id', currentProfile?.id || '')
        loadStateFromJSON()
      }
    }
    
    // Verificar mudanças de perfil periodicamente
    const interval = setInterval(checkProfileChange, 500)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, []) // Executar quando o componente monta

  // Limpar duplicados ao carregar (apenas uma vez)
  useEffect(() => {
    if (!isLoading) {
      const cleanDuplicates = async () => {
        const cleaned = await removeDuplicateAttempts()
        if (cleaned.length !== state.gameAttempts.length) {
          setState(prev => ({
            ...prev,
            gameAttempts: cleaned,
          }))
        }
        
        // Limpar duplicados nos wonGames (manter apenas o mais recente para cada gameId+day)
        const wonGamesMap = new Map()
        state.wonGames.forEach(game => {
          const key = `${game.gameId}-${game.day}`
          const existing = wonGamesMap.get(key)
          if (!existing || new Date(game.date) > new Date(existing.date)) {
            wonGamesMap.set(key, game)
          }
        })
        const cleanedWonGames = Array.from(wonGamesMap.values())
        
        if (cleanedWonGames.length !== state.wonGames.length) {
          console.log('Limpeza de duplicados nos wonGames:', state.wonGames.length - cleanedWonGames.length, 'duplicados removidos')
          setState(prev => ({
            ...prev,
            wonGames: cleanedWonGames,
          }))
        }
      }
      cleanDuplicates()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]) // Executar quando terminar de carregar

  // Recalcular pontos quando gameAttempts ou spentPoints mudam
  // Este useEffect serve como backup caso a atualização direta em addGameAttempt/purchaseItem não funcione
  useEffect(() => {
    const totalScore = state.gameAttempts
      .filter(attempt => attempt.score !== null && attempt.score !== undefined)
      .reduce((sum, attempt) => sum + (attempt.score || 0), 0)
    const spentPoints = state.spentPoints || 0
    const calculatedPoints = Math.max(0, totalScore - spentPoints)
    
    // Atualizar pontos calculados se necessário
    if (calculatedPoints !== state.points) {
      setState(prev => ({ ...prev, points: calculatedPoints }))
    }
  }, [state.gameAttempts, state.spentPoints]) // Usar o array completo para detectar todas as mudanças

  // Sincronizar com localStorage quando o estado muda
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POINTS, state.points.toString())
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_DAYS, JSON.stringify(state.unlockedDays))
    localStorage.setItem(STORAGE_KEYS.WON_GAMES, JSON.stringify(state.wonGames))
    localStorage.setItem(STORAGE_KEYS.PURCHASED_ITEMS, JSON.stringify(state.purchasedItems))
    if (state.lastDailyDate) {
      localStorage.setItem(STORAGE_KEYS.LAST_DAILY_DATE, state.lastDailyDate)
    }
    localStorage.setItem(STORAGE_KEYS.DAILY_WORDLE_ATTEMPTS, JSON.stringify(state.dailyWordleAttempts))
    
    // Guardar estado do utilizador no JSON (sem points - são sempre calculados dinamicamente)
    saveUserState({
      // points: NÃO guardar - são sempre calculados dinamicamente a partir dos game attempts
      spentPoints: state.spentPoints || 0,
      unlockedDays: state.unlockedDays,
      wonGames: state.wonGames,
      purchasedItems: state.purchasedItems,
      lastDailyDate: state.lastDailyDate,
      dailyWordleAttempts: state.dailyWordleAttempts
    })
    
    // Guardar registos no JSON (através do utilitário)
    saveGameAttempts(state.gameAttempts)
  }, [state])

  const addPoints = (amount) => {
    // Não adicionar pontos diretamente - pontos são calculados dos scores
    // Esta função é mantida para compatibilidade, mas não faz nada
    console.warn('addPoints não é mais usado - pontos são calculados dos scores dos gameAttempts')
  }

  const unlockDay = (day) => {
    if (!state.unlockedDays.includes(day)) {
      setState(prev => ({
        ...prev,
        unlockedDays: [...prev.unlockedDays, day].sort((a, b) => a - b),
      }))
    }
  }

  const addWonGame = (gameId, day, metadata = {}) => {
    // Criar uma chave única baseada no jogo e dia
    const wonGameKey = `${gameId}-${day}`
    const now = Date.now()
    
    // Limpar chaves antigas (mais de 2 segundos)
    const keysToDelete = []
    pendingWonGamesRef.current.forEach((timestamp, key) => {
      if (now - timestamp > 2000) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => pendingWonGamesRef.current.delete(key))
    
    // Verificar se já existe um registo pendente muito recente (menos de 2 segundos)
    if (pendingWonGamesRef.current.has(wonGameKey)) {
      const lastTimestamp = pendingWonGamesRef.current.get(wonGameKey)
      if (now - lastTimestamp < 2000) {
        console.log('Jogo ganho duplicado ignorado:', wonGameKey, 'última tentativa há', now - lastTimestamp, 'ms')
        return
      }
    }
    
    // Adicionar à lista de jogos ganhos pendentes com timestamp
    pendingWonGamesRef.current.set(wonGameKey, now)
    
    // Verificar se já existe um jogo ganho para este gameId e day
    const existingIndex = state.wonGames.findIndex(g => g.gameId === gameId && g.day === day)
    
    // Verificar se o jogo foi ganho (para fazer backup)
    const gameWon = metadata.won !== false && metadata.won !== undefined ? metadata.won : true
    
    if (existingIndex === -1) {
      // Não existe, adicionar
      setState(prev => ({
        ...prev,
        wonGames: [...prev.wonGames, { gameId, day, date: new Date().toISOString(), won: true, ...metadata }],
      }))
      
      // Fazer backup quando um jogo é completado (apenas se ganhou)
      // O backup será substituído se já existir um para o mesmo dia
      if (gameWon && day) {
        createConfigBackup(day).catch(err => {
          console.warn('Erro ao fazer backup:', err)
        })
      }
    } else {
      // Já existe, atualizar apenas se for mais recente ou se não tinha won: true
      setState(prev => {
        const updated = [...prev.wonGames]
        const existing = updated[existingIndex]
        const wasWon = existing.won === true
        const isNowWon = metadata.won === true || metadata.won !== false
        
        // Fazer backup sempre que um jogo é ganho, mesmo que já tenha sido ganho antes
        // Isso garante que o backup mais recente substitui o anterior do mesmo dia
        if (isNowWon && day) {
          createConfigBackup(day).catch(err => {
            console.warn('Erro ao fazer backup:', err)
          })
        }
        
        if (metadata.won === true || existing.won !== true) {
          updated[existingIndex] = { ...existing, ...metadata, won: true, date: new Date().toISOString() }
        }
        return { ...prev, wonGames: updated }
      })
    }
  }

  const purchaseItem = (itemId, price) => {
    setState(prev => {
      const newSpentPoints = (prev.spentPoints || 0) + price
      // Recalcular pontos imediatamente
      const totalScore = prev.gameAttempts
        .filter(a => a.score !== null && a.score !== undefined)
        .reduce((sum, a) => sum + (a.score || 0), 0)
      const calculatedPoints = Math.max(0, totalScore - newSpentPoints)
      
      return {
        ...prev,
        purchasedItems: [...prev.purchasedItems, itemId],
        spentPoints: newSpentPoints,
        points: calculatedPoints, // Atualizar pontos imediatamente
      }
    })
  }

  const canUnlockDay = (day) => {
    const today = new Date()
    const decemberDate = new Date(today.getFullYear(), 11, day) // Mês 11 = dezembro
    
    // Verificar se já passou das 21h do dia anterior
    const unlockTime = new Date(decemberDate)
    unlockTime.setHours(21, 0, 0, 0)
    
    // Dia 1 disponível desde o início de dezembro
    if (day === 1) {
      return today.getMonth() === 11 && today.getDate() >= 1
    }
    
    // Dias seguintes: após 21h do dia anterior OU já desbloqueado
    const previousDayUnlockTime = new Date(decemberDate)
    previousDayUnlockTime.setDate(previousDayUnlockTime.getDate() - 1)
    previousDayUnlockTime.setHours(21, 0, 0, 0)
    
    return (today >= unlockTime && today >= previousDayUnlockTime) || 
           state.unlockedDays.includes(day - 1) || 
           state.unlockedDays.includes(day)
  }

  const addDailyWordleAttempt = (attempts) => {
    const today = new Date().toISOString().split('T')[0]
    setState(prev => {
      const updated = prev.dailyWordleAttempts.filter(a => a.date !== today)
      return {
        ...prev,
        dailyWordleAttempts: [...updated, { date: today, attempts }],
        lastDailyDate: today,
      }
    })
  }

  const getTodayWordleAttempts = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayAttempt = state.dailyWordleAttempts.find(a => a.date === today)
    return todayAttempt ? todayAttempt.attempts : null
  }

  const calculateWordlePoints = (attempts) => {
    // 1ª tentativa = 5 pts, 2ª = 4, 3ª = 3, 4ª = 2, 5ª = 1, falha = 0
    if (attempts === 1) return 5
    if (attempts === 2) return 4
    if (attempts === 3) return 3
    if (attempts === 4) return 2
    if (attempts === 5) return 1
    if (attempts === 6) return 1 // 6ª tentativa ainda dá 1 ponto
    return 0 // Falhou completamente
  }

  /**
   * Regista uma tentativa/jogo para cálculo de prémios
   * @param {string} gameType - Tipo de jogo (wordle, quiz, trivia, reflex, riddles, etc)
   * @param {number} day - Dia do calendário
   * @param {object} gameData - Dados do jogo:
   *   - won: boolean - Se ganhou ou não
   *   - attempts: number - Número de tentativas
   *   - errors: number - Número de erros
   *   - score: number - Pontuação final (se aplicável)
   *   - reactionTimes: array - Tempos de reação (para reflex)
   *   - answeredQuestions: array - Perguntas respondidas e se acertou (para quiz/trivia)
   *   - metadata: object - Dados adicionais específicos do jogo
   */
  // Ref para evitar duplicações de registos - guardar chaves dos últimos 5 segundos
  const pendingAttemptsRef = useRef(new Map()) // Map<key, timestamp>
  const pendingWonGamesRef = useRef(new Map()) // Map<key, timestamp>

  const addGameAttempt = async (gameType, day, gameData = {}) => {
    // Criar uma chave única baseada no jogo e dia (sem timestamp para detectar duplicados)
    const attemptKey = `${gameType}-${day}`
    const now = Date.now()
    
    // Limpar chaves antigas (mais de 2 segundos)
    const keysToDelete = []
    pendingAttemptsRef.current.forEach((timestamp, key) => {
      if (now - timestamp > 2000) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => pendingAttemptsRef.current.delete(key))
    
    // Verificar se já existe um registo pendente muito recente (menos de 2 segundos)
    if (pendingAttemptsRef.current.has(attemptKey)) {
      const lastTimestamp = pendingAttemptsRef.current.get(attemptKey)
      if (now - lastTimestamp < 2000) {
        console.log('Tentativa duplicada ignorada:', attemptKey, 'última tentativa há', now - lastTimestamp, 'ms')
        return
      }
    }
    
    // Adicionar à lista de tentativas pendentes com timestamp
    pendingAttemptsRef.current.set(attemptKey, now)
    
    // Adicionar informação do perfil atual
    const currentProfile = getCurrentProfile()
    
    const attempt = {
      gameType,
      day,
      date: new Date().toISOString(),
      won: gameData.won !== undefined ? gameData.won : false,
      attempts: gameData.attempts || 0,
      errors: gameData.errors || 0,
      score: gameData.score !== undefined ? gameData.score : null,
      reactionTimes: gameData.reactionTimes || null,
      answeredQuestions: gameData.answeredQuestions || null,
      metadata: gameData.metadata || {},
      profileId: currentProfile?.id || null,
      profileName: currentProfile?.name || null,
      accountId: currentProfile?.accountId || null,
    }
    
    // Atualizar o estado primeiro (para atualização imediata da UI)
    setState(prev => {
      const newAttempts = [...prev.gameAttempts, attempt]
      // Recalcular pontos imediatamente
      const totalScore = newAttempts
        .filter(a => a.score !== null && a.score !== undefined)
        .reduce((sum, a) => sum + (a.score || 0), 0)
      const spentPoints = prev.spentPoints || 0
      const calculatedPoints = Math.max(0, totalScore - spentPoints)
      
      return {
        ...prev,
        gameAttempts: newAttempts,
        points: calculatedPoints, // Atualizar pontos imediatamente
      }
    })
    
    // Guardar no ficheiro JSON através do utilitário (atualiza o ficheiro diretamente)
    await saveGameAttempt(attempt)
  }

  /**
   * Obtém todos os registos de tentativas de jogos
   * @param {number|null} day - Filtrar por dia específico (opcional)
   * @param {string|null} gameType - Filtrar por tipo de jogo (opcional)
   * @returns {array} Array de tentativas
   */
  const getGameAttempts = (day = null, gameType = null) => {
    let attempts = state.gameAttempts
    
    if (day !== null) {
      attempts = attempts.filter(a => a.day === day)
    }
    
    if (gameType !== null) {
      attempts = attempts.filter(a => a.gameType === gameType)
    }
    
    return attempts
  }

  /**
   * Obtém estatísticas de jogos
   * @returns {object} Estatísticas agregadas
   */
  const getGameStats = () => {
    const attempts = state.gameAttempts
    
    const stats = {
      totalGames: attempts.length,
      totalWins: attempts.filter(a => a.won).length,
      totalErrors: attempts.reduce((sum, a) => sum + (a.errors || 0), 0),
      totalAttempts: attempts.reduce((sum, a) => sum + (a.attempts || 0), 0),
      byGameType: {},
      byDay: {},
    }
    
    // Agrupar por tipo de jogo
    attempts.forEach(attempt => {
      if (!stats.byGameType[attempt.gameType]) {
        stats.byGameType[attempt.gameType] = {
          total: 0,
          wins: 0,
          errors: 0,
          attempts: 0,
        }
      }
      stats.byGameType[attempt.gameType].total++
      if (attempt.won) stats.byGameType[attempt.gameType].wins++
      stats.byGameType[attempt.gameType].errors += attempt.errors || 0
      stats.byGameType[attempt.gameType].attempts += attempt.attempts || 0
    })
    
    // Agrupar por dia
    attempts.forEach(attempt => {
      if (!stats.byDay[attempt.day]) {
        stats.byDay[attempt.day] = {
          total: 0,
          wins: 0,
          errors: 0,
        }
      }
      stats.byDay[attempt.day].total++
      if (attempt.won) stats.byDay[attempt.day].wins++
      stats.byDay[attempt.day].errors += attempt.errors || 0
    })
    
    return stats
  }

  const resetGame = async () => {
    // Limpar localStorage primeiro
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Depois resetar estado
    setState({
      points: 0,
      spentPoints: 0,
      unlockedDays: [],
      wonGames: [],
      purchasedItems: [],
      lastDailyDate: null,
      dailyWordleAttempts: [],
      gameAttempts: [],
    })
    
    // Limpar também os JSONs - aguardar que terminem
    try {
      await clearGameAttempts()
      await clearUserState()
    } catch (error) {
      console.error('Erro ao limpar JSONs:', error)
    }
    
    // Pequeno delay para garantir que tudo foi guardado
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Forçar recarregamento dos dados do localStorage
    window.location.reload()
  }

  // Modo desenvolvimento: carregar da variável de ambiente VITE_DEV_MODE
  // Se não estiver definida, usar false como padrão
  const [devMode, setDevMode] = useState(() => {
    // Primeiro verificar variável de ambiente (definida no build/run)
    const envDevMode = import.meta.env.VITE_DEV_MODE
    if (envDevMode !== undefined) {
      return envDevMode === 'true' || envDevMode === true
    }
    // Fallback para localStorage (compatibilidade)
    const saved = localStorage.getItem('aurora_dev_mode')
    return saved === 'true'
  })

  // Guardar no localStorage quando mudar (apenas se não estiver definido por env)
  useEffect(() => {
    const envDevMode = import.meta.env.VITE_DEV_MODE
    if (envDevMode === undefined) {
      localStorage.setItem('aurora_dev_mode', devMode.toString())
    }
  }, [devMode])

  // Função mantida para compatibilidade, mas não faz nada se DEV_MODE vier do env
  const toggleDevMode = () => {
    const envDevMode = import.meta.env.VITE_DEV_MODE
    if (envDevMode === undefined) {
      setDevMode(prev => !prev)
    }
    // Se vier do env, não permite toggle
  }

  return {
    ...state,
    addPoints,
    unlockDay,
    addWonGame,
    purchaseItem,
    addDailyWordleAttempt,
    getTodayWordleAttempts,
    calculateWordlePoints,
    addGameAttempt,
    getGameAttempts,
    getGameStats,
    resetGame,
    DEV_MODE: devMode,
    toggleDevMode,
  }
}

// Presentes ganhos por dia - agora carregados do JSON
// Mantido para compatibilidade com código existente
export const DAILY_GIFTS = getAllGifts()

// Itens da loja (conforme especificação)
export const SHOP_ITEMS = [
  { id: 1, name: 'Bounty 🍫', price: 5, description: 'Bounty/mini-doce', icon: '🍫', repeatable: true },
  { id: 2, name: 'Rosa 🌹', price: 5, description: 'Dar uma flor', icon: '🌹', repeatable: false },
  { id: 3, name: 'Foto nossa 📸', price: 10, description: 'Foto impressa/Polaroid', icon: '📸', repeatable: true },
  { id: 4, name: 'Massagem 💆', price: 10, description: '5–10 min por ti', icon: '💆', repeatable: false },
  { id: 5, name: 'Escolher um filme 🎬', price: 2, description: 'Ela escolhe o próximo filme', icon: '🎬', repeatable: true },
  { id: 6, name: 'Mensagem secreta 💌', price: 10, description: 'Carta tua guardada no site', icon: '💌', repeatable: false },
  { id: 7, name: 'Sobremesa 🍪', price: 15, description: 'Crumble/bolachas feitas por ti', icon: '🍪', repeatable: false },
  { id: 8, name: 'Momento abraço 🧸', price: 2, description: 'Vale para um abraço longo sem interrupções', icon: '🧸', repeatable: true },
  { id: 9, name: 'Playlist do dia 🎧', price: 10, description: 'Ela escolhe a música do dia (carro, jantar, etc.)', icon: '🎧', repeatable: true },
  { id: 10, name: 'Vamos ao sushi 🍕', price: 40, description: 'Sushi', icon: '🍕', repeatable: false },
  { id: 11, name: 'Pode me perguntar o que quiser ❓', price: 20, description: 'Eu sou obrigado a responder', icon: '❓', repeatable: false },
]

// Tipos de jogos disponíveis (para mapeamento futuro)
export const GAME_TYPES = {
  WORDLE: 'wordle',
  QUIZ: 'quiz',
  T9_ENCODING: 't9-encoding',
  QR_TREASURE: 'qr-treasure',
  LOGIC_PAIRS: 'logic-pairs',
  WHEEL: 'wheel',
  CATCH_HEARTS: 'catch-hearts',
  PHOTO_TRIVIA: 'photo-trivia',
  PUZZLE_TILES: 'puzzle-tiles',
  SIMON: 'simon',
  CRYPTOGRAM: 'cryptogram',
  MINI_SUDOKU: 'mini-sudoku',
  THIS_OR_THAT: 'this-or-that',
  REFLEX: 'reflex',
  MUSIC_QUIZ: 'music-quiz',
  RIDDLES: 'riddles',
  MEMORY: 'memory',
  SCRAMBLED_PHRASE: 'scrambled-phrase',
  WORD_SEARCH: 'word-search',
}

// Configuração de jogos por dia (a definir)
export const DAILY_GAMES = {
  // Exemplo: 1: { type: GAME_TYPES.WORDLE, difficulty: 'easy' }
  // Será preenchido quando os jogos forem implementados
}
