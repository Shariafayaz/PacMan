import { TILE_SIZE, COLORS } from './constants.js';

export default class Pellet {
    constructor(col, row, isPower) {
        this.col = col;
        this.row = row;
        this.isPower = isPower;
        this.eaten = false;
        
        // Pixel coordinates (center of tile)
        this.x = this.col * TILE_SIZE + TILE_SIZE / 2;
        this.y = this.row * TILE_SIZE + TILE_SIZE / 2;
        
        this.radius = this.isPower ? 6 : 2;
        this.flashState = true;
        this.flashTimer = 0;
    }

    update(dt) {
        if (!this.isPower || this.eaten) return;
        
        this.flashTimer += dt;
        if (this.flashTimer > 200) { // Toggle every 200ms
            this.flashState = !this.flashState;
            this.flashTimer = 0;
        }
    }

    draw(ctx) {
        if (this.eaten) return;
        
        if (this.isPower && !this.flashState) {
            return; // Skip drawing to simulate flash
        }

        ctx.fillStyle = COLORS.PELLET;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
