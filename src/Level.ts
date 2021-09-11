/*
 * MIT License
 *
 * Copyright (c) 2021 Sami H, Tero J
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { getCost, getRadius, Plant, Species } from "./Plant";
import { Cone } from "./Cone";
import { collides, GameObject, getContext, imageAssets, TileEngine } from "kontra";
import { Roller } from "./Roller";

const map =
  [ 2,  2,  2,  2,  3,  2,  2,  3,  2,  3,  3,  3,  2,  3,
    3,  2,  2,  2,  2,  3,  2,  2,  2,  2,  2,  3,  4,  2,
    2,  3,  2,  3,  3,  2,  2,  2,  2,  4,  3,  2,  3,  3,
    3,  3,  4,  2,  2,  3,  3,  2,  3,  2,  4,  3,  3,  2,
    2,  2,  3,  3,  2,  2,  2,  2,  3,  3,  2,  3,  3,  2,
    2,  2,  3,  2,  3,  3,  3,  3,  3,  3,  3,  2,  2,  3,
    2,  2,  3,  2,  2,  2,  3,  3,  3,  2,  3,  2,  3,  3,
    3,  2,  2,  2,  2,  2,  3,  2,  2,  3,  2,  3,  2,  3,
    3,  2,  2,  2,  2,  2,  3,  3,  3,  2,  3,  2,  3,  3,
    2,  2,  3,  3,  4,  2,  2,  2,  4,  3,  2,  3,  3,  2,
    2,  2,  2,  2,  3,  2,  2,  2,  2,  3,  2,  3,  2,  3,
    2,  3,  3,  2,  2,  2,  4,  3,  2,  3,  3,  3,  2,  3,
  ];

const TILE_WIDTH = 32;
const TILE_HEIGHT = 16;

const ATTACK_WAVE_INTERVAL = 15000;

interface GridPosition {
  xSquare: number;
  ySquare: number;
}

interface RelativePosition {
  xRel: number;
  yRel: number;
}

type Pattern = RelativePosition[];

export interface SquareBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const isInside = (point: { x: number; y: number }, bounds: SquareBounds): boolean => {
  return bounds.x <= point.x &&
    bounds.y <= point.y &&
    point.x < bounds.x + bounds.width &&
    point.y < bounds.y + bounds.height;
};

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

type ObjectSelector = (o: GameObject) => boolean;

const anyObject: ObjectSelector = () => true;
const otherThanRoller: ObjectSelector = (o) => !(o instanceof Roller);

enum State {
  Running,
  GameOver,
}

const PATTERNS: { [level: number]: Pattern; maxLevel: number } = {
  1: [
    { xRel: 0, yRel: 0 },
  ],
  2: [
    { xRel: 0, yRel: 0 },
    { xRel: 0, yRel: 1 },
  ],
  3: [
    { xRel: -2, yRel: 0 },
    { xRel: 0, yRel: 0 },
    { xRel: 2, yRel: 0 },
  ],
  4: [
    { xRel: 0, yRel: -2 },
    { xRel: -1, yRel: -1 },
    { xRel: 0, yRel: 0 },
    { xRel: -1, yRel: 1 },
    { xRel: 0, yRel: 2 },
  ],
  5: [
    { xRel: -2, yRel: 0 },
    { xRel: -2, yRel: 1 },
    { xRel: -1, yRel: 0 },
    { xRel: -1, yRel: 1 },
    { xRel: 0, yRel: 0 },
    { xRel: 0, yRel: 1 },
    { xRel: 1, yRel: 0 },
    { xRel: 1, yRel: 1 },
    { xRel: 2, yRel: 0 },
    { xRel: 2, yRel: 1 },
  ],
  6: [
    { xRel: -3, yRel: 0 },
    { xRel: -3, yRel: 1 },
    { xRel: -2, yRel: -1 },
    { xRel: -2, yRel: 0 },
    { xRel: -2, yRel: 1 },
    { xRel: -2, yRel: 2 },
    { xRel: -1, yRel: -2 },
    { xRel: -1, yRel: -1 },
    { xRel: -1, yRel: 0 },
    { xRel: -1, yRel: 1 },
    { xRel: -1, yRel: 2 },
    { xRel: -1, yRel: 3 },
    { xRel: 0, yRel: 0 },
    { xRel: 0, yRel: 1 },
    { xRel: 1, yRel: 0 },
    { xRel: 1, yRel: 1 },
    { xRel: 2, yRel: 0 },
    { xRel: 2, yRel: 1 },
  ],
  maxLevel: 6,
};

interface SquareInfo {
  pos: GridPosition;
  obj: GameObject | undefined;
}

interface Highlight {
  position: GridPosition;
  radius: number;
  available: boolean;
}

export class Level {
  private tileEngine: TileEngine;

  private gameObjects: GameObject[] = [];
  private rollers: Array<Roller>;

  private attackCount: number = 0;
  private attackStartTime: number = performance.now();
  private lastRollerCheckTime: number = performance.now();

  private lastEndingConditionCheck: number = performance.now();
  private state: State = State.Running;

  private highlight: Highlight | undefined;

  glucoseLevel: number = 0;
  score: number = 0;

  constructor() {
    this.tileEngine = TileEngine({
      tilewidth: TILE_WIDTH,
      tileheight: TILE_HEIGHT,

      width: 14,
      height: 12,

      tilesets: [{
        firstgid: 1,
        image: imageAssets['tiles.png'],
      }],

      layers: [{
        name: 'ground',
        data: map,
      }]
    });

    this.rollers = new Array<Roller>(this.tileEngine.height);

    this.addObject(new Plant('blue_flower'), { xSquare: 2, ySquare: 2 });
    this.addObject(new Plant('blue_flower'), { xSquare: 3, ySquare: 8 });
  }

  isGameOver(): boolean {
    return this.state === State.GameOver;
  }

  insertPlant(x: number, y: number, species: Species): void {
    if (this.state === State.GameOver) {
      return;
    }

    const cost = getCost(species);
    if (this.isInside(x, y) && cost <= this.glucoseLevel) {
      const position = this.toGridPosition(x, y);
      const isPaved = this.getTile(position) === 1;
      if (!isPaved && this.isFreeOf(position, anyObject)) {
        this.addObject(new Plant(species), position);
        this.glucoseLevel -= cost;
      }
    }
  }

  onMouseMove(x: number, y: number, selectedSpecies: Species) {
    if (this.isInside(x, y)) {
      const position = this.toGridPosition(x, y);
      const tile = this.getTile(position);
      if (tile === 1) {
        this.highlight = {
          position,
          radius: 0,
          available: false,
        };
      } else {
        this.highlight = {
          position,
          radius: getRadius(selectedSpecies),
          available: true,
        };
      }
    } else {
      this.highlight = undefined;
    }
  }

  update(): void {
    const now = performance.now();

    if (this.state !== State.GameOver && now - this.lastEndingConditionCheck > 1000) {
      this.lastEndingConditionCheck = now;
      if (this.checkIsGameOver()) {
        this.state = State.GameOver;
      }
    }

    if (this.state !== State.GameOver && now - this.attackStartTime > ATTACK_WAVE_INTERVAL) {
      this.attackStartTime = now;
      this.attackCount += 1;
      this.attack();
    }

    if (now - this.lastRollerCheckTime > 200) {
      this.lastRollerCheckTime = now;
      this.checkRollersMovement();
    }

    for (const o of this.gameObjects) {
      o.update();

      if (o instanceof Roller && o.dx < 0) {
        this.pave(o);
      }

      if (o instanceof Plant) {
        const glucose = o.getGlucose();
        if (glucose > 0) {
          this.glucoseLevel += glucose;
        }

        if (o.canGrab()) {
          const cone = this.findAdjascentObject(o, o => o instanceof Cone && o.state !== 'grabbed');
          if (cone) {
            o.startGrabbing();
            cone.grab();
            this.score += 1;
          }
        }
      }
    }

    this.gameObjects = this.gameObjects.filter(o => o.isAlive());
  }

  private checkRollersMovement() {
    const rowCount = this.tileEngine.height;
    const rowHeight = this.tileEngine.tileheight;
    const conesOnRows = new Array<boolean>(rowCount).fill(false);

    // Find which rows have at least one cone in them.
    for (const o of this.gameObjects) {
      if (o instanceof Cone) {
        const bounds = this.getSquareBounds(o);
        const row = Math.floor(bounds.y / rowHeight);
        conesOnRows[row] = true;
      }
    }

    // Update rollers movement based on if there are cones.
    for (let row = 0; row < rowCount; row++) {
      const roller = this.rollers[row];
      if (roller) {
        if (conesOnRows[row] && roller.dx === 0) {
          roller.move();
        }
        if (!conesOnRows[row] && roller.dx !== 0) {
          roller.stop();
        }
      }
    }
  }

  private checkIsGameOver(): boolean {
    const width = this.tileEngine.width;
    const height = this.tileEngine.height;
    const totalTileCount = width * height;
    let asphaltTileCount = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = this.tileEngine.tileAtLayer('ground', { row: y, col: x });
        if (tile === 1) {
          asphaltTileCount++;
        }
      }
    }

    if (asphaltTileCount >= totalTileCount - 2) {
      return true;
    }

    return false;
  }

  private pave(roller: Roller): void {
    const pos = this.toGridPosition(roller.x + roller.width, roller.y + (roller.height - TILE_HEIGHT));
    const tile = this.getTile(pos);
    if (tile != null && tile !== 1) {
      this.setTile(pos, 1);
      const objectAtTile = this.findObject(pos, otherThanRoller);
      if (objectAtTile) {
        objectAtTile.ttl = 0;
      }
    }
  }

  private getAttackLevel(): number {
    const n = this.attackCount;

    if (n <= 3) {
      return 1;
    }
    if (n <= 6) {
      return 2;
    }
    if (n < 8) {
      return 3;
    }
    if (n < 10) {
      return 4;
    }
    if (n < 15) {
      return 5;
    }

    return 6;
  }

  private attack(): void {
    const availableTiles = this.getAvailableTilesInFrontOfRollers();

    if (availableTiles.length === 0) {
      return;
    }

    const freeTiles: SquareInfo[] = availableTiles.map((pos) => ({
      pos,
      obj: this.findObject(pos, anyObject),
    })).filter(({ obj }) => obj == null || obj instanceof Plant);

    const level = Math.min(freeTiles.length, this.getAttackLevel());

    if (level === 0) {
      return;
    }

    const pattern: Pattern = PATTERNS[Math.min(level, PATTERNS.maxLevel)];
    let bestAttack: SquareInfo[] = [];
    let bestValue: number = 0;

    for (let i = 0; i < 10; i++) {
      const anchor = getRandomElement(freeTiles).pos;
      let squares = this.getAttackSquares(pattern, anchor, freeTiles);
      let value = this.evaluateAttackSquares(squares);

      if (value > bestValue) {
        bestAttack = squares;
        bestValue = value;
      }
    }

    for (const square of bestAttack) {
      if (square.obj instanceof Plant) {
        square.obj.ttl = 0;
      }

      this.insertCone(square.pos);
    }
  }

  private evaluateAttackSquares(squares: SquareInfo[]): number {
    return squares.reduce((total, current) => total + (current.obj ? 3 : 1), 0);
  }

  private getAttackSquares(pattern: Pattern, anchor: GridPosition, freeTiles: SquareInfo[]): SquareInfo[] {
    const attackSquares: SquareInfo[] = [];

    for (const pat of pattern) {
      const matchingSquare = freeTiles.find((p) =>
        p.pos.xSquare === anchor.xSquare + pat.xRel && p.pos.ySquare === anchor.ySquare + pat.yRel);
      if (matchingSquare) {
        attackSquares.push(matchingSquare);
      }
    }

    return attackSquares;
  }

  private insertCone(pos: GridPosition): void {
    const cone = new Cone();
    this.addObject(cone, pos);

    // Add roller if there isn't one on this row yet.
    if (!this.rollers[pos.ySquare]) {
      const newRoller = new Roller();
      this.addObject(newRoller, { xSquare: this.tileEngine.width, ySquare: pos.ySquare });
      this.rollers[pos.ySquare] = newRoller;
    }
  }

  private getAvailableTilesInFrontOfRollers(): GridPosition[] {
    const width = this.tileEngine.width;
    const height = this.tileEngine.height;
    const result: GridPosition[] = [];

    for (let y = 0; y < height; y++) {
      let freeCount = width - 1;

      const roller = this.rollers[y];
      if (roller) {
        const bounds = this.getSquareBounds(roller);
        const gridPos = this.toGridPosition(bounds.x, bounds.y);
        freeCount = Math.max(0, gridPos.xSquare);
      }

      for (let x = 0; x < freeCount; x++) {
        result.push({ xSquare: x, ySquare: y });
      }
    }

    return result;
  }

  render(): void {
    const context = getContext();
    // Sort objects for perspective effect, back-to-front.
    this.gameObjects.sort((a, b) => a.y - b.y);

    this.tileEngine.render();

    this.renderHighlight(context);

    for (const o of this.gameObjects) {
      o.render();
    }
  }

  private renderHighlight(context: CanvasRenderingContext2D) {
    if (!this.highlight) {
      return;
    }

    const r = this.highlight.radius;
    const x = this.highlight.position.xSquare * TILE_WIDTH - r * TILE_WIDTH;
    const y = this.highlight.position.ySquare * TILE_HEIGHT - r * TILE_HEIGHT;
    const width = TILE_WIDTH + 2 * r * TILE_WIDTH;
    const height = TILE_HEIGHT + 2 * r * TILE_HEIGHT;

    context.save();
    context.fillStyle = this.highlight.available ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)';
    context.globalAlpha = 0.5;
    context.fillRect(x, y, width, height);
    context.restore();
  }

  private findObject(position: GridPosition, selector: ObjectSelector): GameObject | undefined {
    const square: SquareBounds = {
      x: position.xSquare * TILE_WIDTH,
      y: position.ySquare * TILE_HEIGHT,
      width: TILE_WIDTH,
      height: TILE_HEIGHT,
    };

    for (const o of this.gameObjects) {
      if (selector(o) && collides(this.getSquareBounds(o), square)) {
        return o;
      }
    }

    return undefined;
  }

  private findAdjascentObject(o: GameObject, selector: ObjectSelector): GameObject | undefined {
    const nearbyArea = {
      x: o.x - TILE_WIDTH,
      y: o.y + (o.height - TILE_HEIGHT) - TILE_HEIGHT,
      width: TILE_WIDTH * 3,
      height: TILE_HEIGHT * 3,
    };

    for (const other of this.gameObjects) {
      if (selector(other) && collides(this.getSquareBounds(other), nearbyArea)) {
        return other;
      }
    }

    return undefined;
  }

  private getTile(position: GridPosition): number | null {
    if (0 <= position.xSquare &&
      position.xSquare < this.tileEngine.width &&
      0 <= position.ySquare &&
      position.ySquare < this.tileEngine.height)
    {
      return this.tileEngine.tileAtLayer('ground', { row: position.ySquare, col: position.xSquare });
    }

    return null;
  }

  private setTile(position: GridPosition, tile: number): void {
    this.tileEngine.setTileAtLayer('ground', { row: position.ySquare, col: position.xSquare }, tile);
  }

  private getSquareBounds(o: GameObject): SquareBounds {
    return {
      x: o.x,
      y: o.y + (o.height - TILE_HEIGHT),
      width: TILE_WIDTH,
      height: TILE_HEIGHT,
    };
  }

  private isFreeOf(position: GridPosition, selector: ObjectSelector): boolean {
    const square: SquareBounds = {
      x: position.xSquare * TILE_WIDTH,
      y: position.ySquare * TILE_HEIGHT,
      width: TILE_WIDTH,
      height: TILE_HEIGHT,
    };

    for (const o of this.gameObjects) {
      if (selector(o) && collides(this.getSquareBounds(o), square)) {
        return false;
      }
    }

    return true;
  }

  private toGridPosition(x: number, y: number): GridPosition {
    return {
      xSquare: Math.floor(x / TILE_WIDTH),
      ySquare: Math.floor(y / TILE_HEIGHT),
    };
  }

  private addObject(o: GameObject, position: GridPosition): void {
    o.x = position.xSquare * TILE_WIDTH;
    o.y = position.ySquare * TILE_HEIGHT - (o.height - TILE_HEIGHT);
    this.gameObjects.push(o);
  }

  private isInside(x: number, y: number): boolean {
    return 0 <= x && x < this.tileEngine.mapwidth && 0 <= y && y < this.tileEngine.mapheight;
  }
}
