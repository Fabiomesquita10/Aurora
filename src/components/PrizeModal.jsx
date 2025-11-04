import React from 'react'
import { getDayGift } from '../utils/calendarConfig'
import './PrizeModal.css'

function PrizeModal({ day, onClose, onViewAllPresents }) {
  const gift = getDayGift(day)

  if (!gift) {
    return null
  }

  return (
    <div className="prize-modal-overlay" onClick={onClose}>
      <div className="prize-modal" onClick={(e) => e.stopPropagation()}>
        <div className="prize-modal-header">
          <h2>🎉 Parabéns!</h2>
          <button className="prize-modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="prize-modal-content">
          <div className="prize-icon">🎁</div>
          <h3 className="prize-title">Ganhaste o Prémio do Dia {day}!</h3>
          
          <div className="prize-details">
            <h4 className="prize-gift-title">{gift.title}</h4>
            <p className="prize-description">{gift.description}</p>
            
            <div className="prize-info">
              <div className="prize-points">
                <span className="prize-label">Pontos:</span>
                <span className="prize-value">💎 {gift.points}</span>
              </div>
              {gift.estimatedPrice > 0 && (
                <div className="prize-price">
                  <span className="prize-label">Valor estimado:</span>
                  <span className="prize-value">💰 ~{gift.estimatedPrice}€</span>
                </div>
              )}
              <div className="prize-category">
                <span className="prize-label">Categoria:</span>
                <span className="prize-value">{gift.category}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="prize-modal-actions">
          <button className="prize-button-view" onClick={onViewAllPresents}>
            Ver Todos os Prémios
          </button>
          <button className="prize-button-close" onClick={onClose}>
            Continuar a Jogar
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrizeModal

