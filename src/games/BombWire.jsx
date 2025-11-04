import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import './BombWire.css'

function BombWire({ 
  difficulty = 'normal', 
  rules = [], 
  maxTime = 15,
  mathQuestions = [],
  day, 
  onWin, 
  onComplete, 
  onGameAttempt 
}) {
  const [gameStatus, setGameStatus] = useState('waiting') // waiting, playing, won, lost, showing-hint
  const [timeLeft, setTimeLeft] = useState(maxTime)
  const [attempts, setAttempts] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [selectedWire, setSelectedWire] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [currentMathQuestion, setCurrentMathQuestion] = useState(null)
  const [mathAnswer, setMathAnswer] = useState('')
  const [mathError, setMathError] = useState('')
  const [hintRule, setHintRule] = useState(null)
  const [unlockedRules, setUnlockedRules] = useState([]) // Regras desbloqueadas
  const [activeHints, setActiveHints] = useState([]) // Dicas ativas (até 3)
  const [usedMathQuestions, setUsedMathQuestions] = useState([]) // Contas já usadas
  const timerRef = useRef(null)
  const gameStatusRef = useRef('waiting')

  const wires = [
    { id: 'vermelho', name: 'Vermelho', color: '#e74c3c' },
    { id: 'azul', name: 'Azul', color: '#3498db' },
    { id: 'verde', name: 'Verde', color: '#2ecc71' }
  ]

  // Gerar números aleatórios para cada fio (entre 1 e 10)
  const [wireNumbers, setWireNumbers] = useState(() => {
    return {
      vermelho: Math.floor(Math.random() * 10) + 1,
      azul: Math.floor(Math.random() * 10) + 1,
      verde: Math.floor(Math.random() * 10) + 1
    }
  })

  // Função para avaliar uma regra baseada no tempo e números dos fios
  const evaluateRule = useCallback((rule, currentTime, wireNums) => {
    if (!rule.condition || !wireNums) return false
    
    // Substituir condições de tempo
    let condition = rule.condition
      .replace(/time\s*>\s*(\d+)/g, (match, num) => currentTime > parseInt(num) ? 'true' : 'false')
      .replace(/time\s*>=\s*(\d+)/g, (match, num) => currentTime >= parseInt(num) ? 'true' : 'false')
      .replace(/time\s*<\s*(\d+)/g, (match, num) => currentTime < parseInt(num) ? 'true' : 'false')
      .replace(/time\s*<=\s*(\d+)/g, (match, num) => currentTime <= parseInt(num) ? 'true' : 'false')
      .replace(/time\s*==\s*(\d+)/g, (match, num) => currentTime === parseInt(num) ? 'true' : 'false')
    
    // Substituir condições sobre números dos fios
    // "vermelho.connectedToOdd" -> verifica se o número do fio vermelho é ímpar
    const vermelhoNum = wireNums.vermelho || 1
    const azulNum = wireNums.azul || 1
    const verdeNum = wireNums.verde || 1
    
    condition = condition
      .replace(/vermelho\.connectedToOdd/g, (vermelhoNum % 2 === 1) ? 'true' : 'false')
      .replace(/vermelho\.connectedToEven/g, (vermelhoNum % 2 === 0) ? 'true' : 'false')
      .replace(/azul\.connectedToOdd/g, (azulNum % 2 === 1) ? 'true' : 'false')
      .replace(/azul\.connectedToEven/g, (azulNum % 2 === 0) ? 'true' : 'false')
      .replace(/verde\.connectedToOdd/g, (verdeNum % 2 === 1) ? 'true' : 'false')
      .replace(/verde\.connectedToEven/g, (verdeNum % 2 === 0) ? 'true' : 'false')
    
    // Suportar também "verde.connectedToOdd" ou "verde.odd"
    condition = condition
      .replace(/vermelho\.odd/g, (vermelhoNum % 2 === 1) ? 'true' : 'false')
      .replace(/vermelho\.even/g, (vermelhoNum % 2 === 0) ? 'true' : 'false')
      .replace(/azul\.odd/g, (azulNum % 2 === 1) ? 'true' : 'false')
      .replace(/azul\.even/g, (azulNum % 2 === 0) ? 'true' : 'false')
      .replace(/verde\.odd/g, (verdeNum % 2 === 1) ? 'true' : 'false')
      .replace(/verde\.even/g, (verdeNum % 2 === 0) ? 'true' : 'false')
    
    try {
      // Avaliar a expressão booleana resultante
      return eval(condition) === true
    } catch {
      return false
    }
  }, [])

  // Avaliar regras e determinar fio correto baseado no tempo atual
  const correctWire = useMemo(() => {
    if (gameStatus !== 'playing' && gameStatus !== 'waiting') return null
    if (!wireNumbers) return rules.length > 0 ? rules[0]?.wire || 'verde' : 'verde'
    
    const currentTime = gameStatus === 'playing' ? timeLeft : maxTime
    
    // Avaliar cada regra em ordem
    for (const rule of rules) {
      if (evaluateRule(rule, currentTime, wireNumbers)) {
        return rule.wire
      }
    }
    
    // Se nenhuma regra se aplicar, usar a primeira regra como padrão
    return rules.length > 0 ? rules[0].wire : 'verde'
  }, [rules, timeLeft, gameStatus, maxTime, evaluateRule, wireNumbers])

  useEffect(() => {
    gameStatusRef.current = gameStatus
  }, [gameStatus])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Atualizar fio correto quando o tempo muda
  useEffect(() => {
    if (gameStatus === 'playing') {
      // Forçar re-render para atualizar o fio correto
      // O useMemo já faz isso automaticamente
    }
  }, [timeLeft, gameStatus])

  const startGame = () => {
    // Gerar novos números aleatórios para cada fio
    setWireNumbers({
      vermelho: Math.floor(Math.random() * 10) + 1,
      azul: Math.floor(Math.random() * 10) + 1,
      verde: Math.floor(Math.random() * 10) + 1
    })
    
    setGameStatus('playing')
    setTimeLeft(maxTime)
    setAttempts(0)
    setStartTime(Date.now())
    setSelectedWire(null)
    setShowResult(false)
    setShowHint(false)
    setHintRule(null)
    setUnlockedRules([])
    setActiveHints([])
    setUsedMathQuestions([])
    setCurrentMathQuestion(null)
    setMathAnswer('')
    setMathError('')

    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleTimeUp = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setGameStatus('lost')
    setShowResult(true)
    
    const elapsedTime = startTime ? Math.round((Date.now() - startTime) / 1000) : maxTime
    setTimeout(() => {
      if (onGameAttempt && day) {
        onGameAttempt('bomb-wire', day, {
          won: false,
          attempts: attempts + 1,
          errors: attempts + 1,
          score: null,
            metadata: { 
              timeSeconds: elapsedTime,
              timeLeft: 0,
              difficulty,
              correctWire: correctWire || 'unknown',
              selectedWire: null,
              hintsUsed: activeHints.length
            }
        })
      }
    }, 0)
    
    if (onComplete) setTimeout(() => onComplete(attempts + 1, false), 500)
  }

  const handleWireCut = (wireId) => {
    if (gameStatus !== 'playing') return
    
    setSelectedWire(wireId)
    setAttempts(prev => prev + 1)

    if (timerRef.current) clearInterval(timerRef.current)

    const isCorrect = wireId === correctWire
    const elapsedTime = Math.round((Date.now() - startTime) / 1000)

    if (isCorrect) {
      setGameStatus('won')
      setShowResult(true)
      
      setTimeout(() => {
        if (onGameAttempt && day) {
          onGameAttempt('bomb-wire', day, {
            won: true,
            attempts: attempts + 1,
            errors: 0,
            score: timeLeft,
            metadata: { 
              timeSeconds: elapsedTime,
              timeLeft,
              difficulty,
              correctWire: correctWire || 'unknown',
              selectedWire: wireId,
              hintsUsed: activeHints.length
            }
          })
        }
      }, 0)
      
      if (onWin) setTimeout(() => onWin(attempts + 1), 500)
      if (onComplete) setTimeout(() => onComplete(attempts + 1, true), 500)
    } else {
      setGameStatus('lost')
      setShowResult(true)
      
      setTimeout(() => {
        if (onGameAttempt && day) {
          onGameAttempt('bomb-wire', day, {
            won: false,
            attempts: attempts + 1,
            errors: attempts + 1,
            score: null,
            metadata: { 
              timeSeconds: elapsedTime,
              timeLeft,
              difficulty,
              correctWire: correctWire || 'unknown',
              selectedWire: wireId,
              hintsUsed: activeHints.length
            }
          })
        }
      }, 0)
      
      if (onComplete) setTimeout(() => onComplete(attempts + 1, false), 500)
    }
  }

  const requestHint = () => {
    // Se já tiver 3 dicas, não permitir pedir mais
    if (activeHints.length >= 3) {
      return
    }
    
    if (mathQuestions.length === 0) {
      // Se não houver perguntas, mostrar dica diretamente
      return
    }
    
    // Filtrar perguntas que ainda não foram usadas
    const availableQuestions = mathQuestions.filter((q, index) => {
      // Verificar se a pergunta já foi usada (por índice ou por questão única)
      return !usedMathQuestions.some(used => {
        if (typeof used === 'number') {
          return used === index
        }
        // Comparar por questão e resposta
        return used.question === q.question && used.answer === q.answer
      })
    })
    
    // Se não houver perguntas disponíveis, não permitir pedir mais dicas
    if (availableQuestions.length === 0) {
      alert('Já usaste todas as contas disponíveis!')
      return
    }
    
    // Selecionar uma pergunta aleatória das disponíveis
    const randomIndex = Math.floor(Math.random() * availableQuestions.length)
    const selectedQuestion = availableQuestions[randomIndex]
    
    // Encontrar o índice original da pergunta selecionada
    const originalIndex = mathQuestions.findIndex(q => 
      q.question === selectedQuestion.question && q.answer === selectedQuestion.answer
    )
    
    // Associar a pergunta à regra correspondente (por índice)
    const associatedRule = rules[originalIndex] || rules[0] || null
    
    setCurrentMathQuestion(selectedQuestion)
    setHintRule(associatedRule)
    setGameStatus('showing-hint')
    setMathAnswer('')
    setMathError('')
  }

  const handleMathSubmit = () => {
    if (!currentMathQuestion) return
    
    const userAnswer = parseFloat(mathAnswer.trim())
    const correctAnswer = parseFloat(currentMathQuestion.answer)
    
    if (isNaN(userAnswer)) {
      setMathError('Por favor, insere um número válido')
      return
    }
    
    if (Math.abs(userAnswer - correctAnswer) < 0.01) {
      // Marcar a pergunta como usada
      if (currentMathQuestion) {
        setUsedMathQuestions(prev => {
          // Verificar se já está na lista (evitar duplicados)
          const alreadyUsed = prev.some(used => {
            if (typeof used === 'object') {
              return used.question === currentMathQuestion.question && used.answer === currentMathQuestion.answer
            }
            return false
          })
          if (!alreadyUsed) {
            return [...prev, { question: currentMathQuestion.question, answer: currentMathQuestion.answer }]
          }
          return prev
        })
      }
      
      // Resposta correta - adicionar dica às dicas ativas (até 3)
      if (hintRule && activeHints.length < 3) {
        const hintText = hintRule.description || `Corta ${hintRule.wire}`
        // Verificar se a dica já existe (evitar duplicados)
        if (!activeHints.find(h => h === hintText)) {
          setActiveHints(prev => [...prev, hintText])
        }
      }
      
      // Desbloquear a regra também
      if (hintRule && !unlockedRules.find(r => r.condition === hintRule.condition && r.wire === hintRule.wire)) {
        setUnlockedRules(prev => [...prev, hintRule])
      }
      
      setGameStatus('playing')
      setCurrentMathQuestion(null)
      setHintRule(null)
      setMathAnswer('')
      setMathError('')
    } else {
      // Resposta errada
      setMathError('Resposta errada! Tenta novamente.')
      setMathAnswer('')
    }
  }

  const removeHint = (index) => {
    setActiveHints(prev => prev.filter((_, i) => i !== index))
  }

  const resetGame = () => {
    setGameStatus('waiting')
    setAttempts(0)
    setStartTime(null)
    setSelectedWire(null)
    setShowResult(false)
    setShowHint(false)
    setHintRule(null)
    setCurrentMathQuestion(null)
    setMathAnswer('')
    setMathError('')
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const formatTime = (seconds) => {
    return `${seconds}s`
  }

  const getTimeColor = () => {
    if (timeLeft > maxTime * 0.5) return 'var(--color-success)'
    if (timeLeft > maxTime * 0.25) return 'var(--color-gold)'
    return 'var(--color-error)'
  }

  // Obter regras ativas baseadas no tempo atual (não usado mais, mas mantido para compatibilidade)
  const getActiveRules = () => {
    return []
  }

  if (gameStatus === 'waiting') {
    return (
      <div className="bomb-wire-container">
        <div className="bomb-wire-start-screen">
          <h2>💣 Corta o Fio Certo</h2>
          <p className="bomb-wire-instruction">
            Analisa as pistas e corta o fio correto antes que o tempo acabe!
          </p>
          <div className="bomb-wire-info">
            <p><strong>Dificuldade:</strong> {difficulty}</p>
            <p><strong>Tempo máximo:</strong> {formatTime(maxTime)}</p>
            <p><strong>Fios disponíveis:</strong> Vermelho, Azul, Verde</p>
          </div>
          {mathQuestions.length > 0 && (
            <div className="bomb-wire-hint-info">
              <p>💡 Resolve contas matemáticas durante o jogo para desbloquear regras e descobrir qual fio cortar!</p>
            </div>
          )}
          <button onClick={startGame} className="bomb-wire-start-button">
            Começar
          </button>
        </div>
      </div>
    )
  }

  if (gameStatus === 'showing-hint') {
    return (
      <div className="bomb-wire-container">
        <div className="bomb-wire-math-modal">
          <h2>🧮 Resolve a Conta</h2>
          <p className="math-question">{currentMathQuestion?.question} = ?</p>
          <div className="math-input-area">
            <input
              type="number"
              className="math-input"
              value={mathAnswer}
              onChange={(e) => {
                setMathAnswer(e.target.value)
                setMathError('')
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleMathSubmit()
              }}
              placeholder="Resposta"
              autoFocus
            />
            {mathError && <p className="math-error">{mathError}</p>}
          </div>
          <div className="math-actions">
            <button onClick={handleMathSubmit} className="math-submit-button">
              Submeter
            </button>
            <button onClick={() => {
              setGameStatus('playing')
              setCurrentMathQuestion(null)
              setMathAnswer('')
              setMathError('')
            }} className="math-cancel-button">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (gameStatus === 'won') {
    return (
      <div className="bomb-wire-container">
        <div className="bomb-wire-result success">
          <h2>🎉 Bomba Desarmada!</h2>
          <p>Parabéns! Cortaste o fio correto!</p>
          <p>Tempo restante: {formatTime(timeLeft)}</p>
          <p>Tentativas: {attempts}</p>
          <button onClick={resetGame} className="bomb-wire-reset-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (gameStatus === 'lost') {
    return (
      <div className="bomb-wire-container">
        <div className="bomb-wire-result error">
          <h2>💥 BOOM!</h2>
          <p>O fio errado foi cortado! A bomba explodiu!</p>
          <p>O fio correto era: <strong>{wires.find(w => w.id === correctWire)?.name}</strong></p>
          <p>Tentativas: {attempts}</p>
          <button onClick={resetGame} className="bomb-wire-reset-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  const activeRules = getActiveRules()

  return (
    <div className="bomb-wire-container">
      <div className="bomb-wire-header">
        <h2>💣 Corta o Fio Certo</h2>
        <div className="bomb-wire-stats">
          <div className="bomb-wire-timer" style={{ color: getTimeColor() }}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <div className="bomb-wire-attempts">
            Tentativas: {attempts}
          </div>
        </div>
      </div>

      <div className="bomb-wire-game-area">
        <div className="bomb-wire-bomb">
          <div className="bomb-display">
            <div className="bomb-timer-display" style={{ color: getTimeColor() }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="bomb-wire-rules-display">
          <div className="rules-header">
            <h3>Dicas:</h3>
            {mathQuestions.length > 0 && activeHints.length < 3 && (
              <button onClick={requestHint} className="hint-button">
                💡 Pedir Dica ({activeHints.length}/3)
              </button>
            )}
            {activeHints.length >= 3 && (
              <span className="hint-limit">Máximo de 3 dicas atingido</span>
            )}
          </div>
          {activeHints.length > 0 ? (
            <div className="hints-list">
              {activeHints.map((hint, index) => (
                <div key={index} className="hint-display">
                  <p className="hint-text">
                    <strong>💡 Dica {index + 1}:</strong> {hint}
                  </p>
                  <button onClick={() => removeHint(index)} className="close-hint-button">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-rules">Resolve contas matemáticas para desbloquear dicas!</p>
          )}
        </div>

        <div className="bomb-wire-wires">
          {wires.map((wire) => (
            <button
              key={wire.id}
              className={`bomb-wire-button ${selectedWire === wire.id ? 'selected' : ''} ${showResult && wire.id === correctWire ? 'correct' : ''} ${showResult && selectedWire === wire.id && wire.id !== correctWire ? 'wrong' : ''}`}
              onClick={() => handleWireCut(wire.id)}
              disabled={gameStatus !== 'playing'}
              style={{ '--wire-color': wire.color }}
            >
              <div className="wire-visual" style={{ backgroundColor: wire.color }}></div>
              <div className="wire-info">
                <span className="wire-name">{wire.name}</span>
                <span className="wire-number">Número: {wireNumbers?.[wire.id] || '?'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BombWire
