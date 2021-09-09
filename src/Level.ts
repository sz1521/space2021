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

import { getCost, Plant, Species } from "./Plant";
import { Cone } from "./Cone";
import { collides, GameObject, imageAssets, TileEngine } from "kontra";
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

const ATTACK_INTERVAL = 3000;
const ATTACK_ADVANCE_INTERVAL = 6000;

interface GridPosition {
  xSquare: number;
  ySquare: number;
}

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

type ObjectSelector = (o: GameObject) => boolean;

const anyObject: ObjectSelector = () => true;
const otherThanRoller: ObjectSelector = (o) => !(o instanceof Roller);

enum State {
  Running,
  GameOver,
}

export class Level {
  private tileEngine: TileEngine;

  private gameObjects: GameObject[] = [];
  private rollers: Array<Roller>;

  private attackXSquare: number;
  private attackStartTime: number = performance.now();
  private attackAdvanceTime: number = performance.now();

  private lastEndingConditionCheck: number = performance.now();
  private state: State = State.Running;

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
    this.attackXSquare = this.tileEngine.width - 3;

    this.addObject(new Plant('blue_flower'), { xSquare: 2, ySquare: 2 });
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

  update(): void {
    const now = performance.now();

    if (this.state !== State.GameOver && now - this.lastEndingConditionCheck > 1000) {
      this.lastEndingConditionCheck = now;
      if (this.checkIsGameOver()) {
        this.state = State.GameOver;
      }
    }

    if (now - this.attackStartTime > ATTACK_INTERVAL) {
      this.attackStartTime = now;
      this.attack();
    }

    if (this.attackXSquare > 0 && now - this.attackAdvanceTime > ATTACK_ADVANCE_INTERVAL) {
      this.attackAdvanceTime = now;
      this.attackXSquare -= 1;
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

  checkIsGameOver(): boolean {
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

  private attack(): void {
    // try 10 times
    for (let i = 0; i < 10; i++) {
      const pos: GridPosition = {
        xSquare: this.attackXSquare,
        ySquare: Math.floor(Math.random() * this.tileEngine.height),
      };

      const objectAtTile = this.findObject(pos, anyObject);

      if (objectAtTile == null || objectAtTile instanceof Plant) {
        if (objectAtTile instanceof Plant) {
          objectAtTile.ttl = 0;
        }

        const cone = new Cone();
        this.addObject(cone, pos);

        // Add roller if there isn't one on this row yet.
        if (!this.rollers[pos.ySquare]) {
          const newRoller = new Roller();
          newRoller.setObjectToFollow(cone);
          this.addObject(newRoller, { xSquare: this.tileEngine.width, ySquare: pos.ySquare });
          this.rollers[pos.ySquare] = newRoller;
        } else {
          const existingRoller = this.rollers[pos.ySquare];
          if (existingRoller.dx === 0) {
            existingRoller.setObjectToFollow(cone);
          }
        }

        break;
      }
    }
  }

  render(): void {
    // Sort objects for perspective effect, back-to-front.
    this.gameObjects.sort((a, b) => a.y - b.y);

    this.tileEngine.render();
    for (const o of this.gameObjects) {
      o.render();
    }
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
