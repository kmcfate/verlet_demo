const gpu_depth=500;

class Solver {
  constructor() {
    this.m_sub_steps = 1;
    this.m_gravity = new p5.Vector(0, 1000);
    this.m_constraint_radius = 100;
    this.m_constraint_center = new p5.Vector();
    this.m_objects = [];
    this.m_time = 0;
    this.m_frame_dt = 0;
    this.m_gpu = new GPU();
    this.m_update_kernel = this.m_gpu
      .createKernel(
        function (objects, count, dt, center_x, center_y, radius) {
          let new_position = 0;
          // Verlet Integration X is %2=0 Y is %2=1
          const position_index = this.thread.x % 2;
          const position_last_index = (this.thread.x % 2) + 2;
          const displacement =
            objects[this.thread.y][position_index] -
            objects[this.thread.y][position_last_index];
          new_position =
            objects[this.thread.y][position_index] +
            displacement +
            1000 * position_index * dt * dt; // Hard coded acceleration for gravity

          const v_x = center_x - objects[this.thread.y][0];
          const v_y = center_y - objects[this.thread.y][1];
          const dist = Math.sqrt(v_x * v_x + v_y * v_y);
          if (dist > radius - objects[this.thread.y][6]) {
            const n_x = v_x / dist;
            const n_y = v_y / dist;
            if (this.thread.x % 2 != 0) {
              new_position +=
                n_y * (dist - (radius - objects[this.thread.y][6]));
            } else {
              new_position +=
                n_x * (dist - (radius - objects[this.thread.y][6]));
            }
          }

          return new_position;
        },
        { dynamicArguments: true }
      )
      .setOutput([2, gpu_depth])
  }

  addObject(position, radius) {
    const object = Array(
      position.x,
      position.y,
      position.x,
      position.y,
      0,
      0,
      radius,
      255,
      255,
      255
    );
    this.m_objects.push(object);
    return object;
  }

  resetObjects() {
    this.m_objects = [];
  }

  update() {
    this.m_time += this.m_frame_dt;
    const step_dt = this.getStepDt();
    for (let i = 0; i < this.m_sub_steps; i++) {
      // this.applyGravity();
      this.checkCollisions(step_dt);
      // this.applyConstraint();
      this.updateObjects(step_dt);
    }
  }

  setSimulationUpdateRate(rate) {
    this.m_frame_dt = 1.0 / rate;
  }

  setConstraint(position, radius) {
    this.m_constraint_center = position;
    this.m_constraint_radius = radius;
  }

  setSubStepsCount(sub_steps) {
    this.m_sub_steps = sub_steps;
  }

  setObjectVelocity(object, v) {
    const dt = this.getStepDt();
    object[2] = object[0] - v.x * dt;
    object[3] = object[1] - v.y * dt;
    // this.position_last = p5.Vector.sub(
    //   this.position,
    //   p5.Vector.mult(v, dt)
    // );
  }

  getObjects() {
    return this.m_objects;
  }

  getConstraint() {
    return new p5.Vector(
      this.m_constraint_center.x,
      this.m_constraint_center.y,
      this.m_constraint_radius
    );
  }

  getObjectsCount() {
    return this.m_objects.length;
  }

  getTime() {
    return this.m_time;
  }

  getStepDt() {
    return this.m_frame_dt / this.m_sub_steps;
  }

  applyGravity() {
    for (let i = 0; i < this.m_objects.length; i++) {
      this.m_objects[i][4] += this.m_gravity.x;
      this.m_objects[i][5] += this.m_gravity.y;
    }
  }

  checkCollisions(dt) {
    const response_coef = 0.75;
    const objects_count = this.m_objects.length;
    // Iterate on all objects
    for (let i = 0; i < objects_count; ++i) {
      const object_1 = this.m_objects[i];
      // Iterate on object involved in new collision pairs
      for (let k = i + 1; k < objects_count; ++k) {
        const object_2 = this.m_objects[k];
        const v_x = object_1[0] - object_2[0];
        const v_y = object_1[1] - object_2[1];
        const dist2 = v_x * v_x + v_y * v_y;
        const min_dist = object_1[6] + object_2[6];
        // Check overlapping
        if (dist2 < min_dist * min_dist) {
          const dist = Math.sqrt(dist2);
          const n_x = v_x / dist;
          const n_y = v_y / dist;
          const mass_ratio_1 = object_1[6] / min_dist;
          const mass_ratio_2 = object_2[6] / min_dist;
          const delta = 0.5 * response_coef * (dist - min_dist);
          // Update positions
          object_1[0] -= n_x * mass_ratio_2 * delta;
          object_1[1] -= n_y * mass_ratio_2 * delta;
          object_2[0] += n_x * mass_ratio_1 * delta;
          object_2[1] += n_y * mass_ratio_1 * delta;
        }
      }
    }
  }

  applyConstraint() {
    for (let i = 0; i < this.m_objects.length; i++) {
      const v_x = this.m_constraint_center.x - this.m_objects[i][0];
      const v_y = this.m_constraint_center.x - this.m_objects[i][1];
      const dist = Math.sqrt(v_x * v_x + v_y * v_y);
      if (dist > this.m_constraint_radius - this.m_objects[i][6]) {
        const n_x = v_x / dist;
        const n_y = v_y / dist;
        this.m_objects[i][0] =
          this.m_constraint_center.x -
          n_x * (this.m_constraint_radius - this.m_objects[i][6]);
        this.m_objects[i][1] =
          this.m_constraint_center.y -
          n_y * (this.m_constraint_radius - this.m_objects[i][6]);
      }
    }

  }

  updateObjects(dt) {
    var results;
    var count;
    for (let i = 0; i < this.m_objects.length; i += gpu_depth) {
      count = Math.min(gpu_depth, this.m_objects.length - i);
      const slice = this.m_objects.slice(i, i + count);
      results = this.m_update_kernel(
        slice,
        count,
        dt,
        this.m_constraint_center.x,
        this.m_constraint_center.y,
        this.m_constraint_radius
      );
      for (let o = 0; o < count; o++) {
        this.m_objects[o + i][2] = this.m_objects[o + i][0];
        this.m_objects[o + i][3] = this.m_objects[o + i][1];
        this.m_objects[o + i][0] = results[o][0];
        this.m_objects[o + i][1] = results[o][1];
        this.m_objects[o + i][4] = 0;
        this.m_objects[o + i][5] = 0;
      }
    }
    // this.m_objects.map((obj) => obj.update(dt));
  }
}
