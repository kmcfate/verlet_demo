class Renderer {
  constructor(target) {
    this.p5 = target;
  }
  render(solver) {
    const constraint = solver.getConstraint();

    this.p5.fill(0);
    this.p5.circle(constraint.x, constraint.y, constraint.z * 2);

    solver.getObjects().map((obj) => {
      this.p5.fill(obj[7], obj[8], obj[9]);
      this.p5.circle(obj[0], obj[1], obj[6] * 2);
    });
    this.p5.fill(255);
    this.p5.text('Objects:' + solver.getObjects().length, 5, 15);
    this.p5.text('FPS:' + Math.floor(1000 / this.p5.deltaTime), 5, 25);
    this.p5.text('Simulations/s:' + Math.floor(1 / solver.getStepDt()), 5, 35);
  }
}
