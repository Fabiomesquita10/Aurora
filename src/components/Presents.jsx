import React from 'react'
import { useGameState } from '../utils/gameState'
import { DAILY_GIFTS, SHOP_ITEMS } from '../utils/gameState'
import './Presents.css'

function Presents() {
  const { unlockedDays, wonGames, purchasedItems } = useGameState()

  // Só mostrar presentes de jogos ganhos (não apenas desbloqueados)
  // Remover duplicados - um presente por dia apenas
  const uniqueWonDays = [...new Set(
    wonGames
      .filter(g => g.gameId === 'daily-game')
      .map(game => game.day)
  )]
  
  const earnedPresents = uniqueWonDays
    .map(day => ({
      day: day,
      gift: DAILY_GIFTS[day] || { 
        title: `Presente do Dia ${day}`, 
        description: 'Um presente especial', 
        points: 10,
        category: 'Low',
        estimatedPrice: 0
      },
      earned: true,
      type: 'daily'
    }))
    .sort((a, b) => a.day - b.day)

  // Itens comprados na loja
  const shopPresents = purchasedItems
    .map(itemId => {
      const item = SHOP_ITEMS.find(i => i.id === itemId)
      if (!item) return null
      return {
        id: `shop-${itemId}`,
        gift: {
          title: item.name,
          description: item.description,
          points: item.price,
          category: 'Loja',
          estimatedPrice: 0
        },
        earned: true,
        type: 'shop',
        purchaseDate: new Date().toISOString()
      }
    })
    .filter(Boolean)

  // Combinar presentes diários e da loja
  const allPresents = [...earnedPresents, ...shopPresents]

  const totalPresents = allPresents.length
  const unwrappedPresents = allPresents.filter(p => !p.earned).length

  return (
    <div className="presents-container">
      <h2 className="presents-title">🎁 Os Teus Presentes</h2>
      
      <div className="presents-stats">
        <div className="stat-card">
          <div className="stat-value">{totalPresents}</div>
          <div className="stat-label">Presentes Desbloqueados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalPresents - unwrappedPresents}</div>
          <div className="stat-label">Presentes Ganhos</div>
        </div>
      </div>

      {totalPresents === 0 ? (
        <div className="no-presents">
          <p>😔 Ainda não desbloqueaste nenhum dia!</p>
          <p>Vai ao calendário e começa a jogar ou compra algo na loja.</p>
        </div>
      ) : (
        <div className="presents-grid">
          {allPresents.map((present) => {
            const { day, gift, earned, type, id } = present
            const key = type === 'shop' ? id : `day-${day}`
            
            return (
              <div key={key} className={`present-card ${earned ? 'earned' : 'pending'} ${type === 'shop' ? 'shop-item' : ''}`}>
                <div className="present-header">
                  {type === 'shop' ? (
                    <div className="present-day">{gift.title}</div>
                  ) : (
                    <div className="present-day">Dia {day}</div>
                  )}
                  {earned ? (
                    <div className="present-status">✅ {type === 'shop' ? 'Comprado' : 'Ganho'}</div>
                  ) : (
                    <div className="present-status">⏳ Pendente</div>
                  )}
                </div>
                <div className="present-content">
                  <div className="present-category">{gift.category}</div>
                  {type === 'shop' ? (
                    <h3>{gift.title}</h3>
                  ) : (
                    <h3>{gift.title}</h3>
                  )}
                  <p>{gift.description}</p>
                  <div className="present-details">
                    {type === 'shop' ? (
                      <div className="present-points">
                        <span>💎 {gift.points} pontos gastos</span>
                      </div>
                    ) : (
                      <>
                        <div className="present-points">
                          <span>💎 {gift.points} pontos</span>
                        </div>
                        {gift.estimatedPrice > 0 && (
                          <div className="present-price">
                            <span>💰 ~{gift.estimatedPrice}€</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Presents
