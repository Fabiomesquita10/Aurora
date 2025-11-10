import React, { useState } from 'react'
import { useGameState } from '../utils/gameState'
import { getCurrentProfile } from '../utils/userProfiles'
import { isAccountActive } from '../utils/accounts'
import { getDayGame, getDayGameWord, getDayGameNumbers, getDayGamePhrase, getDayGamePrizes, getDayGameQuestions, getDayGameTriviaQuestions, getDayGameRounds, getDayGameRiddles, getDayGameEncodedText, getDayGameDecodedText, getDayGameCipherType, getDayGameCipherRule, getDayGameSudokuPuzzle, getDayGameSudokuSolution, getDayGameSudokuInitial, getDayGameSudokuHint, getDayGameWords, getDayGameGridSize, getDayGameTargetHearts, getDayGameDuration, getDayGameMaxAttempts, getDayGameSentence, getDayGameMazeSize, getDayGameDifficulty, getDayGameCorrectWire, getDayGameRules, getDayGameMaxTime, getDayGameMathQuestions, getDayGameEvents, getDayGameImageUrl, getDayGameNumberOfBalls, getDayGameSequences, getDayGameDoubleReflexRounds, getDayGameDoubleReflexButtons, getDayGamePairs, getDayGameCards, getDayGameNumberSequences, getDayGameFastMathQuestions, getDayGameMathTimeLimit, getDayGamePatterns } from '../utils/calendarConfig'
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
import MemoryGame from '../games/MemoryGame/MemoryGame'
import NumberSequence from '../games/NumberSequence/NumberSequence'
import FastMath from '../games/FastMath/FastMath'
import PatternRecognition from '../games/PatternRecognition/PatternRecognition'
import { generateRandomSudoku } from '../utils/generateSudoku'
import './Playground.css'

function Playground() {
  const { wonGames } = useGameState()
  const [selectedGame, setSelectedGame] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  // Obter todos os jogos já jogados (daily-game)
  const playedGames = wonGames.filter(g => g.gameId === 'daily-game' && g.won === true)
  const uniqueGameDays = [...new Set(playedGames.map(g => g.day))].sort((a, b) => a - b)

  const handlePlayWordle = async () => {
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
    
    setSelectedGame('wordle')
    setSelectedDay(null)
  }

  const handlePlayGame = async (day) => {
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
    
    const game = getDayGame(day)
    if (game) {
      setSelectedGame(game.type)
      setSelectedDay(day)
    }
  }

  const handleBack = () => {
    setSelectedGame(null)
    setSelectedDay(null)
  }

  const getGameIcon = (gameType) => {
    const icons = {
      'wordle': '📝',
      't9-encoding': '📱',
      'wheel': '🎡',
      'quiz': '❓',
      'trivia': '🎯',
      'reflex': '⚡',
      'riddles': '🧩',
      'cryptogram': '🔐',
      'mini-sudoku': '🔢',
      'word-search': '🔍',
      'catch-hearts': '❤️',
      'scrambled-sentence': '🔤',
      'maze-heart': '🧭',
      'bomb-wire': '💣',
      'timeline': '📅',
      'puzzle-tiles': '🧩',
      'simon': '🎵',
      'double-reflex': '⚡⚡',
      'pair-matching': '🔗',
      'memory-game': '🧠',
      'number-sequence': '🔢',
      'fast-math': '⚡',
      'pattern-recognition': '🔍'
    }
    return icons[gameType] || '🎮'
  }

  const renderGame = () => {
    if (!selectedGame) return null

    // Wordle sempre disponível (modo aleatório)
    if (selectedGame === 'wordle' && !selectedDay) {
      return (
        <WordleRomantico 
          targetWord={null} 
          randomMode={true}
          onWin={() => {}}
          onComplete={() => {}}
        />
      )
    }

    // Se não há dia selecionado, não renderizar
    if (!selectedDay) return null

    const game = getDayGame(selectedDay)
    if (!game) return null

    // Obter dados do jogo
    const gameWord = getDayGameWord(selectedDay)
    const gameNumbers = getDayGameNumbers(selectedDay)
    const gamePhrase = getDayGamePhrase(selectedDay)
    const gamePrizes = getDayGamePrizes(selectedDay)
    const gameQuestions = getDayGameQuestions(selectedDay)
    const gameTriviaQuestions = getDayGameTriviaQuestions(selectedDay)
    const gameRounds = getDayGameRounds(selectedDay)
    const gameRiddles = getDayGameRiddles(selectedDay)
    const gameEncodedText = getDayGameEncodedText(selectedDay)
    const gameDecodedText = getDayGameDecodedText(selectedDay)
    const gameCipherType = getDayGameCipherType(selectedDay)
    const gameCipherRule = getDayGameCipherRule(selectedDay)
    const gameSudokuPuzzle = getDayGameSudokuPuzzle(selectedDay)
    const gameSudokuSolution = getDayGameSudokuSolution(selectedDay)
    const gameSudokuInitial = getDayGameSudokuInitial(selectedDay)
    const gameSudokuHint = getDayGameSudokuHint(selectedDay)
    const gameWords = getDayGameWords(selectedDay)
    const gameGridSize = getDayGameGridSize(selectedDay)
    const gameTargetHearts = getDayGameTargetHearts(selectedDay)
    const gameDuration = getDayGameDuration(selectedDay)
    const gameMaxAttempts = getDayGameMaxAttempts(selectedDay)
    const gameSentence = getDayGameSentence(selectedDay)
    const gameMazeSize = getDayGameMazeSize(selectedDay)
    const gameDifficulty = getDayGameDifficulty(selectedDay)
    const gameCorrectWire = getDayGameCorrectWire(selectedDay)
    const gameRules = getDayGameRules(selectedDay)
    const gameMaxTime = getDayGameMaxTime(selectedDay)
    const gameMathQuestions = getDayGameMathQuestions(selectedDay)
    const gameEvents = getDayGameEvents(selectedDay)
    const gameImageUrl = getDayGameImageUrl(selectedDay)
    const gameNumberOfBalls = getDayGameNumberOfBalls(selectedDay)
    const gameSequences = getDayGameSequences(selectedDay)
    const gameDoubleReflexRounds = getDayGameDoubleReflexRounds(selectedDay)
    const gameDoubleReflexButtons = getDayGameDoubleReflexButtons(selectedDay)
    const gamePairs = getDayGamePairs(selectedDay)
    const gameCards = getDayGameCards(selectedDay)
    const gameNumberSequences = getDayGameNumberSequences(selectedDay)
    const gameFastMathQuestions = getDayGameFastMathQuestions(selectedDay)
    const gameFastMathTimeLimit = getDayGameMathTimeLimit(selectedDay)
    const gamePatterns = getDayGamePatterns(selectedDay)
    
    // Renderizar o jogo correto baseado no tipo
    // Jogos com perguntas/conteúdo específico: repetem exatamente como no dia
    // Jogos que geram conteúdo aleatório: geram novo conteúdo cada vez (reflex, catch-hearts, maze-heart, double-reflex)
    switch (selectedGame) {
      case 't9-encoding':
        // Conteúdo específico - repetir
        return (
          <T9Encoding
            numbers={gameNumbers}
            targetWord={gamePhrase ? null : gameWord}
            targetPhrase={gamePhrase}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'wheel':
        // Conteúdo específico - repetir
        return (
          <Wheel
            prizes={gamePrizes}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'quiz':
        // Perguntas específicas - repetir
        return (
          <Quiz
            questions={gameQuestions}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'trivia':
        // Perguntas específicas - repetir
        return (
          <Trivia
            questions={gameTriviaQuestions}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'reflex':
        // Gera conteúdo aleatório - usar rounds mas o jogo gera aleatório
        return (
          <ReflexGame
            rounds={gameRounds}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'riddles':
        // Enigmas específicos - repetir
        return (
          <MiniRiddles
            riddles={gameRiddles}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'cryptogram':
        // Texto específico - repetir
        return (
          <Cryptogram
            encodedText={gameEncodedText}
            decodedText={gameDecodedText}
            cipherType={gameCipherType}
            cipherRule={gameCipherRule}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'mini-sudoku':
        // Gera novo puzzle aleatório
        const randomSudoku = generateRandomSudoku(8) // 8 células removidas (dificuldade média)
        return (
          <MiniSudoku
            puzzle={randomSudoku.puzzle}
            solution={randomSudoku.solution}
            initial={randomSudoku.initial}
            hint={randomSudoku.hint}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'word-search':
        // Gera nova grelha aleatória - usar palavras aleatórias do pool romântico
        const romanticWords = ['AMOR', 'SONHO', 'BEIJO', 'PAIXAO', 'FELIZ', 'UNIDO', 'ABRACO', 'DOCURA', 'CUIDA', 'ABRIGO', 'CARINO', 'AMIGO', 'TENRO', 'TERNO', 'CALOR', 'SUAVE', 'LINDO', 'QUERO', 'AMADA', 'AMADO', 'AMIGA']
        const randomWords = romanticWords.sort(() => Math.random() - 0.5).slice(0, 5)
        return (
          <WordSearch
            words={randomWords}
            gridSize={gameGridSize || 12}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'catch-hearts':
        // Gera corações aleatórios - usar parâmetros mas gera novo conteúdo
        return (
          <CatchHearts
            targetHearts={gameTargetHearts}
            gameDuration={gameDuration}
            maxAttempts={gameMaxAttempts}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'scrambled-sentence':
        // Frase específica - repetir
        return (
          <ScrambledSentence
            sentence={gameSentence}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'maze-heart':
        // Gera labirinto aleatório - usar parâmetros mas gera novo labirinto
        return (
          <MazeHeart
            mazeSize={gameMazeSize}
            difficulty={gameDifficulty}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'bomb-wire':
        // Gera novos números aleatórios para os fios - mantém regras mas números mudam
        // Os números dos fios são gerados aleatoriamente a cada jogo
        return (
          <BombWire
            difficulty={gameDifficulty || 'normal'}
            rules={gameRules || []}
            maxTime={gameMaxTime || 30}
            mathQuestions={gameMathQuestions || []}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'timeline':
        // Eventos específicos - repetir
        return (
          <Timeline
            events={gameEvents}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'puzzle-tiles':
        // Imagem específica - repetir
        return (
          <Puzzle
            gridSize={gameGridSize || 3}
            imageUrl={gameImageUrl}
            difficulty={gameDifficulty || 'medium'}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'simon':
        // Gera novas sequências aleatórias - passar array vazio para gerar aleatório
        return (
          <Simon
            numberOfBalls={gameNumberOfBalls || 4}
            sequences={[]}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'double-reflex':
        // Gera botões aleatórios - usar parâmetros mas gera novo conteúdo
        return (
          <DoubleReflex
            rounds={gameDoubleReflexRounds || 10}
            numberOfButtons={gameDoubleReflexButtons || 9}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'pair-matching':
        // Pares específicos - repetir
        return (
          <PairMatching
            pairs={gamePairs}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'memory-game':
        // Cartas específicas - repetir
        return (
          <MemoryGame
            cards={gameCards}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'number-sequence':
        // Sequências específicas - repetir
        return (
          <NumberSequence
            sequences={gameNumberSequences}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'fast-math':
        // Perguntas específicas - repetir
        return (
          <FastMath
            questions={gameFastMathQuestions}
            timeLimit={gameFastMathTimeLimit}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'pattern-recognition':
        // Padrões específicos - repetir
        return (
          <PatternRecognition
            patterns={gamePatterns}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
          />
        )
      case 'wordle':
      default:
        const wordleWord = selectedDay ? getWordleWordForDay(selectedDay) : null
        return (
          <WordleRomantico
            targetWord={wordleWord}
            day={null}
            onWin={() => {}}
            onComplete={() => {}}
            onGameAttempt={() => {}}
            calculateWordlePoints={() => 0}
          />
        )
    }
  }

  if (selectedGame) {
    const game = selectedDay ? getDayGame(selectedDay) : null
    const gameTitle = selectedDay 
      ? `Dia ${selectedDay} - ${game?.description || 'Jogo'}` 
      : 'Wordle Playground'
    
    return (
      <div className="playground-container">
        <button className="back-button" onClick={handleBack}>
          ← Voltar ao Playground
        </button>
        <div className="playground-game">
          <h2>🎮 {gameTitle}</h2>
          {!selectedDay && (
            <p className="playground-info">
              Palavra aleatória - diverte-te! 🎲
            </p>
          )}
          {renderGame()}
        </div>
      </div>
    )
  }

  return (
    <div className="playground-container">
      <h2 className="playground-title">🎮 Playground</h2>
      <p className="playground-description">
        Repete qualquer jogo que já tenhas jogado para passar o tempo!
      </p>

      <div className="playground-games">
        {/* Wordle sempre disponível */}
        <div className="playground-game-card" onClick={handlePlayWordle}>
          <div className="game-icon">📝</div>
          <h3>Wordle</h3>
          <p>Palavra aleatória</p>
          <span className="game-badge">Sempre Disponível</span>
        </div>

        {/* Jogos já jogados */}
        {uniqueGameDays.map(day => {
          const game = getDayGame(day)
          if (!game) return null
          
          return (
            <div 
              key={day} 
              className="playground-game-card" 
              onClick={() => handlePlayGame(day)}
            >
              <div className="game-icon">{getGameIcon(game.type)}</div>
              <h3>Dia {day}</h3>
              <p>{game.description}</p>
              <span className="game-badge">Jogado</span>
            </div>
          )
        })}

        {uniqueGameDays.length === 0 && (
          <div className="no-games">
            <p>🔒 Ainda não jogaste nenhum jogo!</p>
            <p>Vai ao calendário e começa a jogar para desbloquear o playground.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Playground
