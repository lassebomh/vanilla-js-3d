/** @typedef {{pos: [mat<1, 4>, mat<1, 4>, mat<1, 4>], light: number, surface: mat<1, 4>, proj: [mat<1, 4>, mat<1, 4>, mat<1, 4>], z: number, i: number}} TrigData */

import { mat, pos_to_screen, hsl_to_rgb, cross_product } from "./mat.js";

/**
 *
 * @param {mat<4, 4>} view_projection
 * @param {mat<1, 4>} light_direction_inv
 * @param {mat<1, 4>[]} points
 * @param {CanvasRenderingContext2D} ctx
 */
export function render_to_canvas(ctx, points, view_projection, light_direction_inv) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const image = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

  /** @type {TrigData[]} */
  const trigs = [];

  for (let i = 0; i < points.length; i += 3) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const p2 = points[i + 2];

    /** @type {[mat<1, 4>, mat<1, 4>, mat<1, 4>]} */
    const proj = [p0.mul(view_projection), p1.mul(view_projection), p2.mul(view_projection)];

    const area2 =
      (proj[1].x / proj[1].w - proj[0].x / proj[0].w) *
        (1 - proj[2].y / proj[2].w - (1 - proj[0].y / proj[0].w)) -
      (1 - proj[1].y / proj[1].w - (1 - proj[0].y / proj[0].w)) *
        (proj[2].x / proj[2].w - proj[0].x / proj[0].w);

    const is_clockwise = area2 < 0;

    if (is_clockwise) continue;

    const surface = p1.sub(p0).cross(p2.sub(p0)).normalize();
    const light = surface.dot(light_direction_inv);

    trigs.push({
      pos: [p0, p1, p2],
      proj,
      surface,
      light,
      z: (proj[0].z + proj[1].z + proj[2].z) / 3,
      i,
    });
  }

  trigs.sort((a, b) => b.z - a.z);

  for (const { pos, proj, light, surface, i } of trigs) {
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

    const [r, g, b] = hsl_to_rgb(i / 10, 0.5, 0.5);
    // const [r, g, b] = hsl_to_rgb(i * 1.618 * 180, 0.5, 0.5);

    for (let x = minx; x < maxx; x++) {
      for (let y = miny; y < maxy; y++) {
        if (!inside_triangle(screen_0, screen_1, screen_2, x + 0.5, y + 0.5)) {
          continue;
        }

        const pos = (ctx.canvas.width * y + x) * 4;

        image.data[pos] = r;
        image.data[pos + 1] = g;
        image.data[pos + 2] = b;
        image.data[pos + 3] = 255 * light;
      }
    }
  }

  ctx.putImageData(image, 0, 0);
}

/**
 * @param {mat<1, 2>} screen_0
 * @param {mat<1, 2>} screen_1
 * @param {mat<1, 2>} screen_2
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
