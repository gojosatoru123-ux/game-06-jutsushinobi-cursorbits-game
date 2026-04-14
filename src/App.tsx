import { useEffect, useRef, useState } from 'react';
import { prepareAssets } from './assets';
import { Game } from './game';
import { playMusic } from './music';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let game: Game;
    let animationFrameId: number;
    let cumulativeTime = 0;
    const timeStep = 1000 / 60;

    const initGame = async () => {
      try {
        await prepareAssets();
        setLoading(false);

        setTimeout(() => {
          if (!canvasRef.current) return;

          game = new Game(canvasRef.current);
          game.start();

          const tick = (timestamp: number) => {
            const timeDiff = timestamp - cumulativeTime;
            const steps = Math.min(Math.floor(timeDiff / timeStep), 10);
            cumulativeTime += steps * timeStep;

            for (let i = 0; i < steps; i++) {
              game.engine.update_(timeStep);
            }

            game.engine.camera.update_();
            game.engine.renderer.render();
            playMusic(cumulativeTime);

            animationFrameId = requestAnimationFrame(tick);
          };

          animationFrameId = requestAnimationFrame(tick);
        }, 0);
      } catch (err) {
        console.error('Initialization failed:', err);
      }
    };

    initGame();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="game-wrapper">
      <canvas ref={canvasRef}></canvas>

      <div className="menu-container">
        <div className="ambient ambient-a"></div>
        <div className="ambient ambient-b"></div>
        <div className="ambient ambient-c"></div>

        <div className="menu-card">
          <div className="menu-top">
            <p className="eyebrow">CURSORBITS • DARK FABLE EDITION</p>
            <div className="chapter-pill">Chapter I · Return to the Grave</div>
          </div>

          <h1 className="title">The Wandering Wraith</h1>
          <p className="subtitle">
            Drift through cursed ruins, outsmart deathly traps, and gather every crystal fragment to reclaim your eternal rest.
          </p>

          <div className="feature-grid" aria-hidden="true">
            <span>Stealth Platforming</span>
            <span>75 Crystals to Claim</span>
            <span>Atmospheric Journey</span>
          </div>

          <div className={`loading-text ${!loading ? 'r' : ''}`}>Conjuring moonlight, ruins, and spirits...</div>

          <div className="menu-actions" id="o">
            <button id="c">Continue</button>
            <button id="n">Begin New Quest</button>
          </div>

          <div className="tip-row">
            <span>Move · WASD / Arrows</span>
            <span>Pause · ESC</span>
            <span>Objective · Reach your grave</span>
          </div>

          <div id="f" className="end-screen r">
            <h2>THE END</h2>
            <p className="end-message">The wraith found peace back in the grave.</p>
            <p className="stat">Time: <span id="tm"></span></p>
            <p className="stat">Collected <span id="p"></span>/75 crystals</p>
            <p className="stat">Died <span id="d"></span> times</p>
            <span className="hint">Press ESC to continue</span>
          </div>

          <div id="r" className="r"></div>
        </div>
      </div>
    </div>
  );
}
