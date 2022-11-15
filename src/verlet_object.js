class VerletObject {
  
  constructor(position, radius) {
    this.position = position;
    this.position_last = position;
    this.acceleration = new p5.Vector(0, 0);
    this.radius = radius ? radius : 10;
    this.color = { r: 255, g: 255, b: 255 };
  }

  update(dt) {
    const displacement = p5.Vector.sub(this.position, this.position_last);
    this.position_last = new p5.Vector(this.position.x, this.position.y);
    const acceleration = this.acceleration;
    acceleration.mult(dt * dt);
    this.position.add(p5.Vector.add(displacement, acceleration)); // Type problem on mult
    this.acceleration = new p5.Vector(0, 0);
  }

  accelerate(a) {
    this.acceleration.add(a);
  }

  setVelocity(v, dt) {
    this.position_last = p5.Vector.sub(
      this.position,
      p5.Vector.mult(v, dt)
    );
  }

  // addVelocity(v:p5.Vector, dt:number){
  //   this.position_last.sub(p5.Vector.mult(v, dt) as unknown as p5.Vector);
  // }

  // getVelocity(dt:number){
  //   return p5.Vector.sub(this.position, this.position_last).div(dt);
  // }
}
