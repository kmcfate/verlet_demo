// @ts-ignore Import module
import P5 from 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.5.0/p5.min.js';

export class VerletObject {
  position: P5.Vector;
  position_last: P5.Vector;
  acceleration: P5.Vector;
  radius: number;
  color: {
    r: number;
    g: number;
    b: number;
  };

  constructor(position: P5.Vector, radius: number) {
    this.position = position;
    this.position_last = position;
    this.acceleration = new P5.Vector(0, 0);
    this.radius = radius ? radius : 10;
    this.color = { r: 255, g: 255, b: 255 };
  }

  update(dt: number) {
    const displacement = P5.Vector.sub(this.position, this.position_last);
    this.position_last = new P5.Vector(this.position.x, this.position.y);
    const acceleration = this.acceleration;
    acceleration.mult(dt * dt);
    this.position.add(P5.Vector.add(displacement, acceleration)); // Type problem on mult
    this.acceleration = new P5.Vector(0, 0);
  }

  accelerate(a: P5.Vector) {
    this.acceleration.add(a);
  }

  setVelocity(v: P5.Vector, dt: number) {
    this.position_last = P5.Vector.sub(
      this.position,
      P5.Vector.mult(v, dt) as unknown as P5.Vector
    );
  }

  // addVelocity(v:P5.Vector, dt:number){
  //   this.position_last.sub(P5.Vector.mult(v, dt) as unknown as P5.Vector);
  // }

  // getVelocity(dt:number){
  //   return P5.Vector.sub(this.position, this.position_last).div(dt);
  // }
}
