import { assert, never } from "./utils.js";

/**
 * @template {number} H
 * @template {number} W
 */
export class Matrix extends Float32Array {
  constructor(
    /** @type {H} */ height,
    /** @type {W} */ width,
    /** @type {ArrayLike<number> | undefined} */ array
  ) {
    super(array ?? new Float32Array(width * height).fill(0));
    if (array && width * height !== array.length) never();
    this.height = height;
    this.width = width;
  }

  static down = new Matrix(1, 4, [0, 1, 0, 0]);
  static up = new Matrix(1, 4, [0, -1, 0, 0]);
  static forward = new Matrix(1, 4, [0, 0, 1, 0]);

  get x() {
    return this[0];
  }

  get y() {
    return this[1];
  }

  get z() {
    return this[2];
  }

  get w() {
    return this[3];
  }

  copy() {
    return new Matrix(this.height, this.width, this);
  }

  /**
   * @template {number} T
   * @param {T} size
   * @returns {Matrix<T, T>}
   */
  static identity(size) {
    const out = new Matrix(size, size);
    for (let i = 0; i < size; i++) {
      out[i + i * size] = 1;
    }
    return out;
  }

  /**
   * @template {number} T
   * @param {Matrix<W, T>} other
   * @returns {Matrix<H, T>}
   */
  mul(other) {
    const out = new Matrix(this.height, other.width);

    for (let y = 0; y < out.height; y++) {
      for (let x = 0; x < out.width; x++) {
        let sum = 0;

        for (let i = 0; i < this.width; i++) {
          sum += other[i * other.width + x] * this[i + this.width * y];
        }
        out[y * out.width + x] = sum;
      }
    }

    return out;
  }

  inv() {
    var m00 = this[0 * 4 + 0];
    var m01 = this[0 * 4 + 1];
    var m02 = this[0 * 4 + 2];
    var m03 = this[0 * 4 + 3];
    var m10 = this[1 * 4 + 0];
    var m11 = this[1 * 4 + 1];
    var m12 = this[1 * 4 + 2];
    var m13 = this[1 * 4 + 3];
    var m20 = this[2 * 4 + 0];
    var m21 = this[2 * 4 + 1];
    var m22 = this[2 * 4 + 2];
    var m23 = this[2 * 4 + 3];
    var m30 = this[3 * 4 + 0];
    var m31 = this[3 * 4 + 1];
    var m32 = this[3 * 4 + 2];
    var m33 = this[3 * 4 + 3];
    var tmp_0 = m22 * m33;
    var tmp_1 = m32 * m23;
    var tmp_2 = m12 * m33;
    var tmp_3 = m32 * m13;
    var tmp_4 = m12 * m23;
    var tmp_5 = m22 * m13;
    var tmp_6 = m02 * m33;
    var tmp_7 = m32 * m03;
    var tmp_8 = m02 * m23;
    var tmp_9 = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31 - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31 - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31 - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21 - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    const array = [
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * (tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30 - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * (tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30 - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * (tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30 - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * (tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20 - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d *
        (tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33 - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d *
        (tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33 - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d *
        (tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33 - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d *
        (tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23 - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d *
        (tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12 - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d *
        (tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22 - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d *
        (tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02 - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d *
        (tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12 - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
    ];

    return new Matrix(this.height, this.width, array);
  }

  /**
   * @param {Matrix<H, W>} other
   * @returns {Matrix<H, W>}
   */
  add(other) {
    return new Matrix(
      this.height,
      this.width,
      new Float32Array(this).map((v, i) => v + other[i])
    );
  }

  /**
   * @returns {Matrix<H, W>}
   */
  neg() {
    return new Matrix(
      this.height,
      this.width,
      new Float32Array(this).map((v) => -v)
    );
  }

  normalize() {
    const dist = Math.hypot(this[0], this[1], this[2]);

    return this.div(dist);
  }

  /**
   * @param {number} value
   * @returns {Matrix<H, W>}
   */
  div(value) {
    return new Matrix(
      this.height,
      this.width,
      new Float32Array(this).map((v) => v / value)
    );
  }

  /**
   * @param {Matrix<H, W>} other
   * @returns {Matrix<H, W>}
   */
  sub(other) {
    return new Matrix(
      this.height,
      this.width,
      Array.from(this).map((v, i) => v - other[i])
    );
  }

  /**
   * @param {Matrix<1, 4>} other
   */
  cross(other) {
    return new Matrix(1, 4, [
      this[1] * other[2] - this[2] * other[1],
      this[2] * other[0] - this[0] * other[2],
      this[0] * other[1] - this[1] * other[0],
      0,
    ]);
  }

  /**
   * @param {Matrix<1, W>} other
   * @returns {number}
   */
  dot(other) {
    if (this.length !== other.length) {
      throw new Error("Vectors must be the same length");
    }

    let result = 0;
    for (let i = 0; i < this.length; i++) {
      result += this[i] * other[i];
    }
    return result;
  }

  /**
   * @returns {Matrix<H, W>}
   */
  transpose() {
    const out = new Matrix(this.width, this.height);

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        out[y + x * this.height] = this[x + this.width * y];
      }
    }

    return /** @type {*} */ (out);
  }

  /**
   * @template {number} T
   * @param {Matrix<T, H>[]} matricies
   * @returns {Matrix<T, W>[]}
   */
  apply(matricies) {
    return matricies.map((x) => x.mul(this));
  }

  to_arrays() {
    /** @type {number[][]} */
    const arrays = [];
    for (let y = 0; y < this.height; y++) {
      /** @type {number[]} */
      const array = [];
      for (let x = 0; x < this.width; x++) {
        array.push(this[x + this.width * y]);
      }
      arrays.push(array);
    }
    return arrays;
  }
}

/**
 * @param {number} r
 */
export function rad_to_deg(r) {
  return (r * 180) / Math.PI;
}

/**
 * @param {number} d
 */
export function deg_to_rad(d) {
  return (d * Math.PI) / 180;
}

{
  const a = new Matrix(2, 1, [1, 2]);
  const b = new Matrix(1, 2, [3, 4]);
  const c = a.mul(b);
  const d = b.mul(a);

  if (c.width !== 2) {
    never(c.width);
  }
  if (c.height !== 2) {
    never(c.height);
  }
  if (d.width !== 1) {
    never(d.width);
  }
  if (d.height !== 1) {
    never(d.height);
  }
  if (d[0] !== 11) {
    never();
  }
  if (c[0] !== 3 || c[1] !== 4 || c[2] !== 6 || c[3] !== 8) {
    never();
  }
}

/**
 * @param {number} ax
 * @param {number} ay
 * @param {number} bx
 * @param {number} by
 * @param {number} px
 * @param {number} py
 */
export function cross_product(ax, ay, bx, by, px, py) {
  return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}

/**
 * @param {number} h
 * @param {number} s
 * @param {number} l
 */
export function hsl_to_rgb(h, s, l) {
  h = h % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const h_prime = h / 60;
  const x = c * (1 - Math.abs((h_prime % 2) - 1));

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (0 <= h_prime && h_prime < 1) {
    [r1, g1, b1] = [c, x, 0];
  } else if (1 <= h_prime && h_prime < 2) {
    [r1, g1, b1] = [x, c, 0];
  } else if (2 <= h_prime && h_prime < 3) {
    [r1, g1, b1] = [0, c, x];
  } else if (3 <= h_prime && h_prime < 4) {
    [r1, g1, b1] = [0, x, c];
  } else if (4 <= h_prime && h_prime < 5) {
    [r1, g1, b1] = [x, 0, c];
  } else if (5 <= h_prime && h_prime < 6) {
    [r1, g1, b1] = [c, 0, x];
  }

  const m = l - c / 2;
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  return [r, g, b];
}

/**
 * @param {Matrix<1, 4>} pos
 * @param {number} screen_width
 * @param {number} screen_height
 */
export function pos_to_screen(pos, screen_width, screen_height) {
  return new Matrix(1, 2, [
    ((pos[0] / pos[3] + 1) * screen_width) / 2,
    ((1 - pos[1] / pos[3]) * screen_height) / 2,
  ]);
}

/**
 * @param {number} fieldOfViewInRadians
 * @param {number} aspect
 * @param {number} near
 * @param {number} far
 */
export function perspective(fieldOfViewInRadians, aspect, near, far) {
  var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
  var rangeInv = 1.0 / (near - far);

  return new Matrix(4, 4, [
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (near + far) * rangeInv,
    -1,
    0,
    0,
    near * far * rangeInv * 2,
    0,
  ]);
}

/**
 * @param {number} radians
 */
export function rotate_x(radians) {
  const out = Matrix.identity(4);
  out[5] = Math.cos(radians);
  out[6] = -Math.sin(radians);
  out[9] = Math.sin(radians);
  out[10] = Math.cos(radians);
  return out;
}

/**
 * @param {number} radians
 */
export function rotate_y(radians) {
  const out = Matrix.identity(4);
  out[0] = Math.cos(radians);
  out[2] = Math.sin(radians);
  out[8] = -Math.sin(radians);
  out[10] = Math.cos(radians);
  return out;
}

/**
 * @param {number} radians
 */
export function rotate_z(radians) {
  const out = Matrix.identity(4);
  out[0] = Math.cos(radians);
  out[1] = -Math.sin(radians);
  out[4] = Math.sin(radians);
  out[5] = Math.cos(radians);
  return out;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
export function translate(x, y, z) {
  return new Matrix(4, 4, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
export function scale(x, y, z) {
  return new Matrix(4, 4, [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]);
}
