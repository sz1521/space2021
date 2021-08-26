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

import { init, load, imageAssets, Sprite, GameLoop, TileEngine } from "kontra";

const { canvas } = init();

const createTileMap = (): TileEngine => {
  return TileEngine({
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
      data: [ 2,  2,  2,  2,  1,  2,  2,  3,  2,  3,  1,  3,  2,  3,
              1,  2,  2,  2,  2,  3,  2,  2,  2,  2,  1,  3,  1,  2,
              2,  1,  1,  3,  3,  2,  2,  2,  2,  1,  3,  2,  3,  3,
              1,  3,  1,  1,  2,  3,  3,  2,  3,  2,  1,  1,  1,  1,
              2,  2,  3,  1,  2,  2,  2,  1,  3,  3,  2,  3,  3,  2,
              2,  2,  3,  2,  3,  3,  3,  3,  3,  3,  3,  2,  1,  3,
              2,  2,  1,  2,  2,  2,  1,  3,  1,  2,  3,  2,  3,  1,
              3,  2,  2,  2,  2,  2,  1,  2,  2,  1,  2,  2,  1,  2,
              3,  2,  2,  2,  2,  2,  3,  3,  1,  1,  3,  2,  3,  3,
              2,  2,  3,  1,  1,  2,  2,  2,  1,  3,  2,  3,  3,  2,
              2,  2,  2,  2,  3,  2,  2,  2,  2,  1,  2,  3,  1,  1,
              2,  3,  3,  2,  2,  2,  1,  1,  2,  1,  1,  3,  2,  2,
            ]
    }]
  });
}

const resize = () => {
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
};

window.addEventListener("resize", resize, false);
resize();

const sprite = Sprite({
  x: 100,
  y: 80,
  color: "red",
  width: 20,
  height: 40,
  dx: 2,
});

load('tiles.png').then(() => {
  const tileEngine = createTileMap();

  const loop = GameLoop({
    update: function () {
      sprite.update();

      if (sprite.x > canvas.width) {
        sprite.x = -sprite.width;
      }
    },
    render: function () {
      tileEngine.render();
      sprite.render();
    },
  });

  loop.start();
}).catch((error) => {
  console.warn('Error loading tileset:', error);
});
