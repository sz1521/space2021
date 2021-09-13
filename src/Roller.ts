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

import { getContext, imageAssets } from "kontra";
import { GameObject } from "./GameObject";

const SPEED = 0.1;

export class Roller extends GameObject {
  private moveStartTime: number | undefined;

  render(): void {
    const context = getContext();
    context.save();
    context.translate(this.x, this.y);
    let frame = 0;
    if (this.moveStartTime != null) {
      // framerate: 2 frames per second
      frame = Math.floor((performance.now() - this.moveStartTime) / 500) % 4;
    }
    this.renderImageFrame(context, imageAssets['roller'], frame);
    context.restore();
  }

  move(): void {
    this.dx = -SPEED + Math.random() * 0.01;
    this.moveStartTime = performance.now();
  }

  stop(): void {
    // When near the edge, go all the way
    if (this.x > 64) {
      this.dx = 0;
      this.moveStartTime = undefined;
    }
  }
}
