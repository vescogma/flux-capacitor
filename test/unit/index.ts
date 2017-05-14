import FluxCapacitor, * as pkg from '../../src';
import suite from './_suite';

suite('package', ({ expect }) => {
  it('should expose FluxCapacitor', () => {
    expect(FluxCapacitor).to.be.ok;
  });

  // it('should expose ActionCreator', () => {
  //   expect(pkg.ActionCreator).to.be.ok;
  // });

  it('should expose Store', () => {
    expect(pkg.Store).to.be.ok;
  });

  // it('should expose Observer', () => {
  //   expect(pkg.Observer).to.be.ok;
  // });
  //
  // it('should expose reducer', () => {
  //   expect(pkg.reducer).to.be.ok;
  // });
});
