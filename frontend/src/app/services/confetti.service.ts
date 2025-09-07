import { Injectable, OnDestroy } from '@angular/core';
import confetti, { CreateTypes } from 'canvas-confetti';

@Injectable({ providedIn: 'root' })
export class ConfettiService implements OnDestroy {
  private canvas: HTMLCanvasElement | null = null;
  private myConfetti: CreateTypes | null = null;
  private timers: any[] = [];

  private ensureCanvas(): CreateTypes {
    if (this.myConfetti) return this.myConfetti;
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.inset = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    document.body.appendChild(this.canvas);
    this.myConfetti = confetti.create(this.canvas, { resize: true, useWorker: true });
    return this.myConfetti;
  }

  stop() {
    // Clear timeouts and remove canvas
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
    if (this.canvas?.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
    this.canvas = null;
    this.myConfetti = null;
  }

  // Run the "explosions" preset from confetti.js.org full-window for given duration (ms)
  startExplosions(totalDurationMs = 7500) {
    const c = this.ensureCanvas();

    // Based on https://confetti.js.org/ with preset "explosions"
    const end = Date.now() + totalDurationMs;

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const frame = () => {
      // launch a few bursts from random positions over time
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) return;

      const particleCount = 40 * (timeLeft / totalDurationMs); // taper off

      // Left side burst
      c({
        particleCount: Math.max(12, Math.floor(particleCount)),
        startVelocity: randomInRange(35, 55),
        spread: randomInRange(60, 100),
        ticks: 200,
        origin: { x: Math.random() * 0.3, y: Math.random() * 0.2 + 0.1 }
      });

      // Right side burst
      c({
        particleCount: Math.max(12, Math.floor(particleCount)),
        startVelocity: randomInRange(35, 55),
        spread: randomInRange(60, 100),
        ticks: 200,
        origin: { x: 1 - Math.random() * 0.3, y: Math.random() * 0.2 + 0.1 }
      });

      // center-top pop occasionally
      if (Math.random() < 0.4) {
        c({
          particleCount: Math.max(8, Math.floor(particleCount * 0.5)),
          startVelocity: randomInRange(25, 45),
          spread: randomInRange(50, 120),
          scalar: randomInRange(0.8, 1.2),
          ticks: 200,
          origin: { x: 0.5 + (Math.random() - 0.5) * 0.2, y: randomInRange(0.05, 0.2) }
        });
      }

      // Schedule next frame with small jitter for more natural look
      const nextIn = randomInRange(180, 300);
      this.timers.push(setTimeout(frame, nextIn));
    };

    // kick off
    frame();

    // stop and cleanup after the configured duration + small grace period
    this.timers.push(setTimeout(() => this.stop(), totalDurationMs + 500));
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
