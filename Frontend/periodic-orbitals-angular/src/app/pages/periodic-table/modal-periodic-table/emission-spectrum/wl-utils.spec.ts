import { combineVisibleLines } from './wl-utils';

describe('combineVisibleLines', () => {
  it('returns the intensity-weighted color of visible lines', () => {
    expect(
      combineVisibleLines([
        [450, 1],
        [650, 3],
      ]),
    ).toEqual([191, 3, 64]);
  });

  it('ignores non-visible, invalid, and non-positive lines', () => {
    expect(
      combineVisibleLines([
        [300, 10],
        [500, 0],
        [Number.NaN, 2],
      ]),
    ).toBeNull();
  });
});
