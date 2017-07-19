import * as sagas from '../../../../src/core/sagas';
import autocomplete from '../../../../src/core/sagas/autocomplete';
import collection from '../../../../src/core/sagas/collection';
import productDetails from '../../../../src/core/sagas/product-details';
import products from '../../../../src/core/sagas/products';
import refinements from '../../../../src/core/sagas/refinements';
import suite from '../../_suite';

suite('sagas', ({ expect, spy, stub }) => {

  describe('SAGA_CREATORS', () => {
    it('should include all saga creators', () => {
      expect(sagas.SAGA_CREATORS).to.eql([
        autocomplete,
        collection,
        productDetails,
        products,
        refinements
      ]);
    });
  });

  describe('createSagas()', () => {
    it('should create sagas', () => {
      const flux: any = { a: 'b' };
      const creator1 = spy();
      const creator2 = spy();

      sagas.default([creator1, creator2], flux);

      expect(creator1).to.be.calledWith(flux);
      expect(creator2).to.be.calledWith(flux);
    });
  });
});
