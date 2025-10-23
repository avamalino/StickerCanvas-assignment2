//import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import "./style.css";
import noelleURL from "./noelle2.png";

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

let currentWidth = 2;
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
//ctx: CanvasRenderingContext2D, x: number, y: number, radius: number
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

type Point = { X: number; Y: number };
const displayList: Drawable[] = [];
let currentStroke: Point[] = [];
const undoneStrokes: Drawable[] = [];

const noelleImage = new Image();
noelleImage.src = noelleURL;

//noelleImage.onload = () => {
//  console.log("noelle loaded");
//  context.drawImage(noelleImage, 0, 0, canvas.width, canvas.height);
//};
//noelleImage.onerror = (err) => {
//  console.error("failed to load noelle.png", err);
//};
//noelleImage.src = "src/noelle.png";

canvas.addEventListener("mousedown", (event) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
  if (!stickerActive) {
    currentStroke = [];
    currentStroke.push({ X: cursor.x, Y: cursor.y });
  }
});

canvas.addEventListener("drawEvent", () => {
  console.log("hi");

  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const drawable of displayList) {
    drawable.display(context);
  }

  if (currentStroke.length > 0) {
    context.lineWidth = currentWidth;
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
    if (!stickerActive) {
      currentStroke.push({ X: cursor.x, Y: cursor.y });
    }
  } else {
    if (stickerActive && noelleImage.complete) {
      preview = DrawImage(
        noelleImage,
        cursor.x - 200 / 2,
        cursor.y - 125 / 2,
        200,
        125,
      );
    } else {
      preview = fillCircle({ X: cursor.x, Y: cursor.y }, 5, currentWidth);
    }
  }
  canvas.dispatchEvent(new Event("drawEvent"));
});

canvas.addEventListener("mouseup", () => {
  if (cursor.active && !stickerActive && currentStroke.length > 0) {
    const lineCommand = DrawLine([...currentStroke], currentWidth);
    displayList.push(lineCommand);
    currentStroke = [];
  }
  cursor.active = false;
  canvas.dispatchEvent(new Event("drawEvent"));
});

canvas.addEventListener("click", (event) => {
  if (!stickerActive) return;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;

  if (noelleImage.complete) {
    const stickerCommand = DrawImage(
      noelleImage,
      cursor.x - 200 / 2,
      cursor.y - 125 / 2,
      200,
      125,
    );
    displayList.push(stickerCommand);
    preview = null;
    canvas.dispatchEvent(new Event("drawEvent"));
  }
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
  stickerActive = false;
  currentWidth = 2;
  thinButton.style.outline = "2px solid blue";
  thickButton.style.outline = "";
  noelleStickerButton.style.outline = "";
});

const thickButton = document.createElement("button");
thickButton.innerHTML = "thick";
thickButton.style.fontSize = "30px";
document.body.append(thickButton);

thickButton.addEventListener("click", () => {
  stickerActive = false; //figure out better way for this later
  currentWidth = 5;
  thickButton.style.outline = "2px solid blue";
  thinButton.style.outline = "";
  noelleStickerButton.style.outline = "";
});

const noelleStickerButton = document.createElement("button");
noelleStickerButton.innerHTML = "<img src='" + noelleURL +
  "' width='50' height='35'/>";
document.body.append(noelleStickerButton);

let stickerActive = false;
noelleStickerButton.addEventListener("click", () => {
  stickerActive = true;
  currentWidth = 0;
  noelleStickerButton.style.outline = "2px solid blue";
  thickButton.style.outline = "";
  thinButton.style.outline = "";
  //const stickerDrawable: Drawable = {
  //  display(context: CanvasRenderingContext2D) {
  //    context.drawImage(noelleImage, cursor.x - 200 / 2, cursor.y - 125 / 2, 200, 125);
  //  },
  //};
  //displayList.push(stickerDrawable);
  //canvas.dispatchEvent(new Event("drawEvent"));
});
