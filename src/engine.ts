import { Game } from "./game";
import { PhysicsSystem } from "./physics/physics";
import { FoliageSystem } from "./foliage";
import { ParticlesSystem } from "./particles";
import { Player } from "./player";
import { Vector2 } from "./vector";
import { Control } from "./control";
import { Renderer } from "./renderer/renderer";
import { Camera } from "./camera";
import type { Level } from "./level.interface";
import { save_ } from "./saves";
import type { Save } from "./saves";
import { loadLevel } from "./loader";
import { LEVELS } from "./levels";

// #if process.env.NODE_ENV === 'development'
import { Editor } from "./editor/editor";
// #endif

export class Engine {
  time_ = 0;
  gameTime: number;

  // Declare systems without initializing them yet
  physics: PhysicsSystem;
  foliage: FoliageSystem;
  particles: ParticlesSystem;
  control_: Control;
  renderer: Renderer;
  camera: Camera;
  
  player!: Player;
  level_!: Level;
  currentSave!: Save;
  levelTransitionEnter = 0;
  levelTransitionLeave = 0;

  // #if process.env.NODE_ENV === 'development'
  editor!: Editor;
  // #endif

  constructor(public game: Game, public canvas_: HTMLCanvasElement) {
    // 1. Setup basic data
    this.gameTime = parseInt(localStorage.getItem("tww_t")!) || 0;

    // 2. Initialize systems in order
    // We pass 'this' now that 'game' and 'canvas_' are assigned to the instance
    this.physics = new PhysicsSystem();
    this.foliage = new FoliageSystem();
    this.particles = new ParticlesSystem(this);
    this.control_ = new Control(this.game);
    this.camera = new Camera(this);
    
    // CRITICAL: Initialize Renderer last so it has access to this.canvas_
    this.renderer = new Renderer(this);

    // #if process.env.NODE_ENV === 'development'
    this.editor = new Editor(this);
    // #endif

    this.control_.init();
  }

  load_(save: Save) {
    this.physics.clear_();
    this.currentSave = save;
    loadLevel(this, save.level_);
    this.respawnPlayer();
    this.renderer.init();
    this.foliage.spawnFoliage(this);
  }

  respawnPlayer() {
    this.fixupPlayerPosition();
    this.player = new Player(
      this,
      new Vector2(this.currentSave.pos!.x, this.currentSave.pos!.y),
    );
  }

  fixupPlayerPosition() {
    const startingPos = new Vector2(150, this.level_.startingPos);
    if (!this.currentSave.pos) {
      this.currentSave.pos = startingPos;
    }

    const pos = this.physics.castRay(
      new Vector2(this.currentSave.pos.x, this.currentSave.pos.y),
      new Vector2(this.currentSave.pos.x, this.level_.size_.y),
    );

    if (pos) {
      this.currentSave.pos.y = pos.y - 10;
      return;
    }

    this.currentSave.pos = startingPos;
  }

  save_() {
    this.currentSave.pos = this.player.body_.pos.copy();
    save_(this.currentSave);
    this.saveGameTime();
  }

  saveGameTime() {
    localStorage.setItem("tww_t", this.gameTime.toString());
  }

  update_(timeStep: number) {
    this.time_ += timeStep;
    this.particles.update_();

    if (this.levelTransitionLeave) {
      return;
    }

    // Safety check for player initialization
    if (!this.player) return;

    this.player.update_();

    if (this.game.stopped_) {
      return;
    }

    this.gameTime += timeStep;

    const playerPos = this.player.body_.pos;
    for (const savepoint of this.level_.savepoints) {
      if (savepoint > this.currentSave.pos!.x && playerPos.x > savepoint) {
        this.save_();
      }
    }

    if (playerPos.x > this.level_.size_.x + 10) {
      if (this.currentSave.level_ === LEVELS.length - 1) {
        this.saveGameTime();
        this.game.menu.finish(this.currentSave);
        this.game.stopped_ = true;
        return;
      }
      this.levelTransitionLeave = this.time_;
      setTimeout(() => {
        this.levelTransitionLeave = 0;

        this.currentSave.level_++;
        this.currentSave.pos = null;
        save_(this.currentSave);
        this.load_(this.currentSave);

        this.levelTransitionEnter = this.time_;
        setTimeout(() => {
          this.levelTransitionEnter = 0;
        }, 1100);
      }, 1100);
    }
  }
}