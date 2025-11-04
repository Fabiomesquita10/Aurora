import React, { useState, useEffect, useRef } from 'react'
import './Simon.css'

function Simon({ 
  numberOfBalls = 4, 
  sequences = [], 
  day, 
  onWin, 
  onComplete, 
  onGameAttempt 
}) {
  const [gameStatus, setGameStatus] = useState('waiting') // waiting, showing, playing, won, lost
  const [currentSequence, setCurrentSequence] = useState(0)
  const [playerSequence, setPlayerSequence] = useState([])
  const [highlightedBall, setHighlightedBall] = useState(null)
  const [correctSequences, setCorrectSequences] = useState(0)
  const [reactionTimes, setReactionTimes] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [sequenceStartTime, setSequenceStartTime] = useState(null)
  const sequenceTimeoutRef = useRef(null)

  // Usar sequências fornecidas ou gerar sequências padrão
  const gameSequences = sequences.length > 0 ? sequences : Array.from({ length: 3 }, () => 
    Array.from({ length: 4 }, () => Math.floor(Math.random() * numberOfBalls))
  )

  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current)
      }
    }
  }, [])

  const startGame = () => {
    setGameStatus('showing')
    setCurrentSequence(0)
    setPlayerSequence([])
    setCorrectSequences(0)
    setReactionTimes([])
    setStartTime(Date.now())
    showSequence(0)
  }

  const showSequence = (sequenceIndex) => {
    if (sequenceIndex >= gameSequences.length) {
      // Todas as sequências foram mostradas
      setGameStatus('won')
      handleGameComplete(true)
      return
    }

    const sequence = gameSequences[sequenceIndex]
    let ballIndex = 0
    
    // Calcular velocidade baseada no nível (sequência atual)
    // Velocidade inicial: 500ms, reduz 50ms por nível (mínimo 200ms)
    const baseFlashTime = 500
    const flashTime = Math.max(200, baseFlashTime - (sequenceIndex * 50))
    
    // Pausa entre bolas também diminui (inicial: 300ms, reduz 30ms por nível, mínimo 100ms)
    const basePauseTime = 300
    const pauseTime = Math.max(100, basePauseTime - (sequenceIndex * 30))
    
    const showNextBall = () => {
      if (ballIndex < sequence.length) {
        const ball = sequence[ballIndex]
        setHighlightedBall(ball)
        
        // Desligar após tempo calculado (velocidade aumenta com o nível)
        sequenceTimeoutRef.current = setTimeout(() => {
          setHighlightedBall(null)
          ballIndex++
          
          // Pausa entre bolas (diminui com o nível)
          sequenceTimeoutRef.current = setTimeout(() => {
            showNextBall()
          }, pauseTime)
        }, flashTime)
      } else {
        // Sequência completa mostrada, agora o jogador pode jogar
        setSequenceStartTime(Date.now())
        setGameStatus('playing')
        setPlayerSequence([])
      }
    }
    
    showNextBall()
  }

  const handleBallClick = (ballIndex) => {
    if (gameStatus !== 'playing') return

    const reactionTime = Date.now() - sequenceStartTime
    setReactionTimes(prev => [...prev, reactionTime])

    const newPlayerSequence = [...playerSequence, ballIndex]
    setPlayerSequence(newPlayerSequence)

    const currentSeq = gameSequences[currentSequence]
    
    // Verificar se o clique está correto
    const expectedBall = currentSeq[newPlayerSequence.length - 1]
    if (ballIndex !== expectedBall) {
      // Erro - sequência errada
      setGameStatus('lost')
      handleGameComplete(false)
      return
    }

    // Verificar se completou a sequência
    if (newPlayerSequence.length === currentSeq.length) {
      // Sequência correta!
      setCorrectSequences(prev => prev + 1)
      
      // Avançar para próxima sequência
      setTimeout(() => {
        setCurrentSequence(prev => prev + 1)
        setGameStatus('showing')
        showSequence(currentSequence + 1)
      }, 500)
    }
  }

  const handleGameComplete = (won) => {
    const totalTime = Math.round((Date.now() - startTime) / 1000)
    const averageReactionTime = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0

    // Se ganhou, todas as sequências foram corretas
    const finalCorrectSequences = won ? gameSequences.length : correctSequences

    if (onGameAttempt && day) {
      onGameAttempt('simon', day, {
        won: won,
        attempts: 1,
        errors: won ? 0 : 1,
        score: won ? gameSequences.length : null,
        metadata: {
          timeSeconds: totalTime,
          correctSequences: finalCorrectSequences,
          totalSequences: gameSequences.length,
          averageReactionTime: averageReactionTime,
          numberOfBalls: numberOfBalls
        }
      }).catch(err => {
        console.warn('Erro ao registar tentativa:', err)
      })
    }

    if (won && onWin) {
      setTimeout(() => onWin(correctSequences), 500)
    }
    if (onComplete) {
      setTimeout(() => onComplete(correctSequences, won), 500)
    }
  }

  const resetGame = () => {
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current)
    }
    setGameStatus('waiting')
    setCurrentSequence(0)
    setPlayerSequence([])
    setCorrectSequences(0)
    setReactionTimes([])
    setHighlightedBall(null)
    setStartTime(null)
    setSequenceStartTime(null)
  }

  const getBallColor = (index) => {
    const colors = [
      '#e74c3c', // Vermelho
      '#3498db', // Azul
      '#f39c12', // Laranja
      '#2ecc71', // Verde
      '#9b59b6', // Roxo
      '#1abc9c', // Turquesa
      '#e67e22', // Laranja escuro
      '#34495e'  // Cinza escuro
    ]
    return colors[index % colors.length]
  }

  if (gameStatus === 'waiting') {
    return (
      <div className="simon-container">
        <div className="simon-start-screen">
          <h2>🎮 Simon - Memorizar Sequência</h2>
          <p className="simon-instruction">
            Memoriza a sequência de cores que pisca e repete-a na ordem correta!
          </p>
          <p className="simon-info">
            Bolas: <b>{numberOfBalls}</b> | Sequências: <b>{gameSequences.length}</b>
          </p>
          <button onClick={startGame} className="simon-start-button">
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
      <div className="simon-container">
        <div className="simon-result">
          <h2>🎉 Parabéns! Completaste todas as sequências!</h2>
          <p>Sequências acertadas: {gameSequences.length}/{gameSequences.length}</p>
          <p>Tempo total: {totalTime}s</p>
          <p>Tempo médio de reação: {averageReactionTime}ms</p>
          <button onClick={resetGame} className="simon-reset-button">
            Jogar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (gameStatus === 'lost') {
    const totalTime = Math.round((Date.now() - startTime) / 1000)

    return (
      <div className="simon-container">
        <div className="simon-result">
          <h2>❌ Erro na sequência!</h2>
          <p>Sequências acertadas: {correctSequences}/{gameSequences.length}</p>
          <p>Tempo: {totalTime}s</p>
          <button onClick={resetGame} className="simon-reset-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="simon-container">
      <div className="simon-header">
        <h2>🎮 Simon - Memorizar Sequência</h2>
        <div className="simon-stats">
          <span>Sequência: {currentSequence + 1}/{gameSequences.length}</span>
          {startTime && (
            <span>Tempo: {Math.round((Date.now() - startTime) / 1000)}s</span>
          )}
        </div>
      </div>

      {gameStatus === 'showing' && (
        <div className="simon-message">
          <p>🔍 Observa a sequência...</p>
          <p className="simon-level-info">
            Nível {currentSequence + 1} - Velocidade: {Math.max(200, 500 - (currentSequence * 50))}ms
          </p>
        </div>
      )}

      {gameStatus === 'playing' && (
        <div className="simon-message">
          <p>🎯 Repete a sequência!</p>
          <p className="simon-progress">
            {playerSequence.length}/{gameSequences[currentSequence]?.length || 0}
          </p>
        </div>
      )}

      <div className="simon-board">
        {Array.from({ length: numberOfBalls }).map((_, index) => {
          const isHighlighted = highlightedBall === index
          const ballColor = getBallColor(index)
          
          return (
            <button
              key={index}
              className={`simon-ball ${isHighlighted ? 'highlighted' : ''} ${gameStatus === 'playing' ? 'clickable' : ''}`}
              style={{
                backgroundColor: isHighlighted ? ballColor : `${ballColor}80`,
                boxShadow: isHighlighted ? `0 0 30px ${ballColor}` : 'none'
              }}
              onClick={() => handleBallClick(index)}
              disabled={gameStatus !== 'playing'}
            >
              {index + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Simon

