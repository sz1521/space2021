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

import { Animation, imageAssets, Sprite, SpriteSheet } from "kontra";

let spriteSheet: SpriteSheet | undefined;

const getAnimations = (): {[name: string] : Animation} => {
  if (! spriteSheet) {
    spriteSheet = SpriteSheet({
      image: imageAssets['cone'],
      frameWidth: 32,
      frameHeight: 32,
      animations: {
        idle: {
          frames: [0],
        },
        grabbed: {
          frames: [1, 2],
          loop: false,
          frameRate: 1,
        },
      },
    });
  }

  return spriteSheet.animations;
}

export class Cone extends Sprite.class {
  constructor() {
    super({
      animations: getAnimations(),
    });
  }
}
