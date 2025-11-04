import React, { useState, useEffect } from 'react'
import './Cryptogram.css'

function Cryptogram({ encodedText, decodedText, cipherType, cipherRule, day, onWin, onComplete, onGameAttempt }) {
  const [userMapping, setUserMapping] = useState({})
  const [gameStatus, setGameStatus] = useState('playing')
  const [attempts, setAttempts] = useState(0)
  const [errors, setErrors] = useState(0)
  const [startTime] = useState(Date.now())
  const [validationErrors, setValidationErrors] = useState(0) // Erros de mapeamento incorreto

  // Se não houver texto, usar padrão
  const defaultEncoded = "COQT VGVQPQ"
  const defaultDecoded = "AMOR ETERNO"
  
  const encoded = encodedText || defaultEncoded
  const decoded = decodedText || defaultDecoded.toUpperCase()
  const cipher = cipherType || 'shift'
  const rule = cipherRule || { shift: 2 }

  // Gerar mapeamento correto baseado na cifra
  const generateCorrectMapping = () => {
    const mapping = {}
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
    if (cipher === 'shift') {
      const shift = rule.shift || 2
      for (let i = 0; i < alphabet.length; i++) {
        const encodedIndex = (i + shift) % alphabet.length
        mapping[alphabet[encodedIndex]] = alphabet[i]
      }
    } else if (cipher === 'custom' && rule.mapping) {
      // Mapeamento customizado definido no JSON
      Object.keys(rule.mapping).forEach(encodedChar => {
        mapping[encodedChar.toUpperCase()] = rule.mapping[encodedChar].toUpperCase()
      })
    } else if (cipher === 'reverse') {
      // Alfabeto invertido (Z->A, Y->B, etc.)
      for (let i = 0; i < alphabet.length; i++) {
        mapping[alphabet[alphabet.length - 1 - i]] = alphabet[i]
      }
    }
    
    return mapping
  }

  // Criar mapeamento inicial vazio para o utilizador preencher
  const createInitialMapping = () => {
    const mapping = {}
    const encodedUpper = encoded.toUpperCase().replace(/\s/g, '')
    const uniqueEncoded = [...new Set(encodedUpper)]
    
    uniqueEncoded.forEach(char => {
      mapping[char] = ''
    })
    
    return mapping
  }

  // Obter mapeamento correto
  const correctMapping = generateCorrectMapping()

  useEffect(() => {
    // Reset quando mudar
    const mapping = createInitialMapping()
    setUserMapping(mapping)
    setGameStatus('playing')
    setAttempts(0)
    setErrors(0)
    setValidationErrors(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodedText, decodedText])

  const handleLetterChange = (encodedChar, decodedChar) => {
    if (gameStatus !== 'playing') return
    
    const upperChar = decodedChar.toUpperCase()
    
    // Apenas aceitar letras
    if (upperChar && !upperChar.match(/[A-Z]/)) {
      return
    }
    
    // Verificar se já existe outra letra codificada que mapeia para esta letra decodificada
    // Se sim, limpar o mapeamento anterior (uma letra decodificada só pode ter uma origem)
    setUserMapping(prev => {
      const newMapping = { ...prev }
      const previousMapping = prev[encodedChar]
      
      // Se está a definir uma nova letra, remover mapeamentos anteriores dessa letra decodificada
      if (upperChar) {
        Object.keys(newMapping).forEach(key => {
          if (key !== encodedChar && newMapping[key] === upperChar) {
            newMapping[key] = ''
          }
        })
      }
      
      newMapping[encodedChar] = upperChar || ''
      
      // Verificar se o novo mapeamento está incorreto (comparar com o correto)
      if (upperChar && correctMapping[encodedChar]) {
        const isCorrect = upperChar === correctMapping[encodedChar]
        const wasIncorrect = previousMapping && previousMapping !== correctMapping[encodedChar]
        
        // Se mudou de incorreto para correto, não fazer nada
        // Se mudou de correto/vazio para incorreto, incrementar erro
        if (!wasIncorrect && previousMapping !== upperChar && !isCorrect) {
          setValidationErrors(prev => prev + 1)
        }
        // Se mudou de incorreto para outro incorreto, incrementar erro
        else if (wasIncorrect && !isCorrect && previousMapping !== upperChar) {
          setValidationErrors(prev => prev + 1)
        }
      }
      
      return newMapping
    })
  }

  const handleSubmit = () => {
    setAttempts(prev => prev + 1)
    
    // Verificar se o mapeamento está correto
    const normalizedEncoded = encoded.toUpperCase().replace(/\s/g, '')
    const normalizedDecoded = decoded.replace(/\s/g, '')
    
    let isComplete = true
    let decodedGuess = ''
    
    // Verificar se todas as letras foram mapeadas
    for (let i = 0; i < normalizedEncoded.length; i++) {
      const encodedChar = normalizedEncoded[i]
      const mappedChar = userMapping[encodedChar] || ''
      
      if (!mappedChar) {
        isComplete = false
        break
      }
      
      decodedGuess += mappedChar
    }
    
    if (!isComplete) {
      setErrors(prev => prev + 1)
      alert('Por favor, mapeia todas as letras!')
      return
    }
    
    // Verificar se o mapeamento está correto comparando com o mapeamento correto
    let isCorrect = true
    const encodedChars = [...new Set(normalizedEncoded)]
    
    for (const encodedChar of encodedChars) {
      if (userMapping[encodedChar] !== correctMapping[encodedChar]) {
        isCorrect = false
        break
      }
    }
    
    // Também verificar se a frase decodificada está correta
    const normalize = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const normalizedGuess = normalize(decodedGuess)
    const normalizedTarget = normalize(normalizedDecoded)
    
    if (isCorrect && normalizedGuess === normalizedTarget) {
      setGameStatus('won')
      
      const elapsedTime = Math.round((Date.now() - startTime) / 1000) // Tempo em segundos
      const totalErrors = errors + validationErrors
      
      // Registar tentativa
      setTimeout(() => {
        if (onGameAttempt && day) {
          onGameAttempt('cryptogram', day, {
            won: true,
            attempts: attempts + 1,
            errors: totalErrors,
            score: null,
            metadata: {
              timeSeconds: elapsedTime,
              validationErrors: validationErrors,
              submitErrors: errors,
            },
          })
        }
      }, 0)
      
      if (onWin) {
        setTimeout(() => onWin(attempts + 1), 500)
      }
      if (onComplete) {
        setTimeout(() => onComplete(attempts + 1, true), 500)
      }
    } else {
      const newErrors = errors + 1
      setErrors(newErrors)
      
      const elapsedTime = Math.round((Date.now() - startTime) / 1000)
      const totalErrors = newErrors + validationErrors
      
      // Verificar se excedeu tentativas (opcional - pode adicionar limite)
      // Por agora, registamos mesmo quando há erro
      // Mas só registamos no final quando ganhar ou perder
      
      alert('Mapeamento incorreto! Verifica as letras.')
    }
  }

  const handleReset = () => {
    setUserMapping(createInitialMapping())
    setAttempts(0)
    setErrors(0)
    setValidationErrors(0)
    setGameStatus('playing')
  }

  // Obter letras únicas do texto codificado
  const uniqueEncodedChars = [...new Set(encoded.toUpperCase().replace(/\s/g, ''))].sort()
  
  // Gerar texto decodificado com base no mapeamento atual
  const renderDecodedText = () => {
    return encoded.split('').map((char, idx) => {
      if (char === ' ') {
        return <span key={idx} className="cryptogram-space"> </span>
      }
      const mapped = userMapping[char.toUpperCase()]
      return (
        <span 
          key={idx} 
          className={`cryptogram-char ${mapped ? 'mapped' : 'empty'}`}
        >
          {mapped || '?'}
        </span>
      )
    })
  }

  if (gameStatus === 'won') {
    return (
      <div className="cryptogram-container">
        <div className="cryptogram-result">
          <h2>🎉 Parabéns! Descobriste o código!</h2>
          <div className="cryptogram-final-text">
            <p className="label">Texto decodificado:</p>
            <p className="decoded">{decoded}</p>
          </div>
          <p className="stats">Descobriste em {attempts} tentativa{attempts > 1 ? 's' : ''}!</p>
          <button onClick={handleReset} className="cryptogram-reset-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cryptogram-container">
      <div className="cryptogram-header">
        <h2>🔐 Criptograma</h2>
        <p className="cryptogram-instruction">
          Decifra o texto codificado substituindo cada letra!
        </p>
        {rule.hint && (
          <p className="cryptogram-hint">
            💡 Dica: {rule.hint}
          </p>
        )}
        <div className="cryptogram-stats">
          <span>Tentativas: {attempts}</span>
          {errors > 0 && <span className="errors">Erros: {errors}</span>}
        </div>
      </div>

      <div className="cryptogram-game-area">
        <div className="cryptogram-text-display">
          <div className="encoded-text">
            <p className="label">Texto Codificado:</p>
            <div className="text-box encoded">{encoded}</div>
          </div>
          
          <div className="decoded-text">
            <p className="label">Tua Decodificação:</p>
            <div className="text-box decoded">
              {renderDecodedText()}
            </div>
          </div>
        </div>

        <div className="cryptogram-mapping">
          <h3>Mapeamento de Letras:</h3>
          <p className="mapping-note">
            Cada letra codificada sempre corresponde à mesma letra decodificada
          </p>
          <div className="mapping-grid">
            {uniqueEncodedChars.map(char => {
              const isCorrect = userMapping[char] && userMapping[char] === correctMapping[char]
              const isWrong = userMapping[char] && userMapping[char] !== correctMapping[char] && attempts > 0
              
              return (
                <div key={char} className={`mapping-item ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}>
                  <span className="encoded-char">{char}</span>
                  <span className="arrow">→</span>
                  <input
                    type="text"
                    className={`mapping-input ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                    value={userMapping[char] || ''}
                    onChange={(e) => handleLetterChange(char, e.target.value)}
                    maxLength={1}
                    placeholder="?"
                    disabled={gameStatus !== 'playing'}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSubmit()
                    }}
                  />
                  {isCorrect && <span className="check-mark">✓</span>}
                  {isWrong && <span className="cross-mark">✗</span>}
                </div>
              )
            })}
          </div>
        </div>

        <button
          className="cryptogram-submit-button"
          onClick={handleSubmit}
          disabled={gameStatus !== 'playing' || uniqueEncodedChars.some(char => !userMapping[char])}
        >
          Verificar Decodificação
        </button>
      </div>
    </div>
  )
}

export default Cryptogram

