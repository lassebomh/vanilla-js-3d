import { mat } from "./mat.js";

/**
 * @returns {mat<1, 4>[]}
 */
export function quad() {
  return [
    new mat(1, 4, [0, 1, 0, 1]),
    new mat(1, 4, [1, 1, 0, 1]),
    new mat(1, 4, [0, 0, 0, 1]),
    new mat(1, 4, [0, 0, 0, 1]),
    new mat(1, 4, [1, 1, 0, 1]),
    new mat(1, 4, [1, 0, 0, 1]),
  ];
}

export function box() {
  const translation = mat.translation_3d(-0.5, -0.5, 0.5);
  const q = translation.apply(quad());
  return translation
    .inv()
    .apply([
      ...mat.x_rotation_3d(0).apply(q),
      ...mat.y_rotation_3d(Math.PI / 2).apply(q),
      ...mat.y_rotation_3d(Math.PI).apply(q),
      ...mat.y_rotation_3d((Math.PI / 2) * 3).apply(q),
      ...mat.x_rotation_3d(Math.PI / 2).apply(q),
      ...mat.x_rotation_3d(-Math.PI / 2).apply(q),
    ]);
}

export function model_lhb() {
  /** @type {mat<1,4>[]} */
  const points = [];

  const pixels = `\
###   ###  #   # #   #   #   # #### ##### 
#  # #   # ## ## #   #   ##  # #      #   
###  #   # # # # #####   # # # ###    #   
#  # #   # #   # #   #   #  ## #      #   
###   ###  #   # #   # # #   # ####   #   \
`.split("\n");

  const height = pixels.length;
  const width = pixels[0].length;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const value = pixels[y][x] === "#";
      if (value) {
        points.push(...mat.translation_3d(x, height - y, 0).apply(box()));
      }
    }
  }

  return mat.scale_3d(0.07, 0.07, 0.07).apply(mat.translation_3d(-19, 0, 0).apply(points));
}

export function model_f() {
  /** @type {mat<1,4>[]} */
  const points = [];

  const raw_points = [
    // left column front
    0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0,

    // top rung front
    30, 0, 0, 30, 30, 0, 100, 0, 0, 30, 30, 0, 100, 30, 0, 100, 0, 0,

    // middle rung front
    30, 60, 0, 30, 90, 0, 67, 60, 0, 30, 90, 0, 67, 90, 0, 67, 60, 0,

    // left column back
    0, 0, 30, 30, 0, 30, 0, 150, 30, 0, 150, 30, 30, 0, 30, 30, 150, 30,

    // top rung back
    30, 0, 30, 100, 0, 30, 30, 30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30,

    // middle rung back
    30, 60, 30, 67, 60, 30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67, 90, 30,

    // top
    0, 0, 0, 100, 0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30,

    // top rung right
    100, 0, 0, 100, 30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100, 0, 30,

    // under top rung
    30, 30, 0, 30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100, 30, 0,

    // between top rung and middle
    30, 30, 0, 30, 60, 30, 30, 30, 30, 30, 30, 0, 30, 60, 0, 30, 60, 30,

    // top of middle rung
    30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60, 0, 67, 60, 0, 67, 60, 30,

    // right of middle rung
    67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0, 67, 90, 0, 67, 90, 30,

    // bottom of middle rung.
    30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30, 67, 90, 0,

    // right of bottom
    30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150, 0, 30, 150, 30,

    // bottom
    0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30, 150, 30, 30, 150, 0,

    // left side
    0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150, 30, 0, 150, 0,
  ];

  for (let i = 0; i < raw_points.length; i += 3) {
    let [x, y, z] = raw_points.slice(i, i + 3);
    x /= 40;
    y /= -40;
    z /= 40;
    y += 2;
    x -= 1;
    points.push(new mat(1, 4, [x, y, z, 1]));
  }

  // {
  //   const points_len = points.length;

  //   for (let i = 0; i < points_len; i++) {
  //     const point = points[i];
  //     const copy = point.copy();

  //     copy[0] += 3;
  //     points.push(copy);
  //   }
  // }
  return points;
}

export function model_box() {
  return [
    // bottom
    new mat(1, 4, [-1, -1, -1, 1]),
    new mat(1, 4, [-1, -1, 1, 1]),
    new mat(1, 4, [1, -1, -1, 1]),
    new mat(1, 4, [-1, -1, 1, 1]),
    new mat(1, 4, [1, -1, 1, 1]),
    new mat(1, 4, [1, -1, -1, 1]),

    // // top
    new mat(1, 4, [-1, 1, -1, 1]),
    new mat(1, 4, [1, 1, -1, 1]),
    new mat(1, 4, [-1, 1, 1, 1]),
    new mat(1, 4, [1, 1, -1, 1]),
    new mat(1, 4, [1, 1, 1, 1]),
    new mat(1, 4, [-1, 1, 1, 1]),

    // // back
    new mat(1, 4, [-1, -1, -1, 1]),
    new mat(1, 4, [1, -1, -1, 1]),
    new mat(1, 4, [-1, 1, -1, 1]),
    new mat(1, 4, [1, -1, -1, 1]),
    new mat(1, 4, [1, 1, -1, 1]),
    new mat(1, 4, [-1, 1, -1, 1]),

    // // left
    new mat(1, 4, [-1, 1, 1, 1]),
    new mat(1, 4, [-1, -1, 1, 1]),
    new mat(1, 4, [-1, 1, -1, 1]),
    new mat(1, 4, [-1, -1, 1, 1]),
    new mat(1, 4, [-1, -1, -1, 1]),
    new mat(1, 4, [-1, 1, -1, 1]),

    // // right
    new mat(1, 4, [1, 1, -1, 1]),
    new mat(1, 4, [1, -1, 1, 1]),
    new mat(1, 4, [1, 1, 1, 1]),
    new mat(1, 4, [1, 1, -1, 1]),
    new mat(1, 4, [1, -1, -1, 1]),
    new mat(1, 4, [1, -1, 1, 1]),

    // // front
    new mat(1, 4, [1, -1, 1, 1]),
    new mat(1, 4, [-1, 1, 1, 1]),
    new mat(1, 4, [1, 1, 1, 1]),
    new mat(1, 4, [1, -1, 1, 1]),
    new mat(1, 4, [-1, -1, 1, 1]),
    new mat(1, 4, [-1, 1, 1, 1]),
  ];
}
