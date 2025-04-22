import { cross_product, deg_to_rad, hsl_to_rgb, mat, pos_to_screen } from "./mat.js";
import { box, model_box, model_f, model_lhb, quad } from "./model.js";
import { assert, never, qs, sleep } from "./utils.js";

/** @typedef {{pos: [mat<1, 4>, mat<1, 4>, mat<1, 4>], proj: [mat<1, 4>, mat<1, 4>, mat<1, 4>], z: number, i: number}} TrigData */

/**
 *
 * @param {mat<4, 4>} view_projection
 * @param {mat<1, 4>} light_direction_inv
 * @param {mat<1, 4>[]} points
 * @param {CanvasRenderingContext2D} ctx
 */
function render_to_canvas(ctx, points, view_projection, light_direction_inv) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const image = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
  // image.data.set(background.data);

  /** @type {TrigData[]} */
  const trigs = [];

  for (let i = 0; i < points.length; i += 3) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const p2 = points[i + 2];

    /** @type {[mat<1, 4>, mat<1, 4>, mat<1, 4>]} */
    const proj = [p0.mul(view_projection), p1.mul(view_projection), p2.mul(view_projection)];

    const area2 =
      (proj[1].x / proj[1].w - proj[0].x / proj[0].w) * (1 - proj[2].y / proj[2].w - (1 - proj[0].y / proj[0].w)) -
      (1 - proj[1].y / proj[1].w - (1 - proj[0].y / proj[0].w)) * (proj[2].x / proj[2].w - proj[0].x / proj[0].w);

    const is_clockwise = area2 < 0;

    if (is_clockwise) continue;

    trigs.push({
      pos: [p0, p1, p2],
      proj,
      z: (proj[0].z + proj[1].z + proj[2].z) / 3,
      i,
    });
  }

  trigs.sort((a, b) => b.z - a.z);

  for (const { pos, proj, i } of trigs) {
    const screen_0 = pos_to_screen(proj[0], ctx.canvas.width, ctx.canvas.height);
    const screen_1 = pos_to_screen(proj[1], ctx.canvas.width, ctx.canvas.height);
    const screen_2 = pos_to_screen(proj[2], ctx.canvas.width, ctx.canvas.height);

    const surface = pos[1].sub(pos[0]).cross(pos[2].sub(pos[0])).normalize();

    const light = surface.dot(light_direction_inv);

    const minx = Math.max(0, Math.floor(Math.min(screen_0.x, screen_1.x, screen_2.x)));
    const maxx = Math.min(ctx.canvas.width, Math.floor(Math.max(screen_0.x, screen_1.x, screen_2.x)));
    const miny = Math.max(0, Math.floor(Math.min(screen_0.y, screen_1.y, screen_2.y)));
    const maxy = Math.min(ctx.canvas.height, Math.floor(Math.max(screen_0.y, screen_1.y, screen_2.y)));

    const [r, g, b] = hsl_to_rgb(i / 10, 0.5, 0.5);
    // const [r, g, b] = hsl_to_rgb(i * 1.618 * 180, 0.5, 0.5);

    for (let x = minx; x < maxx; x++) {
      for (let y = miny; y < maxy; y++) {
        const ab = cross_product(screen_1.x, screen_1.y, screen_0.x, screen_0.y, x + 0.5, y + 0.5) <= 0;
        if (!ab) continue;
        const ac = cross_product(screen_0.x, screen_0.y, screen_2.x, screen_2.y, x + 0.5, y + 0.5) <= 0;
        if (!ac) continue;
        const bc = cross_product(screen_2.x, screen_2.y, screen_1.x, screen_1.y, x + 0.5, y + 0.5) <= 0;
        if (!bc) continue;

        const pos = (ctx.canvas.width * y + x) * 4;
        image.data[pos] = r * light;
        image.data[pos + 1] = g * light;
        image.data[pos + 2] = b * light;
        image.data[pos + 3] = 255;
      }
    }
  }

  ctx.putImageData(image, 0, 0);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 */
function setup_canvas(ctx) {
  ctx.canvas.style.imageRendering = "pixelated";

  const downscale = 1;

  ctx.canvas.width = ctx.canvas.clientWidth / downscale;
  ctx.canvas.height = ctx.canvas.clientHeight / downscale;

  return mat.perspective_3d(deg_to_rad(20), ctx.canvas.width / ctx.canvas.height, 1, 2000);
}

const ctxs = [
  // (qs("canvas", "#canvas0") ?? never()).getContext("2d") ?? never(),
  // (qs("canvas", "#canvas1") ?? never()).getContext("2d") ?? never(),
  // (qs("canvas", "#canvas2") ?? never()).getContext("2d") ?? never(),
  (qs("canvas", "#canvas3") ?? never()).getContext("2d") ?? never(),
];

const projections = ctxs.map(setup_canvas);

/** @type {mat<1, 4>[]} */
let points = [];

points.push(...model_lhb());

const light_direction = mat.forward.mul(mat.x_rotation_3d(0.9)).mul(mat.y_rotation_3d(0.4));
const light_direction_inv = light_direction.neg();

// const background = ctx0.createImageData(ctx0.canvas.width, ctx0.canvas.height);
// for (let i = 0; i < background.data.length; i += 4) {
//   background.data[i + 3] = 255;
// }

/**
 * @param {number} t
 */
function frame(t) {
  for (let i = 0; i < ctxs.length; i++) {
    const ctx = ctxs[i];
    const projection = projections[i];

    let camera = mat.translation_3d(0, 0, 5);

    if (i == 1) {
      camera = camera.mul(mat.y_rotation_3d(Math.PI / 2));
    }
    if (i == 2) {
      camera = camera.mul(mat.x_rotation_3d(Math.PI / 2));
    }
    if (i == 0) {
      camera = camera.mul(mat.y_rotation_3d(0.3).mul(mat.x_rotation_3d(Math.cos(t / 500) / 9)));
    }

    let view = camera.inv();
    let view_projection = view.mul(projection);

    render_to_canvas(ctx, points, view_projection, light_direction_inv);
  }

  requestAnimationFrame(frame);
}
frame(performance.now());
