/* global p5 */;
const WIDTH = 500;
const HEIGHT = 500;

function sketch(p) {
  let transactions;
  let flock;

  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT, p.WEBGL);
    flock = new Flock();
    for (let i = 0; i < 10; i++) {
      const b = new Boid(p);
      flock.addBoid(b);
    }
  }

  p.myCustomRedrawAccordingToNewPropsHandler = props => {
    transactions = props.transactions;
  }

  p.draw = () => {
    p.background(51);
    flock.run();
  }
}

export default sketch;

class Flock {
  constructor() {
    this.boids = [];
  }

  addBoid = boid => {
    this.boids.push(boid);
  }

  run = () => {
    this.boids.forEach(boid => boid.run(this.boids));
  }
}

class Boid {
  constructor(p, transaction) {
    this.p = p;
    this.acceleration = p.createVector(0, 0, 0);
    this.velocity = p.createVector(p.random(-1, 1), p.random(-1, 1), p.random(-1, 1));
    this.position = p.createVector(0, 0, 0);
    this.r = 10;
    this.h = 30;
    this.maxspeed = 3;
    this.maxforce = 0.05;
  }
  run = boids => {
    this.flock(boids);
    this.update();
    this.borders();
    this.render();
  }

  flock = boids => {
    const sep = this.separate(boids);   // Separation
    const ali = this.align(boids);      // Alignment
    const coh = this.cohesion(boids);   // Cohesion

    // weight
    sep.mult(1.5);
    ali.mult(1.0);
    coh.mult(1.0);

    // Add the force vectors to acceleration
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }

  update = () => {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  // Wraparound
  borders = () => {
    // if (this.position.x < -this.r)  this.position.x = this.p.width + this.r;
    // if (this.position.y < -this.r)  this.position.y = this.p.height + this.r;
    // if (this.position.x > this.p.width + this.r) this.position.x = -this.r;
    // if (this.position.y > this.p.height + this.r) this.position.y = -this.r;
    // if (this.position.z > 5)  this.position.z = 0;
    // if (this.position.z < 5)  this.position.z = 0;
  }

  render = function() {
    this.p.push();
    this.p.translate(this.position.x, this.position.y, this.position.z);
    // this.p.rotateX(this.velocity.x)
    // this.p.rotateY(this.velocity.y)
    // this.p.rotateZ(this.velocity.z)
    this.p.cone(this.r, this.h, 3, 2);
    this.p.pop();
  }

  separate = boids => {
    const desiredseparation = 25.0;
    const steer = this.p.createVector(0, 0, 0);
    let count = 0;

    // For every boid in the system, check if it's too close
    boids.forEach(other => {
      const d = p5.Vector.dist(this.position, other.position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredseparation)) {
        // Calculate vector pointing away from neighbor
        const diff = p5.Vector.sub(this.position, other.position);
        diff.normalize();
        diff.div(d);        // Weight by distance
        steer.add(diff);
        count++;            // Keep track of how many
      }
    });

    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  }

  // For every nearby boid in the system, calculate the average velocity
  align = boids => {
    const neighbordist = 50;
    const sum = this.p.createVector(0, 0, 0);
    let count = 0;
    boids.forEach(other => {
      const d = p5.Vector.dist(this.position, other.position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(other.velocity);
        count++;
      }
    });

    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxspeed);
      const steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxforce);
      return steer;
    } else {
      return this.p.createVector(0, 0, 0);
    }
  }

  cohesion = boids => {
    const neighbordist = 50;
    const sum = this.p.createVector(0, 0, 0);   // Start with empty vector to accumulate all locations
    let count = 0;
    boids.forEach(other => {
      const d = p5.Vector.dist(this.position, other.position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(other.position); // Add location
        count++;
      }
    });
    if (count > 0) {
      sum.div(count);
      return this.seek(sum);  // Steer towards the location
    } else {
      return this.p.createVector(0, 0);
    }
  }

  applyForce = force => {
    this.acceleration.add(force);
  }

  seek = target => {
    const desired = target.sub(this.position);  // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    const steer = desired.sub(this.velocity);
    steer.limit(this.maxforce);  // Limit to maximum steering force
    return steer;
  }
}
