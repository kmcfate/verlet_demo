// @ts-ignore Import module
import P5 from 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.5.0/p5.min.js';
import { VerletObject } from './verlet_object';
export class Solver {
  m_sub_steps: number;
  m_gravity: P5.Vector;
  m_constraint_center: P5.Vector;
  m_constraint_radius: number;
  m_objects: VerletObject[];
  m_time: number;
  m_frame_dt: number;

  constructor() {
    this.m_sub_steps = 1;
    this.m_gravity = new P5.Vector(0, 1000);
    this.m_constraint_radius = 100;
    this.m_constraint_center = new P5.Vector();
    this.m_objects = [];
    this.m_time = 0;
    this.m_frame_dt = 0;
  }

  addObject(position: P5.Vector, radius: number) {
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

  setSimulationUpdateRate(rate: number) {
    this.m_frame_dt = 1.0 / rate;
  }

  setConstraint(position: P5.Vector, radius: number) {
    this.m_constraint_center = position;
    this.m_constraint_radius = radius;
  }

  setSubStepsCount(sub_steps: number) {
    this.m_sub_steps = sub_steps;
  }

  setObjectVelocity(object: VerletObject, v: P5.Vector) {
    object.setVelocity(v, this.getStepDt());
  }

  getObjects() {
    return this.m_objects;
  }

  getConstraint() {
    return new P5.Vector(
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

  checkCollisions(dt: number) {
    const response_coef = 0.75;
    const objects_count = this.m_objects.length;
    // Iterate on all objects
    for (let i = 0; i < objects_count; ++i) {
      const object_1 = this.m_objects[i];
      // Iterate on object involved in new collision pairs
      for (let k = i + 1; k < objects_count; ++k) {
        const object_2 = this.m_objects[k];
        const v = P5.Vector.sub(object_1.position, object_2.position);
        const dist2 = v.x * v.x + v.y * v.y;
        const min_dist = object_1.radius + object_2.radius;
        // Check overlapping
        if (dist2 < min_dist * min_dist) {
          const dist = Math.sqrt(dist2);
          const n = P5.Vector.div(v, dist) as unknown as P5.Vector;
          const mass_ratio_1 =
            object_1.radius / (object_1.radius + object_2.radius);
          const mass_ratio_2 =
            object_2.radius / (object_1.radius + object_2.radius);
          const delta = 0.5 * response_coef * (dist - min_dist);
          // Update positions
          object_1.position.sub(
            P5.Vector.mult(n, mass_ratio_2 * delta) as unknown as P5.Vector
          );
          object_2.position.add(
            P5.Vector.mult(n, mass_ratio_1 * delta) as unknown as P5.Vector
          );
        }
      }
    }
  }

  applyConstraint() {
    this.m_objects.map((obj) => {
      const v = P5.Vector.sub(this.m_constraint_center, obj.position);
      const dist = Math.sqrt(v.x * v.x + v.y * v.y);
      if (dist > this.m_constraint_radius - obj.radius) {
        const n = P5.Vector.div(v, dist) as unknown as P5.Vector;
        obj.position = P5.Vector.sub(
          this.m_constraint_center,
          P5.Vector.mult(
            n,
            this.m_constraint_radius - obj.radius
          ) as unknown as P5.Vector
        );
      }
    });
  }

  updateObjects(dt: number) {
    this.m_objects.map((obj) => obj.update(dt));
  }
}
