import { TILE_SIZE, DIRECTIONS, MAP_COLS } from './constants.js';

export default class Entity {
    constructor(maze, startCol, startRow, speed) {
        this.maze = maze;
        this.col = startCol;
        this.row = startRow;
        this.x = this.col * TILE_SIZE + TILE_SIZE / 2;
        this.y = this.row * TILE_SIZE + TILE_SIZE / 2;
        
        this.speed = speed; // Tiles per second
        this.dir = DIRECTIONS.NONE;
        this.nextDir = DIRECTIONS.NONE;
        
        // Target tile for movement interpolation
        this.targetCol = this.col;
        this.targetRow = this.row;
    }

    // Set a new direction if possible
    setDirection(direction) {
        this.nextDir = direction;
    }

    canMove(dir) {
        if (dir === DIRECTIONS.NONE) return false;
        const testCol = this.col + dir.x;
        const testRow = this.row + dir.y;
        
        // Entity can pass through doors if it's a ghost (handled in Ghost class)
        // Base entity only checks for walls
        return !this.maze.isWall(testCol, testRow);
    }

    updatePosition(dt) {
        const speedPixels = (this.speed * TILE_SIZE) * (dt / 1000);
        
        // If we are at the center of a tile, we can decide to turn
        const centerX = this.col * TILE_SIZE + TILE_SIZE / 2;
        const centerY = this.row * TILE_SIZE + TILE_SIZE / 2;
        
        const distToCenter = Math.abs(this.x - centerX) + Math.abs(this.y - centerY);
        const margin = speedPixels * 1.5; // Snap margin

        if (distToCenter <= margin) {
            // We are close to the center of the current tile
            
            // Snap to center exactly before turning
            this.x = centerX;
            this.y = centerY;
            
            // Try to change direction to nextDir
            if (this.nextDir !== this.dir && this.nextDir !== DIRECTIONS.NONE) {
                if (this.canMove(this.nextDir)) {
                    this.dir = this.nextDir;
                }
            }

            // Move forward if possible
            if (this.canMove(this.dir)) {
                this.x += this.dir.x * speedPixels;
                this.y += this.dir.y * speedPixels;
                // Update grid position based on movement
                if (this.dir.x > 0) this.col++;
                if (this.dir.x < 0) this.col--;
                if (this.dir.y > 0) this.row++;
                if (this.dir.y < 0) this.row--;
                
                // Tunnel wrap logic
                if (this.col < 0) {
                    this.col = MAP_COLS - 1;
                    this.x = this.col * TILE_SIZE + TILE_SIZE / 2;
                } else if (this.col >= MAP_COLS) {
                    this.col = 0;
                    this.x = this.col * TILE_SIZE + TILE_SIZE / 2;
                }
            } else {
                this.dir = DIRECTIONS.NONE;
            }
        } else {
            // Keep moving in current direction towards next tile center
            this.x += this.dir.x * speedPixels;
            this.y += this.dir.y * speedPixels;
        }
    }
}
