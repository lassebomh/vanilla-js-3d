import { Matrix, scale, translate, rotate_x, rotate_y, hsl_to_rgb } from "./mat.js";
import { fail } from "./utils.js";

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

export function unit_box() {
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
export function text_to_points(text) {
  /** @type {Matrix<1,4>[]} */
  const points = [];

  const pixels = text.split("\n").map((x) => x.split("").map((y) => y === "#"));

  const height = pixels.length;
  const width = pixels[0].length;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (pixels[y][x]) {
        points.push(...translate(x, height - y, 0).apply(unit_box()));
      }
    }
  }

  return scale(0.07, 0.07, 0.07).apply(translate(-width / 2, -height / 2, 0).apply(points));
}

/**
 * @param {string} text
 */
export function text_to_points_unit(text) {
  /** @type {Matrix<1,4>[]} */
  const points = [];

  const pixels = text.split("\n").map((x) => x.split("").map((y) => y === "#"));

  const height = pixels.length;
  const width = pixels[0].length;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (pixels[y][x]) {
        points.push(...translate(x, height - y, 0).apply(unit_box()));
      }
    }
  }

  return points;
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

/**
 * @param {Matrix<1, 4>[]} points
 */
export function filter_colliding_quads(points) {
  /** @type {Map<string, number>} */
  const map = new Map();
  const duplicates = new Array(points.length).fill(false);

  for (let i = 0; i < points.length; i += 6) {
    const a = points[i];
    const b = points[i + 1];
    const c = points[i + 2];
    const d = points[i + 5];

    const center = a.add(b).add(c).add(d).div(4);

    const key = `${center.x.toFixed(2)},${center.y.toFixed(2)},${center.z.toFixed(2)}`;

    const existing_index = map.get(key);
    if (existing_index !== undefined) {
      duplicates[i] = true;
      duplicates[existing_index] = true;
    } else {
      map.set(key, i);
    }
  }

  /** @type {Matrix<1,4>[]} */
  const out = [];

  for (let i = 0; i < points.length; i += 6) {
    if (!duplicates[i]) {
      out.push(...points.slice(i, i + 6));
    }
  }

  return out;
}

export class TextMeshHandler {
  /** @type {Mesh[]} */
  meshes = [];
  /** @type {number[]} */
  widths = [];
  /** @type {string[]} */
  chars = [];

  current_width = 0;
  current_angle = 0;
  distance_from_center = 70;

  show_cursor = false;
  /** @type {number | undefined} */
  show_cursor_interval = undefined;

  update_current_angle() {
    this.current_angle = -this.current_width / (this.distance_from_center * 1.15);
  }

  /** @type {Record<string, {width: number, points: Matrix<1, 4>[]} | undefined>} */
  char_data = {};

  constructor() {
    for (const [char, text] of Object.entries(char_points)) {
      this.char_data[char] = {
        width: text.split("\n")[0].length,
        points: filter_colliding_quads(text_to_points_unit(text)),
      };
    }
  }

  debounce_cursor() {
    if (this.show_cursor_interval !== undefined) {
      clearInterval(this.show_cursor_interval);
      this.show_cursor = true;
    }
    this.show_cursor_interval = setInterval(() => {
      this.show_cursor = !this.show_cursor;
    }, 750);
  }

  delete_last_char() {
    if (this.meshes.length) {
      this.current_width -= (this.widths.pop() ?? fail()) + 2;
      this.meshes.pop();
      this.chars.pop();
      this.update_current_angle();
    }
    this.debounce_cursor();
  }

  /**
   * @param {string} char
   */
  add_char(char) {
    const { points, width } = this.char_data[char] ?? fail();
    const color = hsl_to_rgb(this.chars.length * 15, 0.5, 0.5);

    const mesh_points = rotate_y(this.current_angle).apply(
      translate(0, 0, this.distance_from_center).apply(points)
    );

    const mesh = new Mesh(mesh_points, color);
    this.meshes.push(mesh);
    this.widths.push(width);
    this.chars.push(char);
    this.current_width += width + 2;
    this.update_current_angle();
    this.debounce_cursor();
  }
}

/** @type {Record<string, string>} */
const char_points = Object.fromEntries([
  [
    "A",
    `\
  #  
 # # 
#   #
#####
#   #`,
  ],
  [
    "B",
    `\
### 
#  #
### 
#  #
### `,
  ],
  [
    "C",
    `\
 ###
#   
#   
#   
 ###`,
  ],
  [
    "D",
    `\
### 
#  #
#  #
#  #
### `,
  ],
  [
    "E",
    `\
####
#   
### 
#   
####`,
  ],
  [
    "F",
    `\
####
#   
### 
#   
#   `,
  ],
  [
    "G",
    `\
 ###
#   
# ##
#  #
 ###`,
  ],
  [
    "H",
    `\
#  #
#  #
####
#  #
#  #`,
  ],
  [
    "I",
    `\
###
 # 
 # 
 # 
###`,
  ],
  [
    "J",
    `\
  ###
   # 
   # 
#  # 
 ##  `,
  ],
  [
    "K",
    `\
#  #
# # 
##  
# # 
#  #`,
  ],
  [
    "L",
    `\
#  
#  
#  
#  
###`,
  ],
  [
    "M",
    `\
#   #
## ##
# # #
#   #
#   #`,
  ],
  [
    "N",
    `\
#   #
##  #
# # #
#  ##
#   #`,
  ],
  [
    "O",
    `\
 ## 
#  #
#  #
#  #
 ## `,
  ],
  [
    "P",
    `\
### 
#  #
### 
#   
#   `,
  ],
  [
    "Q",
    `\
 ### 
#   #
#   #
#  # 
 ## #`,
  ],
  [
    "R",
    `\
### 
#  #
### 
# # 
#  #`,
  ],
  [
    "S",
    `\
 ###
#    
 ## 
   #
### `,
  ],
  [
    "T",
    `\
#####
  #  
  #  
  #  
  #  `,
  ],
  [
    "U",
    `\
#  #
#  #
#  #
#  #
 ## `,
  ],
  [
    "V",
    `\
#   #
#   #
#   #
 # # 
  #  `,
  ],
  [
    "W",
    `\
#   #
#   #
# # #
## ##
#   #`,
  ],
  [
    "X",
    `\
#   #
 # # 
  #  
 # # 
#   #`,
  ],
  [
    "Y",
    `\
#   #
 # # 
  #  
  #  
  #  `,
  ],
  [
    "Z",
    `\
####
  # 
 #  
#   
####`,
  ],
  [
    ".",
    `\
 
 
 
 
#`,
  ],
  [
    "!",
    `\
#
#
#
 
#`,
  ],
  [
    ",",
    `\
 
 
 
#
#`,
  ],
  [
    "_",
    `\
    
    
    
    
    
####`,
  ],
  [
    "-",
    `\
    
    
####
    
    `,
  ],
  [
    " ",
    `\
   
   
   
   
   `,
  ],

  [
    "0",
    `\
 ### 
#   #
#   #
#   #
 ### `,
  ],
  [
    "1",
    `\
 # 
## 
 # 
 # 
###`,
  ],
  [
    "2",
    `\
 ## 
#  #
  # 
 #  
####`,
  ],
  [
    "3",
    `\
 ## 
#  #
  # 
#  #
 ## `,
  ],
  [
    "4",
    `\
   # 
  ## 
 # # 
##### 
   # `,
  ],
  [
    "5",
    `\
#### 
#    
###  
   # 
###  `,
  ],
  [
    "6",
    `\
 ## 
#   
### 
#  #
 ## `,
  ],
  [
    "7",
    `\
####
   #
  # 
 #  
#   `,
  ],
  [
    "8",
    `\
 ## 
#  #
 ## 
#  #
 ## `,
  ],
  [
    "9",
    `\
 ## 
#  #
 ###
   #
 ## `,
  ],
]);
