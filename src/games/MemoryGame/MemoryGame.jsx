import React, { useState, useEffect } from 'react'
import './MemoryGame.css'

function MemoryGame({ cards, day, onWin, onComplete, onGameAttempt }) {
  const [flippedCards, setFlippedCards] = useState([]) // Índices das cartas viradas
  const [matchedPairs, setMatchedPairs] = useState([]) // Pares encontrados
  const [gameStatus, setGameStatus] = useState('playing') // playing, won
  const [startTime] = useState(Date.now())
  const [attempts, setAttempts] = useState(0)
  const [moves, setMoves] = useState(0)
  const [failedAttempts, setFailedAttempts] = useState(0) // Vezes que errou

  // Cartas padrão se não fornecidas
  const defaultCards = [
    { id: 'card1', content: '🎵', pair: 'card1' },
    { id: 'card1', content: '🎵', pair: 'card1' },
    { id: 'card2', content: '❤️', pair: 'card2' },
    { id: 'card2', content: '❤️', pair: 'card2' },
    { id: 'card3', content: '⭐', pair: 'card3' },
    { id: 'card3', content: '⭐', pair: 'card3' },
    { id: 'card4', content: '🎁', pair: 'card4' },
    { id: 'card4', content: '🎁', pair: 'card4' },
    { id: 'card5', content: '🎄', pair: 'card5' },
    { id: 'card5', content: '🎄', pair: 'card5' },
    { id: 'card6', content: '🌟', pair: 'card6' },
    { id: 'card6', content: '🌟', pair: 'card6' }
  ]

  const gameCards = cards || defaultCards

  // Baralhar cartas
  const [shuffledCards, setShuffledCards] = useState([])
  
  useEffect(() => {
    const shuffled = [...gameCards].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)
  }, [gameCards])

  // Verificar se ganhou
  useEffect(() => {
    if (matchedPairs.length === gameCards.length / 2 && gameStatus === 'playing') {
      setGameStatus('won')
      const elapsedTime = Math.round((Date.now() - startTime) / 1000)
      
      if (onGameAttempt && day) {
        onGameAttempt('memory-game', day, {
          won: true,
          attempts: moves,
          errors: failedAttempts,
          metadata: {
            timeSeconds: elapsedTime,
            failedAttempts: failedAttempts,
            moves: moves,
            totalPairs: gameCards.length / 2
          }
        })
      }

      if (onWin) {
        setTimeout(() => onWin(gameCards.length / 2), 500)
      }
      if (onComplete) {
        setTimeout(() => onComplete(gameCards.length / 2, true), 500)
      }
    }
  }, [matchedPairs.length, gameCards.length, gameStatus, moves, day, onGameAttempt, onWin, onComplete, startTime])

  // Verificar se duas cartas viradas formam par
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstIndex, secondIndex] = flippedCards
      const firstCard = shuffledCards[firstIndex]
      const secondCard = shuffledCards[secondIndex]
      
      setMoves(prev => prev + 1)

      if (firstCard.id === secondCard.id && firstIndex !== secondIndex) {
        // Par encontrado!
        setMatchedPairs(prev => [...prev, firstCard.id])
        setFlippedCards([])
      } else {
        // Não é par - errou!
        setFailedAttempts(prev => prev + 1)
        // Virar de volta após 1 segundo
        setTimeout(() => {
          setFlippedCards([])
        }, 1000)
      }
    }
  }, [flippedCards, shuffledCards])

  const handleCardClick = (index) => {
    if (gameStatus !== 'playing') return
    if (flippedCards.length >= 2) return // Já tem 2 cartas viradas
    if (flippedCards.includes(index)) return // Carta já virada
    if (matchedPairs.includes(shuffledCards[index].id)) return // Par já encontrado

    setFlippedCards([...flippedCards, index])
  }

  if (gameStatus === 'won') {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000)
    const minutes = Math.floor(elapsedTime / 60)
    const seconds = elapsedTime % 60
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`

    return (
      <div className="memory-game-container">
        <div className="memory-game-result">
          <h2>🎉 Parabéns!</h2>
          <p className="result-text">Encontraste todos os pares!</p>
          <div className="result-stats">
            <p>Movimentos: {moves}</p>
            <p>Tempo: {timeDisplay}</p>
            <p>Pares encontrados: {matchedPairs.length}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="memory-game-container">
      <div className="memory-game-header">
        <h2>🧠 Jogo de Memória</h2>
        <p>Encontra todos os pares!</p>
        <div className="memory-stats">
          <span>Movimentos: {moves}</span>
          <span>Pares: {matchedPairs.length}/{gameCards.length / 2}</span>
        </div>
      </div>

      <div className="memory-grid">
        {shuffledCards.map((card, index) => {
          const isFlipped = flippedCards.includes(index)
          const isMatched = matchedPairs.includes(card.id)
          
          return (
            <div
              key={index}
              className={`memory-card ${isFlipped || isMatched ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              <div className="card-front">?</div>
              <div className="card-back">
                {card.content || card.text || '🎴'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MemoryGame

