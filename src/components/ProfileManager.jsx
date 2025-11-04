import React, { useState, useEffect } from 'react'
import {
  getAllProfiles,
  createProfile,
  deleteProfile,
  setCurrentProfile,
  getCurrentProfile
} from '../utils/userProfiles'
import { authenticateAccount, isAccountActive } from '../utils/accounts'
import './ProfileManager.css'

function ProfileManager({ onProfileChange }) {
  const [profiles, setProfiles] = useState([])
  const [currentProfile, setCurrentProfileState] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newProfileName, setNewProfileName] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isCheckingAccount, setIsCheckingAccount] = useState(false)

  useEffect(() => {
    loadProfiles()
    const profile = getCurrentProfile()
    setCurrentProfileState(profile)
    
    // Se não houver perfil, mostrar modal de login automaticamente
    if (!profile) {
      // Pequeno delay para garantir que o componente está renderizado
      setTimeout(() => {
        setShowLoginModal(true)
      }, 100)
    }
  }, [])

  const loadProfiles = () => {
    const allProfiles = getAllProfiles()
    setProfiles(allProfiles)
    
    const current = getCurrentProfile()
    setCurrentProfileState(current)
  }

  const handleLogin = async () => {
    setLoginError('')
    
    if (!username.trim() || !password.trim()) {
      setLoginError('Por favor, preenche todos os campos')
      return
    }
    
    setIsCheckingAccount(true)
    
    try {
      const account = await authenticateAccount(username.trim(), password.trim())
      
      if (!account) {
        setLoginError('Credenciais inválidas ou conta inativa')
        setIsCheckingAccount(false)
        return
      }
      
      // Verificar se a conta está ativa
      const active = await isAccountActive(account.id)
      if (!active) {
        setLoginError('Esta conta não está ativa')
        setIsCheckingAccount(false)
        return
      }
      
      // Procurar perfil existente para esta conta
      const existingProfiles = getAllProfiles()
      let profile = existingProfiles.find(p => p.accountId === account.id)
      
      // Se não existir, criar perfil
      if (!profile) {
        profile = createProfile(account.name || account.username, account.id, account.username)
      } else {
        // Atualizar informações da conta se necessário
        profile.accountId = account.id
        profile.accountUsername = account.username
        // Atualizar perfil no localStorage
        const profiles = getAllProfiles()
        const profileIndex = profiles.findIndex(p => p.id === profile.id)
        if (profileIndex >= 0) {
          profiles[profileIndex] = profile
          localStorage.setItem('aurora_profiles', JSON.stringify(profiles))
        }
      }
      
      // Definir como perfil atual
      setCurrentProfile(profile.id)
      setCurrentProfileState(profile)
      setShowLoginModal(false)
      setUsername('')
      setPassword('')
      
      // Recarregar página para aplicar mudanças
      if (onProfileChange) {
        onProfileChange(profile.id)
      } else {
        window.location.reload()
      }
    } catch (error) {
      setLoginError('Erro ao fazer login: ' + error.message)
    } finally {
      setIsCheckingAccount(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('⚠️ Tens a certeza que queres fazer logout?')) {
      localStorage.removeItem('aurora_current_profile')
      setCurrentProfileState(null)
      setShowLoginModal(true)
      window.location.reload()
    }
  }

  const handleDeleteProfile = (profileId) => {
    if (!window.confirm('⚠️ Tens a certeza que queres apagar este perfil? Todos os dados serão perdidos!')) {
      return
    }
    
    deleteProfile(profileId)
    loadProfiles()
    
    // Se era o perfil atual, fazer logout
    if (currentProfile?.id === profileId) {
      setCurrentProfileState(null)
      setShowLoginModal(true)
    }
  }

  const handleSwitchProfile = (profileId) => {
    setCurrentProfile(profileId)
    loadProfiles()
    
    // Recarregar página para aplicar mudanças
    if (onProfileChange) {
      onProfileChange(profileId)
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="profile-manager">
      <div className="profile-header">
        <h2>👤 Perfis de Utilizador</h2>
        {currentProfile && (
          <button 
            className="btn-logout"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        )}
      </div>

      {currentProfile && (
        <div className="current-profile">
          <span className="current-label">Perfil Atual:</span>
          <span className="current-name">{currentProfile.name}</span>
          {currentProfile.accountUsername && (
            <span className="current-account">({currentProfile.accountUsername})</span>
          )}
        </div>
      )}

      {!currentProfile && (
        <div className="no-profile-message">
          <p>🔒 Não estás autenticado.</p>
          <p>Faz login para começar a jogar!</p>
          <button 
            className="btn-login"
            onClick={() => setShowLoginModal(true)}
          >
            🔑 Fazer Login
          </button>
        </div>
      )}

      <div className="profiles-list">
        {profiles.length === 0 ? (
          <div className="no-profiles">
            <p>Nenhum perfil criado ainda.</p>
            <p>Faz login para criar o teu perfil!</p>
          </div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.id}
              className={`profile-item ${currentProfile?.id === profile.id ? 'active' : ''}`}
            >
              <div className="profile-info">
                <div className="profile-name">{profile.name}</div>
                {profile.accountUsername && (
                  <div className="profile-account">Conta: {profile.accountUsername}</div>
                )}
                <div className="profile-meta">
                  Criado em: {new Date(profile.createdAt).toLocaleDateString('pt-PT')}
                  {profile.lastPlayed && (
                    <> • Última vez: {new Date(profile.lastPlayed).toLocaleDateString('pt-PT')}</>
                  )}
                </div>
              </div>
              <div className="profile-actions">
                {currentProfile?.id !== profile.id && (
                  <button
                    className="btn-switch"
                    onClick={() => handleSwitchProfile(profile.id)}
                  >
                    Trocar
                  </button>
                )}
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteProfile(profile.id)}
                  title="Apagar perfil"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => !isCheckingAccount && setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🔑 Login</h3>
            <p>Insere as tuas credenciais para aceder:</p>
            <input
              type="text"
              placeholder="Nome de utilizador"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isCheckingAccount && handleLogin()}
              disabled={isCheckingAccount}
              autoFocus
            />
            <input
              type="password"
              placeholder="Palavra-passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isCheckingAccount && handleLogin()}
              disabled={isCheckingAccount}
            />
            {loginError && (
              <div className="login-error">{loginError}</div>
            )}
            <div className="modal-buttons">
              <button 
                onClick={handleLogin}
                disabled={isCheckingAccount}
              >
                {isCheckingAccount ? 'A verificar...' : 'Entrar'}
              </button>
              <button 
                onClick={() => setShowLoginModal(false)}
                disabled={isCheckingAccount}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileManager
