import Entity from './Entity.js';
import { DIRECTIONS, COLORS, BASE_SPEEDS, TILE_SIZE } from './constants.js';

export default class PacMan extends Entity {
    constructor(maze, startCol, startRow, diffObj) {
        super(maze, startCol, startRow, BASE_SPEEDS.PACMAN * diffObj.speedMultiplier);
        this.mouthOpen = 0; // 0 to 1
        this.mouthDir = 1; // 1 opening, -1 closing
        this.angle = 0;
    }

    update(dt, inputDir) {
        this.setDirection(inputDir);
        this.updatePosition(dt);

        // Animate mouth if moving
        if (this.dir !== DIRECTIONS.NONE) {
            this.mouthOpen += this.mouthDir * (dt / 150);
            if (this.mouthOpen >= 1) {
                this.mouthOpen = 1;
                this.mouthDir = -1;
            } else if (this.mouthOpen <= 0) {
                this.mouthOpen = 0;
                this.mouthDir = 1;
            }

            // Set drawing angle based on direction
            if (this.dir === DIRECTIONS.RIGHT) this.angle = 0;
            else if (this.dir === DIRECTIONS.DOWN) this.angle = Math.PI / 2;
            else if (this.dir === DIRECTIONS.LEFT) this.angle = Math.PI;
            else if (this.dir === DIRECTIONS.UP) this.angle = -Math.PI / 2;
        } else {
            this.mouthOpen = 0.2; // Slightly open when stopped
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = COLORS.PACMAN;
        ctx.beginPath();
        
        const mouthAngle = this.mouthOpen * 0.25 * Math.PI;
        
        ctx.arc(0, 0, TILE_SIZE / 2 * 0.8, mouthAngle, 2 * Math.PI - mouthAngle);
        ctx.lineTo(0, 0);
        ctx.fill();

        ctx.restore();
    }
}
