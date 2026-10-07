import { CANVAS_WIDTH, CANVAS_HEIGHT, GAME_STATES, COLORS, TIMINGS, DIFFICULTIES } from './constants.js';
import Maze from './Maze.js';
import PacMan from './PacMan.js';
import Ghost from './Ghost.js';
import Input from './Input.js';
import Audio from './Audio.js';
import UI from './UI.js';

export default class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimize for no transparency
        
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.state = GAME_STATES.START;
        this.lastTime = 0;
        this.accumulatedTime = 0;
        
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('pacman_highscore')) || 0;
        this.lives = 3;
        this.level = 1;
        
        this.maze = new Maze(this.level);
        this.pacman = null;
        this.ghosts = [];
        
        this.ghostModeTimer = 0;
        this.ghostModeIndex = 0;
        this.frightenedTimer = 0;
        this.ghostCombo = 0;
        
        // Mode schedule: Scatter, Chase, Scatter, Chase...
        this.modeSchedule = [
            { mode: 0, time: TIMINGS.SCATTER_DURATION_1 }, // 0 = SCATTER
            { mode: 1, time: TIMINGS.CHASE_DURATION_1 },   // 1 = CHASE
            { mode: 0, time: TIMINGS.SCATTER_DURATION_2 },
            { mode: 1, time: TIMINGS.CHASE_DURATION_2 },
            { mode: 0, time: TIMINGS.SCATTER_DURATION_3 },
            { mode: 1, time: TIMINGS.CHASE_DURATION_3 }
        ];

        this.loop = this.loop.bind(this);

        this.initEntities();
        this.setupEvents();
    }

    initEntities() {
        const diffObj = DIFFICULTIES[UI.difficulty] || DIFFICULTIES.medium;
        this.pacman = new PacMan(this.maze, 15, 18, diffObj);
        this.ghosts = [
            new Ghost(this.maze, 15, 9, COLORS.BLINKY, 'BLINKY', diffObj), // Starts outside
            new Ghost(this.maze, 15, 12, COLORS.PINKY, 'PINKY', diffObj),
            new Ghost(this.maze, 14, 13, COLORS.INKY, 'INKY', diffObj),
            new Ghost(this.maze, 16, 13, COLORS.CLYDE, 'CLYDE', diffObj)
        ];
        
        // Reset modes
        this.ghostModeTimer = 0;
        this.ghostModeIndex = 0;
        this.frightenedTimer = 0;
        this.ghosts.forEach(g => g.setMode(0)); // SCATTER
    }

    setupEvents() {
        document.getElementById('mobile-pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('home-btn-gameover').addEventListener('click', () => this.goToHome());
        document.getElementById('home-btn-victory').addEventListener('click', () => this.goToHome());
        document.getElementById('home-btn-completed').addEventListener('click', () => this.goToHome());
    }

    start() {
        this.initEntities();
        Audio.init();
        Audio.playStart();
        this.state = GAME_STATES.PLAYING;
        UI.hideAllScreens();
        this.lastTime = performance.now();
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.animationId = requestAnimationFrame(this.loop);
    }

    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.maze.parseMap(this.level); // Reset map and pellets
        this.updateHUD();
        this.start();
    }

    nextLevel() {
        this.level++;
        this.lives = 3;
        this.maze.parseMap(this.level); // Load new map and reset pellets
        this.updateHUD();
        this.start();
    }

    togglePause() {
        if (this.state === GAME_STATES.PLAYING) {
            this.state = GAME_STATES.PAUSED;
            UI.showPauseScreen();
        } else if (this.state === GAME_STATES.PAUSED) {
            this.state = GAME_STATES.PLAYING;
            UI.hideAllScreens();
            this.lastTime = performance.now();
            if (this.animationId) cancelAnimationFrame(this.animationId);
            this.animationId = requestAnimationFrame(this.loop);
        }
    }

    goToHome() {
        this.state = GAME_STATES.START;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.maze.parseMap(this.level);
        this.initEntities();
        this.updateHUD();
        this.draw(); // Clear the canvas of old game state
        UI.showStartScreen();
    }

    die() {
        this.state = GAME_STATES.PACMAN_DYING;
        Audio.playDeath();
        
        setTimeout(() => {
            this.lives--;
            UI.updateLives(this.lives);
            if (this.lives > 0) {
                this.initEntities();
                this.state = GAME_STATES.PLAYING;
                this.lastTime = performance.now();
                if (this.animationId) cancelAnimationFrame(this.animationId);
                this.animationId = requestAnimationFrame(this.loop);
            } else {
                this.gameOver();
            }
        }, 1500);
    }

    gameOver() {
        this.state = GAME_STATES.GAME_OVER;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('pacman_highscore', this.highScore);
            UI.updateHighScore(this.highScore);
        }
        UI.showGameOverScreen(this.score);
    }

    winLevel() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('pacman_highscore', this.highScore);
            UI.updateHighScore(this.highScore);
        }

        if (this.level >= 3) {
            this.state = GAME_STATES.VICTORY; // Use victory state to stop play
            UI.showAllCompletedScreen(this.score);
        } else {
            this.state = GAME_STATES.VICTORY;
            UI.showVictoryScreen(this.score);
        }
    }

    addScore(points) {
        this.score += points;
        UI.updateScore(this.score);
    }

    updateHUD() {
        UI.updateScore(this.score);
        UI.updateLives(this.lives);
        UI.updateLevel(this.level);
        UI.updateHighScore(this.highScore);
    }

    handleGhostModes(dt) {
        // Handle Frightened state
        if (this.frightenedTimer > 0) {
            this.frightenedTimer -= dt;
            
            // Flash if near end
            if (this.frightenedTimer < TIMINGS.FRIGHTENED_FLASH_DURATION) {
                this.ghosts.forEach(g => { if (g.mode === 2) g.isFlashing = true; });
            }

            if (this.frightenedTimer <= 0) {
                // Return to normal schedule
                const currentSched = this.modeSchedule[this.ghostModeIndex];
                this.ghosts.forEach(g => {
                    if (g.mode === 2) {
                        g.setMode(currentSched.mode);
                        g.isFlashing = false;
                    }
                });
            }
        } else {
            // Normal Schedule progression
            this.ghostModeTimer += dt;
            const currentSched = this.modeSchedule[this.ghostModeIndex];
            if (this.ghostModeTimer >= currentSched.time) {
                this.ghostModeTimer -= currentSched.time;
                this.ghostModeIndex = Math.min(this.ghostModeIndex + 1, this.modeSchedule.length - 1);
                
                const nextMode = this.modeSchedule[this.ghostModeIndex].mode;
                this.ghosts.forEach(g => {
                    if (g.mode !== 3) g.setMode(nextMode); // Don't interrupt dead ghosts
                });
            }
        }
    }

    update(dt) {
        if (this.state !== GAME_STATES.PLAYING) return;

        this.handleGhostModes(dt);

        // Update entities
        this.pacman.update(dt, Input.desiredDirection);
        this.ghosts.forEach(g => g.update(dt, this.pacman));

        // Check Pellet Collisions
        const pelletCollision = this.maze.checkPelletCollision(this.pacman.col, this.pacman.row);
        if (pelletCollision.score > 0) {
            this.addScore(pelletCollision.score);
            if (pelletCollision.eatenPowerPellet) {
                const diffObj = DIFFICULTIES[UI.difficulty] || DIFFICULTIES.medium;
                Audio.playPowerPellet();
                this.frightenedTimer = diffObj.frightenedDuration;
                this.ghostCombo = 0;
                this.ghosts.forEach(g => {
                    if (g.mode !== 3) {
                        g.setMode(2); // FRIGHTENED
                        g.isFlashing = false;
                    }
                });
            } else {
                Audio.playChomp();
            }

            // Check Win condition
            if (!this.maze.hasPelletsLeft()) {
                this.winLevel();
            }
        }

        // Check Ghost Collisions
        // Distance-based collision checking
        const hitRadius = 12; // Pixels
        for (let g of this.ghosts) {
            const dist = Math.hypot(this.pacman.x - g.x, this.pacman.y - g.y);
            if (dist < hitRadius * 2) { // Collision
                if (g.mode === 2) { // FRIGHTENED
                    Audio.playGhostEat();
                    g.setMode(3); // DEAD
                    this.ghostCombo++;
                    this.addScore(Math.pow(2, this.ghostCombo) * 100); // 200, 400, 800, 1600
                } else if (g.mode === 0 || g.mode === 1) { // SCATTER or CHASE
                    // If debug is on, don't die
                    if (!Input.actionKeys.debug) {
                        this.die();
                        break;
                    }
                }
            }
        }
    }

    draw() {
        // Clear background
        this.ctx.fillStyle = COLORS.WALL; // Fill with wall color then draw background to avoid gaps
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze and pellets
        this.maze.draw(this.ctx);

        // Draw entities
        if (this.state !== GAME_STATES.PACMAN_DYING || Math.floor(performance.now() / 200) % 2 === 0) {
            this.pacman.draw(this.ctx);
        }
        
        this.ghosts.forEach(g => g.draw(this.ctx));
    }

    loop(timestamp) {
        let dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Cap dt to prevent massive jumps or negative values
        if (dt > 100) dt = 100;
        if (dt < 0) dt = 0;

        UI.updateFPS(1000 / dt);

        // Global Actions (checked every frame regardless of state)
        if (Input.consumeAction('pause')) this.togglePause();
        if (Input.consumeAction('mute')) {
            const isMuted = Audio.toggleMute();
            UI.toggleMuteIcon(isMuted);
        }
        if (Input.consumeAction('fps')) UI.toggleFPS(!UI.fpsCounter.classList.contains('hidden'));

        // Only process game logic if playing or dying
        if (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.PACMAN_DYING) {
            if (this.state === GAME_STATES.PLAYING) {
                this.update(dt);
            }
            this.draw();
            if (this.animationId) cancelAnimationFrame(this.animationId);
            this.animationId = requestAnimationFrame(this.loop);
        } else if (this.state === GAME_STATES.PAUSED) {
            // If paused, we still need to queue the next frame to listen for unpause via keyboard!
            if (this.animationId) cancelAnimationFrame(this.animationId);
            this.animationId = requestAnimationFrame(this.loop);
        }
    }
}
