import React, { useState, useEffect, useRef } from 'react'
import './NumberSequence.css'

function NumberSequence({ sequences, day, onWin, onComplete, onGameAttempt }) {
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [startTime] = useState(Date.now())
  const [errorMessage, setErrorMessage] = useState('')
  const inputRef = useRef(null)

  const defaultSequences = [
    {
      id: 'seq1',
      sequence: [2, 4, 6, 8, '?'],
      answer: 10,
      hint: 'Soma 2 a cada número'
    },
    {
      id: 'seq2',
      sequence: [1, 3, 5, 7, '?'],
      answer: 9,
      hint: 'Números ímpares'
    },
    {
      id: 'seq3',
      sequence: [5, 10, 15, 20, '?'],
      answer: 25,
      hint: 'Multiplica por 5'
    }
  ]

  const gameSequences = sequences || defaultSequences
  const currentSequence = gameSequences[currentSequenceIndex]

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentSequenceIndex])

  const checkAnswer = () => {
    const answer = parseInt(userAnswer.trim())
    
    if (isNaN(answer)) {
      setErrorMessage('Por favor, escreve um número!')
      return
    }

    setAttempts(attempts + 1)
    setErrorMessage('')

    if (answer === currentSequence.answer) {
      // Resposta correta!
      setScore(score + 1)
      
      if (currentSequenceIndex < gameSequences.length - 1) {
        // Próxima sequência
        setUserAnswer('')
        setCurrentSequenceIndex(currentSequenceIndex + 1)
      } else {
        // Última sequência - finalizar
        const elapsedTime = Math.round((Date.now() - startTime) / 1000)
        
        if (onGameAttempt && day) {
          onGameAttempt('number-sequence', day, {
            won: true,
            attempts: attempts + 1,
            errors: attempts + 1 - gameSequences.length,
            metadata: {
              correctAnswers: score + 1,
              totalSequences: gameSequences.length
            }
          })
        }

        if (onWin) {
          setTimeout(() => onWin(gameSequences.length), 500)
        }
        if (onComplete) {
          setTimeout(() => onComplete(gameSequences.length, true), 500)
        }
      }
    } else {
      // Resposta incorreta
      setErrorMessage(`❌ Errado! Tenta novamente. 💡 Dica: ${currentSequence.hint || 'Pensa no padrão...'}`)
      setUserAnswer('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer()
    }
  }

  if (currentSequenceIndex >= gameSequences.length) {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000)
    const minutes = Math.floor(elapsedTime / 60)
    const seconds = elapsedTime % 60
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
    const percentage = Math.round((score / gameSequences.length) * 100)

    return (
      <div className="number-sequence-container">
        <div className="number-sequence-result">
          <h2>🎉 Sequências Completas!</h2>
          <div className="result-score">
            <p className="score-label">Pontuação:</p>
            <p className="score-value">{score}/{gameSequences.length}</p>
            <p className="score-percentage">{percentage}%</p>
          </div>
          <div className="result-stats">
            <p>Tempo: {timeDisplay}</p>
            <p>Tentativas: {attempts}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="number-sequence-container">
      <div className="number-sequence-header">
        <h2>🔢 Sequência Numérica</h2>
        <p>Sequência {currentSequenceIndex + 1} de {gameSequences.length}</p>
        <div className="sequence-progress">
          {gameSequences.map((_, index) => (
            <span
              key={index}
              className={`progress-dot ${index === currentSequenceIndex ? 'active' : ''} ${index < currentSequenceIndex ? 'completed' : ''}`}
            ></span>
          ))}
        </div>
      </div>

      <div className="sequence-content">
        <div className="sequence-display">
          {currentSequence.sequence.map((num, index) => (
            <span key={index} className={`sequence-number ${num === '?' ? 'question-mark' : ''}`}>
              {num}
            </span>
          ))}
        </div>

        {currentSequence.hint && (
          <p className="sequence-hint">💡 {currentSequence.hint}</p>
        )}

        <div className="sequence-answer">
          <p className="answer-question">Qual é o número que falta?</p>
          <input
            ref={inputRef}
            type="number"
            className="answer-input"
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value)
              setErrorMessage('')
            }}
            onKeyPress={handleKeyPress}
            placeholder="Escreve o número..."
          />
          {errorMessage && (
            <p className="answer-error">{errorMessage}</p>
          )}
          <button className="answer-submit" onClick={checkAnswer}>
            ✅ Confirmar
          </button>
        </div>

        <div className="sequence-stats">
          <p>Pontuação: {score}/{currentSequenceIndex + 1}</p>
        </div>
      </div>
    </div>
  )
}

export default NumberSequence

