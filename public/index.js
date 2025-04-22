import { cross_product, deg_to_rad, Matrix } from "./mat.js";
import { never, qs, sleep } from "./utils.js";

const canvas = qs("canvas", "#canvas") ?? never();
const ctx = canvas.getContext("2d") ?? never();

canvas.style.imageRendering = "pixelated";

canvas.width = window.innerWidth / 8;
canvas.height = window.innerHeight / 8;

let camera_radians = 0;

let projection = Matrix.perspective_3d(deg_to_rad(90), canvas.width / canvas.height, 1, 2000);

let points = [
  // top
  new Matrix(1, 4, [-1, -1, 1, 1]),
  new Matrix(1, 4, [1, -1, -1, 1]),
  new Matrix(1, 4, [-1, -1, -1, 1]),
  new Matrix(1, 4, [-1, -1, 1, 1]),
  new Matrix(1, 4, [1, -1, 1, 1]),
  new Matrix(1, 4, [1, -1, -1, 1]),
  // bottom
  new Matrix(1, 4, [-1, 1, -1, 1]),
  new Matrix(1, 4, [1, 1, -1, 1]),
  new Matrix(1, 4, [-1, 1, 1, 1]),
  new Matrix(1, 4, [1, 1, -1, 1]),
  new Matrix(1, 4, [1, 1, 1, 1]),
  new Matrix(1, 4, [-1, 1, 1, 1]),

  // back
  new Matrix(1, 4, [-1, -1, -1, 1]),
  new Matrix(1, 4, [1, -1, -1, 1]),
  new Matrix(1, 4, [-1, 1, -1, 1]),
  new Matrix(1, 4, [1, -1, -1, 1]),
  new Matrix(1, 4, [1, 1, -1, 1]),
  new Matrix(1, 4, [-1, 1, -1, 1]),

  // left
  new Matrix(1, 4, [-1, 1, 1, 1]),
  new Matrix(1, 4, [-1, -1, 1, 1]),
  new Matrix(1, 4, [-1, 1, -1, 1]),
  new Matrix(1, 4, [-1, -1, 1, 1]),
  new Matrix(1, 4, [-1, -1, -1, 1]),
  new Matrix(1, 4, [-1, 1, -1, 1]),

  // right
  new Matrix(1, 4, [1, 1, -1, 1]),
  new Matrix(1, 4, [1, -1, 1, 1]),
  new Matrix(1, 4, [1, 1, 1, 1]),
  new Matrix(1, 4, [1, 1, -1, 1]),
  new Matrix(1, 4, [1, -1, -1, 1]),
  new Matrix(1, 4, [1, -1, 1, 1]),

  // front
  new Matrix(1, 4, [1, -1, 1, 1]),
  new Matrix(1, 4, [-1, 1, 1, 1]),
  new Matrix(1, 4, [1, 1, 1, 1]),
  new Matrix(1, 4, [1, -1, 1, 1]),
  new Matrix(1, 4, [-1, -1, 1, 1]),
  new Matrix(1, 4, [-1, 1, 1, 1]),
];

while (true) {
  await sleep(1);
  camera_radians += 0.004;

  let translation = Matrix.translation_3d(0, 0, 7 - Math.abs(Math.sin(camera_radians * 4)) * 4);
  let rotation = Matrix.x_rotation_3d(camera_radians * 4).mul(Matrix.z_rotation_3d(camera_radians * 3));
  // .mul(Matrix.z_rotation_3d(camera_radians * 3))
  // .mul(Matrix.x_rotation_3d(camera_radians));
  let camera = translation.mul(rotation);

  let view = camera.inv();
  let view_projection = view.mul(projection);

  ctx.fillStyle = `#000000ff`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < points.length; i += 3) {
    const a = points[i];
    const b = points[i + 1];
    const c = points[i + 2];

    const proj_a = a.mul(view_projection);
    const proj_b = b.mul(view_projection);
    const proj_c = c.mul(view_projection);

    const ax = ((proj_a[0] / proj_a[3] + 1) * canvas.width) / 2;
    const ay = ((1 - proj_a[1] / proj_a[3]) * canvas.height) / 2;

    const bx = ((proj_b[0] / proj_b[3] + 1) * canvas.width) / 2;
    const by = ((1 - proj_b[1] / proj_b[3]) * canvas.height) / 2;

    const cx = ((proj_c[0] / proj_c[3] + 1) * canvas.width) / 2;
    const cy = ((1 - proj_c[1] / proj_c[3]) * canvas.height) / 2;

    const minx = Math.round(Math.min(ax, bx, cx));
    const maxx = Math.round(Math.max(ax, bx, cx));
    const miny = Math.round(Math.min(ay, by, cy));
    const maxy = Math.round(Math.max(ay, by, cy));

    ctx.fillStyle = `hsl(${i * 1.618 * 360}deg 50% 50%)`;

    for (let x = minx; x < maxx; x++) {
      for (let y = miny; y < maxy; y++) {
        const ab = cross_product(bx, by, ax, ay, x, y) < 0;
        const ac = cross_product(ax, ay, cx, cy, x, y) < 0;
        const bc = cross_product(cx, cy, bx, by, x, y) < 0;
        if (ab && ac && bc) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // throw 1;

    // ctx.fillStyle = `red`;
    // ctx.fillRect(ax, ay, 1, 1);
    // ctx.fillRect(bx, by, 1, 1);
    // ctx.fillRect(cx, cy, 1, 1);
  }

  // for (const pos of points) {
  //   const screen = pos.mul(view_projection);

  //   const w = screen[3];
  //   if (w < 0) continue;

  //   const x = screen[0] / w;
  //   const y = screen[1] / w;

  //   const canvasX = Math.round(((x + 1) * canvas.width) / 2);
  //   const canvasY = Math.round(((1 - y) * canvas.height) / 2);

  //   ctx.fillStyle = `red`;
  //   ctx.fillRect(canvasX, canvasY, 1, 1);
  // }
}
