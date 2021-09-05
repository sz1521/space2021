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

interface Button {
  text: string;
  species: Species;
  bounds: SquareBounds;
}

export class Game {
  private level: Level;

  private buttons: Button[] = [
    {
      text: 'F',
      species: 'blue_flower',
      bounds: {
        x: 0,
        y: 0,
        width: 50,
        height: 50,
      }
    },
    {
      text: 'V',
      species: 'vine',
      bounds: {
        x: 55,
        y: 0,
        width: 50,
        height: 50,
      }
    }
  ];

  constructor() {
    this.level = new Level();

    addEventListener('click', (e) => {
      for (const button of this.buttons) {
        if (isInside(e, button.bounds)) {
          this.level.selectedSpecies = button.species;
          return;
        }
      }

      this.level.onClick(e.x - LEVEL_X, e.y - LEVEL_Y);
    });
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

        this.level.render();

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
      context.fillStyle = button.species === this.level.selectedSpecies ? 'blue' : 'gray';
      context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

      context.fillStyle = 'white';
      context.font = '22px Sans-serif';
      context.fillText(button.text, bounds.x + 17, bounds.y + 30);
    }

    context.restore();
  }
}
