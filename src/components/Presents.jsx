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
    .map(day => {
      // Encontrar o jogo ganho mais recente para este dia
      const dayGames = wonGames
        .filter(g => g.gameId === 'daily-game' && g.day === day)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      const latestGame = dayGames[0]
      
      return {
        day: day,
        gift: DAILY_GIFTS[day] || { 
          title: `Presente do Dia ${day}`, 
          description: 'Um presente especial', 
          points: 10,
          category: 'Low',
          estimatedPrice: 0
        },
        earned: true,
        type: 'daily',
        date: latestGame?.date || new Date().toISOString()
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Ordenar por data mais recente

  // Itens comprados na loja
  // Para itens da loja, precisamos de uma forma de rastrear quando foram comprados
  // Por enquanto, vamos usar a ordem de compra (últimos itens = mais recentes)
  const shopPresents = purchasedItems
    .map((itemId, index) => {
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
        date: new Date(Date.now() - (purchasedItems.length - index) * 1000).toISOString() // Aproximação: itens mais recentes têm timestamp maior
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Ordenar por data mais recente

  // Combinar presentes diários e da loja, ordenados por data mais recente
  const allPresents = [...earnedPresents, ...shopPresents]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)) // Ordenar todos por data mais recente

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
