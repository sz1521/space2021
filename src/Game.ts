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
import { getCost, Species } from "./Plant";

const LEVEL_X = 0;
const LEVEL_Y = 80;

interface Button {
  text: string;
  species: Species;
  bounds: SquareBounds;
}

export class Game {
  private zoomFactor: number = 2;
  private level: Level;
  private selectedSpecies: Species = 'blue_flower';

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

    addEventListener('mousemove', (e) => {
      this.level.onMouseMove(
        (e.x - LEVEL_X) / this.zoomFactor,
        (e.y - LEVEL_Y) / this.zoomFactor,
        this.selectedSpecies
      );
    });
  }

  onClick(e: MouseEvent): void {
    for (const button of this.buttons) {
      if (isInside(e, button.bounds)) {
        this.selectedSpecies = button.species;
        return;
      }
    }

    this.level.insertPlant(
      (e.x - LEVEL_X) / this.zoomFactor,
      (e.y - LEVEL_Y) / this.zoomFactor,
      this.selectedSpecies);
  }

  fitToScreen(canvas: HTMLCanvasElement): void {
    const gameWidth = this.level.getWidth();
    const levelHeight = this.level.getHeight();
    const gameHeight = LEVEL_Y + levelHeight;

    const canvasAspectRatio = canvas.width / canvas.height;
    const gameAspectRatio = gameWidth / gameHeight;

    if (gameAspectRatio > canvasAspectRatio) {
      this.zoomFactor = canvas.width / gameWidth;
    } else {
      this.zoomFactor = (canvas.height - LEVEL_Y) / levelHeight;
    }
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
        context.scale(this.zoomFactor, this.zoomFactor);
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
      this.renderButton(context, button);
    }

    this.renderGlucoseLevel(context);
    this.renderScore(context);

    if (this.level.isGameOver()) {
      this.renderGameOver(context);
    }

    context.restore();
  }

  private renderButton(context: CanvasRenderingContext2D, button: Button) {
    const bounds = button.bounds;
    const cost = getCost(button.species);

    if (cost > this.level.glucoseLevel) {
      context.fillStyle = button.species === this.selectedSpecies ? 'red' : 'rgb(80, 0, 0)';
    } else {
      context.fillStyle = button.species === this.selectedSpecies ? 'green' : 'rgb(0, 80, 0)';
    }
    context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    context.fillStyle = 'white';
    context.font = '1rem Sans-serif';
    context.fillText(button.text, bounds.x + 17, bounds.y + 30);

    context.fillStyle = 'white';
    context.font = 'bold 1rem Sans-serif';
    context.fillText(
      cost.toString(),
      bounds.x + bounds.width - 25,
      bounds.y + bounds.height - 5);
  }

  private renderGlucoseLevel(context: CanvasRenderingContext2D) {
    const lastButton = this.buttons[this.buttons.length - 1].bounds;
    const x = lastButton.x + lastButton.width + 50;
    const y = 35;
    context.fillStyle = 'rgb(0, 200, 0)';
    context.font = '1rem Sans-serif';
    context.fillText('Glucose: ' + this.level.glucoseLevel, x, y);
  }

  private renderScore(context: CanvasRenderingContext2D) {
    const x = 600;
    const y = 40;
    context.fillStyle = 'orange';
    context.font = '30px Sans-serif';
    context.fillText('Score: ' + this.level.score, x, y);
  }

  private renderGameOver(context: CanvasRenderingContext2D) {
    const x = 280;
    const y = 300;
    context.fillStyle = 'white';
    context.font = 'bold 60px Sans-serif';
    context.fillText("GAME OVER", x, y);
  }
}
