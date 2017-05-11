import { expect } from 'chai';
import * as pkg from '../src';

describe('package', () => {
  it('should expose FluxCapacitor', () => {
    expect(pkg.FluxCapacitor).to.be.ok;
  });
});
