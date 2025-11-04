// Utilitário para guardar e carregar o estado do utilizador (pontos, etc.) no JSON

// Função para obter o estado do utilizador
export const loadUserState = async () => {
  try {
    // Primeiro, tentar carregar do localStorage (cache rápido)
    const stored = localStorage.getItem('aurora_user_state_json')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.warn('Erro ao fazer parse do localStorage:', e)
      }
    }
    
    // Se não houver no localStorage, tentar carregar do ficheiro JSON (apenas em desenvolvimento)
    if (import.meta.env.DEV) {
      try {
        const response = await fetch('/src/config/user-state.json')
        if (response.ok) {
          const jsonData = await response.json()
          // Guardar no localStorage para cache
          localStorage.setItem('aurora_user_state_json', JSON.stringify(jsonData))
          return jsonData
        }
      } catch (e) {
        // Se não conseguir carregar do ficheiro, usar estado padrão
        console.warn('Não foi possível carregar do ficheiro JSON:', e.message)
      }
    }
    
    // Se não houver em nenhum lugar, retornar estado padrão
    const defaultState = {
      points: 0,
      spentPoints: 0,
      unlockedDays: [],
      wonGames: [],
      purchasedItems: [],
      lastDailyDate: null,
      dailyWordleAttempts: []
    }
    // Guardar estado padrão no localStorage
    localStorage.setItem('aurora_user_state_json', JSON.stringify(defaultState))
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
    // Guardar no localStorage (cache rápido)
    localStorage.setItem('aurora_user_state_json', JSON.stringify(userState))
    
    // Em modo desenvolvimento, escrever diretamente no ficheiro JSON
    if (import.meta.env.DEV) {
      try {
        const response = await fetch('/api/write-user-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userState),
        })
        
        if (response.ok) {
          console.log('✅ Ficheiro user-state.json atualizado!')
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
export const clearUserState = () => {
  localStorage.removeItem('aurora_user_state_json')
  const emptyState = {
    points: 0,
    unlockedDays: [],
    wonGames: [],
    purchasedItems: [],
    lastDailyDate: null,
    dailyWordleAttempts: []
  }
  saveUserState(emptyState)
}

