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

import { Plant, Species } from "./Plant";
import { Cone } from "./Cone";
import { collides, GameObject, imageAssets, TileEngine } from "kontra";

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

export class Level {
  private tileEngine: TileEngine;
  private gameObjects: GameObject[] = [];
  private attackStartTime: number = performance.now();

  selectedSpecies: Species = 'blue_flower';

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

    const flower = new Plant('blue_flower');
    flower.x = 64;
    flower.y = 64;
    this.gameObjects.push(flower);
  }

  onClick(x: number, y: number): void {
    if (0 <= x && x < this.tileEngine.mapwidth && 0 <= y && y < this.tileEngine.mapheight) {
      const position = this.toGridPosition(x, y);
      if (this.isFreeOf(position, anyObject)) {
        this.addObject(new Plant(this.selectedSpecies), position);
      }
    }
  }

  update(): void {
    const now = performance.now();
    if (now - this.attackStartTime > ATTACK_INTERVAL) {
      this.attackStartTime = now;
      this.attack();
    }

    for (const o of this.gameObjects) {
      o.update();
      if (o instanceof Plant && o.canGrab()) {
        const cone = this.findAdjascentObject(o, o => o instanceof Cone && o.state !== 'grabbed');
        if (cone) {
          o.startGrabbing();
          cone.grab();
        }
      }
    }

    this.gameObjects = this.gameObjects.filter(o => o.isAlive());
  }

  private attack(): void {
    // try 10 times
    for (let i = 0; i < 10; i++) {
      const pos: GridPosition = {
        xSquare: this.tileEngine.width - 3,
        ySquare: Math.floor(Math.random() * this.tileEngine.height),
      };

      const objectAtTile = this.findObject(pos);

      if (objectAtTile == null || objectAtTile instanceof Plant) {
        if (objectAtTile instanceof Plant) {
          objectAtTile.ttl = 0;
        }

        this.addObject(new Cone(), pos);
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

  private findObject(position: GridPosition): GameObject | undefined {
    const square: SquareBounds = {
      x: position.xSquare * TILE_WIDTH,
      y: position.ySquare * TILE_HEIGHT,
      width: TILE_WIDTH,
      height: TILE_HEIGHT,
    };

    for (const o of this.gameObjects) {
      if (collides(this.getSquareBounds(o), square)) {
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
}
