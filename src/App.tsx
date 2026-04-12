import { useEffect, useRef, useState } from 'react';
import { prepareAssets } from "./assets";
import { Game } from "./game";
import { playMusic } from "./music";

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

        // Wait a tiny bit for React to finish rendering the menu DOM
        setTimeout(() => {
          if (canvasRef.current) {
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
          }
        }, 0);
      } catch (err) {
        console.error("Initialization failed:", err);
      }
    };

    initGame();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="game-wrapper">
      {/* The menu-container serves as the 'tint' element */}
      <div className="menu-container">
        <h1 className="title">The Wandering Wraith</h1>
        <p className="subtitle">...or the grand venture of going back to the grave.</p>

        {/* The loading-text element */}
        <div className={`loading-text ${!loading ? 'r' : ''}`}>Loading...</div>

        <div id="o" className="r">
          <button id="c">Continue</button>
          <button id="n">New game</button>
        </div>

        <div id="f" className="r">
          <h1>THE END</h1>
          <p className="end-message">The wraith found his peace back in the grave.</p>
          <p className="stat">Time: <span id="tm"></span></p>
          <p className="stat">Collected <span id="p"></span>/75 crystals</p>
          <p className="stat">Died <span id="d"></span> times</p>
          <span className="hint">Press ESC to continue</span>
        </div>
        
        {/* Placeholder for credits if needed by menu.ts */}
        <div id="r" className="r"></div>
      </div>

      <canvas ref={canvasRef}></canvas>
    </div>
  );
}