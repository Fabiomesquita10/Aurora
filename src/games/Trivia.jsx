import React, { useState } from 'react'
import './Trivia.css'

function Trivia({ questions, day, onWin, onComplete, onGameAttempt }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [gameStatus, setGameStatus] = useState('playing') // playing, won, lost
  const [score, setScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState([])
  const [errors, setErrors] = useState(0)

  // Se não houver perguntas, usar perguntas padrão
  const defaultQuestions = [
    {
      id: 1,
      question: "Isto ou Aquilo?",
      option1: { text: "Praia", correct: true },
      option2: { text: "Montanha", correct: false }
    },
    {
      id: 2,
      question: "Isto ou Aquilo?",
      option1: { text: "Verão", correct: false },
      option2: { text: "Inverno", correct: true }
    },
    {
      id: 3,
      question: "Isto ou Aquilo?",
      option1: { text: "Pizza", correct: true },
      option2: { text: "Hambúrguer", correct: false }
    },
    {
      id: 4,
      question: "Isto ou Aquilo?",
      option1: { text: "Filme", correct: false },
      option2: { text: "Série", correct: true }
    },
    {
      id: 5,
      question: "Isto ou Aquilo?",
      option1: { text: "Manhã", correct: true },
      option2: { text: "Noite", correct: false }
    }
  ]

  const triviaQuestions = questions || defaultQuestions
  const currentQuestion = triviaQuestions[currentQuestionIndex]
  const totalQuestions = triviaQuestions.length

  const handleAnswerSelect = (optionKey) => {
    if (gameStatus !== 'playing') return
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionKey
    }))
  }

  const handleNext = () => {
    const selectedOption = selectedAnswers[currentQuestionIndex]
    const isCorrect = currentQuestion[selectedOption]?.correct || false
    
    // Registar resposta
    setAnsweredQuestions(prev => [...prev, {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedOption: selectedOption || null,
      option1Text: currentQuestion.option1?.text,
      option2Text: currentQuestion.option2?.text,
      correct: isCorrect,
    }])
    
    if (!isCorrect) {
      setErrors(prev => prev + 1)
    }
    
    setScore(prev => {
      const newScore = isCorrect ? prev + 1 : prev
      
      if (currentQuestionIndex < totalQuestions - 1) {
        // Ainda há mais perguntas
        return newScore
      } else {
        // Fim do quiz
        setGameStatus('won')
        
        // Registar tentativa completa no sistema
        setTimeout(() => {
          if (onGameAttempt && day) {
            const finalAnsweredQuestions = [...answeredQuestions, {
              questionId: currentQuestion.id,
              question: currentQuestion.question,
              selectedOption: selectedOption || null,
              option1Text: currentQuestion.option1?.text,
              option2Text: currentQuestion.option2?.text,
              correct: isCorrect,
            }]
            
            onGameAttempt('trivia', day, {
              won: true,
              attempts: totalQuestions,
              errors: totalQuestions - newScore,
              score: newScore,
              answeredQuestions: finalAnsweredQuestions,
            })
          }
        }, 0)
        
        if (onWin) {
          setTimeout(() => onWin(totalQuestions - newScore), 500)
        }
        if (onComplete) {
          setTimeout(() => onComplete(totalQuestions - newScore, newScore === totalQuestions), 500)
        }
        
        return newScore
      }
    })

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handleSubmit = () => {
    if (!selectedAnswers[currentQuestionIndex]) {
      alert('Por favor, escolhe uma opção!')
      return
    }
    handleNext()
  }

  const getSelectedAnswer = () => {
    return selectedAnswers[currentQuestionIndex]
  }

  const resetGame = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setGameStatus('playing')
    setScore(0)
    setAnsweredQuestions([])
    setErrors(0)
  }

  if (!currentQuestion) {
    return (
      <div className="trivia-container">
        <div className="trivia-error">
          <p>Erro: Nenhuma pergunta encontrada!</p>
        </div>
      </div>
    )
  }

  if (gameStatus === 'won') {
    const percentage = Math.round((score / totalQuestions) * 100)
    return (
      <div className="trivia-container">
        <div className="trivia-result">
          <h2>🎉 Trivia Completo!</h2>
          <div className="trivia-score">
            <p className="score-text">Acertaste {score} de {totalQuestions} escolhas</p>
            <div className="score-percentage">{percentage}%</div>
          </div>
          {percentage === 100 && (
            <p className="perfect-score">Perfeito! As vossas escolhas são perfeitas! 💕</p>
          )}
          {percentage >= 80 && percentage < 100 && (
            <p className="good-score">Excelente! Estão muito alinhados! 😊</p>
          )}
          {percentage < 80 && (
            <p className="ok-score">Bom trabalho! Há sempre espaço para mais descobertas! 💪</p>
          )}
          <button onClick={resetGame} className="trivia-reset-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  const isOption1Selected = getSelectedAnswer() === 'option1'
  const isOption2Selected = getSelectedAnswer() === 'option2'

  return (
    <div className="trivia-container">
      <div className="trivia-header">
        <h2>🤔 Isto ou Aquilo?</h2>
        <p className="trivia-subtitle">Escolha {currentQuestionIndex + 1} de {totalQuestions}</p>
        <div className="trivia-progress">
          <div 
            className="trivia-progress-bar" 
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="trivia-question-area">
        <h3 className="trivia-question">
          {currentQuestion.question || "Qual preferes?"}
        </h3>
        
        <div className="trivia-options">
          <button
            className={`trivia-option trivia-option-1 ${isOption1Selected ? 'selected' : ''}`}
            onClick={() => handleAnswerSelect('option1')}
          >
            <div className="option-content">
              <span className="option-label">ISTO</span>
              <span className="option-text">{currentQuestion.option1?.text || "Opção 1"}</span>
            </div>
          </button>

          <div className="trivia-divider">
            <span>OU</span>
          </div>

          <button
            className={`trivia-option trivia-option-2 ${isOption2Selected ? 'selected' : ''}`}
            onClick={() => handleAnswerSelect('option2')}
          >
            <div className="option-content">
              <span className="option-label">AQUILO</span>
              <span className="option-text">{currentQuestion.option2?.text || "Opção 2"}</span>
            </div>
          </button>
        </div>

        <button
          className="trivia-submit-button"
          onClick={handleSubmit}
          disabled={!getSelectedAnswer()}
        >
          {currentQuestionIndex < totalQuestions - 1 ? 'Próxima Escolha' : 'Finalizar'}
        </button>
      </div>
    </div>
  )
}

export default Trivia
