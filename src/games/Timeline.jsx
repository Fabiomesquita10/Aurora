import React, { useState, useEffect, useRef } from 'react'
import './Timeline.css'

function Timeline({ events = [], day, onWin, onComplete, onGameAttempt }) {
  const [gameStatus, setGameStatus] = useState('waiting') // waiting, playing, won, lost
  const [orderedEvents, setOrderedEvents] = useState([])
  const [attempts, setAttempts] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const maxAttempts = 3

  // Inicializar eventos baralhados
  useEffect(() => {
    if (events.length > 0 && gameStatus === 'waiting') {
      // Baralhar eventos
      const shuffled = [...events].sort(() => Math.random() - 0.5)
      setOrderedEvents(shuffled)
    }
  }, [events, gameStatus])

  const startGame = () => {
    // Baralhar eventos novamente
    const shuffled = [...events].sort(() => Math.random() - 0.5)
    setOrderedEvents(shuffled)
    setGameStatus('playing')
    setAttempts(0)
    setStartTime(Date.now())
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragStart = (e, index) => {
    if (gameStatus !== 'playing') return
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    setDragOverIndex(null)

    if (draggedIndex === null || draggedIndex === dropIndex) return

    const newOrder = [...orderedEvents]
    const draggedItem = newOrder[draggedIndex]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(dropIndex, 0, draggedItem)

    setOrderedEvents(newOrder)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const checkOrder = () => {
    if (gameStatus !== 'playing') return

    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    // Ordenar eventos originais por data para comparar
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date))

    // Verificar se a ordem está correta (comparando textos e datas)
    const isCorrect = orderedEvents.every((event, index) => {
      return event.date === sortedEvents[index].date && event.text === sortedEvents[index].text
    })

    if (isCorrect) {
      // Ganhou!
      setGameStatus('won')
      const elapsedTime = Math.round((Date.now() - startTime) / 1000)

      setTimeout(() => {
        if (onGameAttempt && day) {
          onGameAttempt('timeline', day, {
            won: true,
            attempts: newAttempts,
            errors: 0,
            score: null,
            metadata: {
              timeSeconds: elapsedTime,
            },
          })
        }
      }, 0)

      if (onWin) {
        setTimeout(() => onWin(newAttempts), 500)
      }
      if (onComplete) {
        setTimeout(() => onComplete(newAttempts, true), 500)
      }
    } else if (newAttempts >= maxAttempts) {
      // Perdeu - esgotou tentativas
      setGameStatus('lost')
      const elapsedTime = Math.round((Date.now() - startTime) / 1000)

      setTimeout(() => {
        if (onGameAttempt && day) {
          onGameAttempt('timeline', day, {
            won: false,
            attempts: newAttempts,
            errors: newAttempts,
            score: null,
            metadata: {
              timeSeconds: elapsedTime,
            },
          })
        }
      }, 0)

      if (onComplete) {
        setTimeout(() => onComplete(newAttempts, false), 500)
      }
    } else {
      // Tentativa errada, mas ainda tem tentativas
      alert(`Ordem incorreta! Ainda tens ${maxAttempts - newAttempts} tentativa(s).`)
    }
  }

  const resetGame = () => {
    setGameStatus('waiting')
    setAttempts(0)
    setStartTime(null)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (gameStatus === 'waiting') {
    return (
      <div className="timeline-container">
        <div className="timeline-header">
          <h2>📅 Linha do Tempo - Ordenar Eventos de 2025</h2>
          <p>Arrasta os eventos para ordená-los cronologicamente!</p>
          <p>Tens {maxAttempts} tentativas para acertar.</p>
        </div>
        <button className="timeline-start-button" onClick={startGame}>
          Começar
        </button>
      </div>
    )
  }

  if (gameStatus === 'won') {
    return (
      <div className="timeline-container">
        <div className="timeline-result success">
          <h2>🎉 Parabéns! Ordenaste corretamente!</h2>
          <p>Conseguiste em {attempts} tentativa(s)</p>
          <p>Tempo: {Math.round((Date.now() - startTime) / 1000)} segundos</p>
          <button className="timeline-reset-button" onClick={resetGame}>
            Jogar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (gameStatus === 'lost') {
    // Ordenar eventos por data para mostrar a ordem correta
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date))
    
    return (
      <div className="timeline-container">
        <div className="timeline-result error">
          <h2>😔 Esgotaste as tentativas</h2>
          <p>A ordem correta era:</p>
          <div className="timeline-correct-order">
            {sortedEvents.map((event, index) => (
              <div key={index} className="timeline-event-item">
            <span className="timeline-event-number">{index + 1}</span>
            <span className="timeline-event-text">{event.text}</span>
          </div>
        ))}
      </div>
      <button className="timeline-reset-button" onClick={resetGame}>
        Tentar Novamente
      </button>
        </div>
      </div>
    )
  }

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>📅 Linha do Tempo</h2>
        <div className="timeline-stats">
          <span>Tentativas: {attempts} / {maxAttempts}</span>
          <span>Tempo: {startTime ? Math.round((Date.now() - startTime) / 1000) : 0}s</span>
        </div>
      </div>

      <div className="timeline-instructions">
        <p>Arrasta os eventos para ordená-los do mais antigo para o mais recente</p>
      </div>

      <div className="timeline-events">
        {orderedEvents.map((event, index) => (
          <div
            key={`${event.date}-${index}`}
            className={`timeline-event-item ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
            draggable={gameStatus === 'playing'}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <span className="timeline-event-number">{index + 1}</span>
            <span className="timeline-event-text">{event.text}</span>
            <span className="timeline-drag-handle">⋮⋮</span>
          </div>
        ))}
      </div>

      <button 
        className="timeline-check-button" 
        onClick={checkOrder}
        disabled={gameStatus !== 'playing'}
      >
        Verificar Ordem
      </button>
    </div>
  )
}

export default Timeline

