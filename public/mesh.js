import { Matrix, scale, translate, rotate_x, rotate_y } from "./mat.js";

export class Mesh {
  /**
   * @param {Matrix<1, 4>[]} points
   * @param {[number, number, number]} color
   */
  constructor(points, color) {
    this.points = points;
    this.color = color;
  }

  /**
   * @param {Matrix<1, 4>[]} points
   */
  extend(points) {
    this.points.push(...points);
  }

  /**
   * @param {Matrix<4, 4>[]} matricies
   */
  apply(...matricies) {
    for (let i = 0; i < this.points.length; i++) {
      let point = this.points[i];

      for (const matrix of matricies) {
        point = point.mul(matrix);
      }
      this.points[i] = point;
    }
    return this;
  }
}

/**
 * @returns {Matrix<1, 4>[]}
 */
export function quad() {
  return [
    new Matrix(1, 4, [0, 1, 0, 1]),
    new Matrix(1, 4, [1, 1, 0, 1]),
    new Matrix(1, 4, [0, 0, 0, 1]),
    new Matrix(1, 4, [0, 0, 0, 1]),
    new Matrix(1, 4, [1, 1, 0, 1]),
    new Matrix(1, 4, [1, 0, 0, 1]),
  ];
}

export function box() {
  const transl = translate(-0.5, -0.5, 0.5);
  const q = transl.apply(quad());
  return transl
    .inv()
    .apply([
      ...rotate_x(0).apply(q),
      ...rotate_y(Math.PI / 2).apply(q),
      ...rotate_y(Math.PI).apply(q),
      ...rotate_y((Math.PI / 2) * 3).apply(q),
      ...rotate_x(Math.PI / 2).apply(q),
      ...rotate_x(-Math.PI / 2).apply(q),
    ]);
}

/**
 * @param {string} text
 */
export function text_to_mesh(text) {
  /** @type {Matrix<1,4>[]} */
  const points = [];

  const pixels = text.split("\n").map((x) => x.split("").map((y) => y === "#"));

  const height = pixels.length;
  const width = pixels[0].length;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (pixels[y][x]) {
        points.push(...translate(x, height - y, 0).apply(box()));
      }
    }
  }

  return scale(0.07, 0.07, 0.07).apply(translate(-19, 0, 0).apply(points));
}

export function model_box() {
  return [
    // bottom
    new Matrix(1, 4, [-1, -1, -1, 1]),
    new Matrix(1, 4, [-1, -1, 1, 1]),
    new Matrix(1, 4, [1, -1, -1, 1]),
    new Matrix(1, 4, [-1, -1, 1, 1]),
    new Matrix(1, 4, [1, -1, 1, 1]),
    new Matrix(1, 4, [1, -1, -1, 1]),

    // // top
    new Matrix(1, 4, [-1, 1, -1, 1]),
    new Matrix(1, 4, [1, 1, -1, 1]),
    new Matrix(1, 4, [-1, 1, 1, 1]),
    new Matrix(1, 4, [1, 1, -1, 1]),
    new Matrix(1, 4, [1, 1, 1, 1]),
    new Matrix(1, 4, [-1, 1, 1, 1]),

    // // back
    new Matrix(1, 4, [-1, -1, -1, 1]),
    new Matrix(1, 4, [1, -1, -1, 1]),
    new Matrix(1, 4, [-1, 1, -1, 1]),
    new Matrix(1, 4, [1, -1, -1, 1]),
    new Matrix(1, 4, [1, 1, -1, 1]),
    new Matrix(1, 4, [-1, 1, -1, 1]),

    // // left
    new Matrix(1, 4, [-1, 1, 1, 1]),
    new Matrix(1, 4, [-1, -1, 1, 1]),
    new Matrix(1, 4, [-1, 1, -1, 1]),
    new Matrix(1, 4, [-1, -1, 1, 1]),
    new Matrix(1, 4, [-1, -1, -1, 1]),
    new Matrix(1, 4, [-1, 1, -1, 1]),

    // // right
    new Matrix(1, 4, [1, 1, -1, 1]),
    new Matrix(1, 4, [1, -1, 1, 1]),
    new Matrix(1, 4, [1, 1, 1, 1]),
    new Matrix(1, 4, [1, 1, -1, 1]),
    new Matrix(1, 4, [1, -1, -1, 1]),
    new Matrix(1, 4, [1, -1, 1, 1]),

    // // front
    new Matrix(1, 4, [1, -1, 1, 1]),
    new Matrix(1, 4, [-1, 1, 1, 1]),
    new Matrix(1, 4, [1, 1, 1, 1]),
    new Matrix(1, 4, [1, -1, 1, 1]),
    new Matrix(1, 4, [-1, -1, 1, 1]),
    new Matrix(1, 4, [-1, 1, 1, 1]),
  ];
}
