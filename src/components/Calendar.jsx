import React, { useState, useEffect } from 'react'
import { useGameState } from '../utils/gameState'
import { canUnlockDay as checkCanUnlockDay, getUnlockTime, formatTimeUntilUnlock } from '../utils/dateUtils'
import { getDayGift, getDayGame, getGameOpenTime, getDayGameWord, getDayGameNumbers, getDayGamePhrase, getDayGamePrizes, getDayGameQuestions, getDayGameTriviaQuestions, getDayGameRounds, getDayGameRiddles, getDayGameEncodedText, getDayGameDecodedText, getDayGameCipherType, getDayGameCipherRule, getDayGameSudokuPuzzle, getDayGameSudokuSolution, getDayGameSudokuInitial, getDayGameSudokuHint, getDayGameWords, getDayGameGridSize, getDayGameTargetHearts, getDayGameDuration, getDayGameMaxAttempts, getDayGameSentence, getDayGameMazeSize, getDayGameDifficulty, getDayGameCorrectWire, getDayGameRules, getDayGameMaxTime, getDayGameMathQuestions, getDayGameEvents } from '../utils/calendarConfig'
import { getWordleWordForDay } from '../utils/wordlePhrase'
import WordleRomantico from '../games/WordleRomantico'
import T9Encoding from '../games/T9Encoding'
import Wheel from '../games/Wheel'
import Quiz from '../games/Quiz'
import Trivia from '../games/Trivia'
import ReflexGame from '../games/ReflexGame'
import MiniRiddles from '../games/MiniRiddles'
import Cryptogram from '../games/Cryptogram'
import MiniSudoku from '../games/MiniSudoku'
import WordSearch from '../games/WordSearch'
import CatchHearts from '../games/CatchHearts'
import ScrambledSentence from '../games/ScrambledSentence'
import MazeHeart from '../games/MazeHeart'
import BombWire from '../games/BombWire'
import Timeline from '../games/Timeline'
import PrizeModal from './PrizeModal'
import './Calendar.css'
import './GameSelection.css'

const DAYS = Array.from({ length: 25 }, (_, i) => i + 1)

function Calendar({ onNavigateToPresents }) {
  const { unlockedDays, unlockDay, addWonGame, addGameAttempt, addPoints, calculateWordlePoints, DEV_MODE, wonGames } = useGameState()
  const [selectedDay, setSelectedDay] = useState(null)
  const [gameDay, setGameDay] = useState(null)
  const [gameMode, setGameMode] = useState(null) // 'main' ou 'wordle'
  const [showPrizeModal, setShowPrizeModal] = useState(false)
  const [prizeDay, setPrizeDay] = useState(null)

  // Verificar se pode desbloquear dia (modo dev desbloqueia tudo)
  const canUnlock = (day) => {
    if (DEV_MODE) return true
    return checkCanUnlockDay(day) || unlockedDays.includes(day - 1) || day === 1
  }

  const handleDayClick = (day) => {
    if (canUnlock(day)) {
      if (!unlockedDays.includes(day)) {
        unlockDay(day)
      }
      setSelectedDay(day)
      setGameDay(day)
      setGameMode(null) // Reset para escolher jogo
    }
  }

  const handleSelectGame = (mode) => {
    setGameMode(mode)
  }

  const handleGameWin = (attempts) => {
    if (gameDay) {
      const gameId = gameMode === 'wordle' ? 'wordle-extra' : 'daily-game'
      addWonGame(gameId, gameDay, { attempts })
      
      // Não dar pontos aqui - os pontos são calculados dinamicamente dos scores guardados
      
      // Mostrar modal de prémio imediatamente para o jogo principal (não wordle extra)
      if (gameMode === 'main' || gameMode === null) {
        // Fechar o jogo imediatamente e mostrar o modal
        setGameDay(null)
        setSelectedDay(null)
        setGameMode(null)
        setPrizeDay(gameDay)
        setShowPrizeModal(true)
      } else {
        // Para wordle extra, apenas voltar ao calendário
        setTimeout(() => {
          setGameDay(null)
          setSelectedDay(null)
          setGameMode(null)
        }, 2000)
      }
    }
  }

  const handleClosePrizeModal = () => {
    setShowPrizeModal(false)
    setPrizeDay(null)
    // Voltar ao calendário após fechar o modal
    setGameDay(null)
    setSelectedDay(null)
    setGameMode(null)
  }

  const handleViewAllPresents = () => {
    setShowPrizeModal(false)
    setPrizeDay(null)
    // Navegar para a página de prémios
    if (onNavigateToPresents) {
      onNavigateToPresents()
    }
    // Voltar ao calendário
    setGameDay(null)
    setSelectedDay(null)
    setGameMode(null)
  }

  const handleGameComplete = (attempts, won) => {
    // Apenas registar, sem dar pontos
  }

  const handleGameAttempt = async (gameType, day, gameData = {}) => {
    // Se for wordle, calcular o score antes de guardar
    if (gameType === 'wordle' && gameData.won && gameData.attempts) {
      const score = calculateWordlePoints(gameData.attempts)
      gameData.score = score
    }
    
    // Chamar addGameAttempt com os dados atualizados
    await addGameAttempt(gameType, day, gameData)
  }

  const getDayStatus = (day) => {
    if (DEV_MODE) {
      return unlockedDays.includes(day) ? 'unlocked' : 'available'
    }
    if (unlockedDays.includes(day)) {
      return 'unlocked'
    }
    if (checkCanUnlockDay(day)) {
      return 'available'
    }
    return 'locked'
  }

  const hasWonGame = (day) => {
    return wonGames.some(g => g.day === day)
  }

  const getDayUnlockInfo = (day) => {
    if (unlockedDays.includes(day) || checkCanUnlockDay(day)) {
      return null
    }
    const unlockTime = getUnlockTime(day)
    return formatTimeUntilUnlock(unlockTime)
  }

  const today = new Date()
  const currentDay = today.getDate()
  const isDecember = today.getMonth() === 11

  if (gameDay) {
    const game = getDayGame(gameDay)
    const gameType = game?.type || 'wordle'
    
    // Se ainda não escolheu o modo de jogo, mostrar seleção
    if (!gameMode) {
      return (
        <div className="calendar-game">
          <div className="game-header">
            <button className="back-button" onClick={() => {
              setGameDay(null)
              setSelectedDay(null)
            }}>
              ← Voltar ao Calendário
            </button>
            <h2>Dia {gameDay} de Dezembro</h2>
          </div>
          <div className="game-selection">
            <h3>Escolhe um jogo:</h3>
            <div className="game-selection-buttons">
              <button 
                className={`game-selection-button main-game ${wonGames.some(g => g.gameId === 'daily-game' && g.day === gameDay && g.won === true) ? 'completed' : ''}`}
                onClick={() => handleSelectGame('main')}
                disabled={wonGames.some(g => g.gameId === 'daily-game' && g.day === gameDay && g.won === true)}
              >
                <div className="game-icon">🎮</div>
                <div className="game-title">Jogo Principal</div>
                <div className="game-description">{game?.description || 'Jogo do dia'}</div>
                {wonGames.some(g => g.gameId === 'daily-game' && g.day === gameDay && g.won === true) && (
                  <div className="game-completed-badge">✅ Completado</div>
                )}
              </button>
              <button 
                className={`game-selection-button wordle-extra ${wonGames.some(g => g.gameId === 'wordle-extra' && g.day === gameDay && g.won === true) ? 'completed' : ''}`}
                onClick={() => handleSelectGame('wordle')}
                disabled={wonGames.some(g => g.gameId === 'wordle-extra' && g.day === gameDay && g.won === true)}
              >
                <div className="game-icon">📝</div>
                <div className="game-title">Wordle Extra</div>
                <div className="game-description">Descobre a palavra do dia!</div>
                {wonGames.some(g => g.gameId === 'wordle-extra' && g.day === gameDay && g.won === true) && (
                  <div className="game-completed-badge">✅ Completado</div>
                )}
              </button>
            </div>
          </div>
        </div>
      )
    }

    const gameWord = gameMode === 'wordle' ? getWordleWordForDay(gameDay) : getDayGameWord(gameDay)
    const gameNumbers = getDayGameNumbers(gameDay)
    const gamePhrase = getDayGamePhrase(gameDay)
    const gamePrizes = getDayGamePrizes(gameDay)
    const gameQuestions = getDayGameQuestions(gameDay)
    const gameTriviaQuestions = getDayGameTriviaQuestions(gameDay)
    const gameRounds = getDayGameRounds(gameDay)
    const gameRiddles = getDayGameRiddles(gameDay)
    const gameEncodedText = getDayGameEncodedText(gameDay)
    const gameDecodedText = getDayGameDecodedText(gameDay)
    const gameCipherType = getDayGameCipherType(gameDay)
    const gameCipherRule = getDayGameCipherRule(gameDay)
    const gameSudokuPuzzle = getDayGameSudokuPuzzle(gameDay)
    const gameSudokuSolution = getDayGameSudokuSolution(gameDay)
    const gameSudokuInitial = getDayGameSudokuInitial(gameDay)
    const gameSudokuHint = getDayGameSudokuHint(gameDay)
    const gameWords = getDayGameWords(gameDay)
    const gameGridSize = getDayGameGridSize(gameDay)
    const gameTargetHearts = getDayGameTargetHearts(gameDay)
    const gameDuration = getDayGameDuration(gameDay)
    const gameMaxAttempts = getDayGameMaxAttempts(gameDay)
    const gameSentence = getDayGameSentence(gameDay)
    const gameMazeSize = getDayGameMazeSize(gameDay)
    const gameDifficulty = getDayGameDifficulty(gameDay)
    const gameCorrectWire = getDayGameCorrectWire(gameDay)
    const gameRules = getDayGameRules(gameDay)
    const gameMaxTime = getDayGameMaxTime(gameDay)
    const gameMathQuestions = getDayGameMathQuestions(gameDay)
    const gameEvents = getDayGameEvents(gameDay)
    
    // Verificar se o jogo já foi completado
    const isGameCompleted = (gameId) => {
      return wonGames.some(g => g.gameId === gameId && g.day === gameDay && g.won === true)
    }

    // Renderizar tela de bloqueio
    const renderBlockedGame = (gameTitle) => {
      return (
        <div className="game-blocked-container">
          <div className="game-blocked-content">
            <h2>🔒 Jogo Já Completado</h2>
            <p>Já completaste este jogo!</p>
            <p className="game-blocked-title">{gameTitle}</p>
            <button className="game-blocked-button" onClick={() => {
              setGameDay(null)
              setSelectedDay(null)
              setGameMode(null)
            }}>
              Voltar ao Calendário
            </button>
          </div>
        </div>
      )
    }

    // Renderizar o jogo correto baseado no tipo
    const renderGame = () => {
      // Verificar se wordle extra já foi completado
      if (gameMode === 'wordle') {
        const wordleGameId = 'wordle-extra'
        if (isGameCompleted(wordleGameId)) {
          return renderBlockedGame('Wordle Extra')
        }
        return (
          <WordleRomantico
            targetWord={gameWord}
            day={gameDay}
            onWin={handleGameWin}
            onComplete={handleGameComplete}
            onGameAttempt={handleGameAttempt}
            calculateWordlePoints={calculateWordlePoints}
          />
        )
      }

      // Verificar se o jogo principal já foi completado
      const mainGameId = 'daily-game'
      if (isGameCompleted(mainGameId)) {
        return renderBlockedGame(game?.description || 'Jogo do Dia')
      }

      // Caso contrário, renderizar o jogo principal
      switch (gameType) {
        case 't9-encoding':
          return (
            <T9Encoding
              numbers={gameNumbers}
              targetWord={gamePhrase ? null : gameWord}
              targetPhrase={gamePhrase}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'wheel':
          return (
            <Wheel
              prizes={gamePrizes}
              day={gameDay}
              onWin={(prize) => handleGameWin(0)} // Wheel sempre ganha
              onComplete={(won, prize) => handleGameComplete(0, won)}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'quiz':
          return (
            <Quiz
              questions={gameQuestions}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'trivia':
          return (
            <Trivia
              questions={gameTriviaQuestions}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'reflex':
          return (
            <ReflexGame
              rounds={gameRounds}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'riddles':
          return (
            <MiniRiddles
              riddles={gameRiddles}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'cryptogram':
          return (
            <Cryptogram
              encodedText={gameEncodedText}
              decodedText={gameDecodedText}
              cipherType={gameCipherType}
              cipherRule={gameCipherRule}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'mini-sudoku':
          return (
            <MiniSudoku
              puzzle={gameSudokuPuzzle}
              solution={gameSudokuSolution}
              initial={gameSudokuInitial}
              hint={gameSudokuHint}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'word-search':
          return (
            <WordSearch
              words={gameWords}
              gridSize={gameGridSize}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'catch-hearts':
          return (
            <CatchHearts
              targetHearts={gameTargetHearts}
              gameDuration={gameDuration}
              maxAttempts={gameMaxAttempts}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'scrambled-sentence':
          return (
            <ScrambledSentence
              sentence={gameSentence}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'maze-heart':
          return (
            <MazeHeart
              mazeSize={gameMazeSize}
              difficulty={gameDifficulty}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'bomb-wire':
          return (
            <BombWire
              difficulty={gameDifficulty}
              rules={gameRules}
              maxTime={gameMaxTime}
              mathQuestions={gameMathQuestions}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'timeline':
          return (
            <Timeline
              events={gameEvents}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'wordle':
        default:
          return (
            <WordleRomantico
              targetWord={gameWord}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={handleGameAttempt}
              calculateWordlePoints={calculateWordlePoints}
            />
          )
      }
    }

    return (
      <div className="calendar-game">
        <div className="game-header">
          <button className="back-button" onClick={() => {
            setGameDay(null)
            setSelectedDay(null)
            setGameMode(null)
          }}>
            ← Voltar ao Calendário
          </button>
          <h2>Dia {gameDay} de Dezembro</h2>
          {gameMode === 'wordle' ? (
            <p className="game-description">📝 Wordle Extra - Palavra do dia</p>
          ) : (
            game && <p className="game-description">{game.description}</p>
          )}
        </div>
        {renderGame()}
      </div>
    )
  }

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">Calendário de Advento</h2>
      <p className="calendar-subtitle">Clica num dia para desbloquear e jogar!</p>
      
      <div className="calendar-grid">
        {DAYS.map((day) => {
          const status = getDayStatus(day)
          const isToday = isDecember && currentDay === day
          const unlockInfo = getDayUnlockInfo(day)
          const game = getDayGame(day)
          const gameOpenTime = game ? game.openTime : null
          
          return (
            <div
              key={day}
              className={`calendar-day ${status} ${isToday ? 'today' : ''} ${hasWonGame(day) ? 'won' : ''}`}
              onClick={() => status !== 'locked' && handleDayClick(day)}
              title={gameOpenTime ? `Jogo abre às ${gameOpenTime}` : undefined}
            >
              <div className="day-number">{day}</div>
              {hasWonGame(day) && (
                <div className="day-icon">✅</div>
              )}
              {status === 'unlocked' && !hasWonGame(day) && (
                <div className="day-icon">🎁</div>
              )}
              {status === 'locked' && (
                <>
                  <div className="day-icon">🔒</div>
                  {unlockInfo && (
                    <div className="unlock-time">{unlockInfo}</div>
                  )}
                  {gameOpenTime && (
                    <div className="game-open-time">⏰ {gameOpenTime}</div>
                  )}
                </>
              )}
              {status === 'available' && !hasWonGame(day) && (
                <>
                  <div className="day-icon">✨</div>
                  {gameOpenTime && (
                    <div className="game-open-time">⏰ {gameOpenTime}</div>
                  )}
                </>
              )}
              {isToday && <div className="today-badge">Hoje</div>}
            </div>
          )
        })}
      </div>

      {selectedDay && unlockedDays.includes(selectedDay) && hasWonGame(selectedDay) && (
        <div className="day-info">
          <h3>🎁 Prémio do Dia {selectedDay}</h3>
          {(() => {
            const gift = getDayGift(selectedDay)
            const game = getDayGame(selectedDay)
            return gift ? (
              <>
                <p className="gift-title">{gift.title}</p>
                <p className="gift-description">{gift.description}</p>
                {gift.estimatedPrice > 0 && (
                  <p className="gift-price">💰 ~{gift.estimatedPrice}€</p>
                )}
                {game && (
                  <p className="game-info">🎮 {game.description} - Abre às {game.openTime}</p>
                )}
              </>
            ) : null
          })()}
        </div>
      )}
      
      {selectedDay && unlockedDays.includes(selectedDay) && !hasWonGame(selectedDay) && (
        <div className="day-info">
          <h3>📅 Dia {selectedDay} de Dezembro</h3>
          {(() => {
            const gift = getDayGift(selectedDay)
            const game = getDayGame(selectedDay)
            return (
              <>
                {gift && (
                  <>
                    <p className="gift-preview">🎁 Prémio: {gift.title}</p>
                  </>
                )}
                {game && (
                  <p className="game-info">🎮 {game.description}</p>
                )}
              </>
            )
          })()}
        </div>
      )}

      {showPrizeModal && prizeDay && (
        <PrizeModal
          day={prizeDay}
          onClose={handleClosePrizeModal}
          onViewAllPresents={handleViewAllPresents}
        />
      )}
    </div>
  )
}

export default Calendar
