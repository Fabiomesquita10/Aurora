import React from 'react'
import { useGameState } from '../utils/gameState'
import { SHOP_ITEMS } from '../utils/gameState'
import './Shop.css'

function Shop() {
  const { points, purchasedItems, purchaseItem } = useGameState()

  const handlePurchase = (item) => {
    // Se não for repetível e já foi comprado, não permite comprar novamente
    if (!item.repeatable && purchasedItems.includes(item.id)) {
      alert('Já compraste este item!')
      return
    }

    if (points >= item.price) {
      if (window.confirm(`Tens a certeza que queres comprar ${item.name} por ${item.price} pontos?`)) {
        purchaseItem(item.id, item.price) // Passar o preço para atualizar spentPoints
        alert(`🎉 Compraste ${item.name}!`)
      }
    } else {
      alert(`Não tens pontos suficientes! Precisas de ${item.price} pontos.`)
    }
  }

  return (
    <div className="shop-container">
      <h2 className="shop-title">🛍️ Loja de Presentes</h2>
      
      <div className="shop-balance">
        <div className="balance-card">
          <span className="balance-icon">💎</span>
          <span className="balance-amount">{points}</span>
          <span className="balance-label">Pontos Disponíveis</span>
        </div>
      </div>

      <div className="shop-items">
        {SHOP_ITEMS.map((item) => {
          const isPurchased = !item.repeatable && purchasedItems.includes(item.id)
          const canAfford = points >= item.price

          return (
            <div
              key={item.id}
              className={`shop-item ${isPurchased ? 'purchased' : ''} ${canAfford ? 'affordable' : ''}`}
            >
              <div className="item-icon">{item.icon}</div>
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                {item.repeatable && (
                  <p className="repeatable-badge">🔄 Pode comprar várias vezes</p>
                )}
                <div className="item-price">
                  <span>💎 {item.price} pontos</span>
                </div>
              </div>
              <button
                className={`purchase-button ${isPurchased ? 'purchased' : ''} ${canAfford ? '' : 'disabled'}`}
                onClick={() => handlePurchase(item)}
                disabled={isPurchased || !canAfford}
              >
                {isPurchased ? '✅ Comprado' : 'Comprar'}
              </button>
            </div>
          )
        })}
      </div>

      {purchasedItems.length > 0 && (
        <div className="purchased-section">
          <h3>Os Teus Artigos Comprados</h3>
          <div className="purchased-items">
            {SHOP_ITEMS.filter(item => purchasedItems.includes(item.id)).map(item => (
              <div key={item.id} className="purchased-item">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Shop
