import React, { useState } from 'react'
import './Quiz.css'

function Quiz({ questions, day, onWin, onComplete, onGameAttempt }) {
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
      question: "Qual foi o nosso primeiro encontro?",
      options: [
        { id: 'a', text: "Noite fora", correct: true },
        { id: 'b', text: "Cinema", correct: false },
        { id: 'c', text: "Praia", correct: false },
        { id: 'd', text: "Jantar romântico", correct: false }
      ]
    },
    {
      id: 2,
      question: "Qual é a nossa cor favorita?",
      options: [
        { id: 'a', text: "Vermelho", correct: false },
        { id: 'b', text: "Azul", correct: true },
        { id: 'c', text: "Verde", correct: false },
        { id: 'd', text: "Rosa", correct: false }
      ]
    },
    {
      id: 3,
      question: "Onde nos conhecemos?",
      options: [
        { id: 'a', text: "Na praia", correct: false },
        { id: 'b', text: "Num evento", correct: true },
        { id: 'c', text: "Online", correct: false },
        { id: 'd', text: "No trabalho", correct: false }
      ]
    },
    {
      id: 4,
      question: "Qual é o nosso programa favorito para fazer juntos?",
      options: [
        { id: 'a', text: "Ver filmes", correct: true },
        { id: 'b', text: "Ir à praia", correct: false },
        { id: 'c', text: "Fazer desporto", correct: false },
        { id: 'd', text: "Cozinhar", correct: false }
      ]
    },
    {
      id: 5,
      question: "Qual é a nossa comida favorita?",
      options: [
        { id: 'a', text: "Pizza", correct: false },
        { id: 'b', text: "Sushi", correct: false },
        { id: 'c', text: "Hambúrguer", correct: false },
        { id: 'd', text: "A que fazemos juntos", correct: true }
      ]
    }
  ]

  const quizQuestions = questions || defaultQuestions
  const currentQuestion = quizQuestions[currentQuestionIndex]
  const totalQuestions = quizQuestions.length

  const handleAnswerSelect = (optionId) => {
    if (gameStatus !== 'playing') return
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionId
    }))
  }

  const handleNext = () => {
    const selectedOption = currentQuestion.options.find(
      opt => opt.id === selectedAnswers[currentQuestionIndex]
    )
    
    const isCorrect = selectedOption && selectedOption.correct
    
    // Registar resposta
    setAnsweredQuestions(prev => [...prev, {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedAnswer: selectedOption?.id || null,
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
        
        // Registar tentativa completa no sistema (usar função para garantir valores atualizados)
        setTimeout(() => {
          if (onGameAttempt && day) {
            const finalAnsweredQuestions = [...answeredQuestions, {
              questionId: currentQuestion.id,
              question: currentQuestion.question,
              selectedAnswer: selectedOption?.id || null,
              correct: isCorrect,
            }]
            
            onGameAttempt('quiz', day, {
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
      alert('Por favor, escolhe uma resposta!')
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
      <div className="quiz-container">
        <div className="quiz-error">
          <p>Erro: Nenhuma pergunta encontrada!</p>
        </div>
      </div>
    )
  }

  if (gameStatus === 'won') {
    const percentage = Math.round((score / totalQuestions) * 100)
    return (
      <div className="quiz-container">
        <div className="quiz-result">
          <h2>🎉 Quiz Completo!</h2>
          <div className="quiz-score">
            <p className="score-text">Acertaste {score} de {totalQuestions} perguntas</p>
            <div className="score-percentage">{percentage}%</div>
          </div>
          {percentage === 100 && (
            <p className="perfect-score">Perfeito! Conheces mesmo bem o nosso relacionamento! 💕</p>
          )}
          {percentage >= 80 && percentage < 100 && (
            <p className="good-score">Excelente! Conheces muito bem o nosso relacionamento! 😊</p>
          )}
          {percentage < 80 && (
            <p className="ok-score">Bom trabalho! Há sempre mais para descobrir! 💪</p>
          )}
          <button onClick={resetGame} className="quiz-reset-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>📝 Quiz de Relacionamento</h2>
        <p className="quiz-subtitle">Pergunta {currentQuestionIndex + 1} de {totalQuestions}</p>
        <div className="quiz-progress">
          <div 
            className="quiz-progress-bar" 
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="quiz-question-area">
        <h3 className="quiz-question">{currentQuestion.question}</h3>
        
        <div className="quiz-options">
          {currentQuestion.options.map((option) => {
            const isSelected = getSelectedAnswer() === option.id
            return (
              <button
                key={option.id}
                className={`quiz-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(option.id)}
              >
                <span className="option-id">{option.id.toUpperCase()}</span>
                <span className="option-text">{option.text}</span>
              </button>
            )
          })}
        </div>

        <button
          className="quiz-submit-button"
          onClick={handleSubmit}
          disabled={!getSelectedAnswer()}
        >
          {currentQuestionIndex < totalQuestions - 1 ? 'Próxima Pergunta' : 'Finalizar Quiz'}
        </button>
      </div>
    </div>
  )
}

export default Quiz
