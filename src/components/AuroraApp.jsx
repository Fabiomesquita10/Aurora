import React, { useState, useEffect } from 'react'
import Calendar from './Calendar'
import Presents from './Presents'
import Shop from './Shop'
import FinalPhrase from './FinalPhrase'
import Wordles from './Wordles'
import Playground from './Playground'
import { useGameState } from '../utils/gameState'
import { checkAllWordlesCompleted } from '../utils/wordlePhrase'
import './AuroraApp.css'

function AuroraApp() {
  const [activeTab, setActiveTab] = useState('calendar')
  const gameState = useGameState()
  const { points, resetGame, wonGames, DEV_MODE } = gameState
  const [showFinalPhrase, setShowFinalPhrase] = useState(false)
  const allWordlesCompleted = checkAllWordlesCompleted(wonGames || [])
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('aurora_dark_mode')
    return saved === 'true'
  })

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

  const handleReset = () => {
    if (window.confirm('⚠️ Tens a certeza que queres fazer reset? Isto vai apagar todos os pontos, jogos ganhos e compras!')) {
      resetGame()
      setShowResetConfirm(false)
      alert('✅ Reset completo!')
    }
  }

  return (
    <div className="aurora-app">
      <header className="aurora-header">
        <h1>✨ Aurora</h1>
        <div className="header-right">
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
          <Calendar onNavigateToPresents={() => setActiveTab('presents')} />
        )}
        {activeTab === 'presents' && <Presents />}
        {activeTab === 'shop' && <Shop />}
        {activeTab === 'wordles' && <Wordles />}
        {activeTab === 'playground' && <Playground />}
      </main>
    </div>
  )
}

export default AuroraApp
