// Utilitário para guardar e carregar o estado do utilizador (pontos, etc.) no JSON
import { getProfileKey, getCurrentProfile } from './userProfiles'

// Função para carregar todos os estados do JSON (todos os perfis)
const loadAllUserStatesFromJSON = async () => {
  try {
    if (import.meta.env.DEV) {
      const response = await fetch('/src/config/user-state.json')
      if (response.ok) {
        const data = await response.json()
        // Se for um array (novo formato), retornar
        if (Array.isArray(data)) {
          return data
        }
        // Se for objeto antigo (compatibilidade), converter para array
        if (typeof data === 'object' && data !== null) {
          return [data]
        }
      }
    }
    return []
  } catch (e) {
    console.warn('Erro ao carregar do JSON:', e)
    return []
  }
}

// Função para obter o estado do utilizador
export const loadUserState = async (forceReload = false) => {
  try {
    // Se não forçar reload, tentar carregar do localStorage primeiro (cache rápido)
    const storageKey = getProfileKey('user_state_json')
    if (!forceReload) {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Verificar se o estado no localStorage tem os dados corretos do perfil atual
          const currentProfile = getCurrentProfile()
          const currentAccountId = currentProfile?.accountId || null
          const currentProfileId = currentProfile?.id || null
          
          // Se o estado no localStorage corresponde ao perfil atual, usar
          if ((currentAccountId && parsed.accountId === currentAccountId) || 
              (currentProfileId && parsed.profileId === currentProfileId)) {
            return parsed
          }
          // Se não corresponder, limpar e carregar do JSON
        } catch (e) {
          console.warn('Erro ao fazer parse do localStorage:', e)
        }
      }
    }
    
    // Carregar do JSON e filtrar pelo perfil atual
    const currentProfile = getCurrentProfile()
    const currentProfileId = currentProfile?.id || null
    
    if (currentProfileId || currentProfile?.accountId || currentProfile?.name) {
      const allStatesFromJSON = await loadAllUserStatesFromJSON()
      const currentAccountId = currentProfile?.accountId || null
      const currentProfileName = currentProfile?.name || null
      
      // Função para verificar se um estado pertence ao perfil atual
      // IMPORTANTE: Usar accountId como identificador principal (mesmo utilizador em navegadores diferentes)
      // Se não houver accountId, usar profileId como fallback
      const isCurrentProfileState = (state) => {
        // Prioridade 1: verificar por accountId (mesmo utilizador em diferentes navegadores)
        if (currentAccountId && state.accountId && state.accountId === currentAccountId) {
          return true
        }
        // Prioridade 2: verificar por profileId (se não tiver accountId, usar profileId)
        if (currentProfileId && state.profileId === currentProfileId) {
          return true
        }
        return false
      }
      
      // Encontrar TODOS os estados do mesmo accountId (mesmo utilizador em navegadores diferentes)
      const profileStates = allStatesFromJSON.filter(isCurrentProfileState)
      
      if (profileStates.length > 0) {
        // Se houver múltiplos estados do mesmo accountId, mesclar todos eles
        if (profileStates.length > 1 && currentAccountId) {
          // Mesclar todos os estados do mesmo accountId
          const allWonGames = new Map()
          const allUnlockedDays = new Set()
          const allPurchasedItems = new Set()
          const allDailyWordleAttempts = new Map()
          let maxPoints = 0
          let maxSpentPoints = 0
          let lastDailyDate = null
          
          profileStates.forEach(state => {
            // Mesclar wonGames
            if (state.wonGames) {
              state.wonGames.forEach(game => {
                const key = `${game.gameId}-${game.day}`
                const existing = allWonGames.get(key)
                if (!existing || new Date(game.date || 0) > new Date(existing.date || 0)) {
                  allWonGames.set(key, game)
                }
              })
            }
            
            // Mesclar unlockedDays
            if (state.unlockedDays) {
              state.unlockedDays.forEach(day => allUnlockedDays.add(day))
            }
            
            // Mesclar purchasedItems
            if (state.purchasedItems) {
              state.purchasedItems.forEach(item => allPurchasedItems.add(item))
            }
            
            // Mesclar dailyWordleAttempts
            if (state.dailyWordleAttempts) {
              state.dailyWordleAttempts.forEach(attempt => {
                const key = `${attempt.day}-${attempt.date}`
                if (!allDailyWordleAttempts.has(key)) {
                  allDailyWordleAttempts.set(key, attempt)
                }
              })
            }
            
            maxPoints = Math.max(maxPoints, state.points || 0)
            maxSpentPoints = Math.max(maxSpentPoints, state.spentPoints || 0)
            
            if (state.lastDailyDate && (!lastDailyDate || new Date(state.lastDailyDate) > new Date(lastDailyDate))) {
              lastDailyDate = state.lastDailyDate
            }
          })
          
          // Criar estado mesclado
          const mergedState = {
            ...profileStates[0], // Usar primeiro estado como base
            wonGames: Array.from(allWonGames.values()),
            unlockedDays: Array.from(allUnlockedDays).sort((a, b) => a - b),
            purchasedItems: Array.from(allPurchasedItems),
            dailyWordleAttempts: Array.from(allDailyWordleAttempts.values()),
            points: maxPoints,
            spentPoints: maxSpentPoints,
            lastDailyDate: lastDailyDate,
            profileId: currentProfileId,
            profileName: currentProfile?.name || null,
            accountId: currentAccountId
          }
          
          // Guardar no localStorage para cache
          localStorage.setItem(storageKey, JSON.stringify(mergedState))
          return mergedState
        } else {
          // Apenas um estado, usar esse
          const bestState = profileStates[0]
          // Atualizar identificadores para o perfil atual
          bestState.profileId = currentProfileId
          bestState.profileName = currentProfile?.name || null
          bestState.accountId = currentAccountId
          
          // Guardar no localStorage para cache
          localStorage.setItem(storageKey, JSON.stringify(bestState))
          return bestState
        }
      }
    }
    
    // Se não houver em nenhum lugar, retornar estado padrão
    // NOTA: points não é guardado - é sempre calculado dinamicamente a partir dos game attempts
    const defaultState = {
      // points: NÃO guardar - será sempre calculado dinamicamente
      spentPoints: 0,
      unlockedDays: [],
      wonGames: [],
      purchasedItems: [],
      lastDailyDate: null,
      dailyWordleAttempts: [],
      profileId: currentProfileId,
      profileName: currentProfile?.name || null,
      accountId: currentProfile?.accountId || null
    }
    // Guardar estado padrão no localStorage
    localStorage.setItem(storageKey, JSON.stringify(defaultState))
    return defaultState
  } catch (e) {
    console.warn('Erro ao carregar estado do utilizador:', e)
    return {
      points: 0,
      spentPoints: 0,
      unlockedDays: [],
      wonGames: [],
      purchasedItems: [],
      lastDailyDate: null,
      dailyWordleAttempts: []
    }
  }
}

// Função para guardar estado do utilizador
export const saveUserState = async (userState) => {
  try {
    // Guardar no localStorage (cache rápido) - apenas do perfil atual
    const storageKey = getProfileKey('user_state_json')
    localStorage.setItem(storageKey, JSON.stringify(userState))
    
    // SEMPRE guardar no ficheiro JSON (mesmo em produção, se possível)
    // Carregar todos os estados existentes do JSON
    const allStatesFromJSON = await loadAllUserStatesFromJSON()
    
    // Obter perfil atual
    const currentProfile = getCurrentProfile()
    const currentProfileId = currentProfile?.id || null
    const currentProfileName = currentProfile?.name || null
    const currentAccountId = currentProfile?.accountId || null
    
    // Combinar: manter estados de outros perfis, atualizar/adicionar do perfil atual
    const allStates = []
    
    // Função para verificar se um estado pertence ao perfil atual
    // IMPORTANTE: Usar accountId como identificador principal (mesmo utilizador em navegadores diferentes)
    // Se não houver accountId, usar profileId como fallback
    const isCurrentProfileState = (state) => {
      // Prioridade 1: verificar por accountId (mesmo utilizador em diferentes navegadores)
      if (currentAccountId && state.accountId && state.accountId === currentAccountId) {
        return true
      }
      // Prioridade 2: verificar por profileId (se não tiver accountId, usar profileId)
      if (currentProfileId && state.profileId === currentProfileId) {
        return true
      }
      return false
    }
    
    // Separar estados: do perfil atual e de outros perfis
    // IMPORTANTE: Se for o mesmo accountId, mesclar todos os estados (mesmo utilizador em navegadores diferentes)
    const statesForAccount = []
    
    allStatesFromJSON.forEach(state => {
      if (isCurrentProfileState(state)) {
        // Este estado pertence ao perfil atual (mesmo accountId ou profileId)
        // NÃO adicionar a allStates - vamos remover todos e criar um novo mesclado
        statesForAccount.push(state)
      } else if (state.profileId || state.profileName || state.accountId) {
        // Manter estados de outros perfis (com identificador válido e diferente)
        // IMPORTANTE: Se o estado tiver accountId diferente, manter
        // Se tiver o mesmo accountId mas profileId diferente, também remover (será mesclado)
        if (currentAccountId && state.accountId && state.accountId === currentAccountId) {
          // Este estado tem o mesmo accountId mas não foi identificado como do perfil atual
          // (pode ser de um navegador diferente que ainda não foi mesclado)
          // Não adicionar - será removido e mesclado
        } else {
          allStates.push(state)
        }
      }
      // Ignorar estados sem identificador (antigos)
    })
    
    // Se houver múltiplos estados do mesmo accountId, mesclar todos eles
    // (mesmo utilizador em navegadores diferentes)
    let existingState = null
    if (statesForAccount.length > 0) {
      // Mesclar todos os estados do mesmo accountId
      const allWonGames = new Map()
      const allUnlockedDays = new Set()
      const allPurchasedItems = new Set()
      const allDailyWordleAttempts = new Map()
      let maxPoints = 0
      let maxSpentPoints = 0
      let lastDailyDate = null
      
      statesForAccount.forEach(state => {
        // Mesclar wonGames
        if (state.wonGames) {
          state.wonGames.forEach(game => {
            const key = `${game.gameId}-${game.day}`
            const existing = allWonGames.get(key)
            if (!existing || new Date(game.date || 0) > new Date(existing.date || 0)) {
              allWonGames.set(key, game)
            }
          })
        }
        
        // Mesclar unlockedDays
        if (state.unlockedDays) {
          state.unlockedDays.forEach(day => allUnlockedDays.add(day))
        }
        
        // Mesclar purchasedItems
        if (state.purchasedItems) {
          state.purchasedItems.forEach(item => allPurchasedItems.add(item))
        }
        
        // Mesclar dailyWordleAttempts
        if (state.dailyWordleAttempts) {
          state.dailyWordleAttempts.forEach(attempt => {
            const key = `${attempt.day}-${attempt.date}`
            if (!allDailyWordleAttempts.has(key)) {
              allDailyWordleAttempts.set(key, attempt)
            }
          })
        }
        
        // NÃO usar state.points - os pontos são sempre calculados dinamicamente a partir dos game attempts
        // maxPoints = Math.max(maxPoints, state.points || 0)
        maxSpentPoints = Math.max(maxSpentPoints, state.spentPoints || 0)
        
        // Manter a última data se existir
        if (state.lastDailyDate && (!lastDailyDate || new Date(state.lastDailyDate) > new Date(lastDailyDate))) {
          lastDailyDate = state.lastDailyDate
        }
      })
      
      // Criar estado mesclado com todos os dados do mesmo accountId
      // NOTA: points não é guardado - é sempre calculado dinamicamente a partir dos game attempts
      existingState = {
        ...statesForAccount[0], // Usar primeiro estado como base
        wonGames: Array.from(allWonGames.values()),
        unlockedDays: Array.from(allUnlockedDays).sort((a, b) => a - b),
        purchasedItems: Array.from(allPurchasedItems),
        dailyWordleAttempts: Array.from(allDailyWordleAttempts.values()),
        // points: NÃO guardar - será sempre calculado dinamicamente
        spentPoints: maxSpentPoints,
        lastDailyDate: lastDailyDate
      }
      // Remover campo points se existir (não deve ser guardado)
      delete existingState.points
    }
    
    // Criar estado atualizado mesclando com o existente
    // Se já existe um estado mesclado (do mesmo accountId), usar esse como base
    // Caso contrário, usar apenas o userState atual
    const updatedState = existingState ? {
      ...existingState,
      // Mesclar wonGames do userState atual com o existente
      wonGames: (() => {
        const mergedWonGames = [...(existingState.wonGames || [])]
        if (userState.wonGames?.length > 0) {
          userState.wonGames.forEach(game => {
            const existing = mergedWonGames.find(g => g.gameId === game.gameId && g.day === game.day)
            if (!existing) {
              mergedWonGames.push(game)
            } else {
              // Manter o mais recente
              const existingDate = new Date(existing.date || 0)
              const newDate = new Date(game.date || 0)
              if (newDate > existingDate) {
                const index = mergedWonGames.indexOf(existing)
                mergedWonGames[index] = game
              }
            }
          })
        }
        return mergedWonGames
      })(),
      // Mesclar unlockedDays
      unlockedDays: [...new Set([...(existingState.unlockedDays || []), ...(userState.unlockedDays || [])])].sort((a, b) => a - b),
      // Mesclar purchasedItems
      purchasedItems: [...new Set([...(existingState.purchasedItems || []), ...(userState.purchasedItems || [])])],
      // Mesclar dailyWordleAttempts
      dailyWordleAttempts: (() => {
        const merged = [...(existingState.dailyWordleAttempts || [])]
        if (userState.dailyWordleAttempts?.length > 0) {
          userState.dailyWordleAttempts.forEach(attempt => {
            const existing = merged.find(a => a.day === attempt.day && a.date === attempt.date)
            if (!existing) {
              merged.push(attempt)
            }
          })
        }
        return merged
      })(),
      // points: NÃO guardar - será sempre calculado dinamicamente a partir dos game attempts
      spentPoints: Math.max(existingState.spentPoints || 0, userState.spentPoints || 0),
      // Manter a última data se existir
      lastDailyDate: existingState.lastDailyDate || userState.lastDailyDate || null,
      // Atualizar identificadores
      profileId: currentProfileId,
      profileName: currentProfile?.name || null,
      accountId: currentAccountId || null
    } : {
      ...userState,
      profileId: currentProfileId,
      profileName: currentProfile?.name || null,
      accountId: currentAccountId || null
    }
    
    // Remover campo points se existir (não deve ser guardado - é sempre calculado dinamicamente)
    delete updatedState.points
    
    // Remover TODOS os estados antigos do mesmo accountId antes de adicionar o novo
    // Isto garante que só há um estado por accountId no JSON
    const finalStates = allStates.filter(state => {
      // Se for o mesmo accountId, remover (será substituído pelo updatedState)
      if (currentAccountId && state.accountId === currentAccountId) {
        return false
      }
      // Se for o mesmo profileId (mas não tem accountId), também remover
      if (currentProfileId && state.profileId === currentProfileId && !state.accountId) {
        return false
      }
      return true
    })
    
    // Adicionar estado atualizado (substitui qualquer estado anterior do mesmo accountId/profileId)
    finalStates.push(updatedState)
    
    // Em modo desenvolvimento, escrever diretamente no ficheiro JSON
    if (import.meta.env.DEV) {
      try {
        const response = await fetch('/api/write-user-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalStates),
        })
        
        if (response.ok) {
          console.log('✅ Ficheiro user-state.json atualizado! (todos os perfis)')
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
    console.error('Erro ao guardar estado do utilizador:', e)
    return false
  }
}

// Função para limpar o estado do utilizador
export const clearUserState = async () => {
  const storageKey = getProfileKey('user_state_json')
  localStorage.removeItem(storageKey)
  
  // Limpar apenas do perfil atual - carregar todos e remover o do perfil atual
  const currentProfile = getCurrentProfile()
  const currentProfileId = currentProfile?.id || null
  const currentAccountId = currentProfile?.accountId || null
  
  if (currentProfileId || currentAccountId) {
    // Carregar todos os estados
    const allStatesFromJSON = await loadAllUserStatesFromJSON()
    
    // Filtrar para remover apenas o do perfil atual
    const otherProfilesStates = allStatesFromJSON.filter(state => {
      // Se é do perfil atual, remover
      if (currentAccountId && state.accountId === currentAccountId) {
        return false
      }
      if (currentProfileId && state.profileId === currentProfileId) {
        return false
      }
      // Manter estados de outros perfis
      return true
    })
    
    // Guardar apenas os estados de outros perfis
    if (import.meta.env.DEV) {
      try {
        const response = await fetch('/api/write-user-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(otherProfilesStates),
        })
        
        if (response.ok) {
          console.log('✅ Ficheiro user-state.json limpo! (perfil atual removido)')
        } else {
          console.warn('⚠️ Não foi possível atualizar o ficheiro JSON')
        }
      } catch (e) {
        console.warn('⚠️ Não foi possível atualizar o ficheiro JSON:', e.message)
      }
    }
  } else {
    // Se não houver perfil, limpar tudo
    const emptyState = {
      points: 0,
      unlockedDays: [],
      wonGames: [],
      purchasedItems: [],
      lastDailyDate: null,
      dailyWordleAttempts: []
    }
    await saveUserState(emptyState)
  }
}

