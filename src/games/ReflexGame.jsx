import React, { useState, useEffect, useRef } from 'react'
import './ReflexGame.css'

function ReflexGame({ rounds = 5, day, onWin, onComplete, onGameAttempt }) {
  const [gameStatus, setGameStatus] = useState('idle') // idle, waiting, playing, finished
  const [currentRound, setCurrentRound] = useState(0)
  const [reactionTimes, setReactionTimes] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [score, setScore] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [errors, setErrors] = useState(0) // Cliques muito cedo
  const timeoutRef = useRef(null)
  const countdownRef = useRef(null)

  const colors = [
    '#FF6B9D', '#4ECDC4', '#95E1D3', '#C06C84', 
    '#F8B500', '#6C5CE7', '#FFD700', '#FF6B6B'
  ]

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [])

  const startGame = () => {
    setGameStatus('waiting')
    setCurrentRound(0)
    setReactionTimes([])
    setScore(0)
    setCountdown(3)
    setErrors(0)
    
    // Countdown
    let count = 3
    countdownRef.current = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
        startRound()
      }
    }, 1000)
  }

  const startRound = () => {
    setIsActive(false)
    setGameStatus('playing')
    
    // Tempo aleatório entre 1 e 4 segundos antes de ativar
    const delay = 1000 + Math.random() * 3000
    
    timeoutRef.current = setTimeout(() => {
      setIsActive(true)
      setStartTime(Date.now())
    }, delay)
  }

  const handleClick = () => {
    if (gameStatus !== 'playing') return
    
    if (!isActive) {
      // Clicou muito cedo - penalização
      setScore(prev => Math.max(0, prev - 10))
      setErrors(prev => prev + 1)
      alert('Muito cedo! Espera pela mudança!')
      return
    }

    const reactionTime = Date.now() - startTime
    const newReactionTimes = [...reactionTimes, reactionTime]
    
    // Pontuação baseada na velocidade (mais rápido = mais pontos)
    const points = Math.max(0, Math.floor((1000 - reactionTime) / 10))
    
    setReactionTimes(newReactionTimes)
    setScore(prev => {
      const newScore = prev + points
      
      setIsActive(false)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (currentRound < rounds - 1) {
        setCurrentRound(prev => prev + 1)
        setTimeout(() => {
          startRound()
        }, 1000)
      } else {
        // Fim do jogo
        setGameStatus('finished')
        
        const avgReactionTime = newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length
        const finalScore = Math.round(newScore)
      
        // Registar tentativa completa no sistema
        setTimeout(() => {
          if (onGameAttempt && day) {
            onGameAttempt('reflex', day, {
              won: true,
              attempts: rounds,
              errors: errors,
              score: finalScore,
              reactionTimes: [...newReactionTimes, reactionTime], // Incluir este round
            })
          }
        }, 0)
        
        if (onWin) {
          setTimeout(() => onWin(finalScore), 500)
        }
        if (onComplete) {
          setTimeout(() => onComplete(finalScore, true), 500)
        }
      }
      
      return newScore
    })
  }

  const getAverageReactionTime = () => {
    if (reactionTimes.length === 0) return 0
    return Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
  }

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)]
  }

  if (gameStatus === 'finished') {
    const avgTime = getAverageReactionTime()
    return (
      <div className="reflex-container">
        <div className="reflex-result">
          <h2>🎉 Jogo Completo!</h2>
          <div className="reflex-stats">
            <div className="stat-item">
              <div className="stat-label">Pontuação</div>
              <div className="stat-value">{score}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Tempo Médio</div>
              <div className="stat-value">{avgTime}ms</div>
            </div>
          </div>
          {avgTime < 300 && (
            <p className="perfect-score">Excelente reflexo! 🚀</p>
          )}
          {avgTime >= 300 && avgTime < 500 && (
            <p className="good-score">Bom tempo de reação! 😊</p>
          )}
          {avgTime >= 500 && (
            <p className="ok-score">Continua a praticar! 💪</p>
          )}
          <button onClick={startGame} className="reflex-reset-button">
            Jogar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="reflex-container">
      <div className="reflex-header">
        <h2>⚡ Jogo de Reflexo</h2>
        <p className="reflex-subtitle">
          {gameStatus === 'idle'
            ? 'Prepara-te! Clica para começar.'
            : gameStatus === 'waiting' 
            ? `Prepara-te! Começa em ${countdown}...`
            : gameStatus === 'playing' && !isActive
            ? 'Espera pela mudança...'
            : isActive
            ? 'Clica AGORA!'
            : 'Espera pela mudança...'}
        </p>
        <div className="reflex-progress">
          <div 
            className="reflex-progress-bar" 
            style={{ width: `${((currentRound + 1) / rounds) * 100}%` }}
          />
        </div>
        <div className="reflex-info">
          <span>Round {currentRound + 1} / {rounds}</span>
          <span className="reflex-score">Pontos: {score}</span>
        </div>
      </div>

      <div className="reflex-game-area">
        <div
          className={`reflex-box ${isActive ? 'active' : ''}`}
          style={{
            backgroundColor: isActive ? getRandomColor() : '#ddd'
          }}
          onClick={handleClick}
        >
          {gameStatus === 'idle' && (
            <div className="reflex-waiting-text">Prepara-te!</div>
          )}
          {gameStatus === 'waiting' && (
            <div className="reflex-waiting">
              <div className="countdown-circle">
                <span>{countdown}</span>
              </div>
            </div>
          )}
          {gameStatus === 'playing' && !isActive && (
            <div className="reflex-waiting-text">Espera...</div>
          )}
          {isActive && (
            <div className="reflex-active-text">
              <span className="flash">CLICA!</span>
            </div>
          )}
        </div>

        {reactionTimes.length > 0 && (
          <div className="reflex-last-time">
            Última reação: {reactionTimes[reactionTimes.length - 1]}ms
          </div>
        )}

        {gameStatus === 'idle' && (
          <button 
            className="reflex-start-button"
            onClick={startGame}
          >
            Começar Jogo
          </button>
        )}
      </div>

      <div className="reflex-instructions">
        <h4>Como jogar:</h4>
        <ul>
          <li>Espera que a caixa mude de cor</li>
          <li>Clica o mais rápido possível quando isso acontecer</li>
          <li>Não cliques antes da mudança ou perdes pontos!</li>
          <li>Ganha pontos baseados na tua velocidade</li>
        </ul>
      </div>
    </div>
  )
}

export default ReflexGame
