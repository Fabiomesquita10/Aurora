import React, { useState } from 'react'
import './MiniRiddles.css'

function MiniRiddles({ riddles, day, onWin, onComplete, onGameAttempt }) {
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [gameStatus, setGameStatus] = useState('playing') // playing, won, lost
  const [score, setScore] = useState(0)
  const [showHints, setShowHints] = useState({})
  const [attempts, setAttempts] = useState({}) // Tentativas por riddle
  const [errors, setErrors] = useState(0)
  const [startTime] = useState(Date.now())

  // Se não houver riddles, usar riddles padrão
  const defaultRiddles = [
    {
      id: 1,
      question: "Tenho chaves mas não abro portas. Tenho espaço mas não tenho quartos. O que sou?",
      answer: "teclado",
      hint: "Usas-me para escrever",
      category: "Tecnologia"
    },
    {
      id: 2,
      question: "Sou alto quando novo e baixo quando velho. O que sou?",
      answer: "vela",
      hint: "Aceso-me para ver no escuro",
      category: "Objeto"
    },
    {
      id: 3,
      question: "Tenho cidades, mas não tenho casas. Tenho montanhas, mas não tenho árvores. Tenho água, mas não tenho peixes. O que sou?",
      answer: "mapa",
      hint: "Guia-te pelo mundo",
      category: "Geografia"
    }
  ]

  const riddlesList = riddles || defaultRiddles
  const currentRiddle = riddlesList[currentRiddleIndex]
  const totalRiddles = riddlesList.length

  const handleAnswerSubmit = () => {
    const userAnswer = userAnswers[currentRiddleIndex]?.toLowerCase().trim() || ''
    const correctAnswer = currentRiddle.answer.toLowerCase().trim()
    
    // Incrementar tentativas para este riddle
    setAttempts(prev => ({
      ...prev,
      [currentRiddleIndex]: (prev[currentRiddleIndex] || 0) + 1
    }))
    
    // Normalizar respostas (remover acentos)
    const normalize = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const normalizedUser = normalize(userAnswer)
    const normalizedCorrect = normalize(correctAnswer)

    if (normalizedUser === normalizedCorrect) {
      setScore(prev => prev + 1)
      
      if (currentRiddleIndex < totalRiddles - 1) {
        setCurrentRiddleIndex(prev => prev + 1)
        setUserAnswers(prev => ({ ...prev, [currentRiddleIndex]: userAnswer }))
      } else {
        // Fim dos riddles
        setGameStatus('won')
        
        // Calcular tentativas e erros totais
        const totalAttempts = Object.values(attempts).reduce((sum, count) => sum + count, 0) + 1
        const totalErrors = totalAttempts - totalRiddles
        const elapsedTime = Math.round((Date.now() - startTime) / 1000) // Tempo em segundos
        
        // Registar tentativa completa no sistema
        setTimeout(() => {
          if (onGameAttempt && day) {
            const riddlesData = riddlesList.map((riddle, idx) => ({
              riddleId: riddle.id,
              question: riddle.question,
              answer: riddle.answer,
              attempts: attempts[idx] || 1,
              correct: true, // Se chegou aqui, acertou
              usedHint: showHints[idx] || false,
            }))
            
            onGameAttempt('riddles', day, {
              won: true,
              attempts: totalAttempts,
              errors: totalErrors,
              score: score + 1,
              answeredQuestions: riddlesData,
              metadata: {
                timeSeconds: elapsedTime,
              },
            })
          }
        }, 0)
        
        if (onWin) {
          setTimeout(() => onWin(totalRiddles - score - 1), 500)
        }
        if (onComplete) {
          setTimeout(() => onComplete(totalRiddles - score - 1, score + 1 === totalRiddles), 500)
        }
      }
    } else {
      setErrors(prev => prev + 1)
      alert('Resposta errada! Tenta novamente. 💭')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAnswerSubmit()
    }
  }

  const toggleHint = (riddleIndex) => {
    setShowHints(prev => ({
      ...prev,
      [riddleIndex]: !prev[riddleIndex]
    }))
  }

  const resetGame = () => {
    setCurrentRiddleIndex(0)
    setUserAnswers({})
    setGameStatus('playing')
    setScore(0)
    setShowHints({})
    setAttempts({})
    setErrors(0)
    // startTime será resetado quando componente recriar
  }

  if (!currentRiddle) {
    return (
      <div className="riddles-container">
        <div className="riddles-error">
          <p>Erro: Nenhum enigma encontrado!</p>
        </div>
      </div>
    )
  }

  if (gameStatus === 'won') {
    const percentage = Math.round((score / totalRiddles) * 100)
    return (
      <div className="riddles-container">
        <div className="riddles-result">
          <h2>🎉 Todos os Enigmas Resolvidos!</h2>
          <div className="riddles-score">
            <p className="score-text">Resolveste {score} de {totalRiddles} enigmas</p>
            <div className="score-percentage">{percentage}%</div>
          </div>
          {percentage === 100 && (
            <p className="perfect-score">Perfeito! És um mestre dos enigmas! 🧠✨</p>
          )}
          {percentage >= 66 && percentage < 100 && (
            <p className="good-score">Excelente trabalho! És muito perspicaz! 😊</p>
          )}
          {percentage < 66 && (
            <p className="ok-score">Bom esforço! Continua a pensar! 💭</p>
          )}
          <button onClick={resetGame} className="riddles-reset-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="riddles-container">
      <div className="riddles-header">
        <h2>🧩 Mini Riddles</h2>
        <p className="riddles-subtitle">Enigma {currentRiddleIndex + 1} de {totalRiddles}</p>
        {currentRiddle.category && (
          <p className="riddles-category">Categoria: {currentRiddle.category}</p>
        )}
        <div className="riddles-progress">
          <div 
            className="riddles-progress-bar" 
            style={{ width: `${((currentRiddleIndex + 1) / totalRiddles) * 100}%` }}
          />
        </div>
      </div>

      <div className="riddles-question-area">
        <div className="riddles-question-box">
          <h3 className="riddles-question">{currentRiddle.question}</h3>
        </div>

        {showHints[currentRiddleIndex] && currentRiddle.hint && (
          <div className="riddles-hint-box">
            <span className="hint-label">💡 Dica:</span>
            <span className="hint-text">{currentRiddle.hint}</span>
          </div>
        )}

        <div className="riddles-input-area">
          <label htmlFor="riddle-answer">A tua resposta:</label>
          <input
            id="riddle-answer"
            type="text"
            className="riddles-input"
            value={userAnswers[currentRiddleIndex] || ''}
            onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentRiddleIndex]: e.target.value }))}
            onKeyPress={handleKeyPress}
            placeholder="Escreve a tua resposta..."
            autoFocus
          />
        </div>

        <div className="riddles-actions">
          {currentRiddle.hint && (
            <button
              className="riddles-hint-button"
              onClick={() => toggleHint(currentRiddleIndex)}
            >
              {showHints[currentRiddleIndex] ? '🔒 Ocultar Dica' : '💡 Mostrar Dica'}
            </button>
          )}
          <button
            className="riddles-submit-button"
            onClick={handleAnswerSubmit}
            disabled={!userAnswers[currentRiddleIndex]?.trim()}
          >
            {currentRiddleIndex < totalRiddles - 1 ? 'Submeter Resposta' : 'Finalizar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MiniRiddles
