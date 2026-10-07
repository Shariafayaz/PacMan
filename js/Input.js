import { DIRECTIONS } from './constants.js';

class Input {
    constructor() {
        this.keys = {};
        this.actionKeys = {
            pause: false,
            mute: false,
            fps: false,
            debug: false
        };
        
        // Desired direction for PacMan
        this.desiredDirection = DIRECTIONS.NONE;

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Touch events
        this.touchStartX = null;
        this.touchStartY = null;
        // Use passive: false to allow preventDefault if necessary, though we handle preventDefault via css touch-action
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }

    handleKeyDown(e) {
        this.keys[e.key] = true;
        this.updateDesiredDirection();
        
        // Single fire action keys
        if (e.key.toLowerCase() === 'p') this.actionKeys.pause = true;
        if (e.key.toLowerCase() === 'm') this.actionKeys.mute = true;
        if (e.key.toLowerCase() === 'f') this.actionKeys.fps = true;
        if (e.key === '`') this.actionKeys.debug = true; // Cheat/Debug
    }

    handleKeyUp(e) {
        this.keys[e.key] = false;
        this.updateDesiredDirection();
    }

    updateDesiredDirection() {
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            this.desiredDirection = DIRECTIONS.UP;
        } else if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            this.desiredDirection = DIRECTIONS.DOWN;
        } else if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.desiredDirection = DIRECTIONS.LEFT;
        } else if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.desiredDirection = DIRECTIONS.RIGHT;
        }
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }

    handleTouchMove(e) {
        if (!this.touchStartX || !this.touchStartY) return;

        const touch = e.touches[0];
        const diffX = touch.clientX - this.touchStartX;
        const diffY = touch.clientY - this.touchStartY;

        const threshold = 30; // Minimum swipe distance in pixels

        if (Math.abs(diffX) > threshold || Math.abs(diffY) > threshold) {
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (diffX > 0) {
                    this.desiredDirection = DIRECTIONS.RIGHT;
                } else {
                    this.desiredDirection = DIRECTIONS.LEFT;
                }
            } else {
                // Vertical swipe
                if (diffY > 0) {
                    this.desiredDirection = DIRECTIONS.DOWN;
                } else {
                    this.desiredDirection = DIRECTIONS.UP;
                }
            }
            // Reset start coordinates to allow continuous swiping without lifting finger
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        }
    }

    handleTouchEnd(e) {
        this.touchStartX = null;
        this.touchStartY = null;
    }

    consumeAction(action) {
        if (this.actionKeys[action]) {
            this.actionKeys[action] = false;
            return true;
        }
        return false;
    }
}

export default new Input();
