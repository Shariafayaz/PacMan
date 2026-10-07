import Game from './Game.js';
import UI from './UI.js';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game('game-canvas');
    game.updateHUD();
    UI.showStartScreen();
});
