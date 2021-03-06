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

export abstract class GameObject {
  x = 0;
  y = 0;
  dx = 0;
  width = 32;
  height = 32;
  ttl: number = Number.POSITIVE_INFINITY;

  update(): void {
    this.x += this.dx;
    this.ttl -= 1;
  }

  abstract render(): void;

  isAlive(): boolean {
    return this.ttl > 0;
  }

  protected renderImage(context: CanvasRenderingContext2D, image: HTMLImageElement): void {
    context.drawImage(image, 0, 0);
  }

  protected renderImageFrame(context: CanvasRenderingContext2D, image: HTMLImageElement, frame: number): void {
    context.drawImage(image, frame * 32, 0, 32, 32, 0, 0, 32, 32);
  }
}
