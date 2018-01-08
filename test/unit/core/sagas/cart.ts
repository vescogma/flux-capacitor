import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import Adapter from '../../../../src/core/adapters/cart';
import ConfigAdapter from '../../../../src/core/adapters/configuration';
import SearchAdapter from '../../../../src/core/adapters/search';
import Requests from '../../../../src/core/requests';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/cart';
import Selectors from '../../../../src/core/selectors';
import * as utils from '../../../../src/core/utils';
import suite from '../../_suite';

suite.only('autocomplete saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeEvery(Actions.ADD_TO_CART, Tasks.addToCart, flux));
      expect(saga.next().value).to.eql(effects.takeEvery(Actions.ITEM_QUANTITY_CHANGED, Tasks.itemQuantityChanged, flux));
      expect(saga.next().value).to.eql(effects.takeEvery(Actions.REMOVE_ITEM, Tasks.removeItem, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('addToCart()', () => {
      it('should call createCartCall if there is no cart id in the state', () => {
        const product = { a: 'b' };
        const cartSelector = stub(Selectors, 'cart').returns({ content: { cartId: '' } });
        const createCallTask = stub(Tasks, 'createCartCall').returns('IamcartId');
        const addToCartTask = stub(Tasks, 'addToCartCall')

        Tasks.addToCart(<any>{ a: 'b' }, { payload: <any>{ c: 'd' } });
        expect(Tasks.addToCart).to.eq({});
      })
    });
  });
});
