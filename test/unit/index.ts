import FluxCapacitor, * as pkg from '../../src';
import suite from './_suite';

suite('package', ({ expect }) => {
  it('should expose FluxCapacitor', () => {
    expect(FluxCapacitor).to.be.ok;
  });

  it('should expose ActionCreators', () => {
    expect(pkg.ActionCreators).to.be.ok;
  });

  it('should expose Store', () => {
    expect(pkg.Store).to.be.ok;
  });

  it('should expose Observer', () => {
    expect(pkg.Observer).to.be.ok;
  });

  it('should expose Events', () => {
    expect(pkg.Events).to.be.ok;
  });

  it('should expose Selectors', () => {
    expect(pkg.Selectors).to.be.ok;
  });

  it('should expose reducer', () => {
    expect(pkg.reducer).to.be.ok;
  });
});
