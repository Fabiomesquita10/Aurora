import React, { useState, useEffect } from 'react'
import './T9Encoding.css'

// Mapeamento T9 - números para letras
const T9_MAP = {
  '2': ['A', 'B', 'C'],
  '3': ['D', 'E', 'F'],
  '4': ['G', 'H', 'I'],
  '5': ['J', 'K', 'L'],
  '6': ['M', 'N', 'O'],
  '7': ['P', 'Q', 'R', 'S'],
  '8': ['T', 'U', 'V'],
  '9': ['W', 'X', 'Y', 'Z']
}

// Palavras românticas comuns para validação
const ROMANTIC_WORDS = [
  'LOVE', 'AMOR', 'BEIJO', 'SONHO', 'TOCAR', 'CARINO', 'FELIZ', 'QUENTE',
  'DOCE', 'SUAVE', 'TERNO', 'LINDO', 'CALOR', 'PAIXAO', 'ABRACO', 'CUIDA',
  'AMIGO', 'DOCIL', 'TENRO', 'UNIDO', 'GENTIL', 'QUERO', 'AMADA', 'AMADO'
]

function T9Encoding({ numbers, targetWord, targetPhrase, day, onWin, onComplete, onGameAttempt }) {
  const [userGuess, setUserGuess] = useState('')
  const [gameStatus, setGameStatus] = useState('playing') // playing, won, lost
  const [attempts, setAttempts] = useState(0)
  const [hint, setHint] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [startTime] = useState(Date.now())
  
  // Usar targetPhrase se fornecido, caso contrário targetWord
  const target = targetPhrase || targetWord || ''
  const isPhrase = targetPhrase ? true : false

  // Gerar todas as possibilidades de palavras baseado nos números
  const generatePossibilities = (numStr) => {
    if (!numStr || numStr.length === 0) return []
    
    const digits = numStr.split('')
    let possibilities = ['']
    
    digits.forEach(digit => {
      const letters = T9_MAP[digit] || []
      const newPossibilities = []
      possibilities.forEach(prefix => {
        letters.forEach(letter => {
          newPossibilities.push(prefix + letter)
        })
      })
      possibilities = newPossibilities
    })
    
    // Se for frase, não filtrar (aceitar qualquer combinação)
    if (targetPhrase) {
      return possibilities
    }
    
    // Normalizar e filtrar para palavras
    const normalizedTarget = target?.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || ''
    const normalizedRomanticWords = ROMANTIC_WORDS.map(w => w.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    
    // Filtrar apenas palavras românticas conhecidas ou a palavra alvo
    return possibilities.filter(word => {
      const normalized = word.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return normalizedRomanticWords.includes(normalized) || normalized === normalizedTarget
    })
  }

  useEffect(() => {
    // Reset quando números mudam
    setUserGuess('')
    setGameStatus('playing')
    setAttempts(0)
    setHint('')
    setShowHint(false)
    // startTime será resetado pelo componente quando recriar
  }, [numbers, targetWord, targetPhrase])

  // Gerar dica baseada nas possibilidades
  useEffect(() => {
    if (numbers && numbers.length > 0) {
      const possibilities = generatePossibilities(numbers)
      if (isPhrase) {
        setHint('Descobre a frase usando o teclado T9!')
      } else if (possibilities.length <= 10 && possibilities.length > 0) {
        setHint(`Possibilidades: ${possibilities.slice(0, 5).join(', ')}${possibilities.length > 5 ? '...' : ''}`)
      } else if (possibilities.length > 10) {
        setHint(`${possibilities.length} combinações possíveis`)
      } else {
        setHint('Descobre a palavra usando o teclado T9!')
      }
    }
  }, [numbers, targetWord, targetPhrase, isPhrase])

  const handleSubmit = () => {
    if (!userGuess || userGuess.length === 0) {
      alert('Escreve uma palavra!')
      return
    }

    const guess = userGuess.toUpperCase().trim()
    const normalizedTarget = target?.toUpperCase().trim() || ''
    
    if (!normalizedTarget) {
      alert('Erro: palavra/frase alvo não definida!')
      return
    }

    setAttempts(prev => prev + 1)
    const currentAttempts = attempts + 1

    // Normalizar guess (remover acentos) - para frases, manter espaços
    const normalizedGuess = guess.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
    const normalizedTargetWord = normalizedTarget.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

    if (normalizedGuess === normalizedTargetWord) {
      setGameStatus('won')
      const elapsedTime = Math.round((Date.now() - startTime) / 1000) // Tempo em segundos
      
      // Registar tentativa
      if (onGameAttempt && day) {
        setTimeout(() => {
          onGameAttempt('t9-encoding', day, {
            won: true,
            attempts: currentAttempts,
            errors: currentAttempts - 1,
            score: null,
            metadata: {
              timeSeconds: elapsedTime,
            },
          })
        }, 0)
      }
      if (onWin) {
        setTimeout(() => onWin(currentAttempts), 500)
      }
      if (onComplete) {
        setTimeout(() => onComplete(currentAttempts, true), 500)
      }
    } else {
      // Verificar se a palavra é válida (pode ser formada pelos números)
      const validWords = generatePossibilities(numbers)
      const normalizedValidWords = validWords.map(w => w.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase())
      const isValid = normalizedValidWords.some(w => w === normalizedGuess) || 
                     normalizedGuess === normalizedTargetWord
      
      if (!isValid && numbers) {
        alert('Essa palavra não corresponde aos números fornecidos!')
        setUserGuess('')
        return
      }

      // Se excedeu tentativas (ex: 5 tentativas)
      if (currentAttempts >= 5) {
        setGameStatus('lost')
        const elapsedTime = Math.round((Date.now() - startTime) / 1000) // Tempo em segundos
        
        // Registar tentativa (perdeu)
        if (onGameAttempt && day) {
          setTimeout(() => {
            onGameAttempt('t9-encoding', day, {
              won: false,
              attempts: 5,
              errors: 5,
              score: null,
              metadata: {
                timeSeconds: elapsedTime,
              },
            })
          }, 0)
        }
        if (onComplete) {
          setTimeout(() => onComplete(5, false), 500)
        }
        // Mostrar resposta
        setTimeout(() => {
          const answerType = isPhrase ? 'frase' : 'palavra'
          alert(`A ${answerType} correta era: ${normalizedTarget}`)
        }, 1000)
      } else {
        // Dá feedback mas permite continuar
        alert(`Não é ${isPhrase ? 'essa frase' : 'essa palavra'}! Tenta novamente.`)
        setUserGuess('')
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  // Converter números para mostrar em formato simplificado
  const renderNumberDisplay = () => {
    if (!numbers) return null
    
    // Formatar números com hífens entre palavras (espaços)
    const formattedNumbers = numbers.split(' ').join('-')
    
    return (
      <div className="t9-numbers-display-simple">
        <div className="t9-numbers-line">{formattedNumbers}</div>
      </div>
    )
  }

  const canShowHint = generatePossibilities(numbers).length > 0

  return (
    <div className="t9-encoding-container">
      <div className="t9-header">
        <h2>📱 Encoding T9</h2>
        <p className="t9-instruction">
          {isPhrase ? 'Descobre a frase usando o código numérico do telemóvel antigo' : 'Descobre a palavra usando o código numérico do telemóvel antigo'}
        </p>
      </div>

      <div className="t9-game-area">
        {renderNumberDisplay()}
        
        <div className="t9-input-area">
          <label htmlFor="t9-guess">{isPhrase ? 'Qual é a frase?' : 'Qual é a palavra?'}</label>
          <input
            id="t9-guess"
            type="text"
            className="t9-input"
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder={isPhrase ? 'Escreve a frase...' : 'Escreve a palavra...'}
            disabled={gameStatus !== 'playing'}
            maxLength={isPhrase ? 50 : 10}
            autoFocus
          />
          
          <div className="t9-stats">
            <span>Tentativas: {attempts}/5</span>
            {canShowHint && (
              <button 
                className="t9-hint-button"
                onClick={() => setShowHint(!showHint)}
              >
                💡 Dica
              </button>
            )}
          </div>
          
          {showHint && hint && (
            <div className="t9-hint">
              {hint}
            </div>
          )}
          
          <button
            className="t9-submit-button"
            onClick={handleSubmit}
            disabled={gameStatus !== 'playing' || !userGuess}
          >
            {gameStatus === 'playing' ? 'Submeter' : 
             gameStatus === 'won' ? '✅ Ganhaste!' : '❌ Perdeste'}
          </button>
        </div>

        {gameStatus === 'won' && (
          <div className="t9-success">
            <h3>🎉 Parabéns!</h3>
            <p>Descobriste {isPhrase ? 'a frase' : 'a palavra'} em {attempts} tentativa{attempts > 1 ? 's' : ''}!</p>
            <p className="t9-answer">{isPhrase ? 'A frase era' : 'A palavra era'}: <strong>{target.toUpperCase()}</strong></p>
          </div>
        )}

        {gameStatus === 'lost' && (
          <div className="t9-failure">
            <h3>😔 Não conseguiste desta vez</h3>
            <p>{isPhrase ? 'A frase era' : 'A palavra era'}: <strong>{target.toUpperCase()}</strong></p>
            <p>Tenta novamente noutro dia!</p>
          </div>
        )}
      </div>

      <div className="t9-help">
        <h4>Como funciona?</h4>
        <p>Cada número corresponde a letras no telemóvel antigo:</p>
        <div className="t9-help-grid">
          <div>2 = ABC</div>
          <div>3 = DEF</div>
          <div>4 = GHI</div>
          <div>5 = JKL</div>
          <div>6 = MNO</div>
          <div>7 = PQRS</div>
          <div>8 = TUV</div>
          <div>9 = WXYZ</div>
        </div>
      </div>
    </div>
  )
}

export default T9Encoding
