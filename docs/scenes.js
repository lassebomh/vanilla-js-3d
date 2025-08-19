import {
  deg_to_rad,
  Matrix,
  perspective,
  translate,
  rotate_x,
  rotate_y,
  hsl_to_rgb,
  scale,
  surface_vector,
} from "./mat.js";
import {
  unit_box,
  Mesh,
  text_to_points,
  TextMeshHandler,
  char_points,
  text_to_points_unit,
} from "./mesh.js";
import { create_canvas, render_to_canvas } from "./render.js";
import { fail, sleep } from "./utils.js";

export function bomhnet() {
  const ctx = create_canvas("0", "0", "100%", "130px", 2);
  const container = ctx.canvas.parentElement ?? fail();

  const input = document.createElement("input");
  input.type = "text";
  input.style.position = "absolute";
  input.style.inset = "0";
  input.style.opacity = "0";
  container.appendChild(input);

  const projection = perspective(deg_to_rad(10), ctx.canvas.width / ctx.canvas.height, 1, 2000);

  /** @type {Matrix<1, 4>[]} */
  let points = text_to_points(`\
###   ###  #   # #   #   #   # #### #####
#  # #   # ## ## #   #   ##  # #      #  
###  #   # # # # #####   # # # ###    #  
#  # #   # #   # #   #   #  ## #      #  
###   ###  #   # #   # # #   # ####   #  `);

  /** @type {Mesh[]} */
  const meshes = [];

  for (let i = 0; i < points.length; i += 3) {
    meshes.push(
      new Mesh(
        [points[i + 0], points[i + 1], points[i + 2]],
        hsl_to_rgb(((i / 10) * (1 + Math.random())) / 4, 0.8, 0.5)
      )
    );
  }

  const light_direction = Matrix.forward.mul(rotate_x(0.9)).mul(rotate_y(0.4));
  const light_direction_inv = light_direction.neg();

  let mouse_x = 0;
  let mouse_y = 0;

  let canvas_x = 0;
  let canvas_y = 0;

  let camera_pitch = 0;
  let camera_yaw = 0;

  setInterval(() => {
    canvas_x = ctx.canvas.clientLeft + ctx.canvas.clientWidth / 2;
    canvas_y = ctx.canvas.clientTop + ctx.canvas.clientHeight / 2;
  }, 500);

  (window.top ?? window).addEventListener(
    "mousemove",
    (e) => {
      mouse_x = e.clientX;
      mouse_y = e.clientY;
    },
    { passive: true }
  );

  /**
   * @param {number} t
   */
  function frame(t) {
    const target_camera_pitch = (mouse_x - canvas_x) / window.innerWidth;
    const target_camera_yaw = (mouse_y - canvas_y) / window.innerHeight;

    camera_pitch += (target_camera_pitch - camera_pitch) / 8;
    camera_yaw += (target_camera_yaw - camera_yaw) / 8;

    let camera = translate(-0.1, 0.1, 0.8 + 1000 / ctx.canvas.width)
      .mul(rotate_y(camera_pitch))
      .mul(rotate_x(camera_yaw));

    let view = camera.inv();
    let view_projection = view.mul(projection);

    render_to_canvas(ctx, meshes, view_projection, light_direction_inv);

    requestAnimationFrame(frame);
  }
  frame(performance.now());
}

export function text_3d() {
  const ctx = create_canvas("0", "0", "100%", "200px", 2);
  const container = ctx.canvas.parentElement ?? fail();

  const input = document.createElement("input");
  input.type = "text";
  input.style.position = "absolute";
  input.style.inset = "0";
  input.style.opacity = "0";
  container.appendChild(input);

  const text_mesh_handler = new TextMeshHandler();
  let char_limit = 30;

  (async () => {
    /** @type {string | undefined} */
    let last_char;

    for (const char of "hello world!| welcome to bomh.net".toUpperCase().split("")) {
      if (char === "<") {
        if (last_char !== "<") {
          await sleep(1200);
        }
        text_mesh_handler.delete_last_char();
        await sleep(100);
      }
      if (char === "|") {
        await sleep(2000);
      } else {
        if (last_char === "<") {
          await sleep(1200);
        }
        text_mesh_handler.add_char(char);
        if (char === " ") {
          await sleep(300);
        } else {
          await sleep(150);
        }
      }

      last_char = char;
    }

    char_limit = 8;

    await sleep(5000);

    char_limit = 18;
  })();

  const projection = perspective(
    deg_to_rad(window.innerWidth < 700 ? 35 : 25),
    ctx.canvas.width / ctx.canvas.height,
    1,
    2000
  );

  input.value = " ".repeat(100);
  input.addEventListener("input", (e) => {
    const event = /** @type {InputEvent} */ (e);
    if (event.inputType === "deleteContentBackward") {
      text_mesh_handler.delete_last_char();
    } else if (event.inputType === "insertText") {
      text_mesh_handler.add_char((event.data ?? fail()).toUpperCase());
    }
  });

  const cursor = scale(0.5, 7, 0.5).apply(unit_box());

  let current_rotation = 0;

  /**
   * @param {number} t
   */
  function frame(t) {
    for (let i = 0; i < text_mesh_handler.meshes.length - char_limit; i++) {
      const mesh = text_mesh_handler.meshes[i];
      if (mesh.points.length >= 3) {
        mesh.points.splice(Math.floor((Math.random() * mesh.points.length) / 3) * 3, 3);
      }

      if (mesh.points.length >= 3) {
        mesh.points.splice(Math.floor((Math.random() * mesh.points.length) / 3) * 3, 3);
      }

      if (mesh.points.length === 0) {
        text_mesh_handler.meshes.splice(i, 1);
        text_mesh_handler.widths.splice(i, 1);
        text_mesh_handler.chars.splice(i, 1);
        i--;
        text_mesh_handler.update_current_angle();
      }
    }

    current_rotation += (text_mesh_handler.current_angle - current_rotation) / 16;

    let camera = scale(window.innerWidth < 500 ? 1.2 : 1, 1, 1).mul(
      translate(0, 0, -(text_mesh_handler.distance_from_center + 30))
        .mul(rotate_x(0.2 + Math.cos(t / 1000) / 256))
        .mul(rotate_y(current_rotation + 0.55 - Math.PI))
        .mul(translate(0, 4, 0))
    );

    let view = camera.inv();
    let view_projection = view.mul(projection);

    const light_direction = Matrix.forward
      .mul(rotate_x(0.9))
      .mul(rotate_y(0.4))
      .mul(rotate_y(text_mesh_handler.current_angle));
    const light_direction_inv = light_direction.neg();

    const meshes = [...text_mesh_handler.meshes];

    if (text_mesh_handler.show_cursor) {
      meshes.push(
        new Mesh(
          translate(0, 0, text_mesh_handler.distance_from_center)
            .mul(rotate_y(text_mesh_handler.current_angle))
            .apply(cursor),
          [127, 127, 127]
        )
      );
    }

    render_to_canvas(ctx, meshes, view_projection, light_direction_inv, false);

    requestAnimationFrame(frame);
  }
  frame(performance.now());
}

export function box_test() {
  const ctx = create_canvas("0", "0", "100%", "100%", 1);

  const projection = perspective(deg_to_rad(45), ctx.canvas.width / ctx.canvas.height, 1, 2000);

  const light_direction = Matrix.forward.mul(rotate_x(Math.PI / 4)).mul(rotate_y(Math.PI / 4));
  const light_direction_inv = light_direction.neg();

  const surface = [
    new Matrix(1, 4, [0, 0, 1, 1]),
    new Matrix(1, 4, [0, 1, 0, 1]),
    new Matrix(1, 4, [1, 0, 0, 1]),
  ];

  /** @type {Mesh[]} */
  let meshes = [new Mesh(unit_box(), [200, 0, 0])];

  /**
   * @param {number} t
   */
  function frame(t) {
    const camera = translate(0, 0, 5).mul(rotate_y(t / 1000));

    let view = camera.inv();
    let view_projection = view.mul(projection);

    render_to_canvas(ctx, meshes, view_projection, light_direction_inv);

    requestAnimationFrame(frame);
  }
  frame(performance.now());
}
/**
 *
 * @param {Matrix<1,4>} a0
 * @param {Matrix<1,4>} a1
 * @param {Matrix<1,4>} b0
 * @param {Matrix<1,4>} b1
 */
function connect_edges(a0, a1, b0, b1) {
  return [a0.copy(), b0.copy(), a1.copy(), a1.copy(), b0.copy(), b1.copy()];
}

/**
 * @param {Matrix<1, 4>[]} points
 * @param {number} length
 */
function extrude_point_surface(points, length) {
  /** @type {Matrix<1, 4>[]} */
  const side = [];

  const [p0, p1, p2] = points.slice(0, 3);
  const surface = surface_vector(p0, p1, p2);
  const offset = surface.div(1 / length);
  const top = points.map((x) => x.copy().add(offset));

  for (let i = 0; i < points.length; i += 1) {
    const index_0 = i % points.length;
    const index_1 = (i + 1) % points.length;
    const a0 = points[index_0];
    const a1 = points[index_1];
    const b1 = top[index_0];
    const b0 = top[index_1];

    side.push(a0, a1, b0);
    side.push(b0, b1, a0);
  }

  // return [...top.map((x) => x.add(offset)), ...side, ...points.toReversed()];
  return [...top, ...side, ...points.toReversed()];
}

export function extrude_test() {
  const ctx = create_canvas("0", "0", "100%", "100%", 1);
  const container = ctx.canvas.parentElement ?? fail();

  const char_projection = perspective(deg_to_rad(30), 1, 30, 100);

  const chars = Object.fromEntries(
    char_points.map(([char, bitmap]) => {
      const char_model_data = text_to_points_unit(bitmap.split("\n"));

      char_model_data.trigs = char_projection.apply(
        translate(-(char_model_data.width / 2), -(char_model_data.height / 2), -8).apply(
          char_model_data.trigs.toReversed()
        )
      );

      return [char, char_model_data];
    })
  );

  let pitch = 0;
  let yaw = 0;

  window.addEventListener("mousemove", (e) => {
    yaw = (e.clientX / window.innerWidth - 0.5) * -Math.PI * 2;
    pitch = (e.clientY / window.innerHeight - 0.5) * -Math.PI * 2;
  });

  const input = document.createElement("input");
  input.type = "text";
  input.style.position = "absolute";
  input.style.inset = "0";
  input.style.opacity = "0";
  container.appendChild(input);

  const camera_projection = perspective(
    deg_to_rad(30),
    ctx.canvas.width / ctx.canvas.height,
    1,
    2000
  );

  /** @type {Mesh[]} */
  let meshes = [];

  let total_width = 0;
  let target_angle = 0;
  let current_angle = 0;

  /** @type {number[]} */
  const widths = [];

  /**
   * @param {string} char
   */
  function add_char(char) {
    const { width, height, trigs } = chars[char];

    const mesh = new Mesh(rotate_y(target_angle).apply(trigs), [255, 0, 0]);
    total_width += width + 1;
    target_angle = -total_width / 20;
    console.log(total_width);

    widths.push(width);
    meshes.push(mesh);
  }

  input.value = " ".repeat(100);
  input.addEventListener("input", (e) => {
    const event = /** @type {InputEvent} */ (e);
    if (event.inputType === "deleteContentBackward") {
      const width = widths.pop();
      if (width === undefined) return;
      total_width -= width + 1;
      target_angle = -total_width / 20;
      meshes.pop();
      console.log(target_angle);
    } else if (event.inputType === "insertText") {
      add_char((event.data ?? fail()).toUpperCase());
    }
  });

  /**
   * @param {number} t
   */
  function frame(t) {
    current_angle += (target_angle - current_angle) / 16;
    const camera = translate(0, 0, -50).mul(rotate_x(pitch).mul(rotate_y(yaw)));

    let view = camera.inv();
    let view_projection = view.mul(camera_projection);

    const light_direction = Matrix.forward.mul(rotate_y(current_angle).mul(rotate_x(0.4)));
    const light_direction_inv = light_direction.neg();

    render_to_canvas(ctx, meshes, view_projection, light_direction_inv, true);

    requestAnimationFrame(frame);
  }
  frame(performance.now());
}
