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

import { init, load, GameLoop } from "kontra";
import { Game } from "./Game";
import { playSong, renderSong } from "./sfx";

const { canvas, context } = init();
(context as any).webkitImageSmoothingEnabled = false;
(context as any).mozImageSmoothingEnabled = false;
context.imageSmoothingEnabled = false;

let game: Game;

const resize = (): void => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (game) {
    game.fitToScreen(canvas);
  }
};

window.addEventListener("resize", resize, false);
resize();

const createTextScreenLoop = (text: string): GameLoop => {
  return GameLoop({
    update: (): void => {
    },

    render: (): void => {
      const widthMiddle = context.canvas.width / 2;
      const heightMiddle = context.canvas.height / 3;

      context.save();
      context.lineWidth = 2;
      context.fillStyle = 'rgb(00,120,00)';
      context.font = 'bold 60px impact ';
      context.fillText("GREEN SPACE", widthMiddle - 170, heightMiddle - 40);
      context.strokeStyle  = 'rgb(00,255,00)';
      context.strokeText("GREEN SPACE", widthMiddle - 170, heightMiddle - 40);
      context.fillStyle = 'rgb(10,10,10)';
      context.fillText("vs parking", widthMiddle - 160, heightMiddle);
      context.strokeStyle  = 'darkgrey';
      context.strokeText("vs parking", widthMiddle - 160, heightMiddle);
      context.fillStyle = 'white';
      context.font = 'bold 30px Sans-serif';
      context.fillText(text, widthMiddle - 135, heightMiddle + 50);
      context.restore();
    },
  })
};

let startScreenLoop: GameLoop | null = createTextScreenLoop("LOADING...");
startScreenLoop.start();

load('tiles.png', 'blue_flower.png', 'vine.png', 'cone.png', 'roller.png').then(() => {
  game = new Game();
  const tune = renderSong();

  startScreenLoop?.stop();
  startScreenLoop = createTextScreenLoop("CLICK TO START");
  startScreenLoop.start();

  resize();

  addEventListener('click', (e) => {
    if (startScreenLoop) {
      startScreenLoop.stop();
      startScreenLoop = null;

      playSong(tune);

      game.start();
    } else {
      game.onClick(e);
    }
  });
}).catch((error) => {
  // eslint-disable-next-line no-console
  console.warn('Error loading assets:', error);
});
