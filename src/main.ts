//import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import "./style.css";

document.body.innerHTML = `
  <h1> Herro <h1>
  <canvas id="cvs"></canvas>
`;

const canvas = document.getElementById("cvs") as HTMLCanvasElement;
canvas.id = "cvs";
const context = canvas.getContext("2d")!;
const gradient = context.createLinearGradient(0, 0, 200, 0);
gradient.addColorStop(0, "pink");
gradient.addColorStop(1, "purple");

const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("mousedown", (event) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
});

canvas.addEventListener("mousemove", (event) => {
  if (cursor.active) {
    context.fillStyle = gradient; //ill figure out later
    context.beginPath();

    context.moveTo(cursor.x, cursor.y);
    context.lineTo(event.offsetX, event.offsetY);
    context.stroke();
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});
