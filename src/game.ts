import { Engine } from "./engine";
import { loadSave, clearSave } from "./saves";
import { Menu, MenuMode } from "./menu";

export class Game {
  stopped_ = true;
  engine: Engine;
  menu: Menu;

  constructor(canvas: HTMLCanvasElement) {
    // 1. Initialize Engine first
    this.engine = new Engine(this, canvas);
    // 2. Initialize Menu second (so it can find elements rendered by React)
    this.menu = new Menu(this);
  }

  start() {
    this.engine.load_(loadSave());
  }

  togglePause() {
    this.stopped_ = !this.stopped_;
    this.stopped_ ? this.menu.show() : this.menu.hide();
  }

  startNewGame() {
    this.menu.mode = MenuMode.menu;
    localStorage.removeItem("tww_d");
    localStorage.removeItem("tww_t");
    this.engine.gameTime = 0;
    clearSave();
    this.start();
    this.stopped_ = false;
    this.menu.hide();
  }
}