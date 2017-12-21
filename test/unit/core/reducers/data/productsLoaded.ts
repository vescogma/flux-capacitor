import { Actions } from '../../../../../src/core';
import productsLoaded from '../../../../../src/core/reducers/data/productsLoaded';
import suite from '../../../_suite';

suite('products', ({ expect }) => {
  const state: boolean = false;

  describe('updateProducts()', () => {
    it('should update state on RECEIVE_PRODUCTS', () => {
      const reducer = productsLoaded(state, { type: Actions.RECEIVE_PRODUCT_RECORDS });

      expect(reducer).to.be.true;
    });

    it('should return state on default', () => {
      const reducer = productsLoaded(state, <any>{});

      expect(reducer).to.eq(state);
    });
  });
});
