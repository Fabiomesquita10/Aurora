import React, { useState, useEffect } from 'react'
import './PatternRecognition.css'

function PatternRecognition({ patterns, day, onWin, onComplete, onGameAttempt }) {
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [startTime] = useState(Date.now())
  const [hasAnswered, setHasAnswered] = useState(false)
  const [patternErrors, setPatternErrors] = useState({}) // Erros por padrão: { patternId: count }

  const defaultPatterns = [
    {
      id: 'pattern1',
      sequence: ['🔴', '🔵', '🔴', '🔵', '?'],
      options: ['🔴', '🔵', '🟢'],
      correct: 0,
      hint: 'Alterna entre vermelho e azul'
    },
    {
      id: 'pattern2',
      sequence: ['⭐', '⭐', '❤️', '⭐', '⭐', '?'],
      options: ['⭐', '❤️', '🎁'],
      correct: 1,
      hint: 'Dois estrelas, um coração'
    },
    {
      id: 'pattern3',
      sequence: ['⬆️', '➡️', '⬇️', '⬅️', '?'],
      options: ['⬆️', '➡️', '⬇️'],
      correct: 0,
      hint: 'Roda no sentido dos ponteiros do relógio'
    }
  ]

  const gamePatterns = patterns || defaultPatterns
  const currentPattern = gamePatterns[currentPatternIndex]

  useEffect(() => {
    setSelectedAnswer(null)
    setHasAnswered(false)
  }, [currentPatternIndex])

  const handleAnswerSelect = (answerIndex) => {
    if (hasAnswered) return

    setSelectedAnswer(answerIndex)
    setHasAnswered(true)
    setAttempts(attempts + 1)

    const isCorrect = answerIndex === currentPattern.correct
    const isLastPattern = currentPatternIndex >= gamePatterns.length - 1
    
    if (isCorrect) {
      setScore(score + 1)
    } else {
      // Incrementar contador de erros para este padrão (só se não for o último)
      if (!isLastPattern) {
        const currentErrors = patternErrors[currentPattern.id] || 0
        setPatternErrors({
          ...patternErrors,
          [currentPattern.id]: currentErrors + 1
        })
      }
    }

    // Aguardar antes de passar para o próximo padrão
    setTimeout(() => {
      if (currentPatternIndex < gamePatterns.length - 1) {
        setCurrentPatternIndex(currentPatternIndex + 1)
      } else {
        // Último padrão - finalizar
        // Contar todos os erros: erros anteriores + erro atual (se houver)
        const previousErrors = Object.values(patternErrors).reduce((sum, count) => sum + count, 0)
        const totalErrors = previousErrors + (isCorrect ? 0 : 1)
        
        if (onGameAttempt && day) {
          onGameAttempt('pattern-recognition', day, {
            won: true,
            attempts: attempts + 1,
            errors: totalErrors,
            metadata: {
              correctAnswers: score + (isCorrect ? 1 : 0),
              totalErrors: totalErrors,
              totalPatterns: gamePatterns.length
            }
          })
        }

        if (onWin) {
          setTimeout(() => onWin(gamePatterns.length), 500)
        }
        if (onComplete) {
          setTimeout(() => onComplete(gamePatterns.length, true), 500)
        }
      }
    }, 2000)
  }

  if (currentPatternIndex >= gamePatterns.length) {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000)
    const minutes = Math.floor(elapsedTime / 60)
    const seconds = elapsedTime % 60
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
    const percentage = Math.round((score / gamePatterns.length) * 100)

    return (
      <div className="pattern-recognition-container">
        <div className="pattern-recognition-result">
          <h2>🎉 Padrões Completos!</h2>
          <div className="result-score">
            <p className="score-label">Pontuação:</p>
            <p className="score-value">{score}/{gamePatterns.length}</p>
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

  const isCorrect = selectedAnswer === currentPattern.correct
  const showResult = hasAnswered

  return (
    <div className="pattern-recognition-container">
      <div className="pattern-recognition-header">
        <h2>🔍 Reconhecimento de Padrões</h2>
        <p>Padrão {currentPatternIndex + 1} de {gamePatterns.length}</p>
        <div className="pattern-progress">
          {gamePatterns.map((_, index) => (
            <span
              key={index}
              className={`progress-dot ${index === currentPatternIndex ? 'active' : ''} ${index < currentPatternIndex ? 'completed' : ''}`}
            ></span>
          ))}
        </div>
      </div>

      <div className="pattern-content">
        <div className="pattern-display">
          {currentPattern.sequence.map((item, index) => (
            <span key={index} className={`pattern-item ${item === '?' ? 'question-mark' : ''}`}>
              {item}
            </span>
          ))}
        </div>

        {currentPattern.hint && (patternErrors[currentPattern.id] || 0) >= 2 && (
          <p className="pattern-hint">💡 {currentPattern.hint}</p>
        )}

        <div className="pattern-options">
          <p className="options-question">Qual é o próximo elemento?</p>
          <div className="options-grid">
            {currentPattern.options.map((option, index) => {
              let optionClass = 'option-button'
              if (showResult) {
                if (index === currentPattern.correct) {
                  optionClass += ' correct'
                } else if (index === selectedAnswer && index !== currentPattern.correct) {
                  optionClass += ' wrong'
                }
              } else if (selectedAnswer === index) {
                optionClass += ' selected'
              }

              return (
                <button
                  key={index}
                  className={optionClass}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={hasAnswered}
                >
                  <span className="option-emoji">{option}</span>
                  {showResult && index === currentPattern.correct && (
                    <span className="result-icon">✓</span>
                  )}
                  {showResult && index === selectedAnswer && index !== currentPattern.correct && (
                    <span className="result-icon">✗</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {showResult && (
          <div className={`pattern-feedback ${isCorrect ? 'correct-feedback' : 'wrong-feedback'}`}>
            {isCorrect ? (
              <p>🎉 Correto! Muito bem!</p>
            ) : (
              <p>❌ Errado! A resposta correta era: <strong>{currentPattern.options[currentPattern.correct]}</strong></p>
            )}
          </div>
        )}

        <div className="pattern-stats">
          <p>Pontuação: {score}/{currentPatternIndex + 1}</p>
        </div>
      </div>
    </div>
  )
}

export default PatternRecognition

