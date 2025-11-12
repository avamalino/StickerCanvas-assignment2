//import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import noelleURL from "./noelle2.png";
import qiqiURL from "./qiqi2.jpg";
import scaraURL from "./scara2.webp";
import "./style.css";

//Dom setup
document.body.innerHTML = `
  <div id="app-container">
    <div id="tools-left"></div>
    <div id="cvs-container">
      <canvas id="cvs"></canvas>
    </div>
    <div id="palette-right"></div>
  </div>
`;

const canvas = document.getElementById("cvs") as HTMLCanvasElement;
canvas.width = 512;
canvas.height = 512;
const context = canvas.getContext("2d")!;

//application state
type Point = { X: number; Y: number };
type Tool = "thin" | "thick" | "noelle" | "qiqi" | "scara" | "custom" | "text";

interface Drawable {
  display(context: CanvasRenderingContext2D): void;
}

let currentTool: Tool = "thin";
let currentColor = "black";
const cursor = { active: false, x: 0, y: 0 };
const displayList: Drawable[] = [];
let currentStroke: Point[] = [];
const undoneStrokes: Drawable[] = [];
let preview: Drawable | null = null;
let customStickerImage: HTMLImageElement | null = null;

//Drawable Factory Functions
function DrawLine(points: Point[], width: number, currentColor: string) {
  return {
    display(context: CanvasRenderingContext2D) {
      if (points.length === 0) return;
      context.lineWidth = width;
      context.strokeStyle = currentColor;
      context.beginPath();
      context.moveTo(points[0].X, points[0].Y);
      for (let i = 1; i < points.length; i++) {
        context.lineTo(points[i].X, points[i].Y);
      }
      context.stroke();
    },
  };
}

function DrawImage(
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return {
    display(context: CanvasRenderingContext2D) {
      context.drawImage(img, x, y, width, height);
    },
  };
}

function DrawText(
  text: string,
  x: number,
  y: number,
  color: string = "black",
  fontSize: number = 20,
): Drawable {
  return {
    display(context: CanvasRenderingContext2D) {
      context.fillStyle = color;
      context.font = `${fontSize}px sans-serif`;
      context.textBaseline = "middle";
      context.fillText(text, x, y);
    },
  };
}
//preview circle when sticker buttons not active
function fillCircle(point: Point, radius: number, width: number): Drawable {
  return {
    display(context: CanvasRenderingContext2D) {
      context.beginPath();
      context.arc(point.X, point.Y, radius * width, 0, Math.PI * 2);
      context.fillStyle = "#C4C4C4";
      context.fill();
      context.closePath();
    },
  };
}

//Image Loading and Scaling
const MAX_WIDTH = 200;
const MAX_HEIGHT = 125;

function scaleDimensions(img: HTMLImageElement) {
  const ratio = Math.min(MAX_WIDTH / img.width, MAX_HEIGHT / img.height);
  return { w: img.width * ratio, h: img.height * ratio };
}

//initialize images
const images: { [K in "noelle" | "qiqi" | "scara"]: HTMLImageElement } = {
  noelle: new Image(),
  qiqi: new Image(),
  scara: new Image(),
};

images.noelle.src = noelleURL;
images.qiqi.src = qiqiURL;
images.scara.src = scaraURL;

//redraw strokes
function redraw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  displayList.forEach((d) => d.display(context));

  if (currentStroke.length > 1) {
    const width = currentTool === "thin" ? 2 : 5;
    context.lineWidth = width;
    context.strokeStyle = currentColor;
    context.beginPath();
    context.moveTo(currentStroke[0].X, currentStroke[0].Y);
    for (let i = 1; i < currentStroke.length; i++) {
      context.lineTo(currentStroke[i].X, currentStroke[i].Y);
    }
    context.stroke();
  }
  if (!cursor.active && preview) {
    preview.display(context);
  }
}

//updates the line preview or sticker preview
function updatePreview() {
  if (currentTool === "text") {
    preview = DrawText("A", cursor.x, cursor.y, "black", 16);
    return;
  }

  switch (currentTool) {
    case "noelle":
      if (images.noelle.complete) {
        preview = DrawImage(
          images.noelle,
          cursor.x - 200 / 2,
          cursor.y - 125 / 2,
          200,
          125,
        );
      }
      break;
    case "qiqi":
      if (images.qiqi.complete) {
        preview = DrawImage(
          images.qiqi,
          cursor.x - 200 / 2,
          cursor.y - 125 / 2,
          200,
          125,
        );
      }
      break;
    case "scara":
      if (images.scara.complete) {
        preview = DrawImage(
          images.scara,
          cursor.x - 150 / 2,
          cursor.y - 90 / 2,
          150,
          90,
        );
      }
      break;
    case "custom":
      if (customStickerImage) {
        const { w, h } = scaleDimensions(customStickerImage);
        preview = DrawImage(
          customStickerImage,
          cursor.x - w / 2,
          cursor.y - h / 2,
          w,
          h,
        );
      } else {
        preview = null;
      }
      break;
    default:
      preview = fillCircle(
        { X: cursor.x, Y: cursor.y },
        1,
        currentTool === "thin" ? 2 : 5,
      );
  }
}

//clears all button outlines then in each button, makes current one blue
function clearOutlines() {
  document.querySelectorAll("#tools-left button, #palette-right button")
    .forEach((b) => (b as HTMLElement).style.outline = "");
}

//on mouse down
canvas.addEventListener("mousedown", (event) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
  if (currentTool == "thin" || currentTool == "thick") {
    currentStroke = [{ X: cursor.x, Y: cursor.y }];
  }
});

//what actually happens while drawing
canvas.addEventListener("drawEvent", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const drawable of displayList) {
    drawable.display(context);
  }

  if (currentStroke.length > 0) {
    context.lineWidth = currentTool === "thin" ? 2 : 5;
    context.strokeStyle = currentColor;
    context.beginPath();
    context.moveTo(currentStroke[0].X, currentStroke[0].Y);
    for (let i = 1; i < currentStroke.length; i++) {
      context.lineTo(currentStroke[i].X, currentStroke[i].Y);
    }
    context.stroke();
  }

  if (!cursor.active && preview !== null) {
    preview.display(context);
  }
});

//what happens while ur mouse moves
canvas.addEventListener("mousemove", (event) => {
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
  if (cursor.active) {
    if (currentTool === "thin" || currentTool === "thick") {
      currentStroke.push({ X: cursor.x, Y: cursor.y });
      redraw();
    }
  } else {
    updatePreview();
    redraw();
  }
});

//what happens when u let go of mouse
canvas.addEventListener("mouseup", () => {
  if (
    cursor.active && (currentTool === "thin" || currentTool === "thick")
  ) {
    if (currentStroke.length > 1) {
      const width = currentTool === "thin" ? 2 : 5;
      displayList.push(DrawLine([...currentStroke], width, currentColor));
    }
    currentStroke = [];
  }
  cursor.active = false;
  redraw();
});

//clicking to add stickers or text to canvas
canvas.addEventListener("click", (event) => {
  const x = event.offsetX;
  const y = event.offsetY;

  switch (currentTool) {
    case "noelle":
    case "qiqi":
    case "scara": {
      const img = images[currentTool];
      if (img.complete) {
        const { w, h } = scaleDimensions(img);
        displayList.push(DrawImage(img, x - w / 2, y - h / 2, w, h));
      }
      break;
    }

    case "custom": {
      if (customStickerImage) {
        const { w, h } = scaleDimensions(customStickerImage);
        displayList.push(
          DrawImage(customStickerImage, x - w / 2, y - h / 2, w, h),
        );
      }
      break;
    }

    case "text":
      {
        const userText = prompt("Enter text or emoji:", "😊");
        if (userText === null) return;

        const sizeInput = prompt("Font size (pixels):", "24");
        const fontSize = parseInt(sizeInput!) || 24;

        displayList.push(
          DrawText(userText, x, y, currentColor, fontSize),
        );
        redraw();
      }
      break;
  }
  preview = null;
  redraw();
});

//creating buttons and placing them in div containers
const toolsLeft = document.getElementById("tools-left")!;
const paletteRight = document.getElementById("palette-right")!;

function createButton(label: string, parent: HTMLElement, handler: () => void) {
  const button = document.createElement("button");
  button.innerHTML = label;
  button.addEventListener("click", handler);
  parent.appendChild(button);
  return button;
}

const thinButton = createButton("thin", toolsLeft, () => {
  currentTool = "thin";
  clearOutlines();
  thinButton.style.outline = "2px solid blue";
});

const thickButton = createButton("thick", toolsLeft, () => {
  currentTool = "thick";
  clearOutlines();
  thickButton.style.outline = "2px solid blue";
});

["noelle", "qiqi", "scara"].forEach((name) => {
  const button = document.createElement("button");
  const img = images[name as keyof typeof images];
  button.innerHTML = `<img src="${img.src}" width="50" height="35">`;
  button.addEventListener("click", () => {
    currentTool = name as Tool;
    clearOutlines();
    button.style.outline = "2px solid blue";
  });
  toolsLeft.appendChild(button);
});

const customStickerButton = createButton("custom", toolsLeft, () => {
  currentTool = "custom";
  clearOutlines();
  customStickerButton.style.outline = "2px solid blue";
  const url = prompt("Enter image URL for your custom sticker:");
  if (!url) return;
  const img = new Image();
  img.src = url;
  img.onload = () => {
    customStickerImage = img;
    alert("Image loaded!");
    redraw();
  };
  img.onerror = () => {
    alert("Failed to load image. Check the URL.");
  };
});

const textButton = createButton("text", toolsLeft, () => {
  currentTool = "text";
  clearOutlines();
  textButton.style.outline = "2px solid blue";
});

createButton("undo", toolsLeft, () => {
  if (displayList.length > 0) {
    undoneStrokes.push(displayList.pop()!);
    redraw();
  }
});

createButton("redo", toolsLeft, () => {
  if (undoneStrokes.length > 0) {
    displayList.push(undoneStrokes.pop()!);
    redraw();
  }
});

createButton("clear", toolsLeft, () => {
  displayList.length = 0;
  undoneStrokes.length = 0;
  preview = null;
  redraw();
});

createButton("export", toolsLeft, () => {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = 1024;
  tempCanvas.height = 1024;
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) return;

  tempCtx.scale(2, 2);
  displayList.forEach((drawable) => {
    drawable.display(tempCtx);
  });

  const anchor = document.createElement("a");
  anchor.href = tempCanvas.toDataURL("image/png");
  anchor.download = "canvas_export.png";
  anchor.click();
});

//same thing but with the colors on right side
const COLORS = [
  "black",
  "red",
  "green",
  "blue",
  "yellow",
  "purple",
  "orange",
  "pink",
];

COLORS.forEach((color) => {
  const button = document.createElement("button");
  button.style.backgroundColor = color;
  button.style.width = "30px";
  button.style.height = "30px";
  button.title = `Set color to ${color}`;
  button.onclick = () => {
    currentColor = color;
    document.querySelectorAll("#palette-right button").forEach((b) => {
      (b as HTMLElement).style.outline = "";
    });
    button.style.outline = "2px solid blue";
  };
  paletteRight.append(button);
});

(paletteRight.firstChild as HTMLElement)?.style?.setProperty(
  "outline",
  "2px solid blue",
);
