// Utilitário para fazer backup da pasta config quando um jogo é completado

/**
 * Faz backup de todos os ficheiros JSON da pasta config
 * @param {number} gameDay - Dia do jogo do calendário (1-25)
 * @returns {Promise<boolean>} true se o backup foi criado com sucesso
 */
export const createConfigBackup = async (gameDay) => {
  // Apenas fazer backup em modo desenvolvimento (onde o servidor Vite está disponível)
  if (!import.meta.env.DEV) {
    console.log('⚠️ Backup apenas disponível em modo desenvolvimento')
    return false
  }

  if (!gameDay) {
    console.warn('⚠️ Dia do jogo não fornecido para backup')
    return false
  }

  try {
    const response = await fetch('/api/backup-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameDay }),
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Backup criado:', result.backupName, 'Ficheiros:', result.files)
      return true
    } else {
      console.warn('⚠️ Não foi possível criar backup (servidor pode não estar disponível)')
      return false
    }
  } catch (error) {
    // Se o servidor não estiver disponível, apenas logar
    console.warn('⚠️ Não foi possível criar backup:', error.message)
    return false
  }
}

