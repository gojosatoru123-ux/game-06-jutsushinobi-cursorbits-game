import { Game } from "./game";
import type { Save } from "./saves";

export const enum MenuMode {
  menu,
  stats,
  credits,
}

export class Menu {
  // Selectors updated to match the JSX classes/IDs in App.tsx
  tintEl = document.querySelector(".menu-container") as HTMLElement;
  loadingEl = document.querySelector(".loading-text") as HTMLElement;
  optionsEl = document.getElementById("o") as HTMLElement;

  continueEl = document.getElementById("c") as HTMLElement;
  newGameEl = document.getElementById("n") as HTMLElement;

  finishScreenEl = document.getElementById("f") as HTMLElement;
  timeEl = document.getElementById("tm") as HTMLElement;
  crystalsEl = document.getElementById("p") as HTMLElement;
  deathsEl = document.getElementById("d") as HTMLElement;

  // Added a fallback for credits if it's missing in JSX
  creditsEl = document.getElementById("r") || document.createElement("div");

  mode: MenuMode = MenuMode.menu;

  constructor(game: Game) {
    if (this.continueEl) this.continueEl.onclick = () => game.togglePause();
    if (this.newGameEl) this.newGameEl.onclick = () => game.startNewGame();
    
    // Safety checks to prevent 'classList of undefined'
    this.optionsEl?.classList.remove("r");
    this.loadingEl?.classList.add("r");
  }

  private showTint() {
    this.tintEl?.classList.remove("r");
    this.optionsEl?.classList.add("r");
    this.finishScreenEl?.classList.add("r");
    this.creditsEl?.classList.add("r");
  }

  show() {
    this.showTint();
    this.optionsEl?.classList.remove("r");
  }

  hide() {
    this.tintEl?.classList.add("r");
  }

  finish(save: Save) {
    this.showTint();
    this.mode = MenuMode.stats;
    this.finishScreenEl?.classList.remove("r");

    const savedTime = localStorage.getItem("tww_t");
    let seconds = savedTime ? parseInt(savedTime) / 1000 : 0;
    let minutes = Math.floor(seconds / 60);
    if (this.timeEl) {
      this.timeEl.innerText = `${minutes}m ${(seconds - minutes * 60).toFixed(1)}s`;
    }

    if (this.crystalsEl) {
      this.crystalsEl.innerText = Object.values(save.crystals)
        .reduce<number>((acc, c) => acc + c.length, 0)
        .toString();
    }

    if (this.deathsEl) {
      this.deathsEl.innerText = localStorage.getItem("tww_d") || "0";
    }
  }

  showCredits() {
    this.mode = MenuMode.credits;
    this.finishScreenEl?.classList.add("r");
    this.creditsEl?.classList.remove("r");
  }
}