// Sistema de gestão de contas/utilizadores

// Carregar contas do ficheiro JSON
export const loadAccounts = async (forceReload = false) => {
  try {
    if (import.meta.env.DEV) {
      // Adicionar timestamp para evitar cache
      const cacheBuster = forceReload ? `?t=${Date.now()}` : ''
      const response = await fetch(`/src/config/accounts.json${cacheBuster}`)
      if (response.ok) {
        return await response.json()
      }
    }
    // Em produção, retornar array vazio (ou usar localStorage)
    return []
  } catch (e) {
    console.warn('Erro ao carregar contas:', e)
    return []
  }
}

// Verificar credenciais
export const authenticateAccount = async (username, password) => {
  const accounts = await loadAccounts()
  const account = accounts.find(
    acc => acc.username === username && acc.password === password
  )
  
  if (account && account.active) {
    return account
  }
  
  return null
}

// Obter conta por ID
export const getAccountById = async (accountId, forceReload = false) => {
  if (!accountId) return null
  const accounts = await loadAccounts(forceReload)
  const account = accounts.find(acc => acc.id === accountId) || null
  if (!account) {
    console.warn(`⚠️ Conta não encontrada no JSON: ${accountId}. Contas disponíveis:`, accounts.map(a => a.id))
  }
  return account
}

// Verificar se conta está ativa
export const isAccountActive = async (accountId) => {
  if (!accountId) {
    console.warn('⚠️ isAccountActive: accountId não fornecido')
    return false
  }
  
  // Forçar reload para garantir dados atualizados (evitar cache)
  const account = await getAccountById(accountId, true)
  
  if (!account) {
    console.warn(`⚠️ Conta não encontrada: ${accountId}`)
    return false
  }
  
  const isActive = account.active === true
  console.log(`🔍 Verificação de conta: ${accountId} (${account.name}) - Ativa: ${isActive}`)
  
  return isActive
}

// Guardar contas (apenas para modo DEV - para edição manual)
export const saveAccounts = async (accounts) => {
  if (import.meta.env.DEV) {
    try {
      const response = await fetch('/api/write-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accounts),
      })
      
      if (response.ok) {
        console.log('✅ Ficheiro accounts.json atualizado!')
        return true
      }
    } catch (e) {
      console.warn('⚠️ Não foi possível atualizar o ficheiro JSON:', e.message)
    }
  }
  return false
}

