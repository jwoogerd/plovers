import _ from 'lodash';

import { PALETTE } from './constants'

let index = 0;
const COLORS = {};
export const getColor = category => {
  let color = _.get(COLORS, category);
  if (!color) {
    color = PALETTE[index];
    COLORS[category] = color;
    index += 1;
    index %= PALETTE.length;
  }
  return color;
};
