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

import { Plant } from "./Plant";
import { GameObject, imageAssets, TileEngine } from "kontra";

const map =
  [ 2,  2,  2,  2,  3,  2,  2,  3,  2,  3,  3,  3,  2,  3,
    3,  2,  2,  2,  2,  3,  2,  2,  2,  2,  2,  3,  4,  2,
    2,  3,  2,  3,  3,  2,  2,  2,  2,  4,  3,  2,  3,  3,
    3,  3,  4,  2,  2,  3,  3,  2,  3,  2,  4,  3,  3,  2,
    2,  2,  3,  3,  2,  2,  2,  2,  3,  3,  2,  3,  3,  2,
    2,  2,  3,  2,  3,  3,  3,  3,  3,  3,  3,  2,  2,  3,
    2,  2,  3,  2,  2,  2,  3,  3,  3,  2,  3,  2,  3,  3,
    3,  2,  2,  2,  2,  2,  3,  2,  2,  3,  2,  1,  1,  1,
    3,  2,  2,  2,  2,  2,  3,  3,  3,  2,  3,  2,  3,  3,
    2,  2,  3,  3,  4,  2,  2,  2,  4,  3,  2,  3,  3,  2,
    2,  2,  2,  2,  3,  2,  2,  2,  2,  3,  2,  3,  1,  1,
    2,  3,  3,  2,  2,  2,  4,  3,  2,  3,  3,  3,  2,  1,
  ];

export class Level {
  private tileEngine: TileEngine;
  private gameObjects: GameObject[] = [];

  constructor() {
    this.tileEngine = TileEngine({
      tilewidth: 32,
      tileheight: 32,

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

    const flower = new Plant(64, 64);
    this.gameObjects.push(flower);
  }

  onClick(x: number, y: number): void {
    const tileX = Math.floor(x / this.tileEngine.tilewidth);
    const tileY = Math.floor(y / this.tileEngine.tileheight);

    if (this.tileEngine.width <= tileX || this.tileEngine.height <= tileY) {
      return;
    }

    const xx = tileX * this.tileEngine.tilewidth;
    const yy = tileY * this.tileEngine.tileheight;
    const plant = new Plant(xx, yy);
    this.gameObjects.push(plant);
  }

  update(): void {
    for (const o of this.gameObjects) {
      o.update();
    }
  }

  render(): void {
    this.tileEngine.render();
    for (const o of this.gameObjects) {
      o.render();
    }
  }
}
