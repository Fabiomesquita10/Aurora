import React, { useState, useEffect, useRef } from 'react'
import './ScrambledSentence.css'

function ScrambledSentence({ sentence, day, onWin, onComplete, onGameAttempt }) {
  // Frase padrão se não fornecida
  const defaultSentence = "TE AMO MUITO"
  const targetSentence = sentence || defaultSentence
  const targetWords = targetSentence.toUpperCase().split(' ').filter(w => w.length > 0)
  
  const [scrambledWords, setScrambledWords] = useState([])
  const [selectedWords, setSelectedWords] = useState([])
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [gameStatus, setGameStatus] = useState('playing')
  const [attempts, setAttempts] = useState(0)
  const [startTime] = useState(Date.now())

  // Baralhar palavras quando componente inicia
  useEffect(() => {
    // Baralhar as palavras
    const shuffled = [...targetWords].sort(() => Math.random() - 0.5)
    setScrambledWords(shuffled)
    setSelectedWords([])
    setGameStatus('playing')
    setAttempts(0)
  }, [targetSentence])

  const handleWordClick = (word, index) => {
    if (gameStatus !== 'playing') return
    
    setScrambledWords(prev => prev.filter((_, i) => i !== index))
    
    // Usar setState com callback para ter acesso ao estado atualizado
    setSelectedWords(prev => {
      const newSelected = [...prev, word]
      
      // Verificar se está correto após atualizar
      setTimeout(() => {
        checkSolution(newSelected)
      }, 0)
      
      return newSelected
    })
    
    setAttempts(prev => prev + 1)
  }

  const handleSelectedWordClick = (word, index) => {
    if (gameStatus !== 'playing') return
    
    setSelectedWords(prev => prev.filter((_, i) => i !== index))
    setScrambledWords(prev => [...prev, word])
  }

  const checkSolution = (currentSelected) => {
    if (currentSelected.length !== targetWords.length) return
    
    const userSentence = currentSelected.join(' ')
    const isCorrect = userSentence === targetSentence.toUpperCase()
    
    if (isCorrect) {
      setGameStatus('won')
      
      // Usar o attempts atualizado através de setState callback
      setAttempts(currentAttempts => {
        const elapsedTime = Math.round((Date.now() - startTime) / 1000) // Tempo em segundos
        
        setTimeout(() => {
          if (onGameAttempt && day) {
            onGameAttempt('scrambled-sentence', day, {
              won: true,
              attempts: currentAttempts,
              errors: 0,
              score: null,
              metadata: {
                timeSeconds: elapsedTime,
                sentence: targetSentence,
              },
            })
          }
        }, 0)
        
        if (onWin) {
          setTimeout(() => onWin(currentAttempts), 500)
        }
        if (onComplete) {
          setTimeout(() => onComplete(currentAttempts, true), 500)
        }
        
        return currentAttempts
      })
    }
  }

  const handleReset = () => {
    const shuffled = [...targetWords].sort(() => Math.random() - 0.5)
    setScrambledWords(shuffled)
    setSelectedWords([])
    setGameStatus('playing')
    setAttempts(0)
  }

  if (gameStatus === 'won') {
    return (
      <div className="scrambled-container">
        <div className="scrambled-result">
          <h2>🎉 Parabéns! Formaste a frase correta!</h2>
          <p>Frase: <strong>{targetSentence}</strong></p>
          <p>Tentativas: {attempts}</p>
          <button onClick={handleReset} className="scrambled-reset-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="scrambled-container">
      <div className="scrambled-header">
        <h2>🔤 Decifrar Frase Baralhada</h2>
        <p className="scrambled-instruction">
          Clica nas palavras na ordem correta para formar a frase!
        </p>
        <div className="scrambled-stats">
          <span>Tentativas: {attempts}</span>
        </div>
      </div>

      <div className="scrambled-game-area">
        <div className="scrambled-sentence-area">
          <h3>Frase formada:</h3>
          <div className="selected-words-container">
            {selectedWords.length === 0 ? (
              <p className="empty-hint">Clica nas palavras abaixo para começar...</p>
            ) : (
              selectedWords.map((word, index) => (
                <span
                  key={`selected-${index}`}
                  className="selected-word"
                  onClick={() => handleSelectedWordClick(word, index)}
                >
                  {word}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="scrambled-words-area">
          <h3>Palavras disponíveis:</h3>
          <div className="available-words-container">
            {scrambledWords.map((word, index) => (
              <button
                key={`word-${index}`}
                className="available-word"
                onClick={() => handleWordClick(word, index)}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScrambledSentence

