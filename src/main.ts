import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import "./style.css";

document.body.innerHTML = `
  <p>Example image asset: <img src="${exampleIconUrl}" class="icon" /></p>
  <h1> Herro <h1>
  <canvas id="cvs"></canvas>
`;

const canvas = document.getElementById("cvs") as HTMLCanvasElement;
canvas.id = "cvs";
const context = canvas.getContext("2d");

//if (context) {
canvas.addEventListener("mousedown", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const gradient = context?.createLinearGradient(0, 0, 200, 0);
  gradient?.addColorStop(0, "pink");
  gradient?.addColorStop(1, "purple");

  if (context) {
    context.fillStyle = gradient!;
    context.fillRect(x, y, 20, 20);
  }
});
//}
