// Utilitário para guardar e carregar registos de jogos do ficheiro JSON

// Função para obter todos os registos
export const loadGameAttempts = () => {
  try {
    // No browser, guardamos no localStorage mas sincronizamos com JSON
    // O JSON será usado para backup e cálculo de prémios
    const stored = localStorage.getItem('aurora_game_attempts_json')
    if (stored) {
      return JSON.parse(stored)
    }
    // Se não houver no localStorage, retornar array vazio
    // O ficheiro JSON inicial também está vazio
    return []
  } catch (e) {
    console.warn('Erro ao carregar registos de jogos:', e)
    return []
  }
}

// Função para guardar registos
export const saveGameAttempts = async (attempts) => {
  try {
    // Guardar no localStorage (cache rápido)
    localStorage.setItem('aurora_game_attempts_json', JSON.stringify(attempts))
    
    // Em modo desenvolvimento, escrever diretamente no ficheiro JSON
    if (import.meta.env.DEV) {
      try {
        const response = await fetch('/api/write-game-attempts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(attempts),
        })
        
        if (response.ok) {
          console.log('✅ Ficheiro game-attempts.json atualizado!')
        } else {
          console.warn('⚠️ Não foi possível atualizar o ficheiro JSON (servidor pode não estar disponível)')
        }
      } catch (e) {
        // Se o servidor não estiver disponível, apenas logar
        console.warn('⚠️ Não foi possível atualizar o ficheiro JSON:', e.message)
      }
    }
    
    return true
  } catch (e) {
    console.error('Erro ao guardar registos de jogos:', e)
    return false
  }
}

// Função para adicionar um novo registo (com verificação de duplicados)
export const addGameAttempt = async (attempt) => {
  const attempts = loadGameAttempts()
  const now = new Date(attempt.date || new Date().toISOString())
  
  // Verificar se já existe um registo muito similar no último segundo
  // Compara gameType, day, e se o timestamp está muito próximo
  const isDuplicate = attempts.some(existing => {
    if (existing.gameType !== attempt.gameType || existing.day !== attempt.day) {
      return false
    }
    
    const existingDate = new Date(existing.date)
    const timeDiff = Math.abs(now - existingDate)
    
    // Se o registo existente foi criado há menos de 2 segundos, é considerado duplicado
    if (timeDiff < 2000) {
      // Verificar também se os dados são muito similares
      const sameWon = existing.won === attempt.won
      const sameAttempts = existing.attempts === attempt.attempts
      const sameErrors = existing.errors === attempt.errors
      
      // Se forem muito similares, é provável que seja duplicado
      if (sameWon && sameAttempts && sameErrors) {
        return true
      }
    }
    
    return false
  })
  
  if (isDuplicate) {
    console.log('⚠️ Tentativa duplicada detectada no armazenamento, ignorando:', attempt)
    return attempts
  }
  
  attempts.push({
    ...attempt,
    date: attempt.date || new Date().toISOString(),
  })
  await saveGameAttempts(attempts)
  return attempts
}

// Função para exportar JSON (fazer download)
export const exportGameAttemptsJSON = () => {
  const attempts = loadGameAttempts()
  const blob = new Blob([JSON.stringify(attempts, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `game-attempts-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Função para importar JSON (carregar de ficheiro)
export const importGameAttemptsJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const attempts = JSON.parse(e.target.result)
        if (Array.isArray(attempts)) {
          saveGameAttempts(attempts)
          resolve(attempts)
        } else {
          reject(new Error('Formato inválido: deve ser um array'))
        }
      } catch (e) {
        reject(e)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// Função para limpar todos os registos
export const clearGameAttempts = () => {
  localStorage.removeItem('aurora_game_attempts_json')
  saveGameAttempts([])
}

// Função para remover duplicados dos registos existentes
export const removeDuplicateAttempts = async () => {
  const attempts = loadGameAttempts()
  const seen = new Map()
  const uniqueAttempts = []
  
  // Ordenar por data (mais recentes primeiro) para manter a primeira ocorrência
  const sortedAttempts = [...attempts].sort((a, b) => new Date(a.date) - new Date(b.date))
  
  sortedAttempts.forEach(attempt => {
    // Criar uma chave única baseada em gameType e day
    const key = `${attempt.gameType}-${attempt.day}`
    const attemptDate = new Date(attempt.date)
    
    // Verificar se já existe uma entrada com a mesma chave
    const existingEntry = seen.get(key)
    
    if (!existingEntry) {
      // Primeira vez que vemos esta chave, adicionar
      seen.set(key, attempt)
      uniqueAttempts.push(attempt)
    } else {
      // Já existe uma entrada, verificar se são duplicados
      const existingDate = new Date(existingEntry.date)
      const timeDiff = Math.abs(attemptDate - existingDate)
      
      // Comparar também os dados principais
      const sameData = 
        existingEntry.won === attempt.won &&
        existingEntry.attempts === attempt.attempts &&
        existingEntry.errors === attempt.errors &&
        (existingEntry.score === attempt.score || (existingEntry.score === null && attempt.score === null))
      
      // Se a diferença de tempo for menor que 500ms E os dados forem idênticos, é duplicado
      if (timeDiff < 500 && sameData) {
        // Manter o primeiro e ignorar o duplicado
        console.log('⚠️ Duplicado removido:', attempt.gameType, 'dia', attempt.day, 'diferença:', timeDiff, 'ms')
      } else {
        // Se não for duplicado (apenas similar), adicionar com chave única
        const uniqueKey = `${key}-${attempt.date}`
        if (!seen.has(uniqueKey)) {
          seen.set(uniqueKey, attempt)
          uniqueAttempts.push(attempt)
        }
      }
    }
  })
  
  // Se houver duplicados removidos, guardar o array limpo
  if (uniqueAttempts.length < attempts.length) {
    console.log(`✅ Removidos ${attempts.length - uniqueAttempts.length} registos duplicados`)
    await saveGameAttempts(uniqueAttempts)
    return uniqueAttempts
  }
  
  return attempts
}

// Função para obter estatísticas
export const getGameAttemptsStats = () => {
  const attempts = loadGameAttempts()
  
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

