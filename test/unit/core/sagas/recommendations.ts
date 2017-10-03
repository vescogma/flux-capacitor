import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import Adapter from '../../../../src/core/adapters/search';
import Requests from '../../../../src/core/requests';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/recommendations';
import Selectors from '../../../../src/core/selectors';
import * as utils from '../../../../src/core/utils';
import suite from '../../_suite';

suite('recommendations saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b', actions: {} };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_RECOMMENDATIONS_PRODUCTS, Tasks.fetchProducts, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('fetchProducts()', () => {
      it('should return more refinements', () => {
        const customerId = 'myCustomer';
        const productCount = 8;
        const idField = 'myId';
        const productSuggestions = { productCount, idField };
        const config = { customerId, recommendations: { productSuggestions } };
        const state = { c: 'd' };
        const search = () => null;
        const bridge = { search };
        const receiveRecommendationsProductsAction: any = { a: 'b' };
        const receiveRecommendationsProducts = spy(() => receiveRecommendationsProductsAction);
        const recommendationsPromise = Promise.resolve();
        const recommendationsResponse = { result: [{ productId: '123' }, {}, { productId: '456' }] };
        const flux: any = { clients: { bridge }, actions: { receiveRecommendationsProducts }, config };
        const url = `https://${customerId}.groupbycloud.com/wisdom/v2/public/recommendations/products/_getPopular`;
        const searchRequestSelector = stub(Requests, 'search').returns({ e: 'f' });
        const extractProduct = stub(Adapter, 'extractProduct').returns('x');
        const fetch = stub(utils, 'fetch');
        const request = {
          method: 'POST',
          body: JSON.stringify({
            size: productCount,
            type: 'viewProduct',
            target: idField
          })
        };
        const records = ['a', 'b', 'c'];

        const task = Tasks.fetchProducts(flux, <any>{ payload: {} });

        expect(task.next().value).to.eql(effects.select());
        expect(task.next(state).value).to.eql(effects.call(fetch, url, request));
        expect(task.next({ json: () => recommendationsPromise }).value).to.eql(recommendationsPromise);
        expect(task.next(recommendationsResponse).value).to.eql(effects.call(
          [bridge, search],
          {
            e: 'f',
            pageSize: productCount,
            includedNavigations: [],
            skip: 0,
            refinements: [
              { navigationName: idField, type: 'Value', value: '123' },
              { navigationName: idField, type: 'Value', value: '456' }
            ]
          }
        ));
        expect(task.next({ records }).value).to.eql(effects.put(receiveRecommendationsProductsAction));
        expect(searchRequestSelector).to.be.calledWithExactly(state, config);
        expect(receiveRecommendationsProducts).to.be.calledWithExactly(['x', 'x', 'x']);
        expect(extractProduct).to.be.calledThrice
          .and.calledWith('a')
          .and.calledWith('b')
          .and.calledWith('c');
        task.next();
      });

      it('should make request against specified endpoint', () => {
        const customerId = 'myCustomer';
        const productCount = 8;
        const idField = 'myId';
        const productSuggestions = { productCount, idField, mode: 'trending' };
        const config = { customerId, recommendations: { productSuggestions } };
        const flux: any = { config };
        const url = `https://${customerId}.groupbycloud.com/wisdom/v2/public/recommendations/products/_getTrending`;
        const request = {
          method: 'POST',
          body: JSON.stringify({
            size: productCount,
            type: 'viewProduct',
            target: idField
          })
        };
        const records = ['a', 'b', 'c'];
        const fetch = stub(utils, 'fetch');

        const task = Tasks.fetchProducts(flux, <any>{ payload: {} });

        task.next();
        expect(task.next().value).to.eql(effects.call(fetch, url, request));
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveRecommendationsProductsAction: any = { a: 'b' };
        const receiveRecommendationsProducts = spy(() => receiveRecommendationsProductsAction);
        const flux: any = { actions: { receiveRecommendationsProducts } };

        const task = Tasks.fetchProducts(flux, <any>{ payload: {} });

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveRecommendationsProductsAction));
        expect(receiveRecommendationsProducts).to.be.calledWithExactly(error);
        task.next();
      });
    });
  });
});
