import React, { useState, useEffect, useRef } from 'react'
import './CatchHearts.css'

function CatchHearts({ targetHearts = 30, gameDuration = 60, maxAttempts = 3, day, onWin, onComplete, onGameAttempt }) {
  const [gameStatus, setGameStatus] = useState('waiting') // waiting, playing, won, lost
  const [hearts, setHearts] = useState([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(gameDuration)
  const [attempts, setAttempts] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const gameAreaRef = useRef(null)
  const intervalRef = useRef(null)
  const timerRef = useRef(null)
  const gameStatusRef = useRef('waiting') // Ref para acessar o estado atual no setInterval

  // Atualizar ref quando gameStatus muda
  useEffect(() => {
    gameStatusRef.current = gameStatus
  }, [gameStatus])

  // Limpar intervalos quando componente desmonta
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const startGame = () => {
    setGameStatus('playing')
    setScore(0)
    setHearts([])
    setTimeLeft(gameDuration)
    setStartTime(Date.now())
    
    // Limpar intervalos anteriores
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timerRef.current) clearTimeout(timerRef.current)

    // Aguardar um pouco para garantir que a área do jogo está renderizada
    setTimeout(() => {
      // Criar primeiro coração imediatamente
      createHeart()
      
      // Criar novos corações periodicamente
      intervalRef.current = setInterval(() => {
        createHeart()
      }, 800) // Novo coração a cada 800ms em média
    }, 100)

    // Timer do jogo
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const createHeart = () => {
    // Verificar se está a jogar usando ref para ter acesso ao estado atual
    if (gameStatusRef.current !== 'playing' || !gameAreaRef.current) {
      return
    }

    const gameArea = gameAreaRef.current
    const rect = gameArea.getBoundingClientRect()
    
    if (rect.width === 0 || rect.height === 0) {
      return
    }
    
    // Posição aleatória dentro da área do jogo (respeitando o tamanho do coração)
    const heartSize = 60
    const x = Math.random() * Math.max(0, rect.width - heartSize)
    const y = Math.random() * Math.max(0, rect.height - heartSize)
    
    // Velocidade de desaparecimento aleatória (rápido ou normal)
    const isFast = Math.random() < 0.4 // 40% dos corações são rápidos
    const duration = isFast ? 1000 + Math.random() * 1500 : 2000 + Math.random() * 2000 // 1-2.5s rápido, 2-4s normal
    
    const heartId = Date.now() + Math.random()
    
    const newHeart = {
      id: heartId,
      x,
      y,
      duration,
      createdAt: Date.now(),
      isFast,
    }
    
    setHearts(prev => [...prev, newHeart])
    
    // Remover coração após duração
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== heartId))
    }, duration)
  }

  const handleHeartClick = (heartId, isFast) => {
    if (gameStatus !== 'playing') return
    
    // Remover coração clicado
    setHearts(prev => prev.filter(h => h.id !== heartId))
    
    // Pontos baseados no tipo
    const points = isFast ? 2 : 1
    
    // Usar uma ref ou atualizar o score e verificar depois
    setScore(prev => {
      const newScore = prev + points
      
      // Verificar se ganhou - usar setTimeout para garantir que o state foi atualizado
      if (newScore >= targetHearts) {
        // Passar o score atualizado diretamente
        setTimeout(() => {
          endGame(true, newScore)
        }, 0)
      }
      
      return newScore
    })
  }

  const endGame = (won = false, finalScore = null) => {
    setGameStatus(won ? 'won' : 'lost')
    
    // Limpar intervalos
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    
    // Limpar todos os corações
    setHearts([])
    
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    
    // Usar o score passado ou o atual do state
    const finalScoreValue = finalScore !== null ? finalScore : score
    
    const elapsedTime = Math.round((Date.now() - (startTime || Date.now())) / 1000)
    
    // Registar tentativa - usar uma flag para evitar duplicações
    if (onGameAttempt && day) {
      // Usar um identificador único baseado em timestamp para evitar duplicações
      const attemptId = `catch-hearts-${day}-${Date.now()}`
      setTimeout(() => {
        onGameAttempt('catch-hearts', day, {
          won,
          attempts: newAttempts,
          errors: won ? 0 : 1,
          score: finalScoreValue,
          metadata: {
            timeSeconds: elapsedTime,
            targetHearts: targetHearts,
            heartsCaught: finalScoreValue,
            timeLeft: timeLeft,
          },
        })
      }, 0)
    }

    if (won) {
      if (onWin) {
        setTimeout(() => onWin(newAttempts), 500)
      }
      if (onComplete) {
        setTimeout(() => onComplete(newAttempts, true), 500)
      }
    } else {
      // Se perdeu e ainda tem tentativas, pode tentar novamente
      if (newAttempts < maxAttempts) {
        // Jogador pode tentar novamente
      } else {
        // Acabaram as tentativas
        if (onComplete) {
          setTimeout(() => onComplete(newAttempts, false), 500)
        }
      }
    }
  }

  const handleTryAgain = () => {
    if (attempts < maxAttempts) {
      setGameStatus('waiting')
      setHearts([])
      setScore(0)
      setTimeLeft(gameDuration)
    } else {
      // Acabaram as tentativas
      if (onComplete) {
        onComplete(attempts, false)
      }
    }
  }

  if (gameStatus === 'won') {
    return (
      <div className="catch-hearts-container">
        <div className="catch-hearts-result">
          <h2>🎉 Parabéns! Apanhaste {targetHearts} corações!</h2>
          <p>Pontuação final: {score} pontos</p>
          <p>Tempo restante: {timeLeft}s</p>
          <button onClick={handleTryAgain} className="catch-hearts-reset-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (gameStatus === 'lost' && attempts >= maxAttempts) {
    return (
      <div className="catch-hearts-container">
        <div className="catch-hearts-result">
          <h2>⏰ Fim do Jogo</h2>
          <p>Apanhaste {score} de {targetHearts} corações</p>
          <p>Usaste todas as {maxAttempts} tentativas</p>
          <button onClick={() => {
            if (onComplete) {
              onComplete(attempts, false)
            }
          }} className="catch-hearts-reset-button">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="catch-hearts-container">
      <div className="catch-hearts-header">
        <h2>❤️ Apanhar Corações</h2>
        <p className="catch-hearts-instruction">
          Clica nos corações antes que desapareçam! Alguns aparecem e desaparecem muito rápido!
        </p>
        <div className="catch-hearts-stats">
          <div className="stat-item">
            <span className="stat-label">Pontos:</span>
            <span className="stat-value">{score} / {targetHearts}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tempo:</span>
            <span className="stat-value">{timeLeft}s</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tentativa:</span>
            <span className="stat-value">{attempts + 1} / {maxAttempts}</span>
          </div>
        </div>
      </div>

      <div className="catch-hearts-game-area">
        {gameStatus === 'waiting' ? (
          <div className="catch-hearts-start-screen">
            <p>Objetivo: Apanha {targetHearts} corações em {gameDuration} segundos!</p>
            <p className="catch-hearts-hint">💡 Alguns corações desaparecem muito rápido!</p>
            <button onClick={startGame} className="catch-hearts-start-button">
              Iniciar Jogo
            </button>
          </div>
        ) : (
          <div
            ref={gameAreaRef}
            className="catch-hearts-play-area"
          >
            {hearts.map(heart => (
              <div
                key={heart.id}
                className={`catch-heart ${heart.isFast ? 'fast' : 'normal'}`}
                style={{
                  left: `${heart.x}px`,
                  top: `${heart.y}px`,
                }}
                onClick={() => handleHeartClick(heart.id, heart.isFast)}
              >
                ❤️
              </div>
            ))}
          </div>
        )}
      </div>

      {gameStatus === 'lost' && attempts < maxAttempts && (
        <div className="catch-hearts-retry">
          <p>Conseguiste {score} de {targetHearts} corações. Tenta novamente!</p>
          <button onClick={handleTryAgain} className="catch-hearts-try-again-button">
            Tentar Novamente ({attempts} / {maxAttempts})
          </button>
        </div>
      )}
    </div>
  )
}

export default CatchHearts
