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

import { GameLoop, getContext } from "kontra";
import { isInside, Level, SquareBounds } from "./Level";
import { Species } from "./Plant";

const LEVEL_X = 0;
const LEVEL_Y = 80;

const ZOOM_FACTOR = 2;

interface Button {
  text: string;
  species: Species;
  bounds: SquareBounds;
}

export class Game {
  private level: Level;

  private buttons: Button[] = [
    {
      text: 'Flower',
      species: 'blue_flower',
      bounds: {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      }
    },
    {
      text: 'Vine',
      species: 'vine',
      bounds: {
        x: 105,
        y: 0,
        width: 100,
        height: 50,
      }
    }
  ];

  constructor() {
    this.level = new Level();
  }

  onClick(e: MouseEvent): void {
    for (const button of this.buttons) {
      if (isInside(e, button.bounds)) {
        this.level.selectedSpecies = button.species;
        return;
      }
    }

    this.level.onClick(
      (e.x - LEVEL_X) / ZOOM_FACTOR,
      (e.y - LEVEL_Y) / ZOOM_FACTOR);
  }

  start() {
    const context = getContext();

    const loop = GameLoop({
      update: (): void => {
        this.level.update();
      },

      render: (): void => {
        context.save();
        context.translate(LEVEL_X, LEVEL_Y);

        context.save();
        context.scale(ZOOM_FACTOR, ZOOM_FACTOR);
        this.level.render();
        context.restore();

        context.restore();

        this.renderUi(context);
      },
    });

    loop.start()
  }

  private renderUi(context: CanvasRenderingContext2D) {
    context.save();

    for (const button of this.buttons) {
      const bounds = button.bounds;
      context.fillStyle = button.species === this.level.selectedSpecies ? 'green' : 'red';
      context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

      context.fillStyle = 'white';
      context.font = '22px Sans-serif';
      context.fillText(button.text, bounds.x + 17, bounds.y + 30);
    }

    context.restore();
  }
}
