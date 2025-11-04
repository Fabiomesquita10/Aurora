import React from 'react'
import { getAllWordleWords, getFinalPhrase } from '../utils/wordlePhrase'
import { useGameState } from '../utils/gameState'
import './Wordles.css'

function Wordles() {
  const { wonGames } = useGameState()
  const words = getAllWordleWords()
  const phrase = getFinalPhrase()

  // Verificar quais wordles foram completados (apenas os realmente ganhos)
  // Filtrar apenas wordle-extra e remover duplicados mantendo apenas o mais recente
  const wordleWins = wonGames
    .filter(g => g.gameId === 'wordle-extra')
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Mais recentes primeiro
  
  // Remover duplicados mantendo apenas o primeiro de cada dia (mais recente)
  const uniqueWordleWins = wordleWins.filter((game, index, self) => 
    self.findIndex(g => g.day === game.day) === index
  )
  
  const completedWordles = uniqueWordleWins
    .map(g => g.day)

  return (
    <div className="wordles-container">
      <h2 className="wordles-title">📝 Wordles do Calendário</h2>
      
      <div className="wordles-info">
        <p className="wordles-description">
          Completa todos os 25 wordles do calendário para desbloquear a frase final!
        </p>
        <div className="progress-info">
          <span className="progress-text">
            Progresso: {completedWordles.length} / 25 wordles completados
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(completedWordles.length / 25) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {completedWordles.length === 25 && (
        <div className="phrase-unlocked">
          <h3>🎉 Frase Final Desbloqueada!</h3>
          <p className="final-phrase">{phrase}</p>
        </div>
      )}

      <div className="wordles-grid">
        {words.map((wordData, index) => {
          const isCompleted = completedWordles.includes(wordData.day)
          return (
            <div 
              key={index} 
              className={`wordle-card ${isCompleted ? 'completed' : 'pending'}`}
            >
              <div className="wordle-card-header">
                <span className="wordle-day">Dia {wordData.day}</span>
                {isCompleted ? (
                  <span className="wordle-status">✅</span>
                ) : (
                  <span className="wordle-status">⏳</span>
                )}
              </div>
              <div className="wordle-card-content">
                <div className="wordle-word">
                  {isCompleted ? wordData.word : '?????'}
                </div>
                <div className="wordle-initial">
                  Inicial: {isCompleted ? wordData.initial : '?'}
                </div>
                {!isCompleted && (
                  <div className="wordle-hint">🔒 Desbloqueia para jogar</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Wordles

