import React, { useState, useRef } from 'react'
import './Wheel.css'

function Wheel({ prizes, day, onWin, onComplete, onGameAttempt }) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selectedPrize, setSelectedPrize] = useState(null)
  const wheelRef = useRef(null)

  // Se não houver prémios definidos, usar prémios padrão low
  const defaultPrizes = [
    { id: 1, name: 'Chocolate 🍫', description: 'Bounty/mini-doce' },
    { id: 2, name: 'Rosa 🌹', description: 'Dar uma flor' },
    { id: 3, name: 'Beijo extra 💋', description: 'Beijo a pedido' },
    { id: 4, name: 'Bebida quente ☕', description: 'Café/chocolate quente juntos' },
    { id: 5, name: 'Escolher filme 🎬', description: 'Ela escolhe o próximo filme' },
    { id: 6, name: 'Mensagem secreta 💌', description: 'Carta guardada no site' },
    { id: 7, name: 'Sobremesa 🍪', description: 'Crumble/bolachas feitas por ti' },
    { id: 8, name: 'Foto nossa 📸', description: 'Foto impressa/Polaroid' },
  ]

  const wheelPrizes = prizes || defaultPrizes
  const sectorAngle = 360 / wheelPrizes.length

  // Criar gradiente cónico para os setores com cores mais vibrantes
  const createConicGradient = () => {
    const colors = [
      '#FFD700', // Dourado - Chocolate
      '#FF6B9D', // Rosa forte - Rosa
      '#FF6B6B', // Vermelho - Beijo
      '#4ECDC4', // Turquesa - Bebida
      '#95E1D3', // Verde água - Filme
      '#C06C84', // Rosa púrpura - Mensagem
      '#F8B500', // Laranja - Sobremesa
      '#6C5CE7', // Roxo - Foto
    ]
    
    let gradient = 'conic-gradient('
    wheelPrizes.forEach((prize, index) => {
      const startAngle = (index * sectorAngle)
      const endAngle = ((index + 1) * sectorAngle)
      const color = colors[index % colors.length]
      if (index === 0) {
        gradient += `${color} ${startAngle}deg ${endAngle}deg`
      } else {
        gradient += `, ${color} ${startAngle}deg ${endAngle}deg`
      }
    })
    gradient += ')'
    return gradient
  }

  const handleSpin = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setSelectedPrize(null)

    // Rotação aleatória (múltiplas voltas + posição final aleatória)
    const spins = 4 + Math.random() * 3 // 4-7 voltas completas
    const randomPrize = Math.floor(Math.random() * wheelPrizes.length)
    const prizeAngle = randomPrize * sectorAngle
    
    // Rotação total = voltas + ângulo do prémio - ajuste para o ponteiro ficar no topo
    const totalRotation = rotation + (spins * 360) + prizeAngle - (sectorAngle / 2) + 90
    
    setRotation(totalRotation)

    // Quando a animação terminar
    setTimeout(() => {
      const prize = wheelPrizes[randomPrize]
      setSelectedPrize(prize)
      setIsSpinning(false)

      // Registar tentativa (wheel sempre ganha)
      if (onGameAttempt && day) {
        onGameAttempt('wheel', day, {
          won: true,
          attempts: 1,
          errors: 0,
          score: null,
          metadata: { prize: prize.name },
        })
      }

      if (onWin) {
        onWin(prize)
      }
      if (onComplete) {
        onComplete(true, prize)
      }
    }, 4000)
  }

  // Extrair emoji e texto separadamente
  const parsePrizeName = (name) => {
    const emojiMatch = name.match(/[\u{1F300}-\u{1F9FF}]/gu)
    const emoji = emojiMatch ? emojiMatch[0] : ''
    const text = name.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()
    return { emoji, text }
  }

  return (
    <div className="wheel-container">
      <div className="wheel-header">
        <h2>🎰 Roda da Sorte</h2>
        <p className="wheel-instruction">
          Gira a roda e ganha um prémio aleatório!
        </p>
      </div>

      <div className="wheel-game-area">
        <div className="wheel-wrapper">
          <div className="wheel-pointer">▲</div>
          <div
            ref={wheelRef}
            className={`wheel ${isSpinning ? 'spinning' : ''}`}
            style={{
              transform: `rotate(${rotation}deg)`,
              background: createConicGradient(),
            }}
          >
            {/* Linhas separadoras entre setores */}
            {wheelPrizes.map((prize, index) => {
              const separatorAngle = index * sectorAngle - 90
              return (
                <div
                  key={`separator-${prize.id}`}
                  className="wheel-separator"
                  style={{
                    transform: `rotate(${separatorAngle}deg)`,
                  }}
                />
              )
            })}
            
            {/* Labels dos prémios - apenas emoji */}
            {wheelPrizes.map((prize, index) => {
              const { emoji } = parsePrizeName(prize.name)
              const angle = (index * sectorAngle) + (sectorAngle / 2) - 90
              
              return (
                <div
                  key={prize.id}
                  className="wheel-sector-label"
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <div className="sector-label-content">
                    <span className="sector-emoji">{emoji}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button
          className={`wheel-spin-button ${isSpinning ? 'spinning' : ''}`}
          onClick={handleSpin}
          disabled={isSpinning}
        >
          {isSpinning ? '🔄 A girar...' : '🎰 Girar a Roda'}
        </button>

        {selectedPrize && (
          <div className="wheel-result">
            <div className="result-content">
              <h3>🎉 Parabéns!</h3>
              <div className="result-prize">
                <div className="result-icon">{parsePrizeName(selectedPrize.name).emoji}</div>
                <div className="result-name">{selectedPrize.name}</div>
                <div className="result-description">{selectedPrize.description}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wheel