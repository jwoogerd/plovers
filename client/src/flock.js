export default class Flock {
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
