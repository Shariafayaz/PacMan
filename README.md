# HTML5 Canvas Pac-Man Game

A complete, polished Pac-Man game built from scratch using HTML5, CSS3, and ES6 JavaScript.

## Features
- **Classic Gameplay**: Navigate the maze, eat pellets, and avoid ghosts.
- **Power Pellets**: Turn the tables and eat the ghosts for bonus points!
- **Ghost AI**: Each ghost uses target-based pathfinding (Scatter, Chase, Frightened modes).
- **Responsive Controls**: Use Arrow Keys or WASD to move.
- **Custom Audio Engine**: 100% synthesized retro sounds using the Web Audio API (no external sound files required).
- **High Score System**: Uses Local Storage to save your best score.

## How to Run

Since the game uses ES6 modules (`type="module"`), you cannot simply open `index.html` from the file system (`file://` protocol) due to browser CORS restrictions. You must run it through a local web server.

### Option 1: Using Node.js (npx)
If you have Node.js installed, open a terminal in the project folder and run:
```bash
npx serve .
```
Then open your browser to the URL provided (usually `http://localhost:3000`).

### Option 2: Using Python
If you have Python installed, open a terminal in the project folder and run:
```bash
# Python 3
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

### Option 3: VS Code Live Server
If you use Visual Studio Code, you can install the "Live Server" extension, right-click on `index.html`, and select "Open with Live Server".

## Controls
- **Arrow Keys** / **WASD**: Move Pac-Man
- **P**: Pause / Resume
- **M**: Mute / Unmute audio
- **F**: Toggle FPS counter
- **` (Backtick)**: Toggle Cheat/Debug mode (Invincibility)

## Architecture
- `index.html`: Entry point and UI overlay structure.
- `css/style.css`: UI styling and retro aesthetics.
- `js/main.js`: Bootstrapper.
- `js/constants.js`: Configuration, custom maze map array, and enum-like objects.
- `js/Game.js`: Main game loop, state management, and collision detection.
- `js/Maze.js`: Wall rendering and pellet collision map.
- `js/Entity.js`: Base class for smooth grid-based movement interpolation.
- `js/PacMan.js` & `js/Ghost.js`: Player logic and Ghost AI behaviors.
- `js/Audio.js`: Web Audio API synthesizer for sound effects.
- `js/UI.js`: DOM manipulation for HUD and menus.
