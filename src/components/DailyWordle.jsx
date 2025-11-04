import React, { useState, useEffect } from 'react'
import WordleRomantico from '../games/WordleRomantico'
import { useGameState } from '../utils/gameState'
import './DailyWordle.css'

function DailyWordle() {
  const { addPoints, addDailyWordleAttempt, calculateWordlePoints, getTodayWordleAttempts, dailyWordleAttempts } = useGameState()
  const [showResult, setShowResult] = useState(false)
  const [resultMessage, setResultMessage] = useState('')
  const [hasPlayedToday, setHasPlayedToday] = useState(false)

  const todayAttempts = getTodayWordleAttempts()
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    setHasPlayedToday(todayAttempts !== null)
  }, [todayAttempts, dailyWordleAttempts])

  const handleWordleWin = (attempts) => {
    const points = calculateWordlePoints(attempts)
    addPoints(points)
    addDailyWordleAttempt(attempts)
    setHasPlayedToday(true)
    setResultMessage(`🎉 Ganhaste ${points} pontos! (${attempts} tentativa${attempts > 1 ? 's' : ''})`)
    setShowResult(true)
    setTimeout(() => setShowResult(false), 4000)
  }

  const handleWordleComplete = (attempts, won) => {
    if (!won) {
      addDailyWordleAttempt(attempts)
      setHasPlayedToday(true)
      setResultMessage(`Tentaste ${attempts} vezes. Tenta novamente amanhã!`)
      setShowResult(true)
      setTimeout(() => setShowResult(false), 4000)
    }
  }

  return (
    <div className="daily-wordle-container">
      <div className="daily-wordle-header">
        <h2>📝 Wordle Diário</h2>
        <p className="daily-wordle-subtitle">Resolve o Wordle e ganha pontos para a loja!</p>
        {hasPlayedToday && todayAttempts && (
          <div className="today-attempts">
            ✅ Já jogaste hoje - {todayAttempts} tentativa{todayAttempts > 1 ? 's' : ''}
          </div>
        )}
        {!hasPlayedToday && (
          <div className="today-attempts new">
            🎮 Ainda não jogaste hoje! Resolve o Wordle para ganhares pontos.
          </div>
        )}
      </div>

      {showResult && (
        <div className="result-message">
          {resultMessage}
        </div>
      )}

      {hasPlayedToday ? (
        <div className="already-played-message">
          <h3>✅ Já jogaste o Wordle de hoje!</h3>
          <p>Usaste {todayAttempts} tentativa{todayAttempts > 1 ? 's' : ''}.</p>
          <p>Volta amanhã para uma nova palavra! 🎯</p>
        </div>
      ) : (
        <WordleRomantico onWin={handleWordleWin} onComplete={handleWordleComplete} />
      )}
      
      <div className="wordle-points-info">
        <h3>💎 Pontos por Tentativa:</h3>
        <ul>
          <li>1ª tentativa: <strong>5 pontos</strong></li>
          <li>2ª tentativa: <strong>4 pontos</strong></li>
          <li>3ª tentativa: <strong>3 pontos</strong></li>
          <li>4ª tentativa: <strong>2 pontos</strong></li>
          <li>5ª tentativa: <strong>1 ponto</strong></li>
          <li>6ª tentativa: <strong>1 ponto</strong></li>
        </ul>
      </div>
    </div>
  )
}

export default DailyWordle

