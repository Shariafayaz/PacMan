export const TILE_SIZE = 24;

export const MAP_STR = [
  "################################",
  "#..............##..............#",
  "#.####.#######.##.#######.####.#",
  "#O####.#######.##.#######.####O#",
  "#.####.#######.##.#######.####.#",
  "#..............................#",
  "#.####.##.############.##.####.#",
  "#.####.##.############.##.####.#",
  "#......##......##......##......#",
  "######.####### ## #######.######",
  "      .##              ##.      ",
  "######.##  ####--####  ##.######",
  "      .    #xxxxxxxx#    .      ",
  "######.##  #xxxxxxxx#  ##.######",
  "      .##  ##########  ##.      ",
  "######.##              ##.######",
  "#..............##..............#",
  "#.####.#######.##.#######.####.#",
  "#O..##.........P .........##..O#",
  "###.##.##.############.##.##.###",
  "#......##......##......##......#",
  "#.############.##.############.#",
  "#..............................#",
  "################################"
];

export const MAP_COLS = MAP_STR[0].length; // 32
export const MAP_ROWS = MAP_STR.length; // 24

export const CANVAS_WIDTH = MAP_COLS * TILE_SIZE; // 768
export const CANVAS_HEIGHT = MAP_ROWS * TILE_SIZE; // 576

// Entity types in map
export const TYPES = {
    EMPTY: 0,
    WALL: 1,
    PELLET: 2,
    POWER_PELLET: 3,
    DOOR: 4,
    HOUSE: 5
};

// Map mapping
export const charToType = (char) => {
    switch(char) {
        case '#': return TYPES.WALL;
        case '.': return TYPES.PELLET;
        case 'O': return TYPES.POWER_PELLET;
        case '-': return TYPES.DOOR;
        case 'x': return TYPES.HOUSE;
        default: return TYPES.EMPTY;
    }
};

export const COLORS = {
    WALL: '#1919A6',
    PELLET: '#FFB8AE',
    PACMAN: '#FFFF00',
    BLINKY: '#FF0000',
    PINKY: '#FFB8FF',
    INKY: '#00FFFF',
    CLYDE: '#FFB852',
    FRIGHTENED: '#0000FF',
    FRIGHTENED_FLASH: '#FFFFFF'
};

export const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    NONE: { x: 0, y: 0 }
};

export const GAME_STATES = {
    START: 0,
    PLAYING: 1,
    PAUSED: 2,
    GAME_OVER: 3,
    VICTORY: 4,
    PACMAN_DYING: 5
};

export const SCORES = {
    PELLET: 10,
    POWER_PELLET: 50,
    GHOST: 200 // doubles for each consecutive ghost
};

// Base speeds (multiplier applied based on difficulty)
export const BASE_SPEEDS = {
    PACMAN: 10,
    GHOST_NORMAL: 8.5,
    GHOST_FRIGHTENED: 5,
    GHOST_TUNNEL: 4,
    GHOST_DEAD: 15
};

export const DIFFICULTIES = {
    easy: {
        speedMultiplier: 0.8,
        ghostSpeedMultiplier: 0.7,
        frightenedDuration: 8000 // longer
    },
    medium: {
        speedMultiplier: 1.0,
        ghostSpeedMultiplier: 1.0,
        frightenedDuration: 6000
    },
    hard: {
        speedMultiplier: 1.1,
        ghostSpeedMultiplier: 1.2,
        frightenedDuration: 3000 // shorter
    }
};

// Timings
export const TIMINGS = {
    FRIGHTENED_FLASH_DURATION: 2000, // ms
    SCATTER_DURATION_1: 7000,
    CHASE_DURATION_1: 20000,
    SCATTER_DURATION_2: 7000,
    CHASE_DURATION_2: 20000,
    SCATTER_DURATION_3: 5000,
    CHASE_DURATION_3: Infinity
};
