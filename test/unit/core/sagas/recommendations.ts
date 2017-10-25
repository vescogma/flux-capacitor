import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import RecommendationsAdapter from '../../../../src/core/adapters/recommendations';
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
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_PAST_PURCHASES, Tasks.fetchPastPurchases, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('fetchProducts()', () => {
      it('should return more refinements', () => {
        const customerId = 'myCustomer';
        const productCount = 8;
        const idField = 'myId';
        const location = { minSize: 10 };
        const config = { customerId, recommendations: { productSuggestions: { productCount }, location, idField } };
        const state = { c: 'd' };
        const search = () => null;
        const bridge = { search };
        const receiveRecommendationsProductsAction: any = { a: 'b' };
        const receiveRecommendationsProducts = spy(() => receiveRecommendationsProductsAction);
        const recommendationsPromise = Promise.resolve();
        const recommendationsResponse = { result: [{ productId: '123' }, {}, { productId: '456' }] };
        const flux: any = { clients: { bridge }, actions: { receiveRecommendationsProducts }, };
        const url = `https://${customerId}.groupbycloud.com/wisdom/v2/public/recommendations/products/_getPopular`;
        const searchRequestSelector = stub(Requests, 'search').returns({ e: 'f' });
        const extractProduct = stub(Adapter, 'extractProduct').returns('x');
        const matchExact = 'match exact';
        const fetch = stub(utils, 'fetch');
        const originalBody = {
          size: productCount,
          type: 'viewProduct',
          target: idField
        };
        const request = {
          method: 'POST',
          body: JSON.stringify(matchExact)
        };
        const records = ['a', 'b', 'c'];

        const task = Tasks.fetchProducts(flux, <any>{ payload: {} });
        const addLocationToRequest = stub(RecommendationsAdapter, 'addLocationToRequest').returns(matchExact);

        expect(task.next().value).to.eql(effects.select());
        expect(task.next(state).value).to.eql(effects.select(Selectors.config));
        expect(task.next(config).value).to.eql(effects.call(fetch, url, request));
        expect(addLocationToRequest).to.be.calledWith(originalBody);
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
        expect(searchRequestSelector).to.be.calledWithExactly(state);
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
        const productSuggestions = { productCount, mode: 'trending' };
        const location = { minSize: 10 };
        const config = { customerId, recommendations: { productSuggestions, location, idField } };
        const url = `https://${customerId}.groupbycloud.com/wisdom/v2/public/recommendations/products/_getTrending`;
        const matchExact = 'match exact';
        const request = {
          method: 'POST',
          body: JSON.stringify(matchExact)
        };
        const records = ['a', 'b', 'c'];
        const fetch = stub(utils, 'fetch');
        stub(RecommendationsAdapter, 'addLocationToRequest').returns(matchExact);

        const task = Tasks.fetchProducts(<any>{}, <any>{ payload: {} });

        task.next();
        task.next();
        expect(task.next(config).value).to.eql(effects.call(fetch, url, request));
      });

      it('should not return past purchases for 0 productCount', () => {
        const customerId = 'myCustomer';
        const productCount = 0;
        const productSuggestions = { productCount };
        const config = { customerId, recommendations: { productSuggestions } };

        const task = Tasks.fetchProducts(<any>{}, <any>{ payload: {} });

        task.next();
        task.next(config);
        expect(task.next(config).value).to.eql([]);
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

    describe('fetchPastPurchases()', () => {
      it('should return past purchases', () => {
        const customerId = 'myCustomer';
        const productCount = 8;
        const pastPurchases = { productCount };
        const config = { customerId, recommendations: { pastPurchases } };
        const receivePastPurchasesAction: any = { a: 'b' };
        const receivePastPurchases = spy(() => receivePastPurchasesAction);
        const flux: any = { config, actions: { receivePastPurchases } };
        const url = `http://${customerId}.groupbycloud.com/orders/public/skus/popular`;

        const fetch = stub(utils, 'fetch');
        const request = {
          method: 'POST',
          body: JSON.stringify({
            size: productCount
          })
        };
        const promise = Promise.resolve();
        const response = {
          result: [{ sku: '12314', quantity: 1 }, { sku: '0932', quantity: 2 }, { sku: '19235', quantity: 1 }]
        };

        const task = Tasks.fetchPastPurchases(flux, <any>{ payload: {} });

        task.next();
        expect(task.next(config).value).to.eql(effects.call(fetch, url, request));
        expect(task.next({ json: () => promise }).value).to.eql(promise);
        expect(task.next(response).value).to.eql(effects.put(receivePastPurchasesAction));
        expect(receivePastPurchases).to.be.calledWithExactly(response.result);
        task.next();
      });

      it('should not return past purchases for 0 productCount', () => {
        const customerId = 'myCustomer';
        const productCount = 0;
        const pastPurchases = { productCount };
        const config = { customerId, recommendations: { pastPurchases } };

        const task = Tasks.fetchPastPurchases(<any>{}, <any>{ payload: {} });

        expect(task.next().value).to.eql(effects.select(Selectors.config));
        expect(task.next(config).value).to.eql([]);
      });

      it('should handle request failure', () => {
        const customerId = 'myCustomer';
        const productCount = 8;
        const pastPurchases = { productCount };
        const config = { customerId, recommendations: { pastPurchases } };
        const error = new Error();
        const receivePastPurchasesAction: any = { a: 'b' };
        const receivePastPurchases = spy(() => receivePastPurchasesAction);
        const flux: any = { config, actions: { receivePastPurchases } };

        const task = Tasks.fetchPastPurchases(flux, <any>{ payload: {} });

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receivePastPurchasesAction));
        expect(receivePastPurchases).to.be.calledWithExactly(error);
        task.next();
      });
    });
  });
});
