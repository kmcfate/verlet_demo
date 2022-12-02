class VerletObject {
  
  constructor(position, radius) {
    this.position = position;
    this.position_last = position.copy();
    this.acceleration = new p5.Vector(0, 0);
    this.radius = radius ? radius : 10;
    this.color = { r: 255, g: 255, b: 255 };
  }

  update(dt) {
    const displacement = p5.Vector.sub(this.position, this.position_last);
    this.position_last = this.position.copy();
    this.position.add(p5.Vector.add(displacement, this.acceleration.mult(dt*dt))); // Type problem on mult
    this.acceleration.x=0;
    this.acceleration.y=0;
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
