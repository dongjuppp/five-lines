
const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum RawTile {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE, FALLING_STONE,
  BOX, FALLING_BOX,
  KEY1, LOCK1,
  KEY2, LOCK2
}

interface Input {
  isRight(): boolean;
  isLeft(): boolean;
  isUp(): boolean;
  isDown(): boolean;
  handle(): void;
}

class Right implements Input {
  isDown(): boolean {
    return false;
  }

  isLeft(): boolean {
    return false;
  }

  isRight(): boolean {
    return true;
  }

  isUp(): boolean {
    return false;
  }

  handle() {
    map[playery][playerx + 1].moveHorizontal(1);
  }

}

class Left implements Input {
  isDown(): boolean {
    return false;
  }

  isLeft(): boolean {
    return true;
  }

  isRight(): boolean {
    return false;
  }

  isUp(): boolean {
    return false;
  }

  handle() {
    map[playery][playerx + -1].moveHorizontal(-1);
  }

}

class Up implements Input {
  isDown(): boolean {
    return false;
  }

  isLeft(): boolean {
    return false;
  }

  isRight(): boolean {
    return false;
  }

  isUp(): boolean {
    return true;
  }

  handle() {
    map[playery + -1][playerx].moveVertical(-1);
  }
}

class Down implements Input {
  isDown(): boolean {
    return true;
  }

  isLeft(): boolean {
    return false;
  }

  isRight(): boolean {
    return false;
  }

  isUp(): boolean {
    return false;
  }

  handle() {
    map[playery + 1][playerx].moveVertical(1);
  }

}

let playerx = 1;
let playery = 1;
let rawMap: RawTile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];

let inputs: Input[] = [];

let map: Tile[][];

function assertExhausted(x: never): never {
  throw new Error("Unexpected object: " + x);
}

function transformTile(tile: RawTile) {
  switch (tile) {
    case RawTile.AIR: return new Air();
    case RawTile.PLAYER: return new Player();
    case RawTile.UNBREAKABLE: return new Unbreakable();
    case RawTile.STONE: return new Stone();
    case RawTile.FALLING_STONE: return new FallingStone();
    case RawTile.BOX: return new Box();
    case RawTile.FALLING_BOX: return new FallingBox();
    case RawTile.FLUX: return new Flux();
    case RawTile.KEY1: return new Key1();
    case RawTile.KEY2: return new Key2();
    case RawTile.LOCK1: return new Lock1();
    case RawTile.LOCK2: return new Lock2();
    default: assertExhausted(tile);
  }
}

function transformMap() {
  map = new Array(rawMap.length);
  for(let y = 0; y < rawMap.length ; y++) {
    map[y] = new Array(rawMap[y].length);
    for(let x = 0 ; x < rawMap[y].length; y++) {
      map[y][x] = transformTile(rawMap[y][x]);
    }
  }
}

function removeLock1() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x].isLock1()) {
        map[y][x] = new Air();
      }
    }
  }
}


function removeLock2() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x].isLock2()) {
        map[y][x] = new Air();
      }
    }
  }
}

function moveToTile(newx: number, newy: number) {
  map[playery][playerx] = new Air();
  map[newy][newx] = new Player();
  playerx = newx;
  playery = newy;
}

function update() {
  handleInputs();
  updateMap();
}

function handleInputs() {
  while (inputs.length > 0) {
    let current = inputs.pop();
    current.handle();
  }
}

function updateMap() {
  for (let y = map.length - 1; y >= 0; y--) {
    for (let x = 0; x < map[y].length; x++) {
      updateTile(x, y);
    }
  }
}

function updateTile(x: number, y: number) {
  if ((map[y][x].isStone() || map[y][x].isFallingStone())
      && map[y + 1][x].isAir()) {
    map[y + 1][x] = new FallingStone();
    map[y][x] = new Air();
  } else if ((map[y][x].isBox() || map[y][x].isFallingBox())
      && map[y + 1][x].isAir()) {
    map[y + 1][x] = new FallingBox();
    map[y][x] = new Air();
  } else if (map[y][x].isFallingStone()) {
    map[y][x] = new Stone();
  } else if (map[y][x].isFallingBox()) {
    map[y][x] = new Box();
  }
}

function draw() {
  let g = createGraphics();
  drawMap(g);
  drawPlayer(g);
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");

  g.clearRect(0, 0, canvas.width, canvas.height);

  return g
}

interface Tile {
  moveHorizontal(dx: number): void;
  moveVertical(dy: number): void;
  isFlux(): boolean;
  isUnbreakable(): boolean;
  isStone(): boolean;
  isFallingStone(): boolean;
  isBox(): boolean;
  isFallingBox(): boolean;
  isKey1(): boolean;
  isKey2(): boolean;
  isLock1(): boolean;
  isLock2(): boolean;
  isAir(): boolean;
  isPlayer(): boolean;
  color(g: CanvasRenderingContext2D): void;
  isEdible(): boolean;
  isPushable(): boolean;
}

class Lock2 implements Tile {

  moveHorizontal(dx: number) {
  }

  moveVertical(dy: number) {
  }

  color(g: CanvasRenderingContext2D) {
    g.fillStyle = "#00ccff";
  }
  isBox(): boolean {
    return false;
  }

  isFallingBox(): boolean {
    return false;
  }

  isFallingStone(): boolean {
    return false;
  }

  isFlux(): boolean {
    return false;
  }

  isKey1(): boolean {
    return false;
  }

  isKey2(): boolean {
    return false;
  }

  isLock1(): boolean {
    return false;
  }

  isLock2(): boolean {
    return true;
  }

  isStone(): boolean {
    return false;
  }

  isUnbreakable(): boolean {
    return false;
  }

  isAir(): boolean {
    return false;
  }

  isPlayer(): boolean {
    return false;
  }

  isEdible(): boolean {
    return false;
  }

  isPushable(): boolean {
    return false;
  }

}

class Lock1 implements Tile {

  moveHorizontal(dx: number) {
  }

  moveVertical(dy: number) {
  }

  color(g: CanvasRenderingContext2D) {
    g.fillStyle = "#ffcc00";
  }

  isAir(): boolean {
    return false;
  }

  isPlayer(): boolean {
    return false;
  }
  isBox(): boolean {
    return false;
  }

  isFallingBox(): boolean {
    return false;
  }

  isFallingStone(): boolean {
    return false;
  }

  isFlux(): boolean {
    return false;
  }

  isKey1(): boolean {
    return false;
  }

  isKey2(): boolean {
    return false;
  }

  isLock1(): boolean {
    return true;
  }

  isLock2(): boolean {
    return false;
  }

  isStone(): boolean {
    return false;
  }

  isUnbreakable(): boolean {
    return false;
  }

  isEdible(): boolean {
    return false;
  }

  isPushable(): boolean {
    return false;
  }

}

class Key2 implements Tile {

  moveHorizontal(dx: number) {
    removeLock2();
    moveToTile(playerx + dx, playery);
  }

  moveVertical(dy: number) {
    removeLock2();
    moveToTile(playerx, playery + dy);
  }

  color( g: CanvasRenderingContext2D) {
    g.fillStyle = "#00ccff";
  }
  isBox(): boolean {
    return false;
  }

  isFallingBox(): boolean {
    return false;
  }

  isFallingStone(): boolean {
    return false;
  }
  isAir(): boolean {
    return false;
  }

  isPlayer(): boolean {
    return false;
  }
  isFlux(): boolean {
    return false;
  }

  isKey1(): boolean {
    return false;
  }

  isKey2(): boolean {
    return true;
  }

  isLock1(): boolean {
    return false;
  }

  isLock2(): boolean {
    return false;
  }

  isStone(): boolean {
    return false;
  }

  isUnbreakable(): boolean {
    return false;
  }

  isEdible(): boolean {
    return false;
  }

  isPushable(): boolean {
    return false;
  }
}

class Key1 implements Tile {

  moveHorizontal(dx: number) {
    removeLock1();
    moveToTile(playerx + dx, playery);
  }

  moveVertical(dy: number) {
    removeLock1();
    moveToTile(playerx, playery + dy);
  }

  color(g: CanvasRenderingContext2D) {

    g.fillStyle = "#ffcc00";

  }
  isBox(): boolean {
    return false;
  }

  isFallingBox(): boolean {
    return false;
  }
  isAir(): boolean {
    return false;
  }

  isPlayer(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return false;
  }

  isFlux(): boolean {
    return false;
  }

  isKey1(): boolean {
    return true;
  }

  isKey2(): boolean {
    return false;
  }

  isLock1(): boolean {
    return false;
  }

  isLock2(): boolean {
    return false;
  }

  isStone(): boolean {
    return false;
  }

  isUnbreakable(): boolean {
    return false;
  }

  isEdible(): boolean {
    return false;
  }

  isPushable(): boolean {
    return false;
  }

}

class FallingBox implements Tile {

  moveHorizontal(dx: number) {
  }

  moveVertical(dy: number) {
  }

  color(g: CanvasRenderingContext2D) {

    g.fillStyle = "#8b4513";

  }
  isBox(): boolean {
    return false;
  }

  isFallingBox(): boolean {
    return true;
  }
  isAir(): boolean {
    return false;
  }

  isPlayer(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return false;
  }

  isFlux(): boolean {
    return false;
  }

  isKey1(): boolean {
    return false;
  }

  isKey2(): boolean {
    return false;
  }

  isLock1(): boolean {
    return false;
  }

  isLock2(): boolean {
    return false;
  }

  isStone(): boolean {
    return false;
  }

  isUnbreakable(): boolean {
    return false;
  }

  isEdible(): boolean {
    return false;
  }

  isPushable(): boolean {
    return false;
  }

}

class Box implements Tile {

  moveHorizontal(dx: number) {
    if(map[playery][playerx + dx + dx].isAir() && !map[playery + 1][playerx + dx].isAir()) {
      map[playery][playerx + dx + dx] = map[playery][playerx + dx];
      moveToTile(playerx + dx, playery);
    }
  }

  moveVertical(dy: number) {
  }

  color( g: CanvasRenderingContext2D) {

    g.fillStyle = "#8b4513";

  }
  isBox(): boolean {
    return true;
  }

  isFallingBox(): boolean {
    return false;
  }

  isFallingStone(): boolean {
    return false;
  }
  isAir(): boolean {
    return false;
  }

  isPlayer(): boolean {
    return false;
  }
  isFlux(): boolean {
    return false;
  }

  isKey1(): boolean {
    return false;
  }

  isKey2(): boolean {
    return false;
  }

  isLock1(): boolean {
    return false;
  }

  isLock2(): boolean {
    return false;
  }

  isStone(): boolean {
    return false;
  }

  isUnbreakable(): boolean {
    return false;
  }

  isEdible(): boolean {
    return false;
  }

  isPushable(): boolean {
    return true;
  }

}

class FallingStone implements Tile {

  moveHorizontal(dx: number) {
  }

  moveVertical(dy: number) {
  }

  color(g: CanvasRenderingContext2D) {

    g.fillStyle = "#0000cc";

  }
  isBox(): boolean {
    return false;
  }

  isFallingBox(): boolean {
    return false;
  }
  isAir(): boolean {
    return false;
  }

  isPlayer(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return true;
  }

  isFlux(): boolean {
    return false;
  }

  isKey1(): boolean {
    return false;
  }

  isKey2(): boolean {
    return false;
  }

  isLock1(): boolean {
    return false;
  }

  isLock2(): boolean {
    return false;
  }

  isStone(): boolean {
    return false;
  }

  isUnbreakable(): boolean {
    return false;
  }

  isEdible(): boolean {
    return false;
  }

  isPushable(): boolean {
    return false;
  }

}
class Stone implements Tile {

  moveHorizontal(dx: number) {
    if(map[playery][playerx + dx + dx].isAir() && !map[playery + 1][playerx + dx].isAir()) {
      map[playery][playerx + dx + dx] = map[playery][playerx + dx];
      moveToTile(playerx + dx, playery);
    }
  }

  moveVertical(dy: number) {
  }

  color(g: CanvasRenderingContext2D) {

    g.fillStyle = "#0000cc";

  }
  isBox(): boolean {
    return false;
  }

  isFallingBox(): boolean {
    return false;
  }
  isAir(): boolean {
    return false;
  }

  isPlayer(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return false;
  }

  isFlux(): boolean {
    return false;
  }

  isKey1(): boolean {
    return false;
  }

  isKey2(): boolean {
    return false;
  }

  isLock1(): boolean {
    return false;
  }

  isLock2(): boolean {
    return false;
  }

  isStone(): boolean {
    return true;
  }

  isUnbreakable(): boolean {
    return false;
  }

  isEdible(): boolean {
    return false;
  }

  isPushable(): boolean {
    return true;
  }

}

class Unbreakable implements Tile {

  moveHorizontal(dx: number) {
  }

  moveVertical(dy: number) {
  }

  color(g: CanvasRenderingContext2D) {

    g.fillStyle = "#999999";

  }
  isBox(): boolean {
    return false;
  }

  isFallingBox(): boolean {
    return false;
  }

  isFallingStone(): boolean {
    return false;
  }
  isAir(): boolean {
    return false;
  }

  isPlayer(): boolean {
    return false;
  }
  isFlux(): boolean {
    return false;
  }

  isKey1(): boolean {
    return false;
  }

  isKey2(): boolean {
    return false;
  }

  isLock1(): boolean {
    return false;
  }

  isLock2(): boolean {
    return false;
  }

  isStone(): boolean {
    return false;
  }

  isUnbreakable(): boolean {
    return true;
  }

  isEdible(): boolean {
    return false;
  }

  isPushable(): boolean {
    return false;
  }

}
class Flux implements Tile{

  moveHorizontal(dx: number) {
    moveToTile(playerx + dx, playery);
  }

  moveVertical(dy: number) {
    moveToTile(playerx, playery + dy);
  }

  color(g: CanvasRenderingContext2D) {

    g.fillStyle = "#ccffcc";

  }
  isBox(): boolean {
    return false;
  }
  isAir(): boolean {
    return false;
  }

  isPlayer(): boolean {
    return false;
  }
  isFallingBox(): boolean {
    return false;
  }

  isFallingStone(): boolean {
    return false;
  }

  isFlux(): boolean {
    return true;
  }

  isKey1(): boolean {
    return false;
  }

  isKey2(): boolean {
    return false;
  }

  isLock1(): boolean {
    return false;
  }

  isLock2(): boolean {
    return false;
  }

  isStone(): boolean {
    return false;
  }

  isUnbreakable(): boolean {
    return false;
  }

  isEdible(): boolean {
    return true;
  }

  isPushable(): boolean {
    return false;
  }

}

class Air implements Tile {

  moveHorizontal(dx: number) {
    moveToTile(playerx + dx, playery);
  }

  moveVertical(dy: number) {
    moveToTile(playerx, playery + dy);
  }

  color(g: CanvasRenderingContext2D) {

  }
  isAir(): boolean {
    return true;
  }

  isBox(): boolean {
    return false;
  }

  isFallingBox(): boolean {
    return false;
  }

  isFallingStone(): boolean {
    return false;
  }

  isFlux(): boolean {
    return false;
  }

  isKey1(): boolean {
    return false;
  }

  isKey2(): boolean {
    return false;
  }

  isLock1(): boolean {
    return false;
  }

  isLock2(): boolean {
    return false;
  }

  isPlayer(): boolean {
    return false;
  }

  isStone(): boolean {
    return false;
  }

  isUnbreakable(): boolean {
    return false;
  }

  isEdible(): boolean {
    return true;
  }

  isPushable(): boolean {
    return false;
  }

}

class Player implements Tile {

  moveHorizontal(dx: number) {
  }

  moveVertical(dy: number) {
  }

  color(g: CanvasRenderingContext2D) {

  }
  isAir(): boolean {
    return false;
  }

  isBox(): boolean {
    return false;
  }

  isFallingBox(): boolean {
    return false;
  }

  isFallingStone(): boolean {
    return false;
  }

  isFlux(): boolean {
    return false;
  }

  isKey1(): boolean {
    return false;
  }

  isKey2(): boolean {
    return false;
  }

  isLock1(): boolean {
    return false;
  }

  isLock2(): boolean {
    return false;
  }

  isPlayer(): boolean {
    return true;
  }

  isStone(): boolean {
    return false;
  }

  isUnbreakable(): boolean {
    return false;
  }

  isEdible(): boolean {
    return false;
  }

  isPushable(): boolean {
    return false;
  }

}
function colorOfTile(y: number, x: number, g: CanvasRenderingContext2D) {
  map[y][x].color(g);
}

function drawMap(g: CanvasRenderingContext2D) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      drawTile(g, x, y);
    }
  }
}

function drawTile(g: CanvasRenderingContext2D, x: number, y: number) {
  map[y][x].color(g);
  if(!map[y][x].isAir() && !map[y][x].isPlayer()) {
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}

function drawPlayer(g: CanvasRenderingContext2D) {
  g.fillStyle = "#ff0000";
  g.fillRect(playerx * TILE_SIZE, playery * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function gameLoop() {
  let before = Date.now();
  update();
  draw();
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(() => gameLoop(), sleep);
}

window.onload = () => {
  transformMap();
  gameLoop();
}

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", e => {
  if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
  else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
  else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
  else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});

