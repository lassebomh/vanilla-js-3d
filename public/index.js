import { deg_to_rad, mat } from "./mat.js";
import { model_lhb } from "./model.js";
import { render_to_canvas } from "./render.js";
import { never } from "./utils.js";

/**
 * @param {string} x
 * @param {string} y
 * @param {string} w
 * @param {string} h
 * @param {number} downscale
 */
function create_canvas(x, y, w, h, downscale = 1) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = x;
  container.style.top = y;
  container.style.width = w;
  container.style.height = h;
  document.body.appendChild(container);

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.imageRendering = "pixelated";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d") ?? never();

  ctx.canvas.width = ctx.canvas.clientWidth / downscale;
  ctx.canvas.height = ctx.canvas.clientHeight / downscale;

  return ctx;
}

const ctxs = [create_canvas("0", "0", "100%", "100%", 2)];

const projections = [
  mat.perspective_3d(deg_to_rad(20), ctxs[0].canvas.width / ctxs[0].canvas.height, 1, 2000),
];

/** @type {mat<1, 4>[]} */
let points = [];

points.push(...model_lhb());

/**
 * @param {number} a
 * @param {number} b
 */
function swap(a, b) {
  [
    points[a * 3],
    points[a * 3 + 1],
    points[a * 3 + 2],
    points[b * 3],
    points[b * 3 + 1],
    points[b * 3 + 2],
  ] = [
    points[b * 3],
    points[b * 3 + 1],
    points[b * 3 + 2],
    points[a * 3],
    points[a * 3 + 1],
    points[a * 3 + 2],
  ];
}

for (let i = 0; i < points.length / 3 - 40; i++) {
  const other = Math.floor(Math.random() * 40);
  swap(i, i + other);
}

const light_direction = mat.forward.mul(mat.x_rotation_3d(0.9)).mul(mat.y_rotation_3d(0.4));
const light_direction_inv = light_direction.neg();

/**
 * @param {number} t
 */
function frame(t) {
  for (let i = 0; i < ctxs.length; i++) {
    const ctx = ctxs[i];
    const projection = projections[i];

    let camera = mat.translation_3d(0, 0.2, 7);

    camera = camera
      .mul(mat.y_rotation_3d(Math.sin(t / 1000) / 10 + 0.5))
      .mul(mat.x_rotation_3d(Math.cos(t / 1000) / 10 + 0.3));

    let view = camera.inv();
    let view_projection = view.mul(projection);

    const points_slice = points.slice(0, 3 * Math.floor(t / 2));

    render_to_canvas(ctx, points_slice, view_projection, light_direction_inv);
  }

  requestAnimationFrame(frame);
}
frame(performance.now());
