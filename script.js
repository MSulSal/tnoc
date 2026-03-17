let bits = [];
let cellSize = 22;
let cols, rows;
let loader;
let maskGraphics;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  textFont("Monospace");

  cellSize = getResponsiveCellSize();
  buildGrid();
  loader = new BinaryCounterLoader();
  maskGraphics = createGraphics(windowWidth, windowHeight);
  maskGraphics.pixelDensity(1);
}

function draw() {
  background(0);

  loader.update();
  drawCounterMask();

  maskGraphics.loadPixels();

  for (const bit of bits) {
    bit.update();

    const lit = isInsideMask(bit.x, bit.y);
    bit.display(lit);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cellSize = getResponsiveCellSize();
  buildGrid();

  maskGraphics = createGraphics(windowWidth, windowHeight);
  maskGraphics.pixelDensity(1);

  loader = new BinaryCounterLoader();
}

function buildGrid() {
  bits = [];

  cols = floor(width / cellSize);
  rows = floor(height / cellSize);

  const xOffset = (width - cols * cellSize) * 0.5 + cellSize * 0.5;
  const yOffset = (height - rows * cellSize) * 0.5 + cellSize * 0.5;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = xOffset + col * cellSize;
      const y = yOffset + row * cellSize;
      bits.push(new MatrixBit(x, y));
    }
  }
}

function drawCounterMask() {
  const value = floor(loader.progress);
  const binary = value.toString(2);

  maskGraphics.clear();
  maskGraphics.background(0);
  maskGraphics.textAlign(CENTER, CENTER);
  maskGraphics.textFont("Monospace");
  maskGraphics.textSize(min(width * 0.16, height * 0.24));

  maskGraphics.fill(255);
  maskGraphics.stroke(255);
  maskGraphics.strokeWeight(max(8, cellSize * 0.7));
  maskGraphics.strokeJoin(ROUND);

  maskGraphics.text(binary, width * 0.5, height * 0.5);
}

function drawSourceMask() {
  const value = floor(loader.progress);
  const binary = value.toString(2);

  sourceMask.clear();
  sourceMask.background(0);
  sourceMask.textAlign(CENTER, CENTER);
  sourceMask.textFont("Courier New");

  const maxMaskWidth = width * 0.82;
  const maxMaskHeight = height * 0.24;
  const fittedSize = fitMaskTextSize(
    sourceMask,
    binary,
    maxMaskWidth,
    maxMaskHeight,
    "Courier New",
  );

  sourceMask.textSize(fittedSize);
  sourceMask.fill(255);
  sourceMask.stroke(255);
  sourceMask.strokeWeight(max(6, cellSize * 0.7));
  sourceMask.strokeJoin(ROUND);

  sourceMask.text(binary, width * 0.5, height * 0.5);
}

function drawTargetMask() {
  targetMask.clear();
  targetMask.background(0);
  targetMask.textAlign(CENTER, CENTER);
  targetMask.textFont("Courier New");
  targetMask.fill(255);
  targetMask.stroke(255);
  targetMask.strokeWeight(max(5, cellSize * 0.55));
  targetMask.strokeJoin(ROUND);

  const lines = ["THE", "NATURE", "OF CODE"];
  const lineHeight = 1.02;

  const fittedSize = fitMultilineMaskTextSize(
    targetMask,
    lines,
    width * 0.84,
    height * 0.42,
    lineHeight,
    "Courier New",
  );

  targetMask.textSize(fittedSize);

  const step = fittedSize * lineHeight;
  const cx = width * 0.5;
  const cy = height * 0.5;

  targetMask.text(lines[0], cx, cy - step);
  targetMask.text(lines[1], cx, cy);
  targetMask.text(lines[2], cx, cy + step);
}

function getResponsiveCellSize() {
  if (width < 700) return 14;
  if (width < 1180) return 16;
  return 18;
}

function isInsideMask(x, y) {
  const px = floor(x);
  const py = floor(y);

  if (
    px < 0 ||
    px >= maskGraphics.width ||
    py < 0 ||
    py >= maskGraphics.height
  ) {
    return false;
  }

  const idx = 4 * (py * maskGraphics.width + px);
  return maskGraphics.pixels[idx] > 10;
}

function fitMaskTextSize(
  g,
  str,
  maxWidth,
  maxHeight,
  fontName = "Courier New",
) {
  g.textFont(fontName);

  let low = 8;
  let high = 400;
  let best = low;

  while (low <= high) {
    const mid = floor((low + high) / 2);
    g.textSize(mid);

    const w = g.textWidth(str);
    const h = mid;

    if (w <= maxWidth && h <= maxHeight) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best;
}

function fitMultilineMaskTextSize(
  g,
  lines,
  maxWidth,
  maxHeight,
  lineHeight = 1.0,
  fontName = "Courier New",
) {
  g.textFont(fontName);

  let low = 8;
  let high = 300;
  let best = low;

  while (low <= high) {
    const mid = floor((low + high) / 2);
    g.textSize(mid);

    let widest = 0;
    for (const line of lines) {
      widest = max(widest, g.textWidth(line));
    }

    const totalHeight = mid * lineHeight * lines.length;

    if (widest <= maxWidth && totalHeight <= maxHeight) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best;
}

class BinaryCounterLoader {
  constructor() {
    this.progress = 0;
    this.speed = 0.03;
  }

  update() {
    if (this.progress < 100) {
      this.progress = min(
        100,
        this.progress + this.speed * this.progress + 0.01,
      );
    }
  }
}

class MatrixBit {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.value = random() < 0.5 ? "0" : "1";
    this.timer = floor(random(6, 28));
    this.alpha = random(160, 255);
  }

  update() {
    this.timer--;

    if (this.timer <= 0) {
      this.value = random() < 0.5 ? "0" : "1";
      this.timer = floor(random(6, 24));
    }
  }

  display(lit) {
    textAlign(CENTER, CENTER);
    textSize(cellSize * 0.72);

    if (lit) {
      fill(90, 255, 90, this.alpha);
    } else {
      fill(0);
    }

    text(this.value, this.x, this.y);
  }
}
