import P5 from 'p5';

let bounce = 0.999999;
let gravity = new P5.Vector(0, 9.81);

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
    this.position_last = this.position;
    this.position.add(P5.Vector.add(displacement,P5.Vector.mult(this.acceleration,dt * dt) as unknown as P5.Vector)); // Type problem on mult
    this.acceleration = new P5.Vector(0, 0);
  }

  accelerate(a:P5.Vector){
    this.acceleration.add(a);
  }

  setVelocity(v:P5.Vector, dt: number) {
    this.position_last = P5.Vector.sub(this.position,v.mult(dt));
  }

  addVelocity(v:P5.Vector, dt:number){
    this.position_last.sub(P5.Vector.mult(v, dt) as unknown as P5.Vector);
  }

  getVelocity(dt:number){
    return P5.Vector.sub(this.position, this.position_last).div(dt);
  }
}
