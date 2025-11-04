// Utilitários para gestão de datas e bloqueios
import { getGameOpenTime, getGameOpenDateTime } from './calendarConfig'

/**
 * Verifica se um dia de dezembro já pode ser desbloqueado
 * Baseado no horário de abertura do jogo configurado no JSON
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {boolean}
 */
export const canUnlockDay = (day) => {
  const gameOpenTime = getGameOpenTime(day)
  
  // Se não há configuração de horário, usa a lógica antiga como fallback
  if (!gameOpenTime) {
    const today = new Date()
    const currentYear = today.getFullYear()
    
    if (today.getMonth() !== 11) {
      return day === 1 && today.getFullYear() === currentYear
    }
    
    const decemberDate = new Date(currentYear, 11, day)
    
    if (day === 1) {
      return today.getDate() >= 1
    }
    
    const previousDay = new Date(decemberDate)
    previousDay.setDate(previousDay.getDate() - 1)
    previousDay.setHours(21, 0, 0, 0)
    
    return today >= previousDay
  }
  
  // Usar o horário configurado no JSON
  const openDateTime = getGameOpenDateTime(day, gameOpenTime)
  if (!openDateTime) return false
  
  const today = new Date()
  return today >= openDateTime
}

/**
 * Retorna a data/hora de desbloqueio de um dia
 * Baseado no horário de abertura do jogo configurado no JSON
 * @param {number} day - Dia de dezembro (1-25)
 * @returns {Date}
 */
export const getUnlockTime = (day) => {
  const gameOpenTime = getGameOpenTime(day)
  
  // Se não há configuração, usa a lógica antiga como fallback
  if (!gameOpenTime) {
    const today = new Date()
    const currentYear = today.getFullYear()
    const unlockDate = new Date(currentYear, 11, day)
    
    if (day === 1) {
      unlockDate.setHours(0, 0, 0, 0)
    } else {
      unlockDate.setDate(unlockDate.getDate() - 1)
      unlockDate.setHours(21, 0, 0, 0)
    }
    
    return unlockDate
  }
  
  // Usar o horário configurado no JSON
  const openDateTime = getGameOpenDateTime(day, gameOpenTime)
  return openDateTime || new Date()
}

/**
 * Formata o tempo restante até o desbloqueio
 * @param {Date} unlockTime - Data de desbloqueio
 * @returns {string}
 */
export const formatTimeUntilUnlock = (unlockTime) => {
  const now = new Date()
  const diff = unlockTime - now
  
  if (diff <= 0) return 'Já disponível!'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Verifica se é o dia atual
 * @param {number} day - Dia de dezembro
 * @returns {boolean}
 */
export const isToday = (day) => {
  const today = new Date()
  return today.getMonth() === 11 && today.getDate() === day
}

