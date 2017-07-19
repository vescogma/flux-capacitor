import * as effects from 'redux-saga/effects';
import { ActionCreators } from 'redux-undo';
import Actions from '../../../../src/core/actions';
import * as Events from '../../../../src/core/events';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/products';
import Selectors from '../../../../src/core/selectors';
import { Routes } from '../../../../src/core/utils';
import suite from '../../_suite';

suite('products saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_PRODUCTS, Tasks.fetchProducts, flux));
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_MORE_PRODUCTS, Tasks.fetchMoreProducts, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('fetchProducts()', () => {
      it('should return products', () => {
        const id = '1459';
        const config: any = { e: 'f' };
        const emit = spy();
        const saveState = spy();
        const search = () => null;
        const bridge = { search };
        const payload = { a: 'b' };
        const action: any = { payload };
        const receiveProductsAction: any = { c: 'd' };
        const request = { e: 'f' };
        const response = { id };
        const receiveProducts = spy(() => receiveProductsAction);
        const flux: any = { emit, saveState, clients: { bridge }, actions: { receiveProducts }, config };

        const task = Tasks.fetchProducts(flux, action);

        expect(task.next().value).to.eql(effects.select(Selectors.searchRequest, config));
        expect(task.next(request).value).to.eql(effects.call([bridge, search], request));
        expect(task.next(response).value).to.eql(effects.put(receiveProductsAction));
        expect(emit).to.be.calledWithExactly(Events.BEACON_SEARCH, id);
        expect(receiveProducts).to.be.calledWithExactly(response);

        task.next();
        expect(saveState).to.be.calledWith(Routes.SEARCH);
      });

      it('should handle redirect', () => {
        const redirect = '/somewhere.html';
        const payload = { a: 'b' };
        const receiveRedirectAction: any = { g: 'h' };
        const receiveRedirect = spy(() => receiveRedirectAction);
        const flux: any = {
          clients: { bridge: { search: () => null } },
          actions: { receiveRedirect, receiveProducts: () => ({}) }
        };

        const task = Tasks.fetchProducts(flux, <any>{ payload });

        task.next().value;
        task.next().value;
        expect(task.next({ redirect }).value).to.eql(effects.put(receiveRedirectAction));
        expect(receiveRedirect).to.be.calledWith(redirect);
        task.next();
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveProductsAction: any = { a: 'b' };
        const receiveProducts = spy(() => receiveProductsAction);
        const flux: any = {
          emit: () => null,
          saveState: () => null,
          clients: { bridge: { search: () => null } },
          actions: { receiveProducts }
        };

        const task = Tasks.fetchProducts(flux, <any>{});

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveProductsAction));
        expect(receiveProducts).to.be.calledWith(error);
        task.next();
      });
    });

    describe('fetchMoreProducts()', () => {
      it('should return more products', () => {
        const id = '41892';
        const pageSize = 14;
        const emit = spy();
        const saveState = spy();
        const search = () => null;
        const bridge = { search };
        const action: any = { payload: pageSize };
        const receiveMoreProductsAction: any = { c: 'd' };
        const receiveMoreProducts = spy(() => receiveMoreProductsAction);
        const state = { e: 'f' };
        const records = ['g', 'h'];
        const results = { records, id };
        const flux: any = { emit, saveState, clients: { bridge }, actions: { receiveMoreProducts } };
        stub(Selectors, 'searchRequest').returns({ e: 'f' });
        stub(Selectors, 'products').returns(['a', 'b', 'c']);

        const task = Tasks.fetchMoreProducts(flux, action);

        expect(task.next().value).to.eql(effects.select());
        expect(task.next(state).value).to.eql(effects.call([bridge, search], {
          e: 'f',
          pageSize,
          skip: 3
        }));
        expect(task.next(results).value).to.eql(effects.put(receiveMoreProductsAction));
        expect(receiveMoreProducts).to.be.calledWithExactly(records);
        expect(emit).to.be.calledWithExactly(Events.BEACON_SEARCH, id);
        task.next();
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveMoreProductsAction: any = { a: 'b' };
        const receiveMoreProducts = spy(() => receiveMoreProductsAction);
        const flux: any = {
          clients: { sayt: { productSearch: () => null } },
          actions: { receiveMoreProducts }
        };

        const task = Tasks.fetchMoreProducts(flux, <any>{});

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveMoreProductsAction));
        expect(receiveMoreProducts).to.be.calledWith(error);
        task.next();
      });
    });
  });
});
