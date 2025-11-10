import React, { useState, useEffect } from 'react'
import './BoxChoice.css'

function BoxChoice({ boxes, hint, day, onWin, onComplete, onGameAttempt }) {
  const [chosenBox, setChosenBox] = useState(null) // Índice da caixa escolhida
  const [allBoxesOpened, setAllBoxesOpened] = useState(false) // Se todas as caixas já foram abertas
  const [gameStatus, setGameStatus] = useState('choosing') // choosing, showing, completed
  const [startTime] = useState(Date.now())
  const [selectedPrize, setSelectedPrize] = useState(null) // Prémio da caixa escolhida
  const [countdown, setCountdown] = useState(5) // Contagem regressiva de 5 segundos

  // Caixas padrão se não fornecidas
  const defaultBoxes = [
    { id: 'box1', label: 'Caixa 1', prize: '10' },
    { id: 'box2', label: 'Caixa 2', prize: '20' },
    { id: 'box3', label: 'Caixa 3', prize: '30' }
  ]

  const gameBoxes = boxes || defaultBoxes

  // Quando uma caixa é escolhida, abrir todas as outras automaticamente
  useEffect(() => {
    if (chosenBox !== null && !allBoxesOpened) {
      // Abrir todas as caixas (a escolhida a verde, as outras a vermelho)
      setAllBoxesOpened(true)
      setGameStatus('showing')
      
      // Guardar o prémio escolhido
      setSelectedPrize(gameBoxes[chosenBox].prize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenBox, allBoxesOpened])

  // Contagem regressiva de 5 segundos
  useEffect(() => {
    if (gameStatus === 'showing' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (gameStatus === 'showing' && countdown === 0) {
      // Após 5 segundos, mostrar mensagem final
      setGameStatus('completed')
      
      const elapsedTime = Math.round((Date.now() - startTime) / 1000)
      
      // Registar tentativa
      if (onGameAttempt && day) {
        onGameAttempt('box-choice', day, {
          won: true,
          attempts: 1,
          errors: 0,
          metadata: {
            timeSeconds: elapsedTime,
            selectedBoxIndex: chosenBox,
            selectedPrize: gameBoxes[chosenBox].prize,
            allPrizes: gameBoxes.map((box, idx) => ({
              boxIndex: idx,
              boxLabel: box.label,
              prize: box.prize
            }))
          }
        })
      }
      
      // Aguardar mais tempo antes de fechar (dar tempo para ler a mensagem)
      if (onWin) {
        setTimeout(() => onWin(1), 8000) // 8 segundos após mostrar a mensagem final
      }
      if (onComplete) {
        setTimeout(() => onComplete(1, true), 8000) // 8 segundos após mostrar a mensagem final
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus, countdown])

  const handleBoxClick = (index) => {
    // Se já escolheu uma caixa, não pode escolher outra
    if (chosenBox !== null || gameStatus !== 'choosing') return

    // Escolher esta caixa
    setChosenBox(index)
  }

  if (gameStatus === 'completed') {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000)
    const minutes = Math.floor(elapsedTime / 60)
    const seconds = elapsedTime % 60
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
    const chosenBoxData = gameBoxes[chosenBox]
    
    return (
      <div className="box-choice-container">
        <div className="box-choice-result">
          <h2>🎉 Parabéns!</h2>
          <p className="result-text">Escolheste a {chosenBoxData.label || `Caixa ${chosenBox + 1}`}!</p>
          
          <div className="selected-prize-section">
            <p className="selected-prize-label">O teu prémio:</p>
            <p className="selected-prize-value">{selectedPrize} voltas nos karts 🏎️</p>
          </div>

          <div className="all-prizes-summary">
            <p className="summary-title">O que cada caixa continha:</p>
            {gameBoxes.map((box, index) => {
              const isChosen = index === chosenBox
              return (
                <div key={box.id} className={`prize-item ${isChosen ? 'chosen-prize' : 'other-prize'}`}>
                  <div className="prize-box-label">{box.label || `Caixa ${index + 1}`}</div>
                  <div className="prize-box-value">
                    <span className="prize-icon-small">🎁</span>
                    <span className="prize-amount">{box.prize} voltas</span>
                    {isChosen && <span className="chosen-badge">✓ Escolhida</span>}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="result-stats">
            <p>Tempo: {timeDisplay}</p>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="box-choice-container">
      <div className="box-choice-header">
        <h2>📦 Escolhe uma Caixa</h2>
        {hint && (
          <div className="box-choice-hint">
            <p>💡 Dica: {hint}</p>
          </div>
        )}
        <p className="box-choice-subtitle">Escolhe uma caixa! Cada uma tem um prémio diferente.</p>
      </div>

      <div className="boxes-grid">
        {gameBoxes.map((box, index) => {
          const isChosen = chosenBox === index
          const isOpened = allBoxesOpened
          const isCorrect = isChosen && isOpened
          const isWrong = !isChosen && isOpened
          
          return (
            <div
              key={box.id}
              className={`box-item ${isChosen && !isOpened ? 'selected' : ''} ${isOpened ? 'opened' : ''} ${isCorrect ? 'correct-box' : ''} ${isWrong ? 'wrong-box' : ''}`}
              onClick={() => handleBoxClick(index)}
              style={{ pointerEvents: allBoxesOpened ? 'none' : 'auto' }}
            >
              <div className="box-lid">
                {isOpened ? (
                  <div className="box-content">
                    <div className="prize-icon">🎁</div>
                    <p className="prize-text">{box.prize} voltas</p>
                    {isCorrect && <p className="correct-badge">✓ Escolhida</p>}
                    {isWrong && <p className="wrong-badge">✗</p>}
                  </div>
                ) : (
                  <div className="box-label">{box.label || `Caixa ${index + 1}`}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {chosenBox !== null && gameStatus === 'showing' && (
        <div className="box-message">
          <div className="countdown-container">
            <p className="countdown-text">A mostrar resultado em...</p>
            <div className="countdown-number">{countdown}</div>
          </div>
        </div>
      )}

      {chosenBox === null && (
        <div className="box-stats">
          <p>Escolhe uma caixa!</p>
        </div>
      )}
    </div>
  )
}

export default BoxChoice

