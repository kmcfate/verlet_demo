import P5 from 'p5';
import { Solver } from './solver';

export class Renderer {
  p5: P5;
  constructor(target: P5) {
    this.p5 = target;
  }
  
  render(solver: Solver) {
    const constraint = solver.getConstraint();

    this.p5.fill(0);
    this.p5.circle(constraint.x, constraint.y, constraint.z * 2);

    solver.getObjects().map((obj) => {
      this.p5.fill(obj.color.r, obj.color.g, obj.color.b);
      this.p5.circle(obj.position.x, obj.position.y, obj.radius * 2);
    });
    this.p5.fill(255);
    this.p5.text("Objects:" + solver.getObjects().length, 5, 15 );
    this.p5.text("FPS:"+Math.floor(1000/this.p5.deltaTime), 5, 25);
    this.p5.text("Simulations/s:"+Math.floor(1/solver.getStepDt()), 5, 35);

  }
}
