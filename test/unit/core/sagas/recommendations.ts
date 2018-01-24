import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import ConfigAdapter from '../../../../src/core/adapters/configuration';
import PastPurchaseAdapter from '../../../../src/core/adapters/pastPurchases';
import RecommendationsAdapter from '../../../../src/core/adapters/recommendations';
import SearchAdapter from '../../../../src/core/adapters/search';
import { receivePage } from '../../../../src/core/reducers/data/page';
import Requests from '../../../../src/core/requests';
import sagaCreator, { MissingPayloadError, Tasks } from '../../../../src/core/sagas/recommendations';
import Selectors from '../../../../src/core/selectors';
import * as utils from '../../../../src/core/utils';
import suite from '../../_suite';

suite('recommendations saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b', actions: {} };

      const saga = sagaCreator(flux)();

      // tslint:disable max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_RECOMMENDATIONS_PRODUCTS, Tasks.fetchProducts, flux));
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_PAST_PURCHASES, Tasks.fetchPastPurchases, flux));
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_PAST_PURCHASE_PRODUCTS, Tasks.fetchPastPurchaseProducts, flux));
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_PAST_PURCHASE_NAVIGATIONS, Tasks.fetchPastPurchaseProducts, flux, null, true));
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_SAYT_PAST_PURCHASES, Tasks.fetchSaytPastPurchases, flux));
      expect(saga.next().value).to.eql(effects.takeEvery(Actions.FETCH_MORE_PAST_PURCHASE_PRODUCTS, Tasks.fetchMorePastPurchaseProducts, flux));
      saga.next();
      // tslint:enable max-line-length
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
        const augmentProducts = stub(SearchAdapter, 'augmentProducts').returns(['x', 'x', 'x']);
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
        expect(augmentProducts).to.be.calledWithExactly({ records });
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
        const flux: any = { config, store: { getState: () => 1 } };
        stub(Selectors, 'pastPurchases').returns([]);

        const task = Tasks.fetchProducts(<any>{}, <any>{ payload: {} });

        task.next();
        task.next(config);
        expect(task.next(config).value).to.be.undefined;
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

    describe('fetchSkus()', () => {
      it('should fetch skus', () => {
        const securedPayload = 'secured';
        const body = 'asdf';
        const customerId = 'id';
        const endpoint = 'end';
        const query = 'query';
        const jsonResult = 'json';
        const ret = { result: 'returned' };
        const secure = stub(ConfigAdapter, 'extractSecuredPayload').returns(securedPayload);
        const buildBody = stub(RecommendationsAdapter, 'buildBody').returns(body);
        const fetch = stub(utils, 'fetch');

        const task = Tasks.fetchSkus({ customerId }, endpoint, query);

        // tslint:disable-next-line max-line-length
        expect(task.next().value).to.eql(effects.call(fetch, `https://${customerId}.groupbycloud.com/orders/v1/public/skus/${endpoint}`, body));
        expect(buildBody).to.be.calledWithExactly({ securedPayload, query });
        expect(task.next({ json: () => jsonResult }).value).to.eql(jsonResult);
        expect(task.next(ret).value).to.eql(ret.result);
      });

      it('should throw error if no secured payload', () => {
        const securedPayload = null;
        const body = 'asdf';
        const customerId = 'id';
        const secure = stub(ConfigAdapter, 'extractSecuredPayload').returns(securedPayload);

        const task = Tasks.fetchSkus({ customerId }, 'endpoint');

        try {
          task.next();
          expect.fail();
        } catch (e) {
          expect(e).to.be.an.instanceof(MissingPayloadError);
          expect(e.message).to.eql('No Secured Payload');
        }
      });

      it('should throw error if falsy result', () => {
        const securedPayload = 'secured';
        const body = 'asdf';
        const ret = 'returned';
        const secure = stub(ConfigAdapter, 'extractSecuredPayload').returns(securedPayload);
        const buildBody = stub(RecommendationsAdapter, 'buildBody').returns(body);
        const fetch = stub(utils, 'fetch');

        const task = Tasks.fetchSkus({ customerId: 'id' }, 'endpoint', 'query');

        try {
          task.next();
          task.next({ json: () => null });
          task.next({});
          expect.fail();
        } catch (e) {
          expect(e).to.be.an.instanceof(MissingPayloadError);
          expect(e.message).to.eql('No Secured Payload');
        }
      });
    });

    describe('fetchProductsFromSkus()', () => {
      const search = () => null;
      const bridge = { search };
      const flux: any = { clients: { bridge } };
      const sku1 = 123;
      const sku2 = 234;
      const skus: any = [{ sku: sku1 }, { sku: sku2 }];
      const request: any = {};
      const ret = 'returned';
      const ids = [sku1, sku2];

      it('should fetch products from skus', () => {
        const newRequest = {
          biasing: {
            restrictToIds: ids,
          },
          sort: [{ type: 'ByIds', ids }],
        };

        const task = Tasks.fetchProductsFromSkus(flux, skus, request);

        expect(task.next().value).to.eql(effects.call(<any>[bridge, search], newRequest));
        expect(task.next(ret).value).to.eql(ret);
      });
    });

    describe('fetchPastPurchases()', () => {
      const config = { a: 1 };

      it('should return if product count is 0', () => {
        const productCount = 0;
        const receivePastPurchaseSkus = spy(() => 1);
        const flux: any = { actions: { receivePastPurchaseSkus } };
        // tslint:disable-next-line max-line-length
        const extractPastPurchaseProductCount = stub(ConfigAdapter, 'extractPastPurchaseProductCount').returns(productCount);

        const task = Tasks.fetchPastPurchases(flux, <any>{});

        expect(task.next().value).to.eql(effects.select(Selectors.config));
        expect(task.next(config).value).to.eql(effects.put(receivePastPurchaseSkus([])));
        expect(task.next().value).to.be.undefined;
        expect(extractPastPurchaseProductCount).to.be.calledWith(config);
      });

      it('should call fetchPastPurchases', () => {
        const productCount = 5;
        const data: any = { b: 2 };
        const navigations: any = [1, 2, 3];
        const receivePastPurchaseSkus = spy(() => data);
        const fetchPastPurchaseNavigations = spy(() => navigations);
        const flux: any = { actions: { receivePastPurchaseSkus, fetchPastPurchaseNavigations } };
        const resultArray = [1, 2, 3];
        // tslint:disable-next-line max-line-length
        const extractPastPurchaseProductCount = stub(ConfigAdapter, 'extractPastPurchaseProductCount').returns(productCount);

        const task = Tasks.fetchPastPurchases(flux, <any>{});

        expect(task.next().value).to.eql(effects.select(Selectors.config));
        expect(task.next(config).value).to.eql(effects.call(<any>Tasks.fetchSkus, config, 'popular'));
        expect(task.next(resultArray).value).to.eql(effects.put(data));
        expect(task.next(resultArray).value).to.eql(effects.put(navigations));
        expect(task.next().value).to.be.undefined;
        expect(receivePastPurchaseSkus).to.be.calledWith(resultArray);
        expect(extractPastPurchaseProductCount).to.be.calledWith(config);
        expect(fetchPastPurchaseNavigations).to.be.calledOnce;
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receivePastPurchaseSkus = spy(() => error);
        const flux: any = { actions: { receivePastPurchaseSkus } };

        const task = Tasks.fetchPastPurchases(flux, <any>{});

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receivePastPurchaseSkus(error)));
        task.next();
      });

      it('should ignore missing payload errors', () => {
        const error = new MissingPayloadError();
        const receivePastPurchaseSkus = spy(() => error);
        const flux: any = { actions: { receivePastPurchaseSkus } };

        const task = Tasks.fetchPastPurchases(flux, <any>{});

        task.next();
        expect(task.throw(error).value).to.eql(undefined);
      });
    });

    describe('fetchPastPurchaseProducts()', () => {
      it('should return if payload is undefined and results.length is 0', () => {
        const flux: any = {};
        const action: any = {};
        const config = {};

        const task = Tasks.fetchPastPurchaseProducts(flux, action);

        expect(task.next().value).to.eql(effects.select(Selectors.pastPurchases));
        expect(task.next([]).value).to.be.undefined;
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receivePastPurchaseProducts = spy(() => 1);
        const flux: any = { actions: { receivePastPurchaseProducts } };
        const action: any = {};

        const task = Tasks.fetchPastPurchaseProducts(flux, action);

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receivePastPurchaseProducts(error)));
        task.next();
      });

      it('should generate a request', () => {
        const getState = spy(() => ({ a: 1 }));
        const receivePastPurchaseProducts = spy(() => 1);
        const receivePastPurchasePage = spy(() => 3);
        const receivePastPurchaseCurrentRecordCount = spy(() => 4);
        const saveState = spy();
        const actions = {
          receivePastPurchasePage,
          receivePastPurchaseProducts,
          receivePastPurchaseCurrentRecordCount,
        };
        const flux: any = { actions, saveState, store: { getState } };
        const query = 'past';
        const config = { b: 2 };
        const result = [1, 2, 3];
        const request = { c: 3 };
        const transformedNav = ['f'];
        const productData = { selectedNavigation: [2, 3, 5], };
        const currentPage = 2;
        const pageSize = 18;
        const augmentProducts = stub(SearchAdapter, 'augmentProducts').returns(productData);
        const extractPage = stub(SearchAdapter, 'extractPage').returns(productData);
        const extractRecordCount = stub(SearchAdapter, 'extractRecordCount').returns(productData);
        const pastPurchasePage = stub(Selectors, 'pastPurchasePage').returns(currentPage);
        const pastPurchasePageSize = stub(Selectors, 'pastPurchasePageSize').returns(pageSize);

        const task = Tasks.fetchPastPurchaseProducts(flux, <any>{});

        expect(task.next().value).to.eql(effects.select(Selectors.pastPurchases));
        expect(task.next(result).value).to.eql(effects.select(Requests.pastPurchaseProducts, false));
        expect(task.next(request).value).to.eql(effects.call(<any>Tasks.fetchProductsFromSkus, flux, result, request));
        expect(task.next(productData).value).to.eql(effects.put(<any>[
          receivePastPurchasePage(),
          receivePastPurchaseCurrentRecordCount(),
          receivePastPurchaseProducts(),
        ]));
        expect(task.next([]).value).to.be.undefined;

        expect(augmentProducts).to.be.calledWithExactly(productData);
        expect(extractRecordCount).to.be.calledWithExactly(productData);
        expect(receivePastPurchasePage).to.be.calledWithExactly(productData, currentPage);
        expect(pastPurchasePage).to.be.calledWithExactly(flux.store.getState());
        expect(saveState).to.be.calledWithExactly(utils.Routes.PAST_PURCHASE);
      });

      it('should generate a request when getNavigations is true', () => {
        const getState = spy(() => ({ a: 1 }));
        const receivePastPurchaseAllRecordCount = spy(() => 1);
        const receivePastPurchaseRefinements = spy(() => 2);
        const saveState = spy();
        const actions = {
          receivePastPurchaseAllRecordCount,
          receivePastPurchaseRefinements,
        };
        const flux: any = { actions, saveState, store: { getState } };
        const query = 'past';
        const config = { b: 2 };
        const result = [1, 2, 3];
        const request = { c: 3 };
        const transformedNav = ['f'];
        const productData = { selectedNavigation: [2, 3, 5], };
        const augmentProducts = stub(SearchAdapter, 'augmentProducts').returns(productData);
        const combineNavigations = stub(SearchAdapter, 'combineNavigations').returns(productData);
        const navigations = stub(PastPurchaseAdapter, 'pastPurchaseNavigations').returns(transformedNav);

        const task = Tasks.fetchPastPurchaseProducts(flux, <any>{}, true);

        task.next();
        expect(task.next(result).value).to.eql(effects.select(Requests.pastPurchaseProducts, true));
        task.next(request);
        expect(task.next(productData).value).to.eql(effects.select(Selectors.config));
        expect(task.next(config).value).to.eql(effects.put(<any>[
          receivePastPurchaseAllRecordCount(),
          receivePastPurchaseRefinements(),
        ]));
        expect(task.next([]).value).to.be.undefined;

        expect(combineNavigations).to.be.calledWithExactly(productData);
        expect(saveState).to.not.be.called;
        expect(navigations).to.be.calledWithExactly(config, productData);
      });
    });

    describe('fetchMorePastPurchaseProducts()', () => {
      it('should return more products when fetching forward', () => {
        const pageSize = 14;
        const emit = spy();
        const action: any = { payload: { amount: pageSize, forward: true } };
        const receiveMorePastProductsAction: any = { c: 'd' };
        const receiveMorePastPurchaseProducts = spy(() => receiveMorePastProductsAction);
        const receivePastPurchaseCurrentRecordCountAction: any = { i: 'j' };
        const receivePastPurchaseCurrentRecordCount = spy(() => receivePastPurchaseCurrentRecordCountAction);
        const infiniteScrollRequestStateAction: any = { e: 'f' };
        const infiniteScrollRequestState = spy(() => infiniteScrollRequestStateAction);
        const state = { e: 'f' };
        const records = ['g', 'h'];
        const results = { records, totalRecordCount: 1 };
        const flux: any = {
          emit,
          actions: {
            receiveMorePastPurchaseProducts,
            infiniteScrollRequestState,
            receivePastPurchaseCurrentRecordCount,
          }
        };
        stub(Requests, 'pastPurchaseProducts').returns(results);
        stub(Selectors, 'pastPurchaseProductsWithMetadata').returns([{ index: 1 }, { index: 2 }, { index: 3 }]);
        const pastPurchaseSkusSelector = stub(Selectors, 'pastPurchases');

        const task = Tasks.fetchMorePastPurchaseProducts(flux, action);

        expect(task.next().value).to.eql(effects.select());
        expect(task.next().value).to.eql(effects.select(pastPurchaseSkusSelector));
        expect(task.next(state).value).to.eql(effects.put(infiniteScrollRequestStateAction));
        expect(infiniteScrollRequestState).to.be.calledOnce.calledWithExactly({ isFetchingForward: true });
        expect(task.next().value).to.eql(effects.select(Requests.pastPurchaseProducts, false, { pageSize, skip: 3 }));
        expect(task.next(results).value).to.eql(effects.call(<any>Tasks.fetchProductsFromSkus, flux, state, results));
        expect(task.next(results).value).to.eql(effects.put(<any>[
          receivePastPurchaseCurrentRecordCountAction,
          receiveMorePastProductsAction,
        ]));
        expect(task.next().value).to.eql(effects.put(infiniteScrollRequestStateAction));
        expect(infiniteScrollRequestState).to.be.calledTwice.calledWithExactly({ isFetchingForward: false });
        task.next();
      });

      it('should return previous products when fetching backward', () => {
        const pageSize = 14;
        const emit = spy();
        const action: any = { payload: { amount: pageSize, forward: false } };
        const receiveMorePastProductsAction: any = { c: 'd' };
        const receiveMorePastPurchaseProducts = spy(() => receiveMorePastProductsAction);
        const receivePastPurchaseCurrentRecordCountAction: any = { i: 'j' };
        const receivePastPurchaseCurrentRecordCount = spy(() => receivePastPurchaseCurrentRecordCountAction);
        const infiniteScrollRequestStateAction: any = { e: 'f' };
        const infiniteScrollRequestState = spy(() => infiniteScrollRequestStateAction);
        const state = { e: 'f' };
        const records = ['g', 'h'];
        const results = { records, totalRecordCount: 1 };
        const flux: any = {
          emit,
          actions: {
            receiveMorePastPurchaseProducts,
            infiniteScrollRequestState,
            receivePastPurchaseCurrentRecordCount,
          }
        };
        stub(Requests, 'pastPurchaseProducts').returns(results);
        stub(Selectors, 'pastPurchaseProductsWithMetadata').returns([{ index: 11 }, { index: 12 }, { index: 13 }]);
        stub(Selectors, 'pastPurchasePageSize').returns(10);
        const pastPurchaseSkusSelector = stub(Selectors, 'pastPurchases');

        const task = Tasks.fetchMorePastPurchaseProducts(flux, action);

        expect(task.next().value).to.eql(effects.select());
        expect(task.next().value).to.eql(effects.select(pastPurchaseSkusSelector));
        expect(task.next(state).value).to.eql(effects.put(infiniteScrollRequestStateAction));
        expect(infiniteScrollRequestState).to.be.calledOnce.calledWithExactly({ isFetchingBackward: true });
        expect(task.next().value).to.eql(effects.select(Requests.pastPurchaseProducts, false, { pageSize, skip: 0 }));
        expect(task.next(results).value).to.eql(effects.call(<any>Tasks.fetchProductsFromSkus, flux, state, results));
        expect(task.next(results).value).to.eql(effects.put(<any>[
          receivePastPurchaseCurrentRecordCountAction,
          receiveMorePastProductsAction,
        ]));
        expect(task.next().value).to.eql(effects.put(infiniteScrollRequestStateAction));
        expect(infiniteScrollRequestState).to.be.calledTwice.calledWithExactly({ isFetchingBackward: false });
        task.next();
      });

      it('should throw error on failure', () => {
        const error = new Error();
        const receiveMorePastPurchaseProductsAction: any = { a: 'b' };
        const receiveMorePastPurchaseProducts = spy(() => receiveMorePastPurchaseProductsAction);
        const flux: any = {
          clients: { sayt: { productSearch: () => null } },
          actions: { receiveMorePastPurchaseProducts }
        };

        const task = Tasks.fetchMorePastPurchaseProducts(flux, <any>{});

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveMorePastPurchaseProductsAction));
        expect(receiveMorePastPurchaseProducts).to.be.calledWith(error);
        task.next();
      });
    });

    describe('fetchSaytPastPurchases()', () => {
      it('should return if data.length is 0', () => {
        const receiveSaytPastPurchases = spy(() => 1);
        const flux: any = { actions: { receiveSaytPastPurchases } };
        const payload = { a: 1 };
        const action: any = { payload };
        const config = { b: 2 };
        const data = [];

        const task = Tasks.fetchSaytPastPurchases(flux, action);

        expect(task.next().value).to.eql(effects.select(Selectors.config));
        expect(task.next(config).value).to.eql(effects.select(Selectors.pastPurchases));
        expect(task.next(data).value).to.eql(effects.put(receiveSaytPastPurchases()));
        expect(task.next().value).to.be.undefined;
        expect(receiveSaytPastPurchases).to.be.calledWith([]);
      });

      it('should call fetchSaytPastPurchases', () => {
        const receiveSaytPastPurchases = spy(() => 1);
        const flux: any = { actions: { receiveSaytPastPurchases } };
        const payload = 'q';
        const action: any = { payload };
        const config = { b: 2 };
        const result = [1, 2, 3];
        const productData = { c: 3 };
        const request = { d: 4, query: payload };
        const augmentProducts = stub(SearchAdapter, 'augmentProducts').returns(productData);

        const task = Tasks.fetchSaytPastPurchases(flux, action);

        expect(task.next().value).to.eql(effects.select(Selectors.config));
        expect(task.next(config).value).to.eql(effects.select(Selectors.pastPurchases));
        expect(task.next(result).value).to.eql(effects.select(Requests.autocompleteProducts));
        expect(task.next(request).value).to.eql(effects.call(<any>Tasks.fetchProductsFromSkus, flux, result, request));
        expect(task.next(productData).value).to.eql(effects.put(receiveSaytPastPurchases()));
        expect(task.next().value).to.be.undefined;
        expect(receiveSaytPastPurchases).to.be.calledWithExactly(productData);
        expect(augmentProducts).to.be.calledWithExactly(productData);
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveSaytPastPurchases = spy(() => 1);
        const flux: any = { actions: { receiveSaytPastPurchases } };
        const action: any = {};

        const task = Tasks.fetchSaytPastPurchases(flux, action);

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveSaytPastPurchases(error)));
        task.next();
      });
    });
  });
});
