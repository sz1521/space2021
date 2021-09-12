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
import { easeOutCubic } from "./easings";
import { GameObject } from "./GameObject";

export type Species = 'blue_flower' | 'vine';

export interface PlantInfo {
  cost: number;
  glucosis: number;
  radius: number;
  interval?: number;
}

const infos: Record<Species, PlantInfo> = {
  'blue_flower': {
    cost: 4,
    glucosis: 1,
    radius: 0,
    interval: 6000,
  },
  'vine': {
    cost: 12,
    radius: 1,
    glucosis: 0,
  }
};

export const getCost = (species: Species) => {
  return infos[species].cost;
}

export const getRadius = (species: Species) => {
  return infos[species].radius;
}

type State =
  { type: 'idle' } |
  { type: 'grabbing', startTime: number };

export class Plant extends GameObject {
  private species: Species;
  private state: State = { type: 'idle' };
  private lastPhotosynthesisTime: number = 0;

  constructor(species: Species) {
    super();
    this.species = species;
  }

  update(): void {
    super.update();
    if (this.state.type === 'grabbing' && performance.now() - this.state.startTime > 3000) {
      this.state = { type: 'idle' };
    }
  }

  render(): void {
    const context = getContext();

    context.save();
    context.translate(this.x, this.y);
    this.renderImage(context, imageAssets[this.species]);

    if (infos[this.species].interval != null) {
      this.renderGlucose(context);
    }
    context.restore();
  }

  private renderGlucose(context: CanvasRenderingContext2D): void {
    if (this.lastPhotosynthesisTime === 0) {
      return;
    }

    const now = performance.now();
    const timeSincePhotoSynthesis = now - this.lastPhotosynthesisTime;
    if (timeSincePhotoSynthesis < 1000) {
      context.save();
      context.fillStyle = 'rgb(30, 255, 30)';
      context.font = 'bold 12px Sans-serif';
      const x = 10;
      const y = 10 - easeOutCubic(timeSincePhotoSynthesis / 1000) * 10;
      context.fillText('+' + infos[this.species].glucosis, x, y);
      context.restore();
    }
  }

  getGlucose(): number {
    if (!this.isAlive()) {
      return 0;
    }

    const interval = infos[this.species].interval;
    if (interval == null) {
      return 0;
    }

    const now = performance.now();
    if (now - this.lastPhotosynthesisTime > interval) {
      this.lastPhotosynthesisTime = now;
      return 1;
    }

    return 0;
  }

  canGrab(): boolean {
    return this.isAlive() && this.species === 'vine' && this.state.type !== 'grabbing';
  }

  startGrabbing(): void {
    if (this.state.type !== 'grabbing') {
      this.state = { type: 'grabbing', startTime: performance.now() };
    }
  }
}
