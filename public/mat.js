import { assert, never } from "./utils.js";

/**
 * @template {number} H
 * @template {number} W
 */
export class Matrix extends Float32Array {
  constructor(/** @type {H} */ height, /** @type {W} */ width, /** @type {ArrayLike<number> | undefined} */ array) {
    super(array ?? new Float32Array(width * height).fill(0));
    if (array && width * height !== array.length) never();
    this.height = height;
    this.width = width;
  }

  copy() {
    return new Matrix(this.width, this.height, this);
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
      d * (tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33 - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d * (tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33 - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d * (tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33 - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d * (tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23 - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d * (tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12 - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d * (tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22 - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d * (tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02 - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d * (tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12 - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
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
      this.map((v, i) => v + other[i])
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
   * @returns {W extends H ? number : never}
   */
  det() {
    // @ts-ignore
    if (this.width !== this.height) never();

    if (this.width === 2) {
      return /** @type {*} */ (this[0] * this[3] - this[1] * this[2]);
    } else {
      let out = 0;

      for (let col = 0; col < this.width; col++) {
        const inner = new Matrix(this.width - 1, this.width - 1);
        let i = 0;

        for (let x = 0; x < this.width; x++) {
          if (x === col) continue;
          for (let y = 1; y < this.width; y++) {
            inner[i++] = this[x + this.width * y];
          }
        }

        const det = inner.det();

        if (col % 2 === 0) {
          out += det;
        } else {
          out -= det;
        }
      }
      return /** @type {*} */ (out);
    }
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
   * @param {number} fieldOfViewInRadians
   * @param {number} aspect
   * @param {number} near
   * @param {number} far
   */
  static perspective_3d(fieldOfViewInRadians, aspect, near, far) {
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
  static x_rotation_3d(radians) {
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
  static y_rotation_3d(radians) {
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
  static z_rotation_3d(radians) {
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
  static translation_3d(x, y, z) {
    return new Matrix(4, 4, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
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
