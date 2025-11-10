// Utilitário para guardar e carregar registos de jogos do ficheiro JSON
import { getProfileKey, getCurrentProfile } from './userProfiles'

// Função para carregar todos os registos do JSON (todos os perfis)
const loadAllGameAttemptsFromJSON = async (forceReload = false) => {
  try {
    if (import.meta.env.DEV) {
      // Adicionar timestamp para evitar cache
      const cacheBuster = forceReload ? `?t=${Date.now()}` : ''
      const response = await fetch(`/src/config/game-attempts.json${cacheBuster}`)
      if (response.ok) {
        return await response.json()
      }
    }
    return []
  } catch (e) {
    console.warn('Erro ao carregar do JSON:', e)
    return []
  }
}

// Função para obter todos os registos do perfil atual
export const loadGameAttempts = async () => {
  try {
    // No browser, guardamos no localStorage mas sincronizamos com JSON
    // O JSON será usado para backup e cálculo de prémios
    // Usar chave do perfil atual se existir
    const storageKey = getProfileKey('game_attempts_json')
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Verificar se os attempts no localStorage correspondem ao perfil atual
        const currentProfile = getCurrentProfile()
        const currentAccountId = currentProfile?.accountId || null
        const currentProfileId = currentProfile?.id || null
        
        // Se houver attempts e corresponderem ao perfil atual, usar
        if (parsed.length > 0) {
          const firstAttempt = parsed[0]
          if ((currentAccountId && firstAttempt.accountId === currentAccountId) ||
              (currentProfileId && firstAttempt.profileId === currentProfileId)) {
            return parsed
          }
        }
      } catch (e) {
        console.warn('Erro ao fazer parse do localStorage:', e)
      }
    }
    
    // Se não houver no localStorage ou não corresponder, carregar do JSON e filtrar pelo perfil atual
    const currentProfile = getCurrentProfile()
    const currentProfileId = currentProfile?.id || null
    const currentAccountId = currentProfile?.accountId || null
    
    if (currentProfileId || currentAccountId) {
      const allAttemptsFromJSON = await loadAllGameAttemptsFromJSON()
      
      // Filtrar attempts: prioridade 1 = accountId, prioridade 2 = profileId
      const profileAttempts = allAttemptsFromJSON
        .filter(attempt => {
          // Prioridade 1: verificar por accountId (mesmo utilizador em diferentes navegadores)
          if (currentAccountId && attempt.accountId && attempt.accountId === currentAccountId) {
            return true
          }
          // Prioridade 2: verificar por profileId (se não tiver accountId)
          if (currentProfileId && attempt.profileId === currentProfileId) {
            return true
          }
          return false
        })
        .map(attempt => {
          // Atualizar attempts antigos que não têm accountId mas pertencem ao perfil atual
          if (!attempt.accountId && currentAccountId) {
            return {
              ...attempt,
              accountId: currentAccountId
            }
          }
          return attempt
        })
      
      // Guardar no localStorage para cache
      if (profileAttempts.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(profileAttempts))
      }
      
      return profileAttempts
    }
    
    // Se não houver perfil, retornar array vazio
    return []
  } catch (e) {
    console.warn('Erro ao carregar registos de jogos:', e)
    return []
  }
}

// Função para guardar registos
export const saveGameAttempts = async (attempts) => {
  try {
    // Guardar no localStorage (cache rápido) - apenas do perfil atual
    // Usar chave do perfil atual se existir
    const storageKey = getProfileKey('game_attempts_json')
    localStorage.setItem(storageKey, JSON.stringify(attempts))
    
    // SEMPRE guardar no ficheiro JSON (mesmo em produção, se possível)
    // IMPORTANTE: Carregar todos os attempts existentes do JSON SEMPRE (forçar reload para evitar cache)
    // Isto garante que temos os dados mais recentes de todos os navegadores
    const allAttemptsFromJSON = await loadAllGameAttemptsFromJSON(true)
    
    // Obter perfil atual
    const currentProfile = getCurrentProfile()
    const currentProfileId = currentProfile?.id || null
    const currentAccountId = currentProfile?.accountId || null
    
    // Função para verificar se um attempt pertence ao perfil atual
    const isCurrentProfileAttempt = (attempt) => {
      // Prioridade 1: verificar por accountId (mesmo utilizador em diferentes navegadores)
      if (currentAccountId && attempt.accountId && attempt.accountId === currentAccountId) {
        return true
      }
      // Prioridade 2: verificar por profileId (se não tiver accountId)
      if (currentProfileId && attempt.profileId === currentProfileId) {
        return true
      }
      return false
    }
    
    // Combinar: manter attempts de outros perfis, atualizar/adicionar do perfil atual
    const allAttempts = []
    const currentProfileAttempts = new Map()
    
    // Agrupar attempts do perfil atual por chave única (gameType-day-date)
    attempts.forEach(attempt => {
      if (isCurrentProfileAttempt(attempt) || (!attempt.profileId && !attempt.accountId)) {
        const key = `${attempt.gameType}-${attempt.day}-${attempt.date}`
        currentProfileAttempts.set(key, attempt)
      }
    })
    
    // Adicionar attempts de outros perfis E attempts antigos que não são do perfil atual
    allAttemptsFromJSON.forEach(attempt => {
      // Se é de outro perfil (diferente accountId E diferente profileId), adicionar
      if (!isCurrentProfileAttempt(attempt)) {
        // Verificar se não é duplicado do perfil atual
        const key = `${attempt.gameType}-${attempt.day}-${attempt.date}`
        if (!currentProfileAttempts.has(key)) {
          allAttempts.push(attempt)
        }
      } else {
        // Se é do perfil atual mas não está nos novos attempts, manter (pode ser de outro navegador)
        const key = `${attempt.gameType}-${attempt.day}-${attempt.date}`
        if (!currentProfileAttempts.has(key)) {
          // Manter attempts do perfil atual que não estão nos novos attempts (de outros navegadores)
          allAttempts.push(attempt)
        }
      }
    })
    
    // Adicionar attempts do perfil atual (com informação do perfil e accountId)
    currentProfileAttempts.forEach(attempt => {
      allAttempts.push({
        ...attempt,
        profileId: currentProfileId,
        profileName: currentProfile?.name || null,
        accountId: currentAccountId || null
      })
    })
    
    // Ordenar por data (mais recentes primeiro)
    allAttempts.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    console.log(`💾 A guardar ${allAttempts.length} attempts no JSON (${currentProfileAttempts.size} do perfil atual, ${allAttempts.length - currentProfileAttempts.size} de outros perfis/navegadores)`)
    
    // Em modo desenvolvimento, escrever diretamente no ficheiro JSON
    if (import.meta.env.DEV) {
      try {
        const response = await fetch('/api/write-game-attempts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(allAttempts),
        })
        
        if (response.ok) {
          console.log('✅ Ficheiro game-attempts.json atualizado! (todos os perfis e navegadores)')
        } else {
          const errorText = await response.text()
          console.warn('⚠️ Não foi possível atualizar o ficheiro JSON:', response.status, errorText)
        }
      } catch (e) {
        // Se o servidor não estiver disponível, apenas logar
        console.error('❌ Erro ao atualizar o ficheiro JSON:', e)
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
  // IMPORTANTE: Carregar attempts do perfil atual (pode incluir attempts de outros navegadores com mesmo accountId)
  // Mas quando guardamos, vamos fazer merge com TODOS os attempts do JSON (incluindo outros perfis)
  const attempts = await loadGameAttempts()
  const now = new Date(attempt.date || new Date().toISOString())
  
  // Adicionar informação do perfil atual
  const currentProfile = getCurrentProfile()
  const currentProfileId = currentProfile?.id || null
  const currentAccountId = currentProfile?.accountId || null
  
  const attemptWithProfile = {
    ...attempt,
    date: attempt.date || new Date().toISOString(),
    profileId: currentProfileId,
    profileName: currentProfile?.name || null,
    accountId: currentAccountId || null
  }
  
  // Verificar se já existe um registo muito similar no último segundo
  // Compara gameType, day, accountId/profileId e se o timestamp está muito próximo
  const isDuplicate = attempts.some(existing => {
    if (existing.gameType !== attempt.gameType || existing.day !== attempt.day) {
      return false
    }
    
    // Verificar se é do mesmo perfil (por accountId ou profileId)
    const sameAccount = currentAccountId && existing.accountId && existing.accountId === currentAccountId
    const sameProfile = currentProfileId && existing.profileId && existing.profileId === currentProfileId
    if (!sameAccount && !sameProfile) {
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
  
  attempts.push(attemptWithProfile)
  await saveGameAttempts(attempts)
  return attempts
}

// Função para exportar JSON (fazer download)
export const exportGameAttemptsJSON = async () => {
  const attempts = await loadGameAttempts()
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

// Função para escrever diretamente no JSON sem fazer merge (usado no reset)
const writeGameAttemptsDirectly = async (attempts) => {
  if (import.meta.env.DEV) {
    try {
      console.log('🔄 A escrever game-attempts.json diretamente com', attempts.length, 'attempts')
      const response = await fetch('/api/write-game-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attempts),
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Ficheiro game-attempts.json atualizado diretamente!', result)
        return true
      } else {
        const errorText = await response.text()
        console.warn('⚠️ Não foi possível atualizar o ficheiro JSON:', response.status, errorText)
        return false
      }
    } catch (e) {
      console.error('❌ Erro ao atualizar o ficheiro JSON:', e)
      return false
    }
  } else {
    console.warn('⚠️ Modo produção: não é possível escrever diretamente no JSON')
    return false
  }
}

// Função para limpar todos os registos
export const clearGameAttempts = async () => {
  console.log('🧹 A limpar game-attempts...')
  const storageKey = getProfileKey('game_attempts_json')
  localStorage.removeItem(storageKey)
  
  // Limpar apenas do perfil atual - carregar todos e remover os do perfil atual
  const currentProfile = getCurrentProfile()
  const currentProfileId = currentProfile?.id || null
  const currentAccountId = currentProfile?.accountId || null
  
  console.log('👤 Perfil atual:', { profileId: currentProfileId, accountId: currentAccountId })
  
  if (currentProfileId || currentAccountId) {
    // Carregar todos os attempts (forçar reload para evitar cache)
    const allAttemptsFromJSON = await loadAllGameAttemptsFromJSON(true)
    console.log('📊 Total de attempts no JSON:', allAttemptsFromJSON.length)
    
    // Filtrar para remover apenas os do perfil atual
    const otherProfilesAttempts = allAttemptsFromJSON.filter(attempt => {
      // Se é do perfil atual, remover
      if (currentAccountId && attempt.accountId === currentAccountId) {
        console.log('🗑️ Removendo attempt do perfil atual (accountId):', attempt)
        return false
      }
      if (currentProfileId && attempt.profileId === currentProfileId) {
        console.log('🗑️ Removendo attempt do perfil atual (profileId):', attempt)
        return false
      }
      // Manter attempts de outros perfis
      return true
    })
    
    console.log('✅ Attempts restantes após limpeza:', otherProfilesAttempts.length)
    
    // Escrever diretamente no JSON sem fazer merge (para evitar adicionar o perfil atual de volta)
    const success = await writeGameAttemptsDirectly(otherProfilesAttempts)
    if (!success) {
      console.error('❌ Falha ao escrever game-attempts.json')
    }
    return success
  } else {
    // Se não houver perfil, limpar tudo
    console.log('⚠️ Sem perfil atual - limpando tudo')
    const success = await writeGameAttemptsDirectly([])
    if (!success) {
      console.error('❌ Falha ao limpar game-attempts.json')
    }
    return success
  }
}

// Função para remover duplicados dos registos existentes
export const removeDuplicateAttempts = async () => {
  const attempts = await loadGameAttempts()
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
export const getGameAttemptsStats = async () => {
  const attempts = await loadGameAttempts()
  
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

