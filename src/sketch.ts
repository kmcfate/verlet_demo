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
  const window_width = 1000;
  const window_height = 1000;
  const frame_rate = 60;

  const solver = new Solver();
  const renderer = new Renderer(p5);

  // Set simulation attributes
  const object_spawn_delay = 0.025;
  const object_spawn_speed = 1200.0;
  const object_spawn_position = new P5.Vector(500, 200);
  const object_min_radius = 1.0;
  const object_max_radius = 20.0;
  const substep_count = 3;
  let max_objects_count = 200;
  const max_angle = 1.0;
  let last_object_time = 0;

  p5.setup = () => {
    const resetButton = p5.createButton('Reset');
    const resetObjects = () => {
      solver.resetObjects();
    };
    resetButton.position(950, 10);
    resetButton.mouseClicked(resetObjects);
    const subStepCountSlider = p5.createSlider(1, 10, substep_count, 1);
    const setSubStepsCount = () => {
      solver.setSubStepsCount(subStepCountSlider.value() as unknown as number);
    };
    subStepCountSlider.mouseClicked(setSubStepsCount);
    subStepCountSlider.position(120,30);
    const objectCountSlider = p5.createSlider(1,2000,max_objects_count,1);
    const setObjectCount = () => {
      const currentCount=max_objects_count;
      max_objects_count=objectCountSlider.value() as unknown as number;
      if (max_objects_count < currentCount) solver.resetObjects();
    }
    objectCountSlider.mouseClicked(setObjectCount);
    objectCountSlider.position(120,10);
    p5.createCanvas(window_width, window_height);
    solver.setConstraint(
      new P5.Vector(window_width / 2, window_height / 2),
      450.0
    );
    solver.setSubStepsCount(substep_count);
    solver.setSimulationUpdateRate(60);
    p5.noStroke();
  };

  p5.draw = () => {
    const this_time = p5.millis() * 1000;

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
        new P5.Vector(Math.cos(angle), Math.sin(angle)).mult(object_spawn_speed)
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
