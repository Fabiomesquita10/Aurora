// Sistema de múltiplos perfis/utilizadores
// Cada utilizador tem o seu próprio localStorage separado

const PROFILES_KEY = 'aurora_profiles'
const CURRENT_PROFILE_KEY = 'aurora_current_profile'

/**
 * Obter todos os perfis
 */
export const getAllProfiles = () => {
  try {
    const stored = localStorage.getItem(PROFILES_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return []
  } catch (e) {
    console.warn('Erro ao carregar perfis:', e)
    return []
  }
}

/**
 * Criar um novo perfil
 */
export const createProfile = (name, accountId = null, accountUsername = null) => {
  const profiles = getAllProfiles()
  const newProfile = {
    id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name || `Perfil ${profiles.length + 1}`,
    createdAt: new Date().toISOString(),
    lastPlayed: new Date().toISOString(),
    accountId: accountId || null,
    accountUsername: accountUsername || null
  }
  
  profiles.push(newProfile)
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  
  // Criar localStorage separado para este perfil
  initializeProfileStorage(newProfile.id)
  
  return newProfile
}

/**
 * Apagar um perfil
 */
export const deleteProfile = (profileId) => {
  const profiles = getAllProfiles().filter(p => p.id !== profileId)
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  
  // Limpar localStorage deste perfil
  clearProfileStorage(profileId)
  
  // Se era o perfil atual, limpar
  const currentProfileId = getCurrentProfileId()
  if (currentProfileId === profileId) {
    localStorage.removeItem(CURRENT_PROFILE_KEY)
  }
}

/**
 * Obter perfil atual
 */
export const getCurrentProfileId = () => {
  return localStorage.getItem(CURRENT_PROFILE_KEY)
}

/**
 * Definir perfil atual
 */
export const setCurrentProfile = (profileId) => {
  localStorage.setItem(CURRENT_PROFILE_KEY, profileId)
  
  // Atualizar lastPlayed
  const profiles = getAllProfiles()
  const profile = profiles.find(p => p.id === profileId)
  if (profile) {
    profile.lastPlayed = new Date().toISOString()
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  }
}

/**
 * Obter dados do perfil atual
 */
export const getCurrentProfile = () => {
  const profileId = getCurrentProfileId()
  if (!profileId) return null
  
  const profiles = getAllProfiles()
  return profiles.find(p => p.id === profileId) || null
}

/**
 * Inicializar storage para um perfil (criar chaves vazias se não existirem)
 */
const initializeProfileStorage = (profileId) => {
  const prefix = `aurora_${profileId}_`
  
  // Verificar se já existe algum dado
  const hasData = localStorage.getItem(`${prefix}user_state_json`)
  if (!hasData) {
    // Criar estado padrão
    const defaultState = {
      points: 0,
      spentPoints: 0,
      unlockedDays: [],
      wonGames: [],
      purchasedItems: [],
      lastDailyDate: null,
      dailyWordleAttempts: []
    }
    localStorage.setItem(`${prefix}user_state_json`, JSON.stringify(defaultState))
    localStorage.setItem(`${prefix}game_attempts_json`, JSON.stringify([]))
  }
}

/**
 * Limpar storage de um perfil
 */
const clearProfileStorage = (profileId) => {
  const prefix = `aurora_${profileId}_`
  const keysToRemove = []
  
  // Encontrar todas as chaves deste perfil
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key)
    }
  }
  
  // Remover todas as chaves
  keysToRemove.forEach(key => localStorage.removeItem(key))
}

/**
 * Obter chave prefixada para o perfil atual
 */
export const getProfileKey = (baseKey) => {
  const profileId = getCurrentProfileId()
  if (profileId) {
    return `aurora_${profileId}_${baseKey}`
  }
  // Fallback para compatibilidade (sem perfil = usar chaves antigas)
  return baseKey
}

/**
 * Exportar dados do perfil atual
 */
export const exportProfileData = () => {
  const profileId = getCurrentProfileId()
  if (!profileId) {
    throw new Error('Nenhum perfil selecionado')
  }
  
  const prefix = `aurora_${profileId}_`
  const profileData = {
    profileId,
    profile: getCurrentProfile(),
    userState: null,
    gameAttempts: []
  }
  
  // Carregar user state
  const userStateKey = `${prefix}user_state_json`
  const userState = localStorage.getItem(userStateKey)
  if (userState) {
    profileData.userState = JSON.parse(userState)
  }
  
  // Carregar game attempts
  const gameAttemptsKey = `${prefix}game_attempts_json`
  const gameAttempts = localStorage.getItem(gameAttemptsKey)
  if (gameAttempts) {
    profileData.gameAttempts = JSON.parse(gameAttempts)
  }
  
  // Criar ficheiro JSON
  const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `aurora-profile-${profileData.profile?.name || profileId}-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  return profileData
}

/**
 * Importar dados de um perfil
 */
export const importProfileData = (jsonData) => {
  if (!jsonData.profileId || !jsonData.profile) {
    throw new Error('Dados inválidos: falta profileId ou profile')
  }
  
  const profileId = jsonData.profileId
  const prefix = `aurora_${profileId}_`
  
  // Guardar dados do perfil
  const profiles = getAllProfiles()
  const existingIndex = profiles.findIndex(p => p.id === profileId)
  
  if (existingIndex >= 0) {
    // Atualizar perfil existente
    profiles[existingIndex] = { ...profiles[existingIndex], ...jsonData.profile }
  } else {
    // Criar novo perfil
    profiles.push(jsonData.profile)
  }
  
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  
  // Guardar dados do perfil
  if (jsonData.userState) {
    localStorage.setItem(`${prefix}user_state_json`, JSON.stringify(jsonData.userState))
  }
  
  if (jsonData.gameAttempts) {
    localStorage.setItem(`${prefix}game_attempts_json`, JSON.stringify(jsonData.gameAttempts))
  }
  
  return profileId
}

