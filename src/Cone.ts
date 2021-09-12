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
import { easeOutBounce } from "./easings";

const FRAMES_PER_SECOND = 60;

export type ConeState = 'idle' | 'grabbed';

export class Cone extends GameObject {
  state: ConeState = 'idle';
  dropTime: number = performance.now() + Math.random() * 200;
  grabTime: number | undefined;

  render(): void {
    const now = performance.now();
    const timeSinceDrop = now - this.dropTime;
    const y = (timeSinceDrop < 1000) ? -10 + easeOutBounce(timeSinceDrop / 1000) * 10 : 0;

    const context = getContext();
    context.save();
    context.translate(this.x, this.y);
    context.translate(0, y);
    let frame = 0;
    if (this.grabTime) {
      const timeSinceGrab = performance.now() - this.grabTime;
      frame = Math.min(2, 1 + Math.floor(timeSinceGrab / 1000));
    }
    this.renderImageFrame(context, imageAssets['cone'], frame);
    context.restore();
  }

  grab(): void {
    if (this.state !== 'grabbed') {
      this.state = 'grabbed';
      this.ttl = 2 * FRAMES_PER_SECOND;
      this.grabTime = performance.now();
    }
  }
}
