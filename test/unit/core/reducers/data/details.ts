import { Actions, ActionCreator, Store } from '../../../../../src/core';
import details from '../../../../../src/core/reducers/data/details';
import suite from '../../../_suite';

suite('details', ({ expect }) => {
  let actions: ActionCreator;
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
    id,
    product,
  };

  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateDetails()', () => {
    it('should update state on UPDATE_DETAILS_ID', () => {
      const newState = {
        id: product.id,
        product,
      };

      const reducer = details(state, { type: Actions.UPDATE_DETAILS_ID, id: product.id });

      expect(reducer).to.eql(newState);
    });

    it('should update state on RECEIVE_DETAILS_PRODUCT', () => {
      const newState = {
        id,
        product: product2,
      };

      const reducer = details(state, { type: Actions.RECEIVE_DETAILS_PRODUCT, product: product2 });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = details(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
