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
        <div className="menu-card">
          <p className="eyebrow">Cursorbits presents</p>
          <h1 className="title">The Wandering Wraith</h1>
          <p className="subtitle">A moonlit stealth platformer where your spirit fights to return to its grave.</p>

          <div className={`loading-text ${!loading ? 'r' : ''}`}>
            Summoning the spirit realm...
          </div>

          <div className="menu-actions" id="o">
            <button id="c">Continue</button>
            <button id="n">Start New Journey</button>
          </div>

          <div className="tip-row">
            <span>Move: WASD / Arrow keys</span>
            <span>Pause: ESC</span>
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
