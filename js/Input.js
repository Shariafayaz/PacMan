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

    consumeAction(action) {
        if (this.actionKeys[action]) {
            this.actionKeys[action] = false;
            return true;
        }
        return false;
    }
}

export default new Input();
