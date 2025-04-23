import { deg_to_rad, Matrix, perspective, translate, rotate_x, rotate_y, rotate_z } from "./mat.js";
import { box, Mesh, text_to_mesh } from "./mesh.js";
import { create_canvas, render_to_canvas } from "./render.js";
import { never } from "./utils.js";

// export function bomhnet() {
//   const ctxs = [create_canvas("0", "0", "100%", "100%", 1)];

//   const projections = [
//     mat.perspective_3d(deg_to_rad(20), ctxs[0].canvas.width / ctxs[0].canvas.height, 1, 2000),
//   ];

//   /** @type {mat<1, 4>[]} */
//   let points = [];

//   points.push(
//     ...text_to_mesh(`\
// ###   ###  #   # #   #   #   # #### #####
// #  # #   # ## ## #   #   ##  # #      #
// ###  #   # # # # #####   # # # ###    #
// #  # #   # #   # #   #   #  ## #      #
// ###   ###  #   # #   # # #   # ####   #   \
// `)
//   );

//   /**
//    * @param {number} a
//    * @param {number} b
//    */
//   function swap(a, b) {
//     [
//       points[a * 3],
//       points[a * 3 + 1],
//       points[a * 3 + 2],
//       points[b * 3],
//       points[b * 3 + 1],
//       points[b * 3 + 2],
//     ] = [
//       points[b * 3],
//       points[b * 3 + 1],
//       points[b * 3 + 2],
//       points[a * 3],
//       points[a * 3 + 1],
//       points[a * 3 + 2],
//     ];
//   }

//   for (let i = 0; i < points.length / 3 - 40; i++) {
//     const other = Math.floor(Math.random() * 40);
//     swap(i, i + other);
//   }

//   const light_direction = mat.forward.mul(mat.x_rotation_3d(0.9)).mul(mat.y_rotation_3d(0.4));
//   const light_direction_inv = light_direction.neg();

//   /**
//    * @param {number} t
//    */
//   function frame(t) {
//     for (let i = 0; i < ctxs.length; i++) {
//       const ctx = ctxs[i];
//       const projection = projections[i];

//       let camera = mat.translation_3d(0, 0.2, 7);

//       camera = camera
//         .mul(mat.y_rotation_3d(Math.sin(t / 1000) / 10 + 0.5))
//         .mul(mat.x_rotation_3d(Math.cos(t / 1000) / 10 - 0.3));

//       let view = camera.inv();
//       let view_projection = view.mul(projection);

//       const points_slice = points.slice(0, 3 * Math.floor(t / 2));

//       render_to_canvas(ctx, points_slice, view_projection, light_direction_inv);
//     }

//     requestAnimationFrame(frame);
//   }
//   frame(performance.now());
// }

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
