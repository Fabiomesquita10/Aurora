# Aurora - Digital Advent Calendar

Aurora is a digital and personalized advent calendar created especially to surprise during the month of December. With 25 days (December 1-25), each day unlocks a mini-game. Upon completion, it reveals a prize. Includes a daily Wordle that gives points to spend in the Shop.

## 🚀 How to Run

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## 📦 Technologies

- React 18
- Vite
- CSS3 (no external libraries)

## 🗂️ Project Structure

```
src/
├── components/          # Main application components
│   ├── AuroraApp.jsx   # Main component with navigation
│   ├── Calendar.jsx    # Advent calendar (25 days)
│   ├── Presents.jsx    # Won presents tab
│   ├── Shop.jsx        # Points shop
│   ├── Wordles.jsx     # Daily Wordles list
│   ├── Playground.jsx  # Games playground
│   ├── FinalPhrase.jsx # Final phrase after completing all Wordles
│   └── *.css           # Component styles
│
├── games/              # Mini-games
│   ├── WordleRomantico.jsx  # Wordle game (daily)
│   ├── BombWire.jsx         # Bomb defusal game
│   ├── CatchHearts.jsx      # Catch hearts
│   ├── Cryptogram.jsx       # Cryptogram
│   ├── MazeHeart.jsx        # Heart maze
│   ├── MiniRiddles.jsx      # Mini-riddles
│   ├── MiniSudoku.jsx       # 4×4 Sudoku
│   ├── Quiz.jsx             # Quiz
│   ├── ReflexGame.jsx       # Reflex game
│   ├── ScrambledSentence.jsx # Scrambled sentence
│   ├── T9Encoding.jsx       # T9 encoding
│   ├── Timeline.jsx          # Timeline
│   ├── Trivia.jsx           # Trivia
│   ├── Wheel.jsx            # Wheel of fortune
│   ├── WordSearch.jsx       # Word search
│   ├── words.js             # Words dictionary
│   └── *.css                # Game styles
│
├── utils/              # Utilities and logic
│   ├── gameState.js    # Global game state (points, unlocks, etc.)
│   ├── dateUtils.js    # Date management and lock functions
│   ├── calendarConfig.js # Calendar configuration
│   ├── gameAttemptsStorage.js # Attempt management
│   ├── userStateStorage.js # User state persistence
│   └── wordlePhrase.js # Wordle logic and final phrase
│
├── config/             # Configuration files
│   ├── calendar-config.json # Calendar configuration
│   ├── game-attempts.json   # Game attempts
│   ├── user-state.json      # User state
│   └── wordle-phrase.json   # Wordle phrase
│
├── App.jsx             # Root component
├── App.css             # App styles
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## 🎮 Available Mini Games

### Implemented Games

1. ** Wordle 💕 ** (Daily)
   - Guess a romantic word in 6 attempts
   - Color-coded feedback per letter:
     - 🟢 Green: Correct letter in the right position
     - 🟡 Yellow: Letter exists in the word but in a different position
     - ⚪ Gray: Letter does not exist in the word

2. **Bomb Wire 🔴** - Defuse bomb by cutting wires
3. **Catch Hearts 💝** - Catch hearts
4. **Cryptogram 🔐** - Decipher cryptogram
5. **Maze Heart 🧩** - Heart-shaped maze
6. **Mini Riddles 🧠** - Solve 3 mini-riddles
7. **Mini Sudoku 🔢** - 4×4 Sudoku
8. **Quiz ❓** - Quiz questions
9. **Reflex Game ⚡** - Reflex and speed game
10. **Scrambled Sentence 📝** - Order scrambled sentence
11. **T9 Encoding 📱** - Decode T9 message
12. **Timeline 📅** - Order events chronologically
13. **Trivia 🎯** - Couple trivia
14. **Wheel 🎡** - Wheel of fortune
15. **Word Search 🔍** - Word search

## 🎁 Gift System

25 unique gifts (defined in `src/utils/gameState.js`):
- **Categories**: Low, Medium, High, Principal, Final
- **Points**: 10-100 points per gift
- **Estimated price**: €0-100
- Each day has a specific gift

## 💎 Points System

### Daily Wordle
- **1st attempt**: 5 points
- **2nd attempt**: 4 points
- **3rd attempt**: 3 points
- **4th attempt**: 2 points
- **5th attempt**: 1 point
- **6th attempt**: 1 point
- **Complete failure**: 0 points (optional: +1 participation point)

### Day Gifts
- Additional points when completing the day's game
- Values range from 10-100 points depending on category

## 🛍️ Shop

10 available items (all repeatable):
- Chocolate 🍫 (3 pts)
- Rose 🌹 (5 pts)
- Our photo 📸 (6 pts)
- Massage 💆 (10 pts)
- Extra kiss 💋 (1 pt)
- Hot drink ☕ (4 pts)
- Choose movie 🎬 (2 pts)
- Secret message 💌 (2 pts)
- Dessert 🍪 (6 pts)
- Small surprise 🎁 (5 pts)

## 🔒 Lock System

- **Day 1**: Available from December 1st at 00:00
- **Following days**: Unlock at **9 PM** the previous day
- Future days show countdown until unlock

## 💾 Persistence

All data stored in `localStorage`, for now:
- Points
- Unlocked days
- Won games
- Purchased items
- Daily Wordle attempts
- Last daily game date
- Dark mode

## 📱 Pages/Navigation

1. **Calendar** 📅 - Grid of 25 days, clickable when available
2. **Presents** 🎁 - List of unlocked and won gifts
3. **Shop** 🛍️ - Buy items with earned points
4. **Wordles** 📝 - List of completed daily Wordles
5. **Playground** 🎮 - Test all games (development mode)

## 🔧 Configuration and Development

### Adding New Games
1. Create component in `src/games/` (e.g., `NewGame.jsx` and `NewGame.css`)
2. Add type in `GAME_TYPES` in `src/utils/gameState.js`
3. Map day → game in `DAILY_GAMES` in `src/utils/gameState.js`
4. Integrate in `Calendar.jsx`

### Customizing Gifts
Edit `DAILY_GIFTS` in `src/utils/gameState.js`

### Customizing Shop Items
Edit `SHOP_ITEMS` in `src/utils/gameState.js`

### Development Mode
The project includes a development mode (DEV_MODE) that allows:
- Unlock all days
- Test games in Playground
- Reset game state

## 🎯 Special Features

- **Final Phrase**: After completing all daily Wordles, a special phrase is revealed
- **Dark Mode**: Toggle to switch between light and dark theme
- **Local Persistence**: All progress is automatically saved
- **Responsive Design**: Interface adaptable to different screen sizes