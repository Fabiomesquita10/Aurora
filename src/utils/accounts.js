// Sistema de gestão de contas/utilizadores

// Carregar contas do ficheiro JSON
export const loadAccounts = async () => {
  try {
    if (import.meta.env.DEV) {
      const response = await fetch('/src/config/accounts.json')
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
export const getAccountById = async (accountId) => {
  const accounts = await loadAccounts()
  return accounts.find(acc => acc.id === accountId) || null
}

// Verificar se conta está ativa
export const isAccountActive = async (accountId) => {
  const account = await getAccountById(accountId)
  return account && account.active === true
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

