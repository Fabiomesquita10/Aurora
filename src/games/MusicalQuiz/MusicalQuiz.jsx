import React, { useState, useEffect, useRef } from 'react'
import './MusicalQuiz.css'

function MusicalQuiz({ songs, day, onWin, onComplete, onGameAttempt }) {
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime] = useState(Date.now())
  const [attempts, setAttempts] = useState(0)
  const [songResults, setSongResults] = useState([]) // Guardar resultados de cada música
  const audioRef = useRef(null)

  const defaultSongs = [
    {
      id: 'song1',
      audio: '/src/games/MusicalQuiz/audio/song1.mp3',
      options: ['Opção A', 'Opção B', 'Opção C'],
      correct: 0
    }
  ]

  const gameSongs = songs || defaultSongs
  const currentSong = gameSongs[currentSongIndex]

  // Resetar quando muda de música
  useEffect(() => {
    setSelectedAnswer(null)
    setHasAnswered(false)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [currentSongIndex])

  const handlePlay = () => {
    if (audioRef.current && !hasAnswered) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  const handleAnswerSelect = (answerIndex) => {
    if (hasAnswered) return

    setSelectedAnswer(answerIndex)
    setHasAnswered(true)
    setAttempts(attempts + 1)
    
    // Pausar áudio quando responde
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }

    const isCorrect = answerIndex === currentSong.correct
    const newScore = isCorrect ? score + 1 : score
    
    // Guardar resultado desta música
    const songResult = {
      songId: currentSong.id,
      songIndex: currentSongIndex,
      selectedAnswer: answerIndex,
      correctAnswer: currentSong.correct,
      isCorrect: isCorrect,
      selectedOption: currentSong.options[answerIndex],
      correctOption: currentSong.options[currentSong.correct]
    }
    
    const updatedResults = [...songResults, songResult]
    setSongResults(updatedResults)
    
    if (isCorrect) {
      setScore(newScore)
    }

    // Aguardar um pouco antes de passar para a próxima música
    setTimeout(() => {
      if (currentSongIndex < gameSongs.length - 1) {
        setCurrentSongIndex(currentSongIndex + 1)
      } else {
        // Última música - finalizar jogo
        const elapsedTime = Math.round((Date.now() - startTime) / 1000)
        const finalResults = updatedResults
        
        if (onGameAttempt && day) {
          onGameAttempt('musical-quiz', day, {
            won: true,
            attempts: attempts + 1,
            errors: gameSongs.length - newScore,
            metadata: {
              timeSeconds: elapsedTime,
              score: newScore,
              totalSongs: gameSongs.length,
              songResults: finalResults,
              correctSongs: finalResults.filter(r => r.isCorrect).map(r => ({
                songId: r.songId,
                songIndex: r.songIndex,
                correctOption: r.correctOption
              })),
              incorrectSongs: finalResults.filter(r => !r.isCorrect).map(r => ({
                songId: r.songId,
                songIndex: r.songIndex,
                selectedOption: r.selectedOption,
                correctOption: r.correctOption
              }))
            }
          })
        }

        if (onWin) {
          setTimeout(() => onWin(gameSongs.length), 500)
        }
        if (onComplete) {
          setTimeout(() => onComplete(gameSongs.length, true), 500)
        }
      }
    }, 2000)
  }

  if (currentSongIndex >= gameSongs.length) {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000)
    const minutes = Math.floor(elapsedTime / 60)
    const seconds = elapsedTime % 60
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
    const percentage = Math.round((score / gameSongs.length) * 100)

    return (
      <div className="musical-quiz-container">
        <div className="musical-quiz-result">
          <h2>🎵 Quiz Musical Completo!</h2>
          <div className="result-score">
            <p className="score-label">Pontuação:</p>
            <p className="score-value">{score}/{gameSongs.length}</p>
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

  const isCorrect = selectedAnswer === currentSong.correct
  const showResult = hasAnswered

  return (
    <div className="musical-quiz-container">
      <div className="musical-quiz-header">
        <h2>🎵 Quiz Musical</h2>
        <p>Música {currentSongIndex + 1} de {gameSongs.length}</p>
        <div className="quiz-progress">
          {gameSongs.map((_, index) => (
            <span
              key={index}
              className={`progress-dot ${index === currentSongIndex ? 'active' : ''} ${index < currentSongIndex ? 'completed' : ''}`}
            ></span>
          ))}
        </div>
      </div>

      <div className="musical-quiz-content">
        <div className="audio-player-section">
          <audio
            ref={audioRef}
            src={currentSong.audio}
            onEnded={handleAudioEnded}
            onError={(e) => {
              console.error('Erro ao carregar áudio:', e)
            }}
          />
          
          <div className="audio-controls">
            {!isPlaying ? (
              <button
                className="play-button"
                onClick={handlePlay}
                disabled={hasAnswered}
              >
                ▶️ Tocar Música
              </button>
            ) : (
              <button
                className="pause-button"
                onClick={handlePause}
                disabled={hasAnswered}
              >
                ⏸️ Pausar
              </button>
            )}
          </div>

          {isPlaying && (
            <p className="playing-indicator">🎵 A tocar...</p>
          )}
        </div>

        <div className="quiz-options">
          <p className="quiz-question">Qual é esta música?</p>
          {currentSong.options.map((option, index) => {
            let optionClass = 'option-button'
            if (showResult) {
              if (index === currentSong.correct) {
                optionClass += ' correct'
              } else if (index === selectedAnswer && index !== currentSong.correct) {
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
                {option}
                {showResult && index === currentSong.correct && (
                  <span className="result-icon">✓</span>
                )}
                {showResult && index === selectedAnswer && index !== currentSong.correct && (
                  <span className="result-icon">✗</span>
                )}
              </button>
            )
          })}
        </div>

        {showResult && (
          <div className={`quiz-feedback ${isCorrect ? 'correct-feedback' : 'wrong-feedback'}`}>
            {isCorrect ? (
              <p>🎉 Correto! Muito bem!</p>
            ) : (
              <p>❌ Errado! A resposta correta era: <strong>{currentSong.options[currentSong.correct]}</strong></p>
            )}
          </div>
        )}

        <div className="quiz-stats">
          <p>Pontuação: {score}/{currentSongIndex + 1}</p>
        </div>
      </div>
    </div>
  )
}

export default MusicalQuiz

