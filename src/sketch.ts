import P5 from 'p5';
import { Renderer } from './renderer';
import { Solver } from './solver';
import { VerletObject } from './verlet_object';

function getRainbow(t: number) {
  const r = Math.sin(t);
  const g = Math.sin(t + 0.33 * 2.0 * Math.PI);
  const b = Math.sin(t + 0.66 * 2.0 * Math.PI);
  return { r: 255.0 * r * r, g: 255.0 * g * g, b: 255.0 * b * b };
}

const sketch = (p5: P5) => {
  const solver = new Solver();
  const renderer = new Renderer(p5);

  // Solver configuration
  solver.setConstraint(new P5.Vector(p5.width * 0.5, p5.height * 0.5), 450.0);
  solver.setSubStepsCount(8);
  solver.setSimulationUpdateRate(60);

  // Set simulation attributes
  const object_spawn_delay = 25;
  const object_spawn_speed = 1200.0;
  const object_spawn_position = new P5.Vector(200.0, 200.0);
  const object_min_radius = 1.0;
  const object_max_radius = 20.0;
  const max_objects_count = 1000;
  const max_angle = 1.0;
  let last_object_time = 0;
  p5.setup = () => {
    p5.createCanvas(1000, 1000);
  };
  p5.draw = () => {
        // p5.translate(p5.width/2, p5.height/2);
    const this_time = p5.millis();

    if (
      solver.getObjectsCount() < max_objects_count &&
      this_time - last_object_time >= object_spawn_delay
    ) {
      last_object_time = this_time;
      const object = solver.addObject(
        object_spawn_position,
        p5.random(object_min_radius, object_max_radius)
      );
      const t = solver.getTime();
      const angle = max_angle * Math.sin(t) + Math.PI * 0.5;
      solver.setObjectVelocity(
        object,
        P5.Vector.mult(
          new P5.Vector(Math.cos(angle), Math.sin(angle)),
          object_spawn_speed
        ) as unknown as P5.Vector
      );
      object.color = getRainbow(t);
    }

    solver.update();
    p5.background(128);
    renderer.render(solver);
  };
  p5.mouseClicked = () => {};
};

new P5(sketch);
