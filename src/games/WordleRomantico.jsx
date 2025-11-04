import React, { useState, useEffect, useCallback } from 'react'
import { targetWords, initializeWords, isValidWord } from './words'
import './WordleRomantico.css'

const MAX_ATTEMPTS = 6
const WORD_LENGTH = 5

function WordleRomantico({ targetWord: propTargetWord, day, onWin, onComplete, onGameAttempt, randomMode = false, calculateWordlePoints }) {
  const [targetWord, setTargetWord] = useState('')
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameStatus, setGameStatus] = useState('playing') // playing, won, lost
  const [letterStates, setLetterStates] = useState({})
  const [wordsReady, setWordsReady] = useState(false)
  const [startTime] = useState(Date.now())

  // Inicializar palavras e selecionar palavra
  useEffect(() => {
    const init = async () => {
      await initializeWords((ready) => {
        setWordsReady(ready)
        if (ready) {
          // Se foi passada uma palavra específica, usar essa
          // Caso contrário, usar palavra aleatória (para wordle diário ou playground)
          if (propTargetWord) {
            const normalizedWord = propTargetWord.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            setTargetWord(normalizedWord)
          } else {
            // Wordle diário ou playground - usar palavra random
            const randomWord = targetWords[Math.floor(Math.random() * targetWords.length)]
            setTargetWord(randomWord)
          }
        }
      })
    }
    init()
  }, [propTargetWord, randomMode])

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) return
    
    const guess = currentGuess.toUpperCase()
    
    // Verificar se a palavra existe no dicionário
    if (!isValidWord(guess)) {
      alert('Palavra não reconhecida! Tenta outra palavra.')
      return
    }

    setGuesses(prev => {
      const newGuesses = [...prev, guess]
      
      // Verificar vitória
      if (guess === targetWord) {
        setGameStatus('won')
        const attempts = newGuesses.length
        const elapsedTime = Math.round((Date.now() - startTime) / 1000) // Tempo em segundos
        
        // Calcular score (pontos ganhos)
        const score = calculateWordlePoints ? calculateWordlePoints(attempts) : null
        
        // Registar tentativa imediatamente (sem delay para atualização mais rápida)
        if (onGameAttempt && day) {
          onGameAttempt('wordle', day, {
            won: true,
            attempts: attempts,
            errors: 0,
            score: score,
            metadata: {
              timeSeconds: elapsedTime,
            },
          }).catch(err => {
            console.warn('Erro ao registar tentativa:', err)
          })
        }
        // Chamar callbacks se fornecidos
        if (onWin) {
          setTimeout(() => onWin(attempts), 500) // Pequeno delay para animação
        }
        if (onComplete) {
          setTimeout(() => onComplete(attempts, true), 500)
        }
      } else if (newGuesses.length >= MAX_ATTEMPTS) {
        setGameStatus('lost')
        const elapsedTime = Math.round((Date.now() - startTime) / 1000) // Tempo em segundos
        
        // Registar tentativa (perdeu) imediatamente
        if (onGameAttempt && day) {
          onGameAttempt('wordle', day, {
            won: false,
            attempts: MAX_ATTEMPTS,
            errors: MAX_ATTEMPTS,
            score: null,
            metadata: {
              timeSeconds: elapsedTime,
            },
          }).catch(err => {
            console.warn('Erro ao registar tentativa:', err)
          })
        }
        // Mesmo falhando, chamar onComplete para registar participação
        if (onComplete) {
          setTimeout(() => onComplete(MAX_ATTEMPTS, false), 500)
        }
      }

      return newGuesses
    })

    // Atualizar estados das letras para feedback no teclado
    setLetterStates(prev => {
      const newLetterStates = { ...prev }
      const targetArray = targetWord.split('')
      const guessArray = guess.split('')
      
      guessArray.forEach((letter, index) => {
        if (!newLetterStates[letter]) {
          if (letter === targetArray[index]) {
            newLetterStates[letter] = 'correct'
          } else if (targetArray.includes(letter)) {
            // Só marca como presente se ainda não tiver sido marcado como correto
            if (newLetterStates[letter] !== 'correct') {
              newLetterStates[letter] = 'present'
            }
          } else {
            if (newLetterStates[letter] !== 'correct' && newLetterStates[letter] !== 'present') {
              newLetterStates[letter] = 'absent'
            }
          }
        }
      })

      return newLetterStates
    })
    
    setCurrentGuess('')
  }, [currentGuess, targetWord])

  const handleKeyPress = useCallback((key) => {
    if (gameStatus !== 'playing') return

    if (key === 'ENTER') {
      if (currentGuess.length === WORD_LENGTH) {
        submitGuess()
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1))
    } else if (key.length === 1 && key.match(/[A-Z]/)) {
      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess(prev => prev + key)
      }
    }
  }, [gameStatus, currentGuess, submitGuess])

  const getLetterStatus = (letter, index, guess) => {
    if (!targetWord || !letter) return ''
    
    // Se a letra está na posição correta
    if (letter === targetWord[index]) {
      return 'correct'
    }
    
    // Se a letra não existe na palavra alvo
    if (!targetWord.includes(letter)) {
      return 'absent'
    }
    
    // A letra existe na palavra alvo, mas não nesta posição
    // Algoritmo do Wordle: marcar como "present" apenas se ainda houver ocorrências disponíveis
    
    // Primeiro, contar todas as ocorrências corretas (verde) desta letra
    let correctCount = 0
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guess[i] === letter && targetWord[i] === letter) {
        correctCount++
      }
    }
    
    // Contar quantas ocorrências desta letra existem na palavra alvo
    const letterCountInTarget = targetWord.split('').filter(l => l === letter).length
    
    // Contar quantas vezes já marcámos esta letra como "present" (amarelo) até esta posição
    let presentCount = 0
    for (let i = 0; i < index; i++) {
      if (guess[i] === letter && guess[i] !== targetWord[i]) {
        // Esta letra não está correta nesta posição, pode ser marcada como presente
        // Mas só se ainda não tivermos usado todas as ocorrências disponíveis
        const available = letterCountInTarget - correctCount
        if (presentCount < available) {
          presentCount++
        }
      }
    }
    
    // Verificar se ainda podemos marcar esta letra como presente
    const availableForPresent = letterCountInTarget - correctCount
    if (presentCount < availableForPresent) {
      return 'present'
    }
    
    return 'absent'
  }

  const resetGame = () => {
    const randomWord = targetWords[Math.floor(Math.random() * targetWords.length)]
    setTargetWord(randomWord)
    setGuesses([])
    setCurrentGuess('')
    setGameStatus('playing')
    setLetterStates({})
  }

  // Teclado físico
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleKeyPress('ENTER')
      } else if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE')
      } else if (e.key.match(/[a-zA-Z]/)) {
        handleKeyPress(e.key.toUpperCase())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyPress])

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ]

  if (!wordsReady) {
    return (
      <div className="wordle-container">
        <header className="wordle-header">
          <h1>💕 Aurora</h1>
          <p className="subtitle">A carregar dicionário...</p>
        </header>
      </div>
    )
  }

  return (
    <div className="wordle-container">
      <header className="wordle-header">
        <h1>💕 Aurora</h1>
        <p className="subtitle">Adivinha a palavra em {MAX_ATTEMPTS} tentativas</p>
      </header>

      <div className="wordle-grid">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
          const guess = guesses[rowIndex] || ''
          const isCurrentRow = rowIndex === guesses.length && gameStatus === 'playing'
          
          return (
            <div key={rowIndex} className="wordle-row">
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                let letter = ''
                let status = ''
                
                if (guess) {
                  letter = guess[colIndex] || ''
                  status = getLetterStatus(letter, colIndex, guess)
                } else if (isCurrentRow) {
                  letter = currentGuess[colIndex] || ''
                }

                return (
                  <div
                    key={colIndex}
                    className={`wordle-cell ${status} ${isCurrentRow && letter ? 'typing' : ''}`}
                  >
                    {letter}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {gameStatus === 'won' && (
        <div className="game-message success">
          <h2>🎉 Parabéns! Descobriste a palavra!</h2>
          <p>A palavra era: <strong>{targetWord}</strong></p>
          <button onClick={resetGame} className="reset-button">
            Jogar Novamente
          </button>
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="game-message error">
          <h2>😔 Tentativas esgotadas</h2>
          <p>A palavra era: <strong>{targetWord}</strong></p>
          <button onClick={resetGame} className="reset-button">
            Tentar Novamente
          </button>
        </div>
      )}

      <div className="keyboard">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => {
              const isSpecialKey = key === 'ENTER' || key === 'BACKSPACE'
              const keyState = letterStates[key] || ''
              
              return (
                <button
                  key={key}
                  className={`keyboard-key ${keyState} ${isSpecialKey ? 'special' : ''}`}
                  onClick={() => handleKeyPress(key)}
                >
                  {key === 'BACKSPACE' ? '⌫' : key}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default WordleRomantico
