import { MAP_STR, charToType, TYPES, TILE_SIZE, COLORS } from './constants.js';
import Pellet from './Pellet.js';

export default class Maze {
    constructor() {
        this.grid = [];
        this.pellets = [];
        this.powerPellets = [];
        this.parseMap();
    }

    parseMap() {
        this.grid = [];
        this.pellets = [];
        this.powerPellets = [];

        for (let row = 0; row < MAP_STR.length; row++) {
            let gridRow = [];
            for (let col = 0; col < MAP_STR[row].length; col++) {
                const char = MAP_STR[row][col];
                const type = charToType(char);
                gridRow.push(type);

                if (type === TYPES.PELLET) {
                    this.pellets.push(new Pellet(col, row, false));
                } else if (type === TYPES.POWER_PELLET) {
                    this.powerPellets.push(new Pellet(col, row, true));
                }
            }
            this.grid.push(gridRow);
        }
    }

    resetPellets() {
        this.pellets.forEach(p => p.eaten = false);
        this.powerPellets.forEach(p => p.eaten = false);
    }

    isWall(col, row) {
        if (row < 0 || row >= this.grid.length || col < 0 || col >= this.grid[0].length) {
            return false; // Out of bounds is not wall, allows tunnel wrap
        }
        return this.grid[row][col] === TYPES.WALL;
    }

    isDoor(col, row) {
        if (row < 0 || row >= this.grid.length || col < 0 || col >= this.grid[0].length) return false;
        return this.grid[row][col] === TYPES.DOOR;
    }

    draw(ctx) {
        // Draw walls
        ctx.strokeStyle = COLORS.WALL;
        ctx.lineWidth = 2;

        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid[row].length; col++) {
                if (this.grid[row][col] === TYPES.WALL) {
                    const x = col * TILE_SIZE;
                    const y = row * TILE_SIZE;
                    
                    // Simple retro block style
                    ctx.beginPath();
                    ctx.roundRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4, 4);
                    ctx.stroke();
                } else if (this.grid[row][col] === TYPES.DOOR) {
                    const x = col * TILE_SIZE;
                    const y = row * TILE_SIZE;
                    ctx.fillStyle = '#FFB8FF'; // Pink door
                    ctx.fillRect(x, y + TILE_SIZE/2 - 2, TILE_SIZE, 4);
                }
            }
        }

        // Draw pellets
        this.pellets.forEach(p => p.draw(ctx));
        this.powerPellets.forEach(p => p.draw(ctx));
    }

    checkPelletCollision(col, row) {
        let score = 0;
        let eatenPowerPellet = false;

        // Regular pellets
        for (let i = 0; i < this.pellets.length; i++) {
            let p = this.pellets[i];
            if (!p.eaten && p.col === col && p.row === row) {
                p.eaten = true;
                score += 10;
                break; // Can only eat one per tile
            }
        }

        // Power pellets
        for (let i = 0; i < this.powerPellets.length; i++) {
            let p = this.powerPellets[i];
            if (!p.eaten && p.col === col && p.row === row) {
                p.eaten = true;
                score += 50;
                eatenPowerPellet = true;
                break;
            }
        }

        return { score, eatenPowerPellet };
    }

    hasPelletsLeft() {
        return this.pellets.some(p => !p.eaten) || this.powerPellets.some(p => !p.eaten);
    }
}
