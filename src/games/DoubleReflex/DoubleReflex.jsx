import React, { useState, useEffect, useRef } from 'react'
import './DoubleReflex.css'

function DoubleReflex({ rounds = 10, numberOfButtons = 9, day, onWin, onComplete, onGameAttempt }) {
  const [gameStatus, setGameStatus] = useState('waiting') // waiting, showing, reacting, won, lost
  const [currentRound, setCurrentRound] = useState(0)
  const [correctButton, setCorrectButton] = useState(null)
  const [reactionTimes, setReactionTimes] = useState([])
  const [errors, setErrors] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [roundStartTime, setRoundStartTime] = useState(null)
  const [showButtons, setShowButtons] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const startGame = () => {
    setGameStatus('showing')
    setCurrentRound(0)
    setReactionTimes([])
    setErrors(0)
    setStartTime(Date.now())
    startRound(0)
  }

  const startRound = (round) => {
    if (round >= rounds) {
      // Todas as rondas completadas
      setGameStatus('won')
      handleGameComplete(true)
      return
    }

    // Pequeno delay antes de mostrar os botões (1-3 segundos aleatório)
    const delay = Math.random() * 2000 + 1000 // 1-3 segundos
    
    timeoutRef.current = setTimeout(() => {
      // Escolher botão correto aleatoriamente (0 a numberOfButtons-1)
      const correct = Math.floor(Math.random() * numberOfButtons)
      setCorrectButton(correct)
      setShowButtons(true)
      setRoundStartTime(Date.now())
      setGameStatus('reacting')
    }, delay)
  }

  const handleButtonClick = (buttonIndex) => {
    if (gameStatus !== 'reacting') return

    const reactionTime = Date.now() - roundStartTime
    setReactionTimes(prev => [...prev, reactionTime])

    if (buttonIndex === correctButton) {
      // Acertou!
      setShowButtons(false)
      setCurrentRound(prev => prev + 1)
      
      // Pequeno delay antes da próxima ronda
      setTimeout(() => {
        startRound(currentRound + 1)
      }, 500)
    } else {
      // Erro - clicou no botão errado
      setErrors(prev => prev + 1)
      setShowButtons(false)
      
      // Pequeno delay antes da próxima ronda
      setTimeout(() => {
        setCurrentRound(prev => prev + 1)
        startRound(currentRound + 1)
      }, 500)
    }
  }

  const handleGameComplete = (won) => {
    const totalTime = Math.round((Date.now() - startTime) / 1000)
    const averageReactionTime = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0

    if (onGameAttempt && day) {
      onGameAttempt('double-reflex', day, {
        won: won,
        attempts: 1,
        errors: errors,
        score: won ? rounds - errors : null,
        metadata: {
          timeSeconds: totalTime,
          averageReactionTime: averageReactionTime,
          reactionTimes: reactionTimes,
          rounds: rounds,
          errors: errors,
          numberOfButtons: numberOfButtons
        }
      }).catch(err => {
        console.warn('Erro ao registar tentativa:', err)
      })
    }

    if (won && onWin) {
      setTimeout(() => onWin(rounds - errors), 500)
    }
    if (onComplete) {
      setTimeout(() => onComplete(rounds - errors, won), 500)
    }
  }

  const resetGame = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setGameStatus('waiting')
    setCurrentRound(0)
    setReactionTimes([])
    setErrors(0)
    setCorrectButton(null)
    setShowButtons(false)
    setStartTime(null)
    setRoundStartTime(null)
  }

  if (gameStatus === 'waiting') {
    return (
      <div className="double-reflex-container">
        <div className="double-reflex-start-screen">
          <h2>⚡ Reflexo Duplo</h2>
          <p className="double-reflex-instruction">
            Vários quadrados vão aparecer. Clica no quadrado verde (✓) o mais rápido possível!
          </p>
          <p className="double-reflex-info">
            Rondas: <b>{rounds}</b> | Quadrados: <b>{numberOfButtons}</b>
          </p>
          <button onClick={startGame} className="double-reflex-start-button">
            Começar
          </button>
        </div>
      </div>
    )
  }

  if (gameStatus === 'won') {
    const totalTime = Math.round((Date.now() - startTime) / 1000)
    const averageReactionTime = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0

    return (
      <div className="double-reflex-container">
        <div className="double-reflex-result">
          <h2>🎉 Jogo Completo!</h2>
          <p>Rondas: {rounds}</p>
          <p>Erros: {errors}</p>
          <p>Acertos: {rounds - errors}</p>
          <p>Tempo total: {totalTime}s</p>
          <p>Tempo médio de reação: {averageReactionTime}ms</p>
          <button onClick={resetGame} className="double-reflex-reset-button">
            Jogar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="double-reflex-container">
      <div className="double-reflex-header">
        <h2>⚡ Reflexo Duplo</h2>
        <div className="double-reflex-stats">
          <span>Ronda: {currentRound + 1}/{rounds}</span>
          <span>Erros: {errors}</span>
          {startTime && (
            <span>Tempo: {Math.round((Date.now() - startTime) / 1000)}s</span>
          )}
        </div>
      </div>

      {gameStatus === 'showing' && !showButtons && (
        <div className="double-reflex-message">
          <p>👀 Aguarda os botões aparecerem...</p>
        </div>
      )}

      {gameStatus === 'reacting' && showButtons && (
        <div className="double-reflex-message">
          <p>🎯 Clica no botão correto!</p>
        </div>
      )}

      <div className="double-reflex-buttons">
        {showButtons ? (
          <div className="double-reflex-grid">
            {Array.from({ length: numberOfButtons }).map((_, index) => {
              const isCorrect = correctButton === index
              return (
                <button
                  key={index}
                  className={`double-reflex-button ${isCorrect ? 'correct' : 'wrong'}`}
                  onClick={() => handleButtonClick(index)}
                >
                  {isCorrect ? '✓' : '✗'}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="double-reflex-waiting">
            <div className="waiting-spinner"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoubleReflex

