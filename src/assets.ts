import { animateTree, animateGrass } from "./plants";
import type { PlantDefinition } from "./plants";
import { SpriteRenderer } from "./renderer/sprite-renderer";
import { TREE_GROUND_MASK, GRASS_MASK } from "./colisions-masks";
import { Random } from "./random";

interface Assets {
  terrain: HTMLImageElement;
  head_: HTMLImageElement;
  torso: HTMLImageElement;
  eyes: HTMLImageElement;
  limb: HTMLImageElement;
  scaffold: HTMLImageElement;
  hangman: HTMLImageElement;
  plants: PlantDefinition[];
}

// Helper to load images with better error reporting
function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image at: ${src}`));
    img.src = src;
  });
}

async function preparePlants(): Promise<PlantDefinition[]> {
  const r = new Random(1);
  const sr = new SpriteRenderer();
  const plants: PlantDefinition[] = [];
  
  for (let depth = 4; depth < 11; depth++) {
    plants.push({
      frames_: await animateTree(
        sr,
        depth,
        r.nextFloat() / 4 + 0.3,
        5 * depth,
        depth,
      ),
      spread: 25 * Math.pow(depth, 1.3),
      mask_: TREE_GROUND_MASK,
    });
  }

  for (let i = 0; i < 4; i++) {
    plants.push({
      frames_: await animateGrass(sr, 1 + i * 0.5, i),
      spread: 6 + i,
      mask_: GRASS_MASK,
    });
  }
  return plants;
}

export const assets: Assets = {} as any;

let loadingPromise: Promise<void> | null = null;

export async function prepareAssets() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    // Adding leading slashes to point to the public folder
    assets.head_ = await loadImg("/assets/head.svg");
    assets.eyes = await loadImg("/assets/eyes.svg");
    assets.torso = await loadImg("/assets/torso.svg");
    assets.limb = await loadImg("/assets/limb.svg");
    assets.scaffold = await loadImg("/assets/scaffold.svg");
    assets.hangman = await loadImg("/assets/hangman.svg");
    assets.plants = await preparePlants();
  })();

  return loadingPromise;
}