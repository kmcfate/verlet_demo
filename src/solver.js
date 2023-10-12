// const gpu = new GPU();
class Solver {
  constructor() {
    this.m_sub_steps = 1;
    this.m_gravity = new p5.Vector(0, 1000);
    this.m_constraint_radius = 100;
    this.m_constraint_center = new p5.Vector();
    this.m_objects = [];
    this.m_time = 0;
    this.m_frame_dt = 0;
  }

  addObject(position, radius) {
    const object = new VerletObject(position, radius);
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
      this.applyGravity();
      this.checkCollisions(step_dt);
      this.applyConstraint();
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
    object.setVelocity(v, this.getStepDt());
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
    this.m_objects.map((obj) => obj.accelerate(this.m_gravity));
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

        const v = p5.Vector.sub(object_1.position, object_2.position);
        const dist2 = v.x * v.x + v.y * v.y;
        const min_dist = object_1.radius + object_2.radius;
        // Check overlapping
        if (dist2 < min_dist * min_dist) {
          const dist = Math.sqrt(dist2);
          const n = p5.Vector.div(v, dist);
          const mass_ratio_1 =
            object_1.radius / (object_1.radius + object_2.radius);
          const mass_ratio_2 =
            object_2.radius / (object_1.radius + object_2.radius);
          const delta = 0.5 * response_coef * (dist - min_dist);
          // Update positions
          object_1.position.sub(p5.Vector.mult(n, mass_ratio_2 * delta));
          object_2.position.add(p5.Vector.mult(n, mass_ratio_1 * delta));
        }
      }
    }
  }

  applyConstraint() {
    this.m_objects.map((obj) => {
      const v = p5.Vector.sub(this.m_constraint_center, obj.position);
      const dist = Math.sqrt(v.x * v.x + v.y * v.y);
      const max_dist = this.m_constraint_radius - obj.radius;
      if (dist > max_dist) {
        obj.position = p5.Vector.sub(
          this.m_constraint_center,
          p5.Vector.mult(p5.Vector.div(v, dist), max_dist)
        );
      }
    });
  }

  updateObjects(dt) {
    this.m_objects.map((obj) => obj.update(dt));
  }
}
