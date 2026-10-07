import Entity from './Entity.js';
import { DIRECTIONS, COLORS, BASE_SPEEDS, TILE_SIZE, MAP_COLS, TYPES } from './constants.js';

const GHOST_MODES = {
    SCATTER: 0,
    CHASE: 1,
    FRIGHTENED: 2,
    DEAD: 3
};

export default class Ghost extends Entity {
    constructor(maze, startCol, startRow, color, type, diffObj) {
        super(maze, startCol, startRow, BASE_SPEEDS.GHOST_NORMAL * diffObj.ghostSpeedMultiplier);
        this.diff = diffObj;
        this.baseColor = color;
        this.type = type; // 'BLINKY', 'PINKY', 'INKY', 'CLYDE'
        this.mode = GHOST_MODES.SCATTER;
        this.isFlashing = false; // For end of frightened mode
        this.homeCol = startCol;
        this.homeRow = startRow;
        
        // Target tile coords
        this.targetCol = 0;
        this.targetRow = 0;
        
        // Used to prevent reversing direction immediately
        this.allowReverse = false;
    }

    canMove(dir) {
        if (dir === DIRECTIONS.NONE) return false;
        
        // Prevent reversing unless allowed
        if (!this.allowReverse && this.dir !== DIRECTIONS.NONE) {
            if (dir.x === -this.dir.x && dir.y === -this.dir.y) {
                return false;
            }
        }

        const testCol = this.col + dir.x;
        const testRow = this.row + dir.y;
        
        if (this.mode === GHOST_MODES.DEAD) {
            // Dead ghosts can go through doors to get home
            if (this.maze.isDoor(testCol, testRow)) return true;
        } else {
            // Live ghosts cannot go down into the house through the door unless leaving?
            // Simplified: they just don't enter the door unless dead.
            if (this.maze.isDoor(testCol, testRow) && dir === DIRECTIONS.DOWN) return false;
        }
        
        return !this.maze.isWall(testCol, testRow);
    }

    setMode(newMode) {
        if (this.mode !== newMode) {
            if (newMode === GHOST_MODES.FRIGHTENED && this.mode === GHOST_MODES.DEAD) {
                return; // Dead ghosts don't get frightened
            }
            // Reverse direction when mode changes (except to Dead)
            if (this.mode !== GHOST_MODES.DEAD && this.dir !== DIRECTIONS.NONE) {
                this.allowReverse = true;
                this.nextDir = { x: -this.dir.x, y: -this.dir.y };
            }
            this.mode = newMode;
            this.updateSpeed();
        }
    }

    updateSpeed() {
        if (this.mode === GHOST_MODES.FRIGHTENED) this.speed = BASE_SPEEDS.GHOST_FRIGHTENED * this.diff.ghostSpeedMultiplier;
        else if (this.mode === GHOST_MODES.DEAD) this.speed = BASE_SPEEDS.GHOST_DEAD * this.diff.ghostSpeedMultiplier;
        else this.speed = BASE_SPEEDS.GHOST_NORMAL * this.diff.ghostSpeedMultiplier;
    }

    updateTarget(pacman) {
        if (this.mode === GHOST_MODES.SCATTER) {
            // Target corners
            switch(this.type) {
                case 'BLINKY': this.targetCol = MAP_COLS - 2; this.targetRow = 1; break;
                case 'PINKY': this.targetCol = 1; this.targetRow = 1; break;
                case 'INKY': this.targetCol = MAP_COLS - 2; this.targetRow = this.maze.grid.length - 2; break;
                case 'CLYDE': this.targetCol = 1; this.targetRow = this.maze.grid.length - 2; break;
            }
        } else if (this.mode === GHOST_MODES.CHASE) {
            // Simplified chase: all act like Blinky for now to save complexity, or add custom targets.
            // Blinky targets pacman directly.
            this.targetCol = pacman.col;
            this.targetRow = pacman.row;
            // A more complete AI would use pacman.dir for Pinky, etc.
        } else if (this.mode === GHOST_MODES.DEAD) {
            this.targetCol = this.homeCol;
            this.targetRow = this.homeRow;
        }
    }

    chooseDirection() {
        const possibleDirs = [DIRECTIONS.UP, DIRECTIONS.LEFT, DIRECTIONS.DOWN, DIRECTIONS.RIGHT];
        let validDirs = possibleDirs.filter(d => this.canMove(d));
        
        if (validDirs.length === 0) {
            this.nextDir = DIRECTIONS.NONE;
            return;
        }

        if (this.mode === GHOST_MODES.FRIGHTENED) {
            // Random turn
            this.nextDir = validDirs[Math.floor(Math.random() * validDirs.length)];
        } else {
            // Pick direction that minimizes straight-line distance to target
            let bestDir = validDirs[0];
            let minDistance = Infinity;

            for (let d of validDirs) {
                const nextCol = this.col + d.x;
                const nextRow = this.row + d.y;
                const dist = Math.pow(nextCol - this.targetCol, 2) + Math.pow(nextRow - this.targetRow, 2);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestDir = d;
                }
            }
            this.nextDir = bestDir;
        }
    }

    update(dt, pacman) {
        // If at center of tile, choose next direction
        const centerX = this.col * TILE_SIZE + TILE_SIZE / 2;
        const centerY = this.row * TILE_SIZE + TILE_SIZE / 2;
        const distToCenter = Math.abs(this.x - centerX) + Math.abs(this.y - centerY);
        const margin = (this.speed * TILE_SIZE) * (dt / 1000) * 1.5;

        if (distToCenter <= margin) {
            this.updateTarget(pacman);
            this.chooseDirection();
            this.allowReverse = false; // Reset after turn
            
            // If dead and arrived home, respawn
            if (this.mode === GHOST_MODES.DEAD && this.col === this.homeCol && this.row === this.homeRow) {
                this.setMode(GHOST_MODES.CHASE); // Will be overridden by Game's master mode if needed
            }
        }

        // Adjust speed if in tunnel
        if (this.col <= 0 || this.col >= MAP_COLS - 1) {
            if (this.mode !== GHOST_MODES.DEAD && this.mode !== GHOST_MODES.FRIGHTENED) {
                this.speed = BASE_SPEEDS.GHOST_TUNNEL * this.diff.ghostSpeedMultiplier;
            }
        } else {
            this.updateSpeed();
        }

        this.updatePosition(dt);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const radius = (TILE_SIZE / 2) * 0.8;

        if (this.mode === GHOST_MODES.DEAD) {
            // Draw eyes only
            this.drawEyes(ctx, radius);
        } else {
            // Determine color
            let color = this.baseColor;
            if (this.mode === GHOST_MODES.FRIGHTENED) {
                color = this.isFlashing ? COLORS.FRIGHTENED_FLASH : COLORS.FRIGHTENED;
            }

            ctx.fillStyle = color;
            ctx.beginPath();
            
            // Draw ghost body (rounded top, zig-zag bottom)
            ctx.arc(0, -radius * 0.2, radius, Math.PI, 0);
            ctx.lineTo(radius, radius);
            ctx.lineTo(radius * 0.33, radius * 0.7);
            ctx.lineTo(-radius * 0.33, radius);
            ctx.lineTo(-radius, radius * 0.7);
            ctx.closePath();
            ctx.fill();

            if (this.mode !== GHOST_MODES.FRIGHTENED) {
                this.drawEyes(ctx, radius);
            } else {
                // Frightened face (simple mouth)
                ctx.strokeStyle = '#FFB8AE';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-radius * 0.4, 0);
                ctx.lineTo(-radius * 0.2, radius * 0.2);
                ctx.lineTo(0, 0);
                ctx.lineTo(radius * 0.2, radius * 0.2);
                ctx.lineTo(radius * 0.4, 0);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    drawEyes(ctx, radius) {
        // Whites
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-radius * 0.4, -radius * 0.2, radius * 0.3, 0, Math.PI * 2);
        ctx.arc(radius * 0.4, -radius * 0.2, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Pupils (look in direction of travel)
        ctx.fillStyle = 'blue';
        let px = this.dir.x * 2;
        let py = this.dir.y * 2;
        
        ctx.beginPath();
        ctx.arc(-radius * 0.4 + px, -radius * 0.2 + py, radius * 0.15, 0, Math.PI * 2);
        ctx.arc(radius * 0.4 + px, -radius * 0.2 + py, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }
}
