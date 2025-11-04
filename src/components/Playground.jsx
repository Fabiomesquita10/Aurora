import React, { useState } from 'react'
import { useGameState } from '../utils/gameState'
import WordleRomantico from '../games/WordleRomantico'
import './Playground.css'

function Playground() {
  const { wonGames } = useGameState()
  const [selectedGame, setSelectedGame] = useState(null)

  // Obter todos os jogos já jogados
  const playedGames = wonGames.filter(g => g.gameId === 'daily-game')
  const uniqueGameDays = [...new Set(playedGames.map(g => g.day))].sort((a, b) => a - b)

  const handlePlayWordle = () => {
    setSelectedGame('wordle')
  }

  const handleBack = () => {
    setSelectedGame(null)
  }

  if (selectedGame === 'wordle') {
    return (
      <div className="playground-container">
        <button className="back-button" onClick={handleBack}>
          ← Voltar ao Playground
        </button>
        <div className="playground-game">
          <h2>🎮 Wordle Playground</h2>
          <p className="playground-info">
            Palavra aleatória - diverte-te! 🎲
          </p>
          <WordleRomantico 
            targetWord={null} 
            randomMode={true}
            onWin={() => {}}
            onComplete={() => {}}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="playground-container">
      <h2 className="playground-title">🎮 Playground</h2>
      <p className="playground-description">
        Repete qualquer jogo que já tenhas jogado para passar o tempo!
      </p>

      <div className="playground-games">
        <div className="playground-game-card" onClick={handlePlayWordle}>
          <div className="game-icon">📝</div>
          <h3>Wordle</h3>
          <p>Palavra aleatória</p>
          <span className="game-badge">Disponível</span>
        </div>

        {uniqueGameDays.length === 0 && (
          <div className="no-games">
            <p>🔒 Ainda não jogaste nenhum jogo!</p>
            <p>Vai ao calendário e começa a jogar para desbloquear o playground.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Playground

