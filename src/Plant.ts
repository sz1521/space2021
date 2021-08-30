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

export class Plant extends Sprite.class {
  private static spriteSheet: SpriteSheet | undefined;

  private static getAnimations(): {[name: string] : Animation} {
    if (!Plant.spriteSheet) {
      // Assents should be loaded by the time of creating objects.
      Plant.spriteSheet = SpriteSheet({
        image: imageAssets['blue_flower.png'],
        frameWidth: 32,
        frameHeight: 32,
        animations: {
          idle: {
            frames: [0, 1, 2],
            frameRate: 1,
          }
        }
      });
    }

    return Plant.spriteSheet.animations;
  }

  constructor() {
    super({
      width: 32,
      height: 32,
      animations: Plant.getAnimations()
    });
    this.playAnimation('idle');
  }
}
