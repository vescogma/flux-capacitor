import { Actions, Store } from '../../../../../src/core';
import details from '../../../../../src/core/reducers/data/details';
import suite from '../../../_suite';

suite('details', ({ expect }) => {
  const id = '19283';
  const product = {
    id: '19293',
    price: 20,
    name: 'toy',
  };
  const product2 = {
    id: '13928',
    price: 53,
    name: 'pajamas',
  };
  const state: Store.Details = {
    data: product,
    product,
  };

  describe('updateDetails()', () => {
    it('should update state on UPDATE_DETAILS_ID', () => {
      const newState = {
        data: product2,
        product,
      };

      const reducer = details(state, {
        type: Actions.UPDATE_DETAILS,
        payload: product2
      });

      expect(reducer).to.eql(newState);
    });

    it('should update state on RECEIVE_DETAILS_PRODUCT', () => {
      const newState = {
        data: product,
        product: product2,
      };

      const reducer = details(state, { type: Actions.RECEIVE_DETAILS_PRODUCT, payload: product2 });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = details(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
