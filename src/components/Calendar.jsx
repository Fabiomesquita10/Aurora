import React, { useState, useEffect, useMemo } from 'react'
import { useGameState } from '../utils/gameState'
import { canUnlockDay as checkCanUnlockDay, getUnlockTime, formatTimeUntilUnlock } from '../utils/dateUtils'
import { getCurrentProfile } from '../utils/userProfiles'
import { isAccountActive } from '../utils/accounts'
import { getDayGift, getDayGame, getGameOpenTime, getDayGameWord, getDayGameNumbers, getDayGamePhrase, getDayGamePrizes, getDayGameQuestions, getDayGameTriviaQuestions, getDayGameRounds, getDayGameRiddles, getDayGameEncodedText, getDayGameDecodedText, getDayGameCipherType, getDayGameCipherRule, getDayGameSudokuPuzzle, getDayGameSudokuSolution, getDayGameSudokuInitial, getDayGameSudokuHint, getDayGameWords, getDayGameGridSize, getDayGameTargetHearts, getDayGameDuration, getDayGameMaxAttempts, getDayGameSentence, getDayGameMazeSize, getDayGameDifficulty, getDayGameCorrectWire, getDayGameRules, getDayGameMaxTime, getDayGameMathQuestions, getDayGameEvents, getDayGameImageUrl, getDayGameNumberOfBalls, getDayGameSequences, getDayGameDoubleReflexRounds, getDayGameDoubleReflexButtons, getDayGamePairs, getDayGameQRCodes, getDayGamePhotos, getDayGameBoxes, getDayGameHint, getDayGameSongs, getDayGameCards, getDayGameNumberSequences, getDayGameFastMathQuestions, getDayGameMathTimeLimit, getDayGamePatterns } from '../utils/calendarConfig'
import { getWordleWordForDay } from '../utils/wordlePhrase'
import WordleRomantico from '../games/WordleRomantico/WordleRomantico'
import T9Encoding from '../games/T9Encoding/T9Encoding'
import Wheel from '../games/Wheel/Wheel'
import Quiz from '../games/Quiz/Quiz'
import Trivia from '../games/Trivia/Trivia'
import ReflexGame from '../games/ReflexGame/ReflexGame'
import MiniRiddles from '../games/MiniRiddles/MiniRiddles'
import Cryptogram from '../games/Cryptogram/Cryptogram'
import MiniSudoku from '../games/MiniSudoku/MiniSudoku'
import WordSearch from '../games/WordSearch/WordSearch'
import CatchHearts from '../games/CatchHearts/CatchHearts'
import ScrambledSentence from '../games/ScrambledSentence/ScrambledSentence'
import MazeHeart from '../games/MazeHeart/MazeHeart'
import BombWire from '../games/BombWire/BombWire'
import Timeline from '../games/Timeline/Timeline'
import Puzzle from '../games/Puzzle/Puzzle'
import Simon from '../games/Simon/Simon'
import DoubleReflex from '../games/DoubleReflex/DoubleReflex'
import PairMatching from '../games/PairMatching/PairMatching'
import QRCodeReader from '../games/QRCodeReader/QRCodeReader'
import PhotoTrivia from '../games/PhotoTrivia/PhotoTrivia'
import BoxChoice from '../games/BoxChoice/BoxChoice'
import MusicalQuiz from '../games/MusicalQuiz/MusicalQuiz'
import MemoryGame from '../games/MemoryGame/MemoryGame'
import NumberSequence from '../games/NumberSequence/NumberSequence'
import FastMath from '../games/FastMath/FastMath'
import PatternRecognition from '../games/PatternRecognition/PatternRecognition'
import PrizeModal from './PrizeModal'
import bgImage from '../public/images/bgImage.jpg'
import './Calendar.css'
import './GameSelection.css'

const DAYS = Array.from({ length: 25 }, (_, i) => i + 1)

// ============================================
// IMAGEM DE FUNDO DO CALENDÁRIO
// ============================================
// A imagem bgImage.jpg está a ser usada como fundo do calendário.
// Para usar uma imagem diferente, substitui o import acima e atualiza a constante abaixo.
// Exemplo: import minhaImagem from '../caminho/para/imagem.jpg'
// ============================================
const CALENDAR_BACKGROUND_IMAGE = bgImage

// Função para gerar número pseudo-aleatório determinístico
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Função para embaralhar array usando Fisher-Yates com seed
function shuffleArray(array, seed) {
  const shuffled = [...array]
  let randomIndex
  let currentIndex = shuffled.length
  
  while (currentIndex !== 0) {
    const randomValue = seededRandom(seed + currentIndex)
    randomIndex = Math.floor(randomValue * currentIndex)
    currentIndex--
    
    // Trocar elementos
    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex]
    ]
  }
  
  return shuffled
}

// ============================================
// POSIÇÕES MANUAIS DO CALENDÁRIO
// ============================================
// Posições base bem distribuídas, depois randomizadas
// Os números são embaralhados e as posições têm pequenas variações
// Seed fixo (2024) garante consistência entre renderizações
// ============================================
function getManualPositions(seed = 2024) {
  // Posições base bem distribuídas para evitar sobreposições
  // Distribuição orgânica mas controlada
  // Área útil: 12% a 88% (76% x 76%)
  
  const basePositions = [
    // Topo esquerdo
    { x: 18, y: 18, rotation: -4 },
    { x: 38, y: 15, rotation: 3 },
    { x: 58, y: 17, rotation: -2 },
    { x: 78, y: 19, rotation: 5 },
    { x: 88, y: 22, rotation: -3 },
    
    // Parte superior
    { x: 15, y: 35, rotation: 2 },
    { x: 35, y: 33, rotation: -5 },
    { x: 52, y: 32, rotation: 4 },
    { x: 72, y: 34, rotation: -2 },
    { x: 85, y: 38, rotation: 3 },
    
    // Centro
    { x: 17, y: 50, rotation: -3 },
    { x: 36, y: 48, rotation: 4 },
    { x: 50, y: 50, rotation: -1 },
    { x: 68, y: 52, rotation: 2 },
    { x: 83, y: 50, rotation: -4 },
    
    // Parte inferior
    { x: 16, y: 65, rotation: 3 },
    { x: 34, y: 67, rotation: -2 },
    { x: 54, y: 68, rotation: 5 },
    { x: 74, y: 66, rotation: -3 },
    { x: 86, y: 62, rotation: 2 },
    
    // Baixo
    { x: 20, y: 82, rotation: -4 },
    { x: 40, y: 85, rotation: 3 },
    { x: 60, y: 83, rotation: -2 },
    { x: 80, y: 81, rotation: 4 },
    { x: 88, y: 78, rotation: -3 },
  ]
  
  // Embaralhar os números 1-25
  const days = Array.from({ length: 25 }, (_, i) => i + 1)
  const shuffledDays = shuffleArray(days, seed)
  
  // Criar posições finais com variações aleatórias
  const positions = basePositions.map((basePos, index) => {
    const day = shuffledDays[index]
    
    // Adicionar pequena variação aleatória nas posições (±4%)
    const xVariation = (seededRandom(seed + day * 100) - 0.5) * 8
    const yVariation = (seededRandom(seed + day * 200) - 0.5) * 8
    
    // Variação na rotação (±3 graus)
    const rotationVariation = (seededRandom(seed + day * 300) - 0.5) * 6
    
    // Calcular posição final
    const x = Math.max(12, Math.min(88, basePos.x + xVariation))
    const y = Math.max(12, Math.min(88, basePos.y + yVariation))
    const rotation = basePos.rotation + rotationVariation
    
    return {
      day,
      x,
      y,
      rotation
    }
  })
  
  return positions
}

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

  const handleDayClick = async (day) => {
    // Verificar se está autenticado
    const profile = getCurrentProfile()
    if (!profile) {
      alert('🔒 Por favor, faz login primeiro! Vai à secção "Perfis" para fazer login.')
      return
    }
    
    // Verificar se a conta está ativa
    if (profile.accountId) {
      const active = await isAccountActive(profile.accountId)
      if (!active) {
        alert('⚠️ A tua conta não está ativa. Contacta o administrador.')
        return
      }
    }
    
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

  // Usar posições manuais com números randomizados e variações nas posições
  // Seed fixo (2024) garante que as posições são consistentes entre renderizações
  // Mas os números aparecem em ordem diferente e as posições têm pequenas variações
  const dayPositions = useMemo(() => getManualPositions(2024), [])

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
    const gameImageUrl = getDayGameImageUrl(gameDay)
    const gameNumberOfBalls = getDayGameNumberOfBalls(gameDay)
    const gameSequences = getDayGameSequences(gameDay)
    const gameDoubleReflexRounds = getDayGameDoubleReflexRounds(gameDay)
    const gameDoubleReflexButtons = getDayGameDoubleReflexButtons(gameDay)
    const gamePairs = getDayGamePairs(gameDay)
    const gameQRCodes = getDayGameQRCodes(gameDay)
    const gamePhotos = getDayGamePhotos(gameDay)
    const gameBoxes = getDayGameBoxes(gameDay)
    const gameHint = getDayGameHint(gameDay)
    const gameSongs = getDayGameSongs(gameDay)
    const gameCards = getDayGameCards(gameDay)
    const gameNumberSequences = getDayGameNumberSequences(gameDay)
    const gameFastMathQuestions = getDayGameFastMathQuestions(gameDay)
    const gameFastMathTimeLimit = getDayGameMathTimeLimit(gameDay)
    const gamePatterns = getDayGamePatterns(gameDay)
    
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
        case 'puzzle-tiles':
          return (
            <Puzzle
              gridSize={gameGridSize || 3}
              imageUrl={gameImageUrl}
              difficulty={gameDifficulty || 'medium'}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'simon':
          return (
            <Simon
              numberOfBalls={gameNumberOfBalls || 4}
              sequences={gameSequences}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'double-reflex':
          return (
            <DoubleReflex
              rounds={gameDoubleReflexRounds || 10}
              numberOfButtons={gameDoubleReflexButtons || 9}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'pair-matching':
          return (
            <PairMatching
              pairs={gamePairs}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'qr-code':
          return (
            <QRCodeReader
              qrCodes={gameQRCodes}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'photo-trivia':
          return (
            <PhotoTrivia
              photos={gamePhotos}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'box-choice':
          return (
            <BoxChoice
              boxes={gameBoxes}
              hint={gameHint}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'musical-quiz':
          return (
            <MusicalQuiz
              songs={gameSongs}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'memory-game':
          return (
            <MemoryGame
              cards={gameCards}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'number-sequence':
          return (
            <NumberSequence
              sequences={gameNumberSequences}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'fast-math':
          return (
            <FastMath
              questions={gameFastMathQuestions}
              timeLimit={gameFastMathTimeLimit}
              day={gameDay}
              onWin={handleGameWin}
              onComplete={handleGameComplete}
              onGameAttempt={addGameAttempt}
            />
          )
        case 'pattern-recognition':
          return (
            <PatternRecognition
              patterns={gamePatterns}
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
      
      <div 
        className="calendar-background-wrapper"
        style={CALENDAR_BACKGROUND_IMAGE ? {
          backgroundImage: `url(${CALENDAR_BACKGROUND_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          maxWidth: '100%'
        } : {
          width: '100%',
          maxWidth: '100%'
        }}
      >
        <div className={`calendar-days-overlay ${CALENDAR_BACKGROUND_IMAGE ? 'has-background' : ''}`}>
          {dayPositions.map(({ day, x, y, rotation }) => {
            const status = getDayStatus(day)
            const isToday = isDecember && currentDay === day
            const unlockInfo = getDayUnlockInfo(day)
            const game = getDayGame(day)
            const gameOpenTime = game ? game.openTime : null
            
            const dayStyle = {
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              '--rotation': `${rotation}deg`,
            }
            
            // Só mostrar o número se o dia não estiver bloqueado
            const isLocked = status === 'locked'
            const isWon = hasWonGame(day)
            
            // Adicionar classe not-won apenas para dias desbloqueados que ainda não foram completados
            const shouldBlink = status === 'unlocked' && !isWon
            
            return (
              <div
                key={day}
                className={`calendar-day ${status} ${isToday ? 'today' : ''} ${isWon ? 'won' : ''} ${shouldBlink ? 'not-won' : ''}`}
                onClick={() => status !== 'locked' && handleDayClick(day)}
                title={gameOpenTime ? `Jogo abre às ${gameOpenTime}` : undefined}
                style={dayStyle}
              >
                {/* Sempre mostrar o número - único elemento visível quando não desbloqueado */}
                <div className="day-number">{day}</div>
                
                {/* Mostrar elementos apenas quando desbloqueado */}
                {status === 'unlocked' && (
                  <>
                    {isWon && (
                      <div className="day-icon">✅</div>
                    )}
                    {!isWon && (
                      <div className="day-icon">🎁</div>
                    )}
                    {gameOpenTime && (
                      <div className="game-open-time">⏰ {gameOpenTime}</div>
                    )}
                  </>
                )}
                
                {/* Quando bloqueado ou available - não mostrar nada além do número */}
                
                {isToday && status === 'unlocked' && <div className="today-badge">Hoje</div>}
              </div>
            )
          })}
        </div>
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
