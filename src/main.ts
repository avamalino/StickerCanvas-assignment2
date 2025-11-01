//import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import noelleURL from "./noelle2.png";
import qiqiURL from "./qiqi2.jpg";
import scaraURL from "./scara2.webp";
import "./style.css";

document.body.innerHTML = `
  <h1> Herro <h1>
  <canvas id="cvs"></canvas>
`;

const canvas = document.getElementById("cvs") as HTMLCanvasElement;
canvas.id = "cvs";
canvas.width = 560;
canvas.height = 560;
const context = canvas.getContext("2d")!;
const gradient = context.createLinearGradient(0, 0, 200, 0);
gradient.addColorStop(0, "pink");
gradient.addColorStop(1, "purple");

const cursor = { active: false, x: 0, y: 0 };

interface Drawable {
  display(context: CanvasRenderingContext2D): void;
}

function DrawLine(points: Point[], width: number) {
  return {
    display(context: CanvasRenderingContext2D) {
      if (points.length === 0) return;
      context.lineWidth = width;
      context.strokeStyle = "black";
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

let preview: Drawable | null = null;
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
const MAX_WIDTH = 200;
const MAX_HEIGHT = 125;
function scaleDimensions(img: HTMLImageElement) {
  const w = img.width;
  const h = img.height;
  const ratio = Math.min(MAX_WIDTH / w, MAX_HEIGHT / h);
  return { w: w * ratio, h: h * ratio };
}

function clearOutlines() {
  thickButton.style.outline = "";
  thinButton.style.outline = "";
  noelleStickerButton.style.outline = "";
  scaraStickerButton.style.outline = "";
  qiqiStickerButton.style.outline = "";
  customStickerButton.style.outline = "";
}

type Point = { X: number; Y: number };
const displayList: Drawable[] = [];
let currentStroke: Point[] = [];
const undoneStrokes: Drawable[] = [];

const noelleImage = new Image();
noelleImage.src = noelleURL;
const qiqiImage = new Image();
qiqiImage.src = qiqiURL;
const scaraImage = new Image();
scaraImage.src = scaraURL;

canvas.addEventListener("mousedown", (event) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
  if (currentTool == "thin" || currentTool == "thick") {
    currentStroke = [];
    currentStroke.push({ X: cursor.x, Y: cursor.y });
  }
});

canvas.addEventListener("drawEvent", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const drawable of displayList) {
    drawable.display(context);
  }

  if (currentStroke.length > 0) {
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

canvas.addEventListener("mousemove", (event) => {
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
  if (cursor.active) {
    if (currentTool === "thin" || currentTool === "thick") {
      currentStroke.push({ X: cursor.x, Y: cursor.y });
      canvas.dispatchEvent(new Event("drawEvent"));
    }
  } else {
    switch (currentTool) {
      case "noelle":
        if (noelleImage.complete) {
          preview = DrawImage(
            noelleImage,
            cursor.x - 200 / 2,
            cursor.y - 125 / 2,
            200,
            125,
          );
        }
        break;
      case "qiqi":
        if (qiqiImage.complete) {
          preview = DrawImage(
            qiqiImage,
            cursor.x - 200 / 2,
            cursor.y - 125 / 2,
            200,
            125,
          );
        }
        break;
      case "scara":
        if (scaraImage.complete) {
          preview = DrawImage(
            scaraImage,
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
  canvas.dispatchEvent(new Event("drawEvent"));
});

canvas.addEventListener("mouseup", () => {
  if (
    cursor.active && (currentTool === "thin" || currentTool === "thick") &&
    currentStroke.length > 0
  ) {
    const currentWidth = currentTool === "thin" ? 2 : 5;
    const lineCommand = DrawLine([...currentStroke], currentWidth);
    displayList.push(lineCommand);
    currentStroke = [];
  }
  cursor.active = false;
  canvas.dispatchEvent(new Event("drawEvent"));
});

canvas.addEventListener("click", (event) => {
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;

  switch (currentTool) {
    case "noelle":
      if (noelleImage.complete) {
        const command = DrawImage(
          noelleImage,
          cursor.x - 200 / 2,
          cursor.y - 125 / 2,
          200,
          125,
        );
        displayList.push(command);
      }
      break;
    case "qiqi":
      if (qiqiImage.complete) {
        const command = DrawImage(
          qiqiImage,
          cursor.x - 200 / 2,
          cursor.y - 125 / 2,
          200,
          125,
        );
        displayList.push(command);
      }
      break;
    case "scara":
      if (scaraImage.complete) {
        const command = DrawImage(
          scaraImage,
          cursor.x - 150 / 2,
          cursor.y - 90 / 2,
          150,
          90,
        );
        displayList.push(command);
      }
      break;
    case "custom":
      if (customStickerImage) {
        const { w, h } = scaleDimensions(customStickerImage);
        preview = DrawImage(
          customStickerImage,
          cursor.x - w / 2, //- customStickerImage.width + 200,
          cursor.y - w / 2, //- customStickerImage.height + 125,
          w,
          h,
        );
        displayList.push(preview);
      } else {
        preview = null;
      }
      break;
  }
  preview = null;
  canvas.dispatchEvent(new Event("drawEvent"));
});

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);
clearButton.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  displayList.length = 0;
  undoneStrokes.length = 0;
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
document.body.append(undoButton);
undoButton.addEventListener("click", () => {
  if (displayList.length === 0) return;
  const undoneStroke = displayList.pop()!;
  undoneStrokes.push(undoneStroke);
  canvas.dispatchEvent(new Event("drawEvent"));
  console.log(undoneStroke);
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
document.body.append(redoButton);
redoButton.addEventListener("click", () => {
  if (undoneStrokes.length === 0) return;
  const redoneStroke = undoneStrokes.pop()!;
  displayList.push(redoneStroke);
  canvas.dispatchEvent(new Event("drawEvent"));
});

const thinButton = document.createElement("button");
thinButton.innerHTML = "thin";
thinButton.style.fontSize = "20px";
document.body.append(thinButton);

thinButton.addEventListener("click", () => {
  currentTool = "thin";
  clearOutlines();
  thinButton.style.outline = "2px solid blue";
});

const thickButton = document.createElement("button");
thickButton.innerHTML = "thick";
thickButton.style.fontSize = "30px";
document.body.append(thickButton);

thickButton.addEventListener("click", () => {
  currentTool = "thick";
  clearOutlines();
  thickButton.style.outline = "2px solid blue";
});

const noelleStickerButton = document.createElement("button");
noelleStickerButton.innerHTML = "<img src='" + noelleURL +
  "' width='50' height='35'/>";
document.body.append(noelleStickerButton);

type Tool = "thin" | "thick" | "noelle" | "qiqi" | "scara" | "custom";
let currentTool: Tool = "thin";

noelleStickerButton.addEventListener("click", () => {
  currentTool = "noelle";
  clearOutlines();
  noelleStickerButton.style.outline = "2px solid blue";
});

const qiqiStickerButton = document.createElement("button");
qiqiStickerButton.innerHTML = "<img src='" + qiqiURL +
  "' width='50' height='35'/>";
document.body.append(qiqiStickerButton);

qiqiStickerButton.addEventListener("click", () => {
  currentTool = "qiqi";
  clearOutlines();
  qiqiStickerButton.style.outline = "2px solid blue";
});

const scaraStickerButton = document.createElement("button");
scaraStickerButton.innerHTML = "<img src='" + scaraURL +
  "' width='50' height='35'/>";
document.body.append(scaraStickerButton);

scaraStickerButton.addEventListener("click", () => {
  currentTool = "scara";
  clearOutlines();
  scaraStickerButton.style.outline = "2px solid blue";
});

const customStickerButton = document.createElement("button");
customStickerButton.innerHTML = "custom";
document.body.append(customStickerButton);

let customStickerImage: HTMLImageElement | null = null;
customStickerButton.addEventListener("click", () => {
  currentTool = "custom";
  const url = prompt("Enter image URL for your custom sticker:");
  if (!url) return;

  const customImg = new Image();
  customImg.crossOrigin = "anonymous";
  customImg.src = url;

  alert("Loading image...");

  customImg.onload = () => {
    alert("Image loaded successfully!");
    customStickerImage = customImg;
    canvas.dispatchEvent(new Event("drawEvent"));
  };

  customImg.onerror = () => {
    alert("Failed to load image. Please check the URL and try again.");
  };
  clearOutlines();
  customStickerButton.style.outline = "2px solid blue";
});

const exportButton = document.createElement("button");
exportButton.innerHTML = "export";
document.body.append(exportButton);
exportButton.addEventListener("click", () => {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = 1024;
  tempCanvas.height = 1024;
  const ctx = tempCanvas.getContext("2d");
  ctx?.scale(4, 4);
  displayList.forEach((drawable) => {
    drawable.display(ctx!);
  });
  const anchor = document.createElement("a");
  anchor.href = canvas.toDataURL("image/png");
  anchor.download = "canvas_export.png";
  anchor.click();
});

thinButton.style.outline = "2px solid blue";
