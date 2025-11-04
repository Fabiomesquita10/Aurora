import wordlePhraseData from '../config/wordle-phrase.json'

// Obter a palavra do dia
export const getWordleWordForDay = (day) => {
  const wordData = wordlePhraseData.words.find(w => w.day === day)
  return wordData ? wordData.word : null
}

// Obter todas as palavras
export const getAllWordleWords = () => {
  return wordlePhraseData.words
}

// Obter a frase final
export const getFinalPhrase = () => {
  return wordlePhraseData.phrase
}

// Obter a explicação
export const getPhraseExplanation = () => {
  return wordlePhraseData.explanation
}

// Verificar se todos os wordles foram completados
export const checkAllWordlesCompleted = (wonGames) => {
  if (!wonGames || wonGames.length === 0) return false
  // Verificar se existem 25 jogos wordle-extra ganhos (um para cada dia)
  const wordleWins = wonGames.filter(g => 
    g.gameId === 'wordle-extra' && 
    g.day >= 1 && 
    g.day <= 25
  )
  const uniqueDays = [...new Set(wordleWins.map(g => g.day))]
  return uniqueDays.length === 25
}

