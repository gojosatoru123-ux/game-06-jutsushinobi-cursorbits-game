// 1. Import the actual function from the file
import { zzfx } from "./ZzFX.micro";

let lastTime = 0;

// wind actually
export function playMusic(time: number) {
  if (time - lastTime > 100) {
    lastTime = time;
    const freq =
      170 +
      Math.sin(time / 631) * 40 +
      Math.cos(time / 487) * 60 +
      Math.sin(time / 227) * 30;
    
    // 2. Call the imported function directly
    zzfx(0.015, 2, freq, 1.5, 0.5, 0, 5, 0.1, 0);
  }
}