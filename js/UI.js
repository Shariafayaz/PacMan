class UI {
    constructor() {
        this.scoreEl = document.getElementById('score');
        this.highScoreEl = document.getElementById('high-score');
        this.livesEl = document.getElementById('lives');
        this.levelEl = document.getElementById('level');
        
        this.startScreen = document.getElementById('start-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.victoryScreen = document.getElementById('victory-screen');
        
        this.finalScoreEl = document.getElementById('final-score');
        this.victoryScoreEl = document.getElementById('victory-score');
        
        this.fpsCounter = document.getElementById('fps-counter');
        this.fpsValue = document.getElementById('fps-value');
        this.muteIndicator = document.getElementById('mute-indicator');

        this.difficulty = 'medium';
        this.difficultyBtns = document.querySelectorAll('.diff-btn');
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.difficultyBtns.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                // The dataset or id can give us the diff
                this.difficulty = e.target.id.replace('btn-', '');
            });
        });

        // Initial high score
        const hs = localStorage.getItem('pacman_highscore') || 0;
        this.updateHighScore(hs);
    }

    updateScore(score) {
        this.scoreEl.textContent = score;
    }

    updateHighScore(score) {
        this.highScoreEl.textContent = score;
    }

    updateLives(lives) {
        this.livesEl.textContent = lives;
    }

    updateLevel(level) {
        this.levelEl.textContent = level;
    }

    updateFPS(fps) {
        this.fpsValue.textContent = Math.round(fps);
    }

    toggleFPS(show) {
        if (show) this.fpsCounter.classList.remove('hidden');
        else this.fpsCounter.classList.add('hidden');
    }

    toggleMuteIcon(muted) {
        if (muted) this.muteIndicator.classList.remove('hidden');
        else this.muteIndicator.classList.add('hidden');
    }

    hideAllScreens() {
        this.startScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.victoryScreen.classList.add('hidden');
    }

    showStartScreen() {
        this.hideAllScreens();
        this.startScreen.classList.remove('hidden');
    }

    showPauseScreen() {
        this.hideAllScreens();
        this.pauseScreen.classList.remove('hidden');
    }

    showGameOverScreen(score) {
        this.hideAllScreens();
        this.finalScoreEl.textContent = score;
        this.gameOverScreen.classList.remove('hidden');
    }

    showVictoryScreen(score) {
        this.hideAllScreens();
        this.victoryScoreEl.textContent = score;
        this.victoryScreen.classList.remove('hidden');
    }
}

export default new UI();
