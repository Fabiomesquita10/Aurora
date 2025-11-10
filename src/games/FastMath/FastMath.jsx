import React, { useState, useEffect, useRef } from 'react'
import './FastMath.css'

function FastMath({ questions, timeLimit, day, onWin, onComplete, onGameAttempt }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit || 30)
  const [gameStatus, setGameStatus] = useState('playing') // playing, finished
  const [startTime] = useState(Date.now())
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState(0)
  const [questionTimes, setQuestionTimes] = useState([]) // Tempo por pergunta
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const inputRef = useRef(null)

  const defaultQuestions = [
    { question: '5 + 3', answer: 8 },
    { question: '10 - 4', answer: 6 },
    { question: '7 × 2', answer: 14 },
    { question: '15 ÷ 3', answer: 5 },
    { question: '9 + 6', answer: 15 }
  ]

  const gameQuestions = questions || defaultQuestions
  const currentQuestion = gameQuestions[currentQuestionIndex]

  // Timer
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameStatus('finished')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStatus])

  // Focar no input quando muda de pergunta e resetar timer da pergunta
  useEffect(() => {
    if (inputRef.current && gameStatus === 'playing') {
      inputRef.current.focus()
      setQuestionStartTime(Date.now())
    }
  }, [currentQuestionIndex, gameStatus])

  // Finalizar jogo quando tempo acaba
  useEffect(() => {
    if (gameStatus === 'finished') {
      const elapsedTime = Math.round((Date.now() - startTime) / 1000)
      
      if (onGameAttempt && day) {
        onGameAttempt('fast-math', day, {
          won: correctAnswers > 0,
          attempts: correctAnswers + wrongAnswers,
          errors: wrongAnswers,
          metadata: {
            correctAnswers: correctAnswers,
            questionTimes: questionTimes,
            totalQuestions: gameQuestions.length,
            questionsAnswered: correctAnswers + wrongAnswers
          }
        })
      }

      if (onWin && correctAnswers > 0) {
        setTimeout(() => onWin(correctAnswers), 500)
      }
      if (onComplete) {
        setTimeout(() => onComplete(correctAnswers, correctAnswers > 0), 500)
      }
    }
  }, [gameStatus, correctAnswers, wrongAnswers, day, onGameAttempt, onWin, onComplete, startTime, gameQuestions.length])

  const handleAnswer = () => {
    const answer = parseInt(userAnswer.trim())
    
    if (isNaN(answer)) {
      return
    }

    // Calcular tempo desta pergunta
    const questionTime = Math.round((Date.now() - questionStartTime) / 1000)
    const questionData = {
      questionIndex: currentQuestionIndex,
      question: currentQuestion.question,
      answer: currentQuestion.answer,
      userAnswer: answer,
      isCorrect: answer === currentQuestion.answer,
      timeSeconds: questionTime
    }

    if (answer === currentQuestion.answer) {
      // Resposta correta!
      setCorrectAnswers(correctAnswers + 1)
      setScore(score + 1)
    } else {
      // Resposta incorreta
      setWrongAnswers(wrongAnswers + 1)
    }

    // Guardar tempo desta pergunta
    setQuestionTimes([...questionTimes, questionData])

    // Próxima pergunta ou finalizar
    setUserAnswer('')
    
    if (currentQuestionIndex < gameQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Voltou ao início - continuar até o tempo acabar
      setCurrentQuestionIndex(0)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAnswer()
    }
  }

  if (gameStatus === 'finished') {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000)
    const accuracy = correctAnswers + wrongAnswers > 0 
      ? Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100) 
      : 0

    return (
      <div className="fast-math-container">
        <div className="fast-math-result">
          <h2>⏱️ Tempo Esgotado!</h2>
          <div className="result-score">
            <p className="score-label">Respostas Corretas:</p>
            <p className="score-value">{correctAnswers}</p>
            <p className="score-accuracy">Precisão: {accuracy}%</p>
          </div>
          <div className="result-stats">
            <p>Total de perguntas: {correctAnswers + wrongAnswers}</p>
            <p>Tempo: {elapsedTime}s</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fast-math-container">
      <div className="fast-math-header">
        <h2>⚡ Matemática Rápida</h2>
        <div className="math-timer">
          <span className={`timer-display ${timeLeft <= 10 ? 'warning' : ''}`}>
            ⏱️ {timeLeft}s
          </span>
        </div>
        <div className="math-stats">
          <span>✅ Corretas: {correctAnswers}</span>
          <span>❌ Erradas: {wrongAnswers}</span>
        </div>
      </div>

      <div className="math-content">
        <div className="math-question-display">
          <p className="question-text">{currentQuestion.question} = ?</p>
        </div>

        <div className="math-answer">
          <input
            ref={inputRef}
            type="number"
            className="math-input"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Resposta..."
            autoFocus
          />
          <button className="math-submit" onClick={handleAnswer}>
            ✅
          </button>
        </div>

        <p className="math-instruction">Responde o mais rápido possível!</p>
      </div>
    </div>
  )
}

export default FastMath

