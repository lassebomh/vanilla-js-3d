import { deg_to_rad, Matrix } from "./mat.js";
import { never, qs, sleep } from "./utils.js";

const canvas = qs("canvas", "#canvas") ?? never();
const ctx = canvas.getContext("2d") ?? never();

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let camera_radians = 0;

let projection = Matrix.perspective_3d(deg_to_rad(120), canvas.clientWidth / canvas.clientHeight, 1, 2000);

let points = [
  new Matrix(1, 4, [-1, -1, -1, 1]),
  new Matrix(1, 4, [1, -1, -1, 1]),
  new Matrix(1, 4, [-1, 1, -1, 1]),
  new Matrix(1, 4, [1, 1, -1, 1]),
  new Matrix(1, 4, [-1, -1, 1, 1]),
  new Matrix(1, 4, [1, -1, 1, 1]),
  new Matrix(1, 4, [-1, 1, 1, 1]),
  new Matrix(1, 4, [1, 1, 1, 1]),
];

ctx.fillStyle = "red";

while (true) {
  await sleep(10);
  camera_radians += 0.03;

  let translation = Matrix.translation_3d(0, 0, 3);
  let rotation = Matrix.y_rotation_3d(camera_radians);
  let camera = translation.mul(rotation);

  let view = camera.inv();
  let view_projection = view.mul(projection);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "red";

  for (const pos of points) {
    const screen = pos.mul(view_projection);

    const w = screen[3];
    if (w < 0) continue;

    const x = screen[0] / w;
    const y = screen[1] / w;

    const canvasX = ((x + 1) * canvas.width) / 2;
    const canvasY = ((1 - y) * canvas.height) / 2;

    ctx.fillRect(canvasX, canvasY, 5, 5);
  }
}
