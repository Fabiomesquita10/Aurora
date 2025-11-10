import React, { useState, useEffect } from 'react'
import Calendar from './Calendar'
import Presents from './Presents'
import Shop from './Shop'
import FinalPhrase from './FinalPhrase'
import Wordles from './Wordles'
import Playground from './Playground'
import ProfileManager from './ProfileManager'
import { useGameState } from '../utils/gameState'
import { checkAllWordlesCompleted } from '../utils/wordlePhrase'
import { getCurrentProfile, getAllProfiles, createProfile, setCurrentProfile as setCurrentProfileId } from '../utils/userProfiles'
import './AuroraApp.css'

function AuroraApp() {
  const [activeTab, setActiveTab] = useState('calendar')
  const gameState = useGameState()
  const { points, resetGame, wonGames, DEV_MODE } = gameState
  const [showFinalPhrase, setShowFinalPhrase] = useState(false)
  const allWordlesCompleted = checkAllWordlesCompleted(wonGames || [])
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [currentProfile, setCurrentProfile] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('aurora_dark_mode')
    return saved === 'true'
  })

  useEffect(() => {
    // Carregar perfil atual (sem criar perfil padrão)
    const profile = getCurrentProfile()
    setCurrentProfile(profile)
    
    // Se não houver perfil, redirecionar para a secção de perfis para mostrar login
    if (!profile) {
      setActiveTab('profiles')
    }
  }, [])

  // Verificar se todos os wordles foram completados
  useEffect(() => {
    if (allWordlesCompleted && !showFinalPhrase) {
      // Verificar se já mostrou antes
      const hasSeenPhrase = localStorage.getItem('aurora_seen_final_phrase')
      if (!hasSeenPhrase) {
        setShowFinalPhrase(true)
      }
    }
  }, [allWordlesCompleted, showFinalPhrase])

  useEffect(() => {
    localStorage.setItem('aurora_dark_mode', isDarkMode.toString())
    if (isDarkMode) {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }
  }, [isDarkMode])

  const handleReset = async () => {
    if (window.confirm('⚠️ Tens a certeza que queres fazer reset? Isto vai apagar todos os pontos, jogos ganhos e compras!')) {
      setShowResetConfirm(false)
      try {
        await resetGame()
        // O resetGame já faz reload, mas se não fizer, mostrar mensagem
        alert('✅ Reset completo! A página vai recarregar...')
      } catch (error) {
        console.error('Erro ao fazer reset:', error)
        alert('❌ Erro ao fazer reset. Tenta novamente.')
      }
    }
  }

  return (
    <div className="aurora-app">
      <header className="aurora-header">
        <h1>✨ Aurora</h1>
        <div className="header-right">
          {currentProfile && (
            <div className="profile-indicator" title={`Perfil: ${currentProfile.name}`}>
              👤 {currentProfile.name}
            </div>
          )}
          <div className="points-display" key={`points-${points}`}>
            <span className="points-icon">💎</span>
            <span className="points-value">{points || 0}</span>
            <span className="points-label">pontos</span>
          </div>
          <button 
            className="theme-toggle" 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          {DEV_MODE && (
            <button className="reset-button" onClick={() => setShowResetConfirm(true)} title="Reset">
              🔄
            </button>
          )}
        </div>
      </header>

      {showResetConfirm && (
        <div className="reset-confirm-overlay">
          <div className="reset-confirm-box">
            <h3>⚠️ Confirmar Reset</h3>
            <p>Isto vai apagar:</p>
            <ul>
              <li>💎 Todos os pontos</li>
              <li>🎮 Todos os jogos ganhos</li>
              <li>🛍️ Todas as compras</li>
              <li>📅 Todos os dias desbloqueados</li>
            </ul>
            <div className="reset-confirm-buttons">
              <button className="confirm-reset" onClick={handleReset}>
                Sim, Reset
              </button>
              <button className="cancel-reset" onClick={() => setShowResetConfirm(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="aurora-nav">
        <button
          className={`nav-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendário
        </button>
        <button
          className={`nav-button ${activeTab === 'presents' ? 'active' : ''}`}
          onClick={() => setActiveTab('presents')}
        >
          🎁 Presentes
        </button>
        <button
          className={`nav-button ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          🛍️ Loja
        </button>
        <button
          className={`nav-button ${activeTab === 'wordles' ? 'active' : ''}`}
          onClick={() => setActiveTab('wordles')}
        >
          📝 Wordles
        </button>
        <button
          className={`nav-button ${activeTab === 'playground' ? 'active' : ''}`}
          onClick={() => setActiveTab('playground')}
        >
          🎮 Playground
        </button>
        <button
          className={`nav-button ${activeTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('profiles')}
        >
          👤 Perfis
        </button>
      </nav>

      <main className="aurora-main">
        {showFinalPhrase && allWordlesCompleted && (
          <div className="final-phrase-overlay">
            <div className="final-phrase-modal">
              <FinalPhrase />
              <button 
                className="close-phrase-button"
                onClick={() => {
                  setShowFinalPhrase(false)
                  localStorage.setItem('aurora_seen_final_phrase', 'true')
                }}
              >
                ✕ Fechar
              </button>
            </div>
          </div>
        )}
        {activeTab === 'calendar' && (
          <>
            {!currentProfile && (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>🔒 Autenticação Necessária</h2>
                <p>Por favor, faz login na secção "Perfis" para aceder ao calendário.</p>
                <button 
                  onClick={() => setActiveTab('profiles')}
                  style={{ 
                    marginTop: '20px', 
                    padding: '12px 24px', 
                    background: 'var(--primary-color)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  Ir para Login
                </button>
              </div>
            )}
            {currentProfile && <Calendar onNavigateToPresents={() => setActiveTab('presents')} />}
          </>
        )}
        {activeTab === 'presents' && (
          <>
            {!currentProfile && (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>🔒 Autenticação Necessária</h2>
                <p>Por favor, faz login na secção "Perfis" para aceder aos presentes.</p>
              </div>
            )}
            {currentProfile && <Presents />}
          </>
        )}
        {activeTab === 'shop' && (
          <>
            {!currentProfile && (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>🔒 Autenticação Necessária</h2>
                <p>Por favor, faz login na secção "Perfis" para aceder à loja.</p>
              </div>
            )}
            {currentProfile && <Shop />}
          </>
        )}
        {activeTab === 'wordles' && (
          <>
            {!currentProfile && (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>🔒 Autenticação Necessária</h2>
                <p>Por favor, faz login na secção "Perfis" para aceder aos wordles.</p>
              </div>
            )}
            {currentProfile && <Wordles />}
          </>
        )}
        {activeTab === 'playground' && (
          <>
            {!currentProfile && (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>🔒 Autenticação Necessária</h2>
                <p>Por favor, faz login na secção "Perfis" para aceder ao playground.</p>
              </div>
            )}
            {currentProfile && <Playground />}
          </>
        )}
        {activeTab === 'profiles' && (
          <ProfileManager onProfileChange={(profileId) => {
            setCurrentProfile(getCurrentProfile())
            window.location.reload()
          }} />
        )}
      </main>
    </div>
  )
}

export default AuroraApp
