import { Matrix, pos_to_screen, cross_product } from "./mat.js";
import { Mesh } from "./mesh.js";
import { never } from "./utils.js";
/** @typedef {{pos: [Matrix<1, 4>, Matrix<1, 4>, Matrix<1, 4>], color: [number, number, number], light: number, surface: Matrix<1, 4>, proj: [Matrix<1, 4>, Matrix<1, 4>, Matrix<1, 4>], z: number, i: number}} TrigData */

/**
 *
 * @param {Matrix<4, 4>} view_projection
 * @param {Matrix<1, 4>} light_direction_inv
 * @param {Mesh[]} meshes
 * @param {CanvasRenderingContext2D} ctx
 */
export function render_to_canvas(ctx, meshes, view_projection, light_direction_inv) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const image = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

  /** @type {TrigData[]} */
  const trigs = [];

  for (const mesh of meshes) {
    for (let i = 0; i < mesh.points.length; i += 3) {
      const p0 = mesh.points[i];
      const p1 = mesh.points[i + 1];
      const p2 = mesh.points[i + 2];

      /** @type {[Matrix<1, 4>, Matrix<1, 4>, Matrix<1, 4>]} */
      const proj = [p0.mul(view_projection), p1.mul(view_projection), p2.mul(view_projection)];

      const area2 =
        (proj[1].x / proj[1].w - proj[0].x / proj[0].w) *
          (1 - proj[2].y / proj[2].w - (1 - proj[0].y / proj[0].w)) -
        (1 - proj[1].y / proj[1].w - (1 - proj[0].y / proj[0].w)) *
          (proj[2].x / proj[2].w - proj[0].x / proj[0].w);

      const is_clockwise = area2 < 0;

      if (is_clockwise) continue;

      const surface = p1.sub(p0).cross(p2.sub(p0)).normalize();
      const light = Math.max(surface.dot(light_direction_inv), 0.2) * 1.5;

      trigs.push({
        pos: [p0, p1, p2],
        proj,
        surface,
        light,
        color: mesh.color,
        z: Math.max(proj[0].z, proj[1].z, proj[2].z),
        i,
      });
    }
  }

  trigs.sort((a, b) => b.z - a.z);

  for (const { pos, proj, light, color, surface, i } of trigs) {
    const screen_0 = pos_to_screen(proj[0], ctx.canvas.width, ctx.canvas.height);
    const screen_1 = pos_to_screen(proj[1], ctx.canvas.width, ctx.canvas.height);
    const screen_2 = pos_to_screen(proj[2], ctx.canvas.width, ctx.canvas.height);

    const minx = Math.max(0, Math.floor(Math.min(screen_0.x, screen_1.x, screen_2.x)));
    const maxx = Math.min(
      ctx.canvas.width,
      Math.floor(Math.max(screen_0.x, screen_1.x, screen_2.x))
    );
    const miny = Math.max(0, Math.floor(Math.min(screen_0.y, screen_1.y, screen_2.y)));
    const maxy = Math.min(
      ctx.canvas.height,
      Math.floor(Math.max(screen_0.y, screen_1.y, screen_2.y))
    );

    // const [r, g, b] = hsl_to_rgb(i / 10, 0.5, 0.5);
    // const [r, g, b] = hsl_to_rgb(i * 1.618 * 180, 0.5, 0.5);
    const [r, g, b] = color;

    for (let x = minx; x < maxx; x++) {
      for (let y = miny; y < maxy; y++) {
        if (!inside_triangle(screen_0, screen_1, screen_2, x + 0.5, y + 0.5)) {
          continue;
        }

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
 * @param {Matrix<1, 2>} screen_0
 * @param {Matrix<1, 2>} screen_1
 * @param {Matrix<1, 2>} screen_2
 * @param {number} x
 * @param {number} y
 */
function inside_triangle(screen_0, screen_1, screen_2, x, y) {
  const ab = cross_product(screen_1.x, screen_1.y, screen_0.x, screen_0.y, x + 0.5, y + 0.5) <= 0;
  if (!ab) return false;
  const ac = cross_product(screen_0.x, screen_0.y, screen_2.x, screen_2.y, x + 0.5, y + 0.5) <= 0;
  if (!ac) return false;
  const bc = cross_product(screen_2.x, screen_2.y, screen_1.x, screen_1.y, x + 0.5, y + 0.5) <= 0;
  if (!bc) return false;

  return true;
}

/**
 * @param {string} x
 * @param {string} y
 * @param {string} w
 * @param {string} h
 * @param {number} downscale
 */
export function create_canvas(x, y, w, h, downscale = 1) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = x;
  container.style.top = y;
  container.style.width = w;
  container.style.height = h;
  container.style.outline = "1px solid #444";
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
