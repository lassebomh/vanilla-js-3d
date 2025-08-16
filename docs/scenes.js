import {
  deg_to_rad,
  Matrix,
  perspective,
  translate,
  rotate_x,
  rotate_y,
  rotate_z,
  hsl_to_rgb,
} from "./mat.js";
import { box, Mesh, text_to_mesh } from "./mesh.js";
import { create_canvas, render_to_canvas } from "./render.js";

export function bomhnet() {
  const ctx = create_canvas("0", "0", "100%", "130px", 2);

  const projection = perspective(deg_to_rad(10), ctx.canvas.width / ctx.canvas.height, 1, 2000);

  /** @type {Matrix<1, 4>[]} */
  let points = text_to_mesh(`\
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

  window.addEventListener(
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

    render_to_canvas(
      ctx,
      meshes.slice(0, 3 * Math.floor(t / 4)),
      view_projection,
      light_direction_inv
    );

    requestAnimationFrame(frame);
  }
  frame(performance.now());
}

export function box_test() {
  const ctx = create_canvas("0", "0", "100%", "100%", 1);

  const projection = perspective(deg_to_rad(90), ctx.canvas.width / ctx.canvas.height, 1, 2000);

  const camera = Matrix.identity(4);

  const light_direction = Matrix.forward.mul(rotate_x(Math.PI / 4)).mul(rotate_y(Math.PI / 4));
  const light_direction_inv = light_direction.neg();

  /**
   * @param {number} t
   */
  function frame(t) {
    const ship_angle = t / 1000;

    let ship = new Mesh(box(), [255, 0, 0]).apply(
      translate(-0.5, -0.5, -0.5),
      translate(0, -4, -5),
      rotate_z(ship_angle)
    );

    let meshes = [ship];

    let view = camera.inv();
    let view_projection = view.mul(projection);

    render_to_canvas(ctx, meshes, view_projection, light_direction_inv);

    requestAnimationFrame(frame);
  }
  frame(performance.now());
}
