# Changelog - Aurora Advent Calendar

## Major Updates

### Multi-User System with Login
- ✅ Implemented login system with manual account authentication via `accounts.json`
- ✅ Removed default profile creation - users must log in to play
- ✅ Removed import/export profile buttons
- ✅ Added account activation requirement (`active: true` to play)
- ✅ Cross-browser synchronization using `accountId` as primary identifier
- ✅ Profile management component with login modal
- ✅ Automatic profile creation on first login

### Cross-Browser Data Synchronization
- ✅ User progress syncs across different browsers using `accountId`
- ✅ `game-attempts.json` now uses `accountId` for filtering and merging attempts
- ✅ `user-state.json` now uses `accountId` for state merging across browsers
- ✅ Automatic data deduplication and merging for same user across browsers
- ✅ Points are calculated dynamically from all game attempts (not stored in user-state.json)

### New Games
- ✅ **Simon (Day 16)**: Memory sequence game with progressive difficulty
  - Configurable number of balls (`numberOfBalls`)
  - Custom sequences or auto-generated
  - Progressive speed increase with each level
  - Saves: correct sequences, average reaction time
- ✅ **Double Reflex (Day 17)**: Quick reaction game
  - Configurable number of rounds (`rounds`)
  - 9-button grid (configurable via `numberOfButtons`)
  - Only one correct button per round
  - Saves: reaction times, failures count

### Game Improvements
- ✅ **Puzzle Tiles**: Added difficulty levels (easy/medium/hard)
  - Configurable `gridSize` and `difficulty` in calendar-config.json
  - Difficulty-based shuffling algorithm
  - Saves `difficulty` and `gridSize` in game attempts

### Technical Changes
- ✅ New utilities: `userProfiles.js`, `accounts.js`
- ✅ Updated `gameAttemptsStorage.js` to use `accountId` as primary key
- ✅ Updated `userStateStorage.js` to merge states by `accountId`
- ✅ Removed `points` field from `user-state.json` (always calculated dynamically)
- ✅ Points calculation now uses all game attempts filtered by `accountId`
- ✅ Added `ProfileManager` component for user management

### Data Structure Updates
- ✅ `game-attempts.json`: Now includes `accountId` and `profileId` in each attempt
- ✅ `user-state.json`: Now includes `accountId` and `profileId` for cross-browser sync
- ✅ `accounts.json`: New file for user account management
- ✅ Old attempts without `accountId` are automatically updated when loaded

### Bug Fixes
- ✅ Fixed puzzle tiles clickability issues (corner tiles, diagonal movement)
- ✅ Fixed points synchronization between browsers
- ✅ Fixed game attempts not syncing correctly across browsers
- ✅ Fixed duplicate state creation on login

## Files Added
- `src/games/Simon/Simon.jsx` and `Simon.css`
- `src/games/DoubleReflex/DoubleReflex.jsx` and `DoubleReflex.css`
- `src/components/ProfileManager.jsx` and `ProfileManager.css`
- `src/utils/userProfiles.js`
- `src/utils/accounts.js`
- `src/config/accounts.json`

## Files Modified
- `src/components/Calendar.jsx` - Added Simon and DoubleReflex games, authentication checks
- `src/components/AuroraApp.jsx` - Integrated ProfileManager, profile indicator
- `src/utils/gameState.js` - Dynamic points calculation, accountId in attempts
- `src/utils/gameAttemptsStorage.js` - accountId-based filtering and merging
- `src/utils/userStateStorage.js` - accountId-based state merging, removed points field
- `src/utils/calendarConfig.js` - Added getters for Simon and DoubleReflex config
- `src/config/calendar-config.json` - Added Simon (day 16) and DoubleReflex (day 17)
- `src/games/Puzzle/Puzzle.jsx` - Added difficulty support

## Breaking Changes
- ⚠️ Users must now log in before playing (no default profile)
- ⚠️ Import/export profile buttons removed
- ⚠️ `points` field removed from `user-state.json` (always calculated dynamically)

