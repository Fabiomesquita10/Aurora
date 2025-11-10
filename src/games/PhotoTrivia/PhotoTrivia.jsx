import React, { useState, useEffect, useRef } from 'react'
import './PhotoTrivia.css'

function PhotoTrivia({ photos, day, onWin, onComplete, onGameAttempt }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [hints, setHints] = useState([]) // Array de letras reveladas por foto
  const [gameStatus, setGameStatus] = useState('playing') // playing, won
  const [startTime] = useState(Date.now())
  const [photoAttempts, setPhotoAttempts] = useState([]) // Tentativas por foto
  const [errorMessage, setErrorMessage] = useState('')
  const inputRef = useRef(null)

  // Fotos padrão se não fornecidas
  const defaultPhotos = [
    { id: 'photo1', image: '/src/games/PhotoTrivia/photos/photo1.jpg', answer: 'LOCAL1' },
    { id: 'photo2', image: '/src/games/PhotoTrivia/photos/photo2.jpg', answer: 'LOCAL2' },
    { id: 'photo3', image: '/src/games/PhotoTrivia/photos/photo3.jpg', answer: 'LOCAL3' }
  ]

  const gamePhotos = photos || defaultPhotos
  const currentPhoto = gamePhotos[currentPhotoIndex]

  // Inicializar hints para cada foto
  useEffect(() => {
    if (hints.length === 0) {
      setHints(gamePhotos.map(() => ''))
    }
  }, [gamePhotos])

  // Focar no input quando muda de foto
  useEffect(() => {
    if (inputRef.current && gameStatus === 'playing') {
      inputRef.current.focus()
    }
  }, [currentPhotoIndex, gameStatus])

  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      setErrorMessage('Por favor, escreve uma resposta!')
      return
    }

    const answerLower = userAnswer.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
    const correctAnswer = currentPhoto.answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    
    // Verificar se a resposta está correta (comparação mais flexível)
    const isCorrect = answerLower === correctAnswer || 
                     answerLower.replace(/\s+/g, '') === correctAnswer.replace(/\s+/g, '') ||
                     answerLower.includes(correctAnswer) || 
                     correctAnswer.includes(answerLower)
    
    if (isCorrect) {
      // Resposta correta!
      setErrorMessage('')
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      // Guardar tentativas desta foto
      const newPhotoAttempts = [...photoAttempts]
      newPhotoAttempts[currentPhotoIndex] = (newPhotoAttempts[currentPhotoIndex] || 0) + 1
      setPhotoAttempts(newPhotoAttempts)
      
      // Verificar se é a última foto
      if (currentPhotoIndex === gamePhotos.length - 1) {
        // Última foto - jogo ganho!
        setGameStatus('won')
        
        const elapsedTime = Math.round((Date.now() - startTime) / 1000)
        
        // Registar tentativa
        setTimeout(() => {
          if (onGameAttempt && day) {
            onGameAttempt('photo-trivia', day, {
              won: true,
              attempts: newAttempts,
              errors: newAttempts - gamePhotos.length, // Tentativas falhadas
              metadata: {
                timeSeconds: elapsedTime,
                photoAttempts: newPhotoAttempts,
                hintsUsed: hints.filter(h => h && h.length > 0).length
              }
            })
          }
        }, 0)
        
        if (onWin) {
          setTimeout(() => onWin(gamePhotos.length), 500)
        }
        if (onComplete) {
          setTimeout(() => onComplete(gamePhotos.length, true), 500)
        }
      } else {
        // Passar para a próxima foto
        setUserAnswer('')
        setErrorMessage('')
        setCurrentPhotoIndex(currentPhotoIndex + 1)
      }
    } else {
      // Resposta incorreta
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      // Guardar tentativas desta foto
      const newPhotoAttempts = [...photoAttempts]
      newPhotoAttempts[currentPhotoIndex] = (newPhotoAttempts[currentPhotoIndex] || 0) + 1
      setPhotoAttempts(newPhotoAttempts)
      
      // Dar dica: revelar uma letra por vez
      const currentHints = [...hints]
      const currentHint = currentHints[currentPhotoIndex] || ''
      const correctAnswerUpper = currentPhoto.answer.toUpperCase()
      
      // Criar array de letras reveladas (inicializar se vazio)
      let hintArray = currentHint.split('')
      if (hintArray.length === 0 || hintArray.every(c => c === '_' || c === ' ')) {
        // Primeira dica - criar array com underscores
        hintArray = correctAnswerUpper.split('').map(char => char === ' ' ? ' ' : '_')
      }
      
      // Encontrar próxima letra a revelar (da esquerda para direita)
      let revealed = false
      for (let i = 0; i < correctAnswerUpper.length; i++) {
        if (correctAnswerUpper[i] !== ' ' && hintArray[i] === '_') {
          hintArray[i] = correctAnswerUpper[i]
          revealed = true
          break
        }
      }
      
      const nextHint = hintArray.join('')
      currentHints[currentPhotoIndex] = nextHint
      setHints(currentHints)
      
      if (revealed) {
        setErrorMessage(`❌ Resposta incorreta! 💡 Dica: ${nextHint}`)
      } else {
        setErrorMessage('❌ Resposta incorreta! Tenta novamente.')
      }
      setUserAnswer('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer()
    }
  }

  if (gameStatus === 'won') {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000)
    const minutes = Math.floor(elapsedTime / 60)
    const seconds = elapsedTime % 60
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
    
    return (
      <div className="photo-trivia-container">
        <div className="photo-trivia-result">
          <h2>🎉 Parabéns!</h2>
          <p className="result-text">Adivinhaste todos os locais!</p>
          <div className="result-stats">
            <p>Fotos adivinhadas: {gamePhotos.length}/{gamePhotos.length}</p>
            <p>Tentativas: {attempts}</p>
            <p>Tempo: {timeDisplay}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="photo-trivia-container">
      <div className="photo-trivia-header">
        <h2>📸 Trivia das Fotos</h2>
        <p className="photo-trivia-subtitle">Foto {currentPhotoIndex + 1} de {gamePhotos.length}</p>
        <div className="photo-trivia-progress">
          {gamePhotos.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index < currentPhotoIndex ? 'completed' : ''} ${index === currentPhotoIndex ? 'current' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="photo-trivia-content">
        <div className="photo-display">
          <img
            src={currentPhoto.image}
            alt={`Foto ${currentPhotoIndex + 1}`}
            className="photo-image"
            style={{
              filter: 'blur(20px)',
              clipPath: 'inset(25% 25% 25% 25%)', // Cortar 25% de cada lado (mostra apenas centro)
              transform: 'scale(1.5)' // Aumentar para compensar o corte
            }}
            onError={(e) => {
              console.error('Erro ao carregar imagem:', currentPhoto.image)
              e.target.style.display = 'none'
            }}
          />
        </div>

        {hints[currentPhotoIndex] && (
          <div className="photo-hint">
            <p>💡 Dica: {hints[currentPhotoIndex].split('').map((char, i) => (
              <span key={i} className={char !== '_' ? 'hint-letter' : 'hint-blank'}>
                {char === '_' ? '?' : char}
              </span>
            ))}</p>
          </div>
        )}

        <div className="photo-answer-section">
          <p className="photo-question">Onde foi tirada esta foto?</p>
          <input
            ref={inputRef}
            type="text"
            className="photo-answer-input"
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value)
              setErrorMessage('')
            }}
            onKeyPress={handleKeyPress}
            placeholder="Escreve o nome do local..."
          />
          {errorMessage && (
            <p className="photo-error">{errorMessage}</p>
          )}
          <button className="photo-submit-btn" onClick={checkAnswer}>
            ✅ Confirmar
          </button>
        </div>

        <div className="photo-stats">
          <p>Tentativas nesta foto: {photoAttempts[currentPhotoIndex] || 0}</p>
          <p>Total de tentativas: {attempts}</p>
        </div>
      </div>
    </div>
  )
}

export default PhotoTrivia

