import _ from 'lodash';

import Boid from './boid';
import { HEIGHT, WIDTH, PALETTE } from './constants';
import Flock from './flock';

function sketch(p) {
  let flock;

  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT, p.WEBGL);
    p.perspective(p.PI / 3.0, p.width / p.height, 0.1, 500);
    flock = new Flock();
  }

  p.myCustomRedrawAccordingToNewPropsHandler = props => {
    _.forEach(props.transactions, transaction => {
      const b = new Boid(p, transaction);
      flock.addBoid(b);
    });
  }

  p.draw = () => {
    p.background(246);
    if (flock.boids.length === 0) {
      p.translate(0, 0, 50)
      p.fill(p.color(PALETTE[3]));
      p.rotateY(p.millis() / 1000)
      p.cone(30, 90, 3, 4);
    } else {
      flock.run();
    }
  }
}

export default sketch;
