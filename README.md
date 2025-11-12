# Aurora - Digital Advent Calendar

Aurora is a digital and personalized advent calendar created especially to surprise during the month of December. With 25 days (December 1-25), each day unlocks a mini-game. Upon completion, it reveals a prize. Includes a daily Wordle that gives points to spend in the Shop.

## 🚀 How to Run

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
# Development mode (with dev tools)
npm run dev:dev

# Player mode (without dev tools)
npm run dev:player

# Default (same as dev:dev)
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
│   ├── ProfileManager.jsx # User profile and login management
│   └── *.css           # Component styles
│
├── games/              # Mini-games (organized by game)
│   ├── WordleRomantico/     # Wordle game (daily)
│   │   ├── WordleRomantico.jsx
│   │   ├── WordleRomantico.css
│   │   ├── words.js
│   │   └── README.md
│   ├── BombWire/            # Bomb defusal game
│   │   ├── BombWire.jsx
│   │   ├── BombWire.css
│   │   └── README.md
│   ├── CatchHearts/         # Catch hearts
│   ├── Cryptogram/          # Cryptogram
│   ├── MazeHeart/           # Heart maze
│   ├── MiniRiddles/         # Mini-riddles
│   ├── MiniSudoku/          # 4×4 Sudoku
│   ├── Quiz/                # Quiz
│   ├── ReflexGame/          # Reflex game
│   ├── ScrambledSentence/   # Scrambled sentence
│   ├── T9Encoding/          # T9 encoding
│   ├── Timeline/            # Timeline
│   ├── Trivia/              # Trivia
│   ├── Wheel/               # Wheel of fortune
│   ├── WordSearch/          # Word search
│   ├── Puzzle/              # Puzzle tiles (sliding puzzle)
│   ├── Simon/               # Simon Says (memory sequence game)
│   ├── DoubleReflex/        # Double Reflex (quick reaction game)
│   ├── PairMatching/        # Pair matching game
│   ├── QRCodeReader/        # QR code scanner (treasure hunt)
│   ├── PhotoTrivia/         # Photo trivia (guess locations)
│   ├── BoxChoice/           # Box choice game (pick a box)
│   ├── MusicalQuiz/         # Musical quiz (identify songs)
│   ├── MemoryGame/           # Memory game (find pairs)
│   ├── NumberSequence/      # Number sequence game
│   ├── FastMath/            # Fast math game (timer-based)
│   └── PatternRecognition/   # Pattern recognition game
│       (Each game has its own folder with .jsx, .css, and README.md)
│
├── utils/              # Utilities and logic
│   ├── gameState.js    # Global game state (points, unlocks, etc.)
│   ├── dateUtils.js    # Date management and lock functions
│   ├── calendarConfig.js # Calendar configuration
│   ├── gameAttemptsStorage.js # Attempt management
│   ├── userStateStorage.js # User state persistence
│   ├── userProfiles.js # User profile management
│   ├── accounts.js     # Account authentication
│   └── wordlePhrase.js # Wordle logic and final phrase
│
├── config/             # Configuration files
│   ├── calendar-config.json # Calendar configuration
│   ├── game-attempts.json   # Game attempts
│   ├── user-state.json      # User state
│   ├── wordle-phrase.json   # Wordle phrase
│   └── accounts.json         # User accounts (login)
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
16. **Puzzle Tiles 🧩** - Sliding puzzle game (configurable difficulty and grid size)
17. **Simon 🎮** - Memorize and repeat color sequences (progressive difficulty)
18. **Double Reflex ⚡** - Quick reaction game with multiple buttons
19. **Pair Matching 🔗** - Match pairs of related items (e.g., "Lua ↔ Noite")
20. **QR Code Reader 📱** - Scan QR codes to find hidden messages (treasure hunt)
21. **Photo Trivia 📸** - Guess locations from blurred/cropped photos
22. **Box Choice 📦** - Choose one of three boxes with different prizes
23. **Musical Quiz 🎵** - Listen to music snippets and identify the song
24. **Memory Game 🧠** - Find matching pairs of cards (12 cards, 6 pairs)
25. **Number Sequence 🔢** - Complete numerical sequences with hints
26. **Fast Math ⚡** - Solve math problems as fast as possible (timer-based)
27. **Pattern Recognition 🔍** - Identify visual patterns and choose the next element

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

All data stored in `localStorage` and JSON files:
- Points (calculated dynamically from game attempts - not stored in user-state.json)
- Unlocked days
- Won games
- Purchased items
- Daily Wordle attempts
- Last daily game date
- Dark mode

**JSON Files** (in `src/config/`):
- `calendar-config.json` - Calendar and game configuration
- `game-attempts.json` - All game attempts and scores (with accountId for cross-browser sync)
- `user-state.json` - User progress and state (with accountId for cross-browser sync)
- `wordle-phrase.json` - Wordle phrases and final message
- `accounts.json` - User accounts for authentication

**Backups** (in `src/config/backups/`):
- Automatic backups created when games are completed
- One backup per game day (most recent kept)

## 👥 Multi-User System

The application supports multiple users with individual progress tracking:

- **Login System**: Manual account authentication via `accounts.json`
- **Account Activation**: Accounts must be marked as `active: true` to play
- **Cross-Browser Sync**: User progress syncs across different browsers using `accountId`
- **Profile Management**: Each account has its own profile with separate progress
- **No Default Profile**: No default profile is created - users must log in to play
- **Data Isolation**: Each user's data (points, unlocked days, game attempts) is stored separately
- **Dynamic Points**: Points are calculated dynamically from all game attempts (not stored in user-state.json)

## 📱 Pages/Navigation

1. **Calendar** 📅 - Interactive advent calendar with personalized background image
   - 25 days displayed over a custom background image
   - Manual position layout for optimal visual distribution
   - Randomized day numbers for added challenge
   - Transparent numbers (30% opacity) when not unlocked
   - Background box appears only when day is unlocked
   - Blinking animation for unlocked days that haven't been completed
   - Click on unlocked days to play the game
2. **Presents** 🎁 - List of unlocked and won gifts
3. **Shop** 🛍️ - Buy items with earned points
4. **Wordles** 📝 - List of completed daily Wordles
5. **Profiles** 👤 - User login and profile management
6. **Playground** 🎮 - Replay any previously played game

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

### Playground System
The Playground allows players to replay any game they've already completed:
- **Access**: Available to all logged-in users (not just dev mode)
- **Available Games**: Shows all games from days you've won
- **Wordle**: Always available with random word selection
- **Content Behavior**:
  - **Fixed Content**: Games with specific questions/content (Quiz, Trivia, Cryptogram, Riddles, Timeline, Pair Matching, Memory Game, Number Sequence, Fast Math, Pattern Recognition) repeat the exact same content
  - **Randomized Content**: Games that generate content (Reflex, Catch Hearts, Maze Heart, Word Search, Simon, Bomb Wire, Mini Sudoku, Double Reflex) create new content each time
- **Authentication**: Requires login and active account

### Development Mode
The project includes a development mode (DEV_MODE) that allows:
- Unlock all days
- Reset game state (button only visible in dev mode)

**Modes:**
- `npm run dev:dev` - Development mode with dev tools and reset button
- `npm run dev:player` - Player mode without dev tools (clean interface)

### Customizing Calendar Visual
The calendar uses a custom background image and manual position layout:
- **Background Image**: Replace `src/public/images/bgImage.jpg` with your own image
- **Position Layout**: Edit `getManualPositions()` in `src/components/Calendar.jsx` to adjust day positions
- **Number Randomization**: Day numbers are shuffled using a seed (default: 2024) for consistency
- **Transparency**: Adjust number opacity in `src/components/Calendar.css` (`.day-number` opacity property)
- **Animations**: Modify blink animation in `src/components/Calendar.css` for different effects

### Adding User Accounts
Edit `src/config/accounts.json` to add new users:
```json
[
  {
    "id": "account_1",
    "username": "admin",
    "password": "admin",
    "name": "Administrador",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```
- `active: true` is required for accounts to be able to play
- Each account gets its own profile and progress tracking

## 🎯 Special Features

### Visual Calendar System
- **Custom Background Image**: Personalize the calendar with your own background image
- **Manual Position Layout**: 25 day positions are manually defined for optimal visual distribution
- **Randomized Day Numbers**: Day numbers (1-25) are shuffled and randomly assigned to positions for added challenge
- **Smart Visibility System**:
  - Numbers are transparent (30% opacity) when days are not unlocked
  - Background boxes are invisible until a day is unlocked
  - Only the number is visible for locked and available days
  - Background box with blur effect appears when a day is unlocked
- **Blinking Animation**: Unlocked days that haven't been completed have a subtle blinking animation to draw attention
- **No Movement**: Numbers stay in fixed positions (no movement animations) to maintain mystery
- **Position Variations**: Small random variations in position and rotation make each day unique while maintaining spacing

### Other Features
- **Multi-User Support**: Login system with individual progress tracking per user
- **Cross-Browser Sync**: User progress automatically syncs across different browsers using `accountId`
- **Dynamic Points System**: Points are calculated in real-time from all game attempts (not stored statically)
- **Prize Modal**: When a game is completed, a beautiful modal shows the prize won. The player decides when to close it and can navigate directly to the presents page
- **Final Phrase**: After completing all daily Wordles, a special phrase is revealed
- **Dark Mode**: Toggle to switch between light and dark theme
- **Local Persistence**: All progress is automatically saved
- **Auto Backup System**: Automatic backup of config files when games are completed
  - One backup per game day (keeps the most recent)
  - Backup is created when either the daily game or wordle extra is completed
  - If both games are played on the same day, the latest backup replaces the previous one
  - Backup naming: `backup-YYYY-MM-DDTHH-MM-SS-day-N` (includes backup date and game day)
  - Keeps last 50 backups automatically
- **Real-time Points**: Points update immediately when games are completed or items are purchased (no page refresh needed)
- **Organized Presents**: Presents page shows all prizes ordered by most recent first
- **Responsive Design**: Interface adaptable to different screen sizes, optimized for desktop use
- **Desktop Optimized**: Full-width layout for desktop screens, better use of available space
- **Progressive Difficulty**: Some games (like Simon) increase difficulty progressively (speed increases with each level)
- **Playground System**: Replay any game you've already played:
  - Shows all games from days you've completed
  - Wordle is always available with random words
  - Games with specific content (quizzes, cryptograms, etc.) repeat the same content
  - Games with randomized content (Reflex, Catch Hearts, Maze, Word Search, Simon, Bomb Wire, Mini Sudoku, Double Reflex) generate new content each time
  - Requires login and active account to play

## 🎁 Prize System

When a game is completed:
1. A modal appears immediately showing the prize details (no game victory screen delay)
2. Player can choose to:
   - View all presents (navigates to Presents page)
   - Continue playing (returns to calendar)
3. Presents are organized by most recent first
4. All prizes are automatically saved and backed up

## 💾 Backup System

The application automatically creates backups of all configuration files when games are completed:

- **Backup Trigger**: Created when either the daily game or wordle extra is won
- **One Backup Per Day**: Only the most recent backup for each game day (1-25) is kept
- **Backup Naming**: `backup-YYYY-MM-DDTHH-MM-SS-day-N`
  - Includes the backup creation date/time
  - Includes the game day number (1-25)
  - Example: `backup-2024-12-14T10-30-00-day-14`
- **Automatic Cleanup**: Maintains only the last 50 backups
- **Location**: `src/config/backups/`