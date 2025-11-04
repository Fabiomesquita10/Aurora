import React, { useState } from 'react'
import { getFinalPhrase, getPhraseExplanation, getAllWordleWords } from '../utils/wordlePhrase'
import './FinalPhrase.css'

function FinalPhrase() {
  const [showExplanation, setShowExplanation] = useState(false)
  const words = getAllWordleWords()
  const phrase = getFinalPhrase()
  const explanation = getPhraseExplanation()

  return (
    <div className="final-phrase-container">
      <div className="final-phrase-content">
        <h2 className="final-phrase-title">🎉 Enigma Final Desbloqueado! 🎉</h2>
        
        <div className="final-phrase-display">
          <p className="phrase-text">{phrase}</p>
        </div>

        <button 
          className="explanation-button"
          onClick={() => setShowExplanation(!showExplanation)}
        >
          {showExplanation ? 'Ocultar' : 'Mostrar'} Explicação
        </button>

        {showExplanation && (
          <div className="explanation-box">
            <p className="explanation-text">{explanation}</p>
            <div className="words-list">
              <h3>As 25 Palavras:</h3>
              <div className="words-grid">
                {words.map((wordData, index) => (
                  <div key={index} className="word-item">
                    <span className="word-day">Dia {wordData.day}:</span>
                    <span className="word-word">{wordData.word}</span>
                    <span className="word-initial">({wordData.initial})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FinalPhrase

