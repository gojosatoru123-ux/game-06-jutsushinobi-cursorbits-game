export class SpriteRenderer {
  ctx: CanvasRenderingContext2D;
  private canvas_: HTMLCanvasElement;

  constructor() {
    this.canvas_ = document.createElement("canvas");
    // Ensure the context is acquired safely
    const context = this.canvas_.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Failed to create 2D context");
    this.ctx = context;
  }

  setSize(width: number, height: number) {
    // Rounding dimensions prevents sub-pixel rendering errors/NaN crashes
    this.canvas_.width = Math.max(1, Math.ceil(width));
    this.canvas_.height = Math.max(1, Math.ceil(height));
  }

  async render(
    renderFn: (ctx: CanvasRenderingContext2D) => void,
  ): Promise<HTMLImageElement> {
    // 1. Clear the canvas BEFORE drawing
    this.reset_();

    // 2. Execute the drawing logic
    renderFn(this.ctx);

    // 3. Convert to image and wait for it to actually "exist" in memory
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve(img);
      };

      img.onerror = (e) => {
        console.error("Sprite rendering failed. Canvas size:", this.canvas_.width, "x", this.canvas_.height);
        reject(e);
      };

      // Extract the data
      const dataUrl = this.canvas_.toDataURL();
      
      // Safety check: if the URL is too short, the canvas was empty
      if (dataUrl === "data:,") {
        reject(new Error("Canvas is empty or size is 0"));
        return;
      }

      img.src = dataUrl;
    });
  }

  private reset_() {
    // ClearRect is safer than resetting width/height which can flicker
    this.ctx.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
  }
}