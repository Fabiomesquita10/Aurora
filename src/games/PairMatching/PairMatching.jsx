import React, { useState, useEffect } from 'react'
import './PairMatching.css'

function PairMatching({ pairs, day, onWin, onComplete, onGameAttempt }) {
  const [selectedItems, setSelectedItems] = useState([])
  const [matchedPairs, setMatchedPairs] = useState([])
  const [gameStatus, setGameStatus] = useState('playing') // playing, won
  const [errors, setErrors] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [startTime] = useState(Date.now()) // Tempo de início do jogo

  // Se não houver pares, usar pares padrão
  const defaultPairs = [
    { left: "Lua", right: "Noite" },
    { left: "Sol", right: "Dia" },
    { left: "Chuva", right: "Guarda-chuva" },
    { left: "Fogo", right: "Água" },
    { left: "Amor", right: "Coração" }
  ]

  const gamePairs = pairs || defaultPairs

  // Criar lista de todos os itens (esquerda e direita) baralhados
  const [allItems, setAllItems] = useState([])

  useEffect(() => {
    // Criar lista com todos os itens
    const items = []
    gamePairs.forEach((pair, index) => {
      items.push({ text: pair.left, side: 'left', pairId: index, id: `left-${index}` })
      items.push({ text: pair.right, side: 'right', pairId: index, id: `right-${index}` })
    })
    
    // Baralhar os itens
    const shuffled = items.sort(() => Math.random() - 0.5)
    setAllItems(shuffled)
  }, [gamePairs])

  const handleItemClick = (item) => {
    if (gameStatus !== 'playing') return
    if (matchedPairs.includes(item.pairId)) return // Já foi emparelhado
    if (selectedItems.some(sel => sel.id === item.id)) return // Já está selecionado

    const newSelected = [...selectedItems, item]
    setSelectedItems(newSelected)

    // Se temos 2 itens selecionados, verificar se formam um par
    if (newSelected.length === 2) {
      setAttempts(prev => prev + 1)
      
      const [first, second] = newSelected
      
      // Verificar se são do mesmo par e lados diferentes
      if (first.pairId === second.pairId && first.side !== second.side) {
        // Par correto!
        setMatchedPairs(prev => [...prev, first.pairId])
        setSelectedItems([])
        
        // Verificar se todos os pares foram encontrados
        if (matchedPairs.length + 1 === gamePairs.length) {
          setGameStatus('won')
          
          // Calcular tempo decorrido
          const elapsedTime = Math.round((Date.now() - startTime) / 1000) // Tempo em segundos
          
          // Registar tentativa
          setTimeout(() => {
            if (onGameAttempt && day) {
              onGameAttempt('pair-matching', day, {
                won: true,
                attempts: attempts + 1,
                errors: errors,
                matchedPairs: matchedPairs.length + 1,
                totalPairs: gamePairs.length,
                metadata: {
                  timeSeconds: elapsedTime,
                  failedAttempts: errors // Tentativas falhadas (pares incorretos)
                }
              })
            }
          }, 0)
          
          if (onWin) {
            setTimeout(() => onWin(attempts + 1), 500)
          }
          if (onComplete) {
            setTimeout(() => onComplete(attempts + 1, true), 500)
          }
        }
      } else {
        // Par incorreto
        setErrors(prev => prev + 1)
        // Limpar seleção após um breve delay
        setTimeout(() => {
          setSelectedItems([])
        }, 1000)
      }
    }
  }

  const isSelected = (item) => {
    return selectedItems.some(sel => sel.id === item.id)
  }

  const isMatched = (item) => {
    return matchedPairs.includes(item.pairId)
  }

  const getItemClass = (item) => {
    let classes = 'pair-item'
    if (isSelected(item)) classes += ' selected'
    if (isMatched(item)) classes += ' matched'
    return classes
  }

  if (gameStatus === 'won') {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000)
    const minutes = Math.floor(elapsedTime / 60)
    const seconds = elapsedTime % 60
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
    
    return (
      <div className="pair-matching-container">
        <div className="pair-matching-result">
          <h2>🎉 Parabéns!</h2>
          <p className="result-text">Ligaste todos os pares corretamente!</p>
          <div className="result-stats">
            <p>Pares encontrados: {gamePairs.length}/{gamePairs.length}</p>
            <p>Tentativas: {attempts}</p>
            {errors > 0 && <p>Tentativas falhadas: {errors}</p>}
            <p>Tempo: {timeDisplay}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pair-matching-container">
      <div className="pair-matching-header">
        <h2>🔗 Ligar Pares com Sentido</h2>
        <p className="pair-matching-subtitle">
          Clica em dois itens para formar um par lógico
        </p>
        <div className="pair-matching-progress">
          <p>Pares encontrados: {matchedPairs.length}/{gamePairs.length}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(matchedPairs.length / gamePairs.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pair-matching-grid">
        {allItems.map((item) => (
          <button
            key={item.id}
            className={getItemClass(item)}
            onClick={() => handleItemClick(item)}
            disabled={isMatched(item)}
          >
            {item.text}
            {isMatched(item) && <span className="check-mark">✓</span>}
          </button>
        ))}
      </div>

      {selectedItems.length > 0 && (
        <div className="selected-info">
          <p>Selecionado: {selectedItems.map(item => item.text).join(' ↔ ')}</p>
        </div>
      )}
    </div>
  )
}

export default PairMatching

