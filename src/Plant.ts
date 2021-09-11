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

import { Animation, getContext, imageAssets, Sprite, SpriteSheet } from "kontra";
import { easeOutCubic } from "./easings";

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

const spriteSheetConstructors: { [S in Species]: () => SpriteSheet } = {
  'blue_flower': () => SpriteSheet({
    image: imageAssets['blue_flower'],
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      idle: {
        frames: [0, 1, 2],
        frameRate: 1,
      }
    },
  }),
  'vine': () => SpriteSheet({
    image: imageAssets['vine'],
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      idle: {
        frames: [0, 1],
        frameRate: 1,
      }
    },
  }),
};

const spriteSheets: { [S in Species]?: SpriteSheet } = {};

const getAnimations = (species: Species): {[name: string] : Animation} => {
  if (!spriteSheets[species]) {
    // Assents should be loaded by the time of creating objects.
    spriteSheets[species] = spriteSheetConstructors[species]();
  }

  // Strange type error here
  return (spriteSheets as any)[species].animations;
}

export class Plant extends Sprite.class {

  private species: Species;
  private state: State = { type: 'idle' };
  private lastPhotosynthesisTime: number = 0;

  constructor(species: Species) {
    super({
      animations: getAnimations(species),
    });
    this.species = species;
    this.playAnimation('idle');
  }

  update(): void {
    super.update();
    if (this.state.type === 'grabbing' && performance.now() - this.state.startTime > 3000) {
      this.state = { type: 'idle' };
    }
  }

  draw(): void {
    const context = getContext();
    super.draw();

    if (infos[this.species].interval != null) {
      this.renderGlucose(context);
    }
  }

  private renderGlucose(context: CanvasRenderingContext2D): void {
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
