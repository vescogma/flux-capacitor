import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/cart';
import Selectors from '../../../../src/core/selectors';
import * as utils from '../../../../src/core/utils';
import suite from '../../_suite';

suite('cart saga', ({ expect, spy, stub }) => {
  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      expect(saga.next().value).to.eql(effects.takeEvery(Actions.ADD_TO_CART, Tasks.addToCart, flux));
      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeEvery(Actions.ITEM_QUANTITY_CHANGED, Tasks.itemQuantityChanged, flux));
      expect(saga.next().value).to.eql(effects.takeEvery(Actions.REMOVE_ITEM, Tasks.removeItem, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('addToCart()', () => {
      it('should handle error', () => {
        const task = Tasks.addToCart(<any>{}, <any>{});
        const error = new Error();
        task.next();
        expect(task.throw(error).value).to.eql(error);
        task.next();
      });

      it('should call createCartCall if there is no cart id in the state', () => {
        const product = <any>{ a: 'b' };
        const cartState = <any>{ content: { cartId: '' } };
        const flux = <any>{ e: 'g' };
        const cartId = 'IamcartId';
        const cartSelector = stub(Selectors, 'cart');

        const task = Tasks.addToCart(flux, <any>{ payload: product });

        expect(task.next().value).to.eql(effects.select(cartSelector));
        expect(task.next(cartState).value).to.eql(effects.call(Tasks.createCartCall, flux, cartState));
        expect(task.next(cartId).value).to.eql(effects.call(Tasks.addToCartCall, flux, cartId, product));
        task.next();
      });

      it('should not call createCartCall if there is cart id in the state', () => {
        const product = { a: 'b' };
        const cartId = 'IamcartId';
        const cartState = { content: { cartId } };
        const flux = <any>{ e: 'g' };
        const cartSelector = stub(Selectors, 'cart');
        const createCartTask = stub(Tasks, 'createCartCall');

        const task = Tasks.addToCart(flux, <any>{ payload: product });

        expect(task.next().value).to.eql(effects.select(cartSelector));
        expect(task.next(cartState).value).to.eql(effects.call(Tasks.addToCartCall, flux, cartId, product));
        expect(createCartTask).not.to.be.called;
        task.next();
      });
    });

    describe('createCartCall()', () => {
      let cartCreated: any;
      let cartCreatedAction: any;
      let flux: any;

      beforeEach(() => {
        cartCreatedAction = { c: 'd' };
        cartCreated = spy(() => cartCreatedAction);
        flux = { actions: { cartCreated } };
      });

      it('should handle error', () => {
        const task = Tasks.createCartCall(flux, <any>{});
        const error = new Error();
        task.next();
        expect(task.throw(error).value).to.eql(effects.put(cartCreatedAction));
        expect(cartCreated).to.be.calledWith(error);
        task.next();
      });

      it('should call api and then dispatch cartCreated action and return cart id', () => {
        const sessionId = 's';
        const visitorId = 'v';
        const cartState: any = { content: { cartId: '', sessionId, visitorId } };
        const config = { customerId: 'a' };
        const url = `https://qa2.groupbycloud.com/api/v0/carts/`;
        const body = {
          method: 'POST',
          body: JSON.stringify({ sessionId, visitorId, cartType: 'cart' })
        };
        const id = 'IamId';
        const jsonResult = { result: { id } };
        const fetch = stub(utils, 'fetch');

        const task = Tasks.createCartCall(flux, cartState);

        expect(task.next().value).to.eql(effects.select(Selectors.config));
        expect(task.next(config).value).to.eql(effects.call(fetch, url, body));
        expect(task.next({ json: () => jsonResult }).value).to.eql(jsonResult);
        expect(task.next({ result: { id } }).value).to.eql(effects.put(cartCreatedAction));
        expect(cartCreated).to.be.calledWithExactly(id);
        expect(task.next().value).to.be.eq(id);
      });
    });

    describe('addToCartCall()', () => {
      let cartServerUpdated: any;
      let cartServerUpdatedAction: any;
      let flux: any;

      beforeEach(() => {
        cartServerUpdatedAction = { c: 'd' };
        cartServerUpdated = spy(() => cartServerUpdatedAction);
        flux = { actions: { cartServerUpdated } };
      });

      it('should handle error', () => {
        const error = new Error();

        const task = Tasks.addToCartCall(flux, 'hey', {});

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(cartServerUpdatedAction));
        expect(cartServerUpdated).to.be.calledWith(error);
        task.next();
      });

      it('should dispatch an action with server data', () => {
        const cartId = 'IamcartId';
        const product = { p: 'p' };
        const url = `https://qa2.groupbycloud.com/api/v0/carts/${cartId}/items/`;
        const body = {
          method: 'POST',
          body: JSON.stringify([product])
        };
        const result = 'bunch of json';
        const jsonResult = { result };
        const fetch = stub(utils, 'fetch');

        const task = Tasks.addToCartCall(<any>flux, cartId, product);

        expect(task.next().value).to.eql(effects.call(fetch, url, body));
        expect(task.next({ json: () => jsonResult }).value).to.eql(jsonResult);
        expect(task.next(jsonResult).value).to.eql(effects.put(cartServerUpdatedAction));
        expect(cartServerUpdated).to.be.calledWithExactly(result);
        task.next();
      });
    });

    describe('itemQuantityChanged()', () => {
      let cartServerUpdated: any;
      let cartServerUpdatedAction: any;
      let flux: any;

      beforeEach(() => {
        cartServerUpdatedAction = { c: 'd' };
        cartServerUpdated = spy(() => cartServerUpdatedAction);
        flux = { actions: { cartServerUpdated } };
      });

      it('should handle error', () => {
        const error = new Error();

        const task = Tasks.itemQuantityChanged(flux, <any>{ payload: { product: 'a', quantity: 2 } });

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(cartServerUpdatedAction));
        expect(cartServerUpdated).to.be.calledWith(error);
        task.next();
      });

      it('should dispatch an action with server data', () => {
        const cartId = 'IamcartId';
        const product = { p: 'p' };
        const quantity = 2;
        const url = `https://qa2.groupbycloud.com/api/v0/carts/${cartId}/items/`;
        const body = {
          method: 'PUT',
          body: JSON.stringify([{ ...product, quantity }])
        };
        const result = 'bunch of json';
        const jsonResult = { result };
        const fetch = stub(utils, 'fetch');

        const task = Tasks.itemQuantityChanged(<any>flux, <any>{ payload: { product, quantity } });

        expect(task.next().value).to.eql(effects.select(Selectors.cart));
        expect(task.next({ content: { cartId } }).value).to.eql(effects.call(fetch, url, body));
        expect(task.next({ json: () => jsonResult }).value).to.eql(jsonResult);
        expect(task.next(jsonResult).value).to.eql(effects.put(cartServerUpdatedAction));
        expect(cartServerUpdated).to.be.calledWithExactly(result);
        task.next();
      });
    });

    describe('removeItem()', () => {
      let cartServerUpdated: any;
      let cartServerUpdatedAction: any;
      let flux: any;

      beforeEach(() => {
        cartServerUpdatedAction = { c: 'd' };
        cartServerUpdated = spy(() => cartServerUpdatedAction);
        flux = { actions: { cartServerUpdated } };
      });

      it('should handle error', () => {
        const error = new Error();

        const task = Tasks.removeItem(flux, <any>{ payload: { product: 'a' } });

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(cartServerUpdatedAction));
        expect(cartServerUpdated).to.be.calledWith(error);
        task.next();
      });

      it('should dispatch an action with server data', () => {
        const cartId = 'IamcartId';
        const product = { sku: 'p' };
        const deleteUrl = `https://qa2.groupbycloud.com/api/v0/carts/${cartId}/items/${product.sku}`;
        const fetchUrl = `https://qa2.groupbycloud.com/api/v0/carts/${cartId}/`;
        const result = 'bunch of json';
        const jsonResult = { result };
        const fetch = stub(utils, 'fetch');

        const task = Tasks.removeItem(<any>flux, <any>{ payload: product });

        expect(task.next().value).to.eql(effects.select(Selectors.cart));
        expect(task.next({ content: { cartId } }).value).to.eql(effects.call(fetch, deleteUrl, { method: 'DELETE' }));
        expect(task.next().value).to.eql(effects.call(fetch, fetchUrl, { method: 'GET' }));
        expect(task.next({ json: () => jsonResult }).value).to.eql(jsonResult);
        expect(task.next(jsonResult).value).to.eql(effects.put(cartServerUpdatedAction));
        expect(cartServerUpdated).to.be.calledWithExactly(result);
        task.next();
      });
    });
  });
});
