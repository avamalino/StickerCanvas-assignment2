//import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
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

function DrawLine(points: Point[]) {
  return {
    display(context: CanvasRenderingContext2D) {
      if (points.length === 0) return;
      context.beginPath();
      context.moveTo(points[0].X, points[0].Y);
      for (let i = 1; i < points.length; i++) {
        context.lineTo(points[i].X, points[i].Y);
      }
      context.stroke();
    },
  };
}

type Point = { X: number; Y: number };
const displayList: Drawable[] = [];
let currentStroke: Point[] = [];
const undoneStrokes: Drawable[] = [];

canvas.addEventListener("mousedown", (event) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
  currentStroke = [];
});

canvas.addEventListener("drawEvent", () => {
  console.log("hi");

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
});

canvas.addEventListener("mousemove", (event) => {
  if (!cursor.active) return;
  context.fillStyle = gradient; //ill figure out later

  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
  currentStroke.push({ X: cursor.x, Y: cursor.y });
  canvas.dispatchEvent(new Event("drawEvent"));
});

canvas.addEventListener("mouseup", () => {
  if (cursor.active && currentStroke.length > 0) {
    const lineCommand = DrawLine([...currentStroke]);
    displayList.push(lineCommand);
    currentStroke = [];
  }
  cursor.active = false;
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
