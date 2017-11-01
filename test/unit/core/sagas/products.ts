import * as effects from 'redux-saga/effects';
import { ActionCreators } from 'redux-undo';
import Actions from '../../../../src/core/actions';
import PersonalizationAdapter from '../../../../src/core/adapters/personalization';
import RecommendationsAdapter from '../../../../src/core/adapters/recommendations';
import Events from '../../../../src/core/events';
import Requests from '../../../../src/core/requests';
import { Tasks as productDetailsTasks } from '../../../../src/core/sagas/product-details';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/products';
import Selectors from '../../../../src/core/selectors';
import * as utils from '../../../../src/core/utils';
import suite from '../../_suite';

suite('products saga', ({ expect, spy, stub }) => {
  const iNavDefaults = {
    navigations: {
      sort: false
    },
    refinements: {
      sort: false
    },
    minSize: 15,
    size: 10,
    window: 'day',
  };

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
      const singleRefinement = [{ value: 'test1', type: 'Value', count: 2 },
      { value: 'test3', type: 'Value', count: 4 },
      { value: 'test8', type: 'Value', count: 8 }];
      const availableNavigation: any = [
        { name: 'cat1', refinements: singleRefinement },
        { name: 'cat0', refinements: singleRefinement },
        { name: 'cat-1', refinements: singleRefinement },
        { name: 'other', refinements: singleRefinement },
      ];

      it('should handle error', () => {
        const receiveProductsAction: any = 'test';
        const receiveProducts = spy(() => receiveProductsAction);
        const flux: any = {
          actions: {
            receiveProducts
          }
        };
        const task = Tasks.fetchProducts(flux, <any>{});
        const error = new Error();
        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveProductsAction));
        expect(receiveProducts).to.be.calledWith(error);
        task.next();
      });

      it('should fetch products and navigations', () => {
        const id = '1459';
        const config: any = {
          recommendations: { iNav: iNavDefaults },
          search: { redirectSingleResult: false }
        };
        const emit = spy();
        const saveState = spy();
        const search = () => null;
        const bridge = { search };
        const payload = { a: 'b' };
        const action: any = { payload };
        const receiveProductsAction: any = { c: 'd' };
        const receiveNavigationsAction: any = { e: 'f' };
        const request = { e: 'f' };
        const response = { id, totalRecordCount: 3 };
        const receiveProducts = spy(() => receiveProductsAction);
        const receiveNavigationSort = spy(() => receiveNavigationsAction);
        // tslint:disable-next-line max-line-length
        const flux: any = { emit, saveState, clients: { bridge }, actions: { receiveProducts, receiveNavigationSort }, config };

        const task = Tasks.fetchProducts(flux, action);

        expect(task.next().value).to.eql(effects.all(([
          effects.call(Tasks.fetchProductsRequest, flux, action),
          effects.call(Tasks.fetchNavigations, flux, action)
        ])));
        expect(task.next([response, undefined]).value).to.eql(effects.select(Selectors.config));
        expect(task.next(config).value).to.eql(effects.put(<any>[receiveProductsAction]));
        expect(emit).to.be.calledWithExactly(Events.BEACON_SEARCH, id);
        expect(receiveProducts).to.be.calledWithExactly(response);
        task.next();
        expect(saveState).to.be.calledWith(utils.Routes.SEARCH);
      });

      it('should call actions.receiveRedirect when products.redirect is true', () => {
        const receiveProductsAction: any = { c: 'd' };
        const receiveNavigationsAction: any = { e: 'f' };
        const receiveRedirect = spy(() => receiveProductsAction);
        const receiveProducts = spy(() => receiveNavigationsAction);
        const flux = {
          actions: { receiveProducts, receiveRedirect },
          config: {
            search: {
              redirectSingleResult: false
            }
          },
          emit: () => undefined,
          saveState: () => undefined
        };

        const task = Tasks.fetchProducts(<any>flux, <any>{ hello: 'hello' });
        task.next();
        task.next([{ redirect: true }, undefined]);
        task.next();
        task.next();
        expect(receiveRedirect).to.be.calledOnce;
      });

      it('should call receiveDetailsProduct when only a single result', () => {
        const receiveProductsAction: any = { c: 'd' };
        const receiveNavigationsAction: any = { e: 'f' };
        const setDetailsAction: any = { j: 'e' };
        const record: any = { g: 'h' };
        const receiveRedirect = spy(() => receiveProductsAction);
        const receiveProducts = spy(() => receiveNavigationsAction);
        const setDetails = spy(() => setDetailsAction);
        const config = {
          search: {
            redirectSingleResult: true
          }
        };
        const flux: any = {
          actions: { receiveProducts, receiveRedirect, setDetails },
          emit: () => undefined,
          saveState: () => undefined
        };

        const task = Tasks.fetchProducts(<any>flux, <any>{});
        task.next();
        task.next([{ redirect: false, totalRecordCount: 1, records: [record] }, undefined]);
        expect(task.next(config).value)
          .to.eql(effects.put(setDetailsAction));
        expect(setDetails).to.be.calledWith(record);
        task.next();
      });

      it('should not sort navigations if navigations is an error', () => {
        const receiveProductsAction: any = { c: 'd' };
        const record: any = { g: 'h' };
        const receiveProducts = spy(() => receiveProductsAction);
        const products = { id: 2 };
        const config = {
          search: {
            redirectSingleResult: false
          }
        };
        const flux: any = {
          actions: { receiveProducts },
          emit: () => undefined,
          saveState: () => undefined
        };

        const task = Tasks.fetchProducts(<any>flux, <any>{});
        task.next();
        task.next(config);
        expect(task.next([products, new Error()]).value).to.eql(effects.put(receiveProductsAction));
      });

      it('should sort navigations if navigations received', () => {
        const receiveRecommendationsNavigationsAction: any = { c: 'd' };
        const record: any = { g: 'h' };
        const receiveNavigationSort = spy(() => receiveRecommendationsNavigationsAction);
        const products = { id: 2 };
        const receiveProductsAction: any = { c: 'd' };
        const receiveProducts = spy(() => receiveProductsAction);
        const config = {
          search: {
            redirectSingleResult: false
          },
          recommendations: {
            iNav: {
              navigations: {
                sort: true,
                pinned: undefined,
              },
              refinements: {
                sort: false,
                pinned: undefined,
              }
            }
          },
        };
        const flux: any = {
          actions: { receiveNavigationSort, receiveProducts },
          emit: () => undefined,
          saveState: () => undefined
        };

        const sortArray: any = [
          {
            name: 'cat-1', values: [{ value: 'test1', type: 'Value', count: 2 },
            { value: 'test8', type: 'Value', count: 8 },
            { value: 'test3', type: 'Value', count: 4 }],
          },
          { name: 'cat0', values: singleRefinement },
          { name: 'cat1', values: singleRefinement },
          { name: 'test1', values: singleRefinement },
        ];

        const sortedNavigations: any = [
          { name: 'cat-1', refinements: singleRefinement },
          { name: 'cat0', refinements: singleRefinement },
          { name: 'cat1', refinements: singleRefinement },
          { name: 'other', refinements: singleRefinement },
        ];

        const task = Tasks.fetchProducts(<any>flux, <any>{});
        task.next();
        task.next([{ availableNavigation }, sortArray]);
        expect(task.next(config).value)
          .to.eql(effects.put(<any>[receiveRecommendationsNavigationsAction, receiveProductsAction]));
        expect(receiveProducts.getCall(0).args[0]).to.eql({ availableNavigation: sortedNavigations });
      });

      it('should sort refinements if navigations received', () => {
        const receiveRecommendationsNavigationsAction: any = { c: 'd' };
        const record: any = { g: 'h' };
        const receiveNavigationSort = spy(() => receiveRecommendationsNavigationsAction);
        const products = { id: 2 };
        const receiveProductsAction: any = { c: 'd' };
        const receiveProducts = spy(() => receiveProductsAction);
        const config = {
          search: {
            redirectSingleResult: false
          },
          recommendations: {
            iNav: {
              navigations: {
                sort: false,
                pinned: undefined,
              },
              refinements: {
                sort: true,
                pinned: undefined,
              }
            }
          },
        };
        const flux: any = {
          actions: { receiveNavigationSort, receiveProducts },
          emit: () => undefined,
          saveState: () => undefined
        };

        const avail = [...availableNavigation];
        avail[2] = {
          ...availableNavigation[2], refinements: [...availableNavigation[2].refinements,
          { value: 'otherRef', type: 'Value', count: 9 }]
        };

        const sortArray: any = [
          {
            name: 'cat-1', values: [{ value: 'test1', type: 'Value', count: 2 },
            { value: 'test8', type: 'Value', count: 8 },
            { value: 'test3', type: 'Value', count: 4 }],
          },
          { name: 'cat0', values: singleRefinement },
          { name: 'cat1', values: singleRefinement },
          { name: 'test1', values: singleRefinement },
        ];

        const sortedNavigations: any = [
          { name: 'cat1', refinements: singleRefinement },
          { name: 'cat0', refinements: singleRefinement },
          {
            name: 'cat-1', refinements: [{ value: 'test1', type: 'Value', count: 2 },
            { value: 'test8', type: 'Value', count: 8 },
            { value: 'test3', type: 'Value', count: 4 },
            { value: 'otherRef', type: 'Value', count: 9 }]
          },
          { name: 'other', refinements: singleRefinement },
        ];

        const task = Tasks.fetchProducts(<any>flux, <any>{});
        task.next();
        task.next([{ availableNavigation: avail }, sortArray]);
        expect(task.next(config).value)
          .to.eql(effects.put(<any>[receiveRecommendationsNavigationsAction, receiveProductsAction]));
        expect(receiveProducts.getCall(0).args[0]).to.eql({ availableNavigation: sortedNavigations });
      });

      it('should sort navigations and refinements if navigations received', () => {
        const receiveRecommendationsNavigationsAction: any = { c: 'd' };
        const record: any = { g: 'h' };
        const receiveNavigationSort = spy(() => receiveRecommendationsNavigationsAction);
        const products = { id: 2 };
        const receiveProductsAction: any = { c: 'd' };
        const receiveProducts = spy(() => receiveProductsAction);
        const config = {
          search: {
            redirectSingleResult: false
          },
          recommendations: {
            iNav: {
              navigations: {
                sort: true,
                pinned: undefined,
              },
              refinements: {
                sort: true,
                pinned: undefined,
              }
            }
          },
        };
        const flux: any = {
          actions: { receiveNavigationSort, receiveProducts },
          emit: () => undefined,
          saveState: () => undefined
        };

        const avail = [...availableNavigation];
        avail[2] = {
          ...availableNavigation[2], refinements: [...availableNavigation[2].refinements,
          { value: 'otherRef', type: 'Value', count: 9 }]
        };

        const sortArray: any = [
          {
            name: 'cat-1', values: [{ value: 'test1', type: 'Value', count: 2 },
            { value: 'test8', type: 'Value', count: 8 },
            { value: 'test3', type: 'Value', count: 4 }],
          },
          { name: 'cat0', values: singleRefinement },
          { name: 'cat1', values: singleRefinement },
          { name: 'test1', values: singleRefinement },
        ];

        const sortedNavigations: any = [
          {
            name: 'cat-1', refinements: [{ value: 'test1', type: 'Value', count: 2 },
            { value: 'test8', type: 'Value', count: 8 },
            { value: 'test3', type: 'Value', count: 4 },
            { value: 'otherRef', type: 'Value', count: 9 }]
          },
          { name: 'cat0', refinements: singleRefinement },
          { name: 'cat1', refinements: singleRefinement },
          { name: 'other', refinements: singleRefinement },
        ];

        const task = Tasks.fetchProducts(<any>flux, <any>{});
        task.next();
        task.next([{ availableNavigation: avail }, sortArray]);
        expect(task.next(config).value).
          to.eql(effects.put(<any>[receiveRecommendationsNavigationsAction, receiveProductsAction]));
        expect(receiveProducts.getCall(0).args[0]).to.eql({ availableNavigation: sortedNavigations });
      });

      it('should call pinNavigations and pinRefinements when navigations received', () => {
        const receiveRecommendationsNavigationsAction: any = { c: 'd' };
        const record: any = { g: 'h' };
        const receiveNavigationSort = spy(() => receiveRecommendationsNavigationsAction);
        const products = { id: 2 };
        const receiveProductsAction: any = { c: 'd' };
        const receiveProducts = spy(() => receiveProductsAction);
        const sortAndPinNavigations = stub(RecommendationsAdapter, 'sortAndPinNavigations').returnsArg(0);
        const config = {
          search: {
            redirectSingleResult: false
          },
          recommendations: {
            iNav: {
              navigations: {
                sort: false,
                pinned: ['1', '2', '3', '4'],
              },
              refinements: {
                sort: false,
                pinned: {
                  1: ['1']
                }
              }
            }
          },
        };
        const flux: any = {
          actions: { receiveNavigationSort, receiveProducts },
          emit: () => undefined,
          saveState: () => undefined
        };

        const sortArray: any = [
          { name: 'cat-1', values: singleRefinement },
          { name: 'cat0', values: singleRefinement },
          { name: 'cat1', values: singleRefinement },
          { name: 'test1', values: singleRefinement },
        ];

        const task = Tasks.fetchProducts(<any>flux, <any>{});
        task.next();
        task.next([{ availableNavigation }, sortArray]);
        expect(task.next(config).value)
          .to.eql(effects.put(<any>[receiveRecommendationsNavigationsAction, receiveProductsAction]));
        expect(receiveProducts.getCall(0).args[0]).to.eql({ availableNavigation });
        expect(sortAndPinNavigations).to.be.calledWith(availableNavigation, sortArray, config);
      });
    });

    describe('fetchProductsRequest()', () => {
      it('should return products', () => {
        const id = '1459';
        const config: any = { e: 'f', search: { redirectSingleResult: false } };
        const emit = spy();
        const saveState = spy();
        const search = () => null;
        const bridge = { search };
        const payload = { a: 'b' };
        const action: any = { payload };
        const receiveProductsAction: any = { c: 'd' };
        const biases = [];
        const request = { e: 'f',
                          biasing: {
                            biases
                          }};
        const response = { id, totalRecordCount: 3 };
        const receiveProducts = spy(() => receiveProductsAction);
        const flux: any = { emit, saveState, clients: { bridge }, actions: { receiveProducts }, };

        const task = Tasks.fetchProductsRequest(flux, action);

        expect(task.next().value).to.eql(effects.select(PersonalizationAdapter.convertToBias));
        expect(task.next(biases).value).to.eql(effects.select(Requests.search));
        const ret = effects.call([bridge, search], request);
        expect(task.next(request).value).to.eql(ret);
        expect(task.next(request).value).to.eql(request);
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

        const task = Tasks.fetchProductsRequest(flux, <any>{});

        expect(task.throw(error)).to.throw;
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
        stub(Requests, 'search').returns({ e: 'f' });
        stub(Selectors, 'products').returns(['a', 'b', 'c']);

        const task = Tasks.fetchMoreProducts(flux, action);

        expect(task.next().value).to.eql(effects.select());
        expect(task.next(state).value).to.eql(effects.select(Selectors.config));
        expect(task.next().value).to.eql(effects.call([bridge, search], {
          e: 'f',
          pageSize,
          skip: 3
        }));
        expect(task.next(results).value).to.eql(effects.put(receiveMoreProductsAction));
        expect(receiveMoreProducts).to.be.calledWithExactly(results);
        expect(emit).to.be.calledWithExactly(Events.BEACON_SEARCH, id);
        task.next();
      });

      it('should throw error on failure', () => {
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

    describe('fetchNavigations()', () => {
      it('should return two actions', () => {
        const customerId = 'id';
        const state = 1;
        const config = {
          customerId,
          recommendations: {
            iNav: {
              ...iNavDefaults,
              navigations: {
                sort: true
              },
              refinements: {
                sort: true
              }
            }
          },
        };
        const url = 'url';
        const body = { a: 'b' };
        const recommendations = {
          result: [{ values: 'truthy' }, { values: false }, { values: 'literally truthy' }]
        };
        const returnVal: any = [{ values: 'truthy' }, { values: 'literally truthy' }];
        const jsonResult = 'hello';

        const buildUrl = stub(RecommendationsAdapter, 'buildUrl').returns(url);
        const buildBody = stub(RecommendationsAdapter, 'buildBody').returns(body);
        const fetch = stub(utils, 'fetch');
        const task = Tasks.fetchNavigations(<any>{}, <any>{ payload: {} });
        const query = stub(Selectors, 'query');
        const queryReturn = 2;

        expect(task.next().value).to.eql(effects.select(Selectors.config));
        expect(task.next(config).value).to.eql(effects.select(Selectors.query));
        expect(task.next(queryReturn).value).to.eql(effects.call(fetch, url, body));
        expect(buildUrl).to.be.calledWith(customerId, 'refinements', 'Popular');
        expect(task.next({ json: () => jsonResult }).value).to.eql(jsonResult);
        expect(buildBody).to.be.calledWith({
          minSize: iNavDefaults.minSize,
          sequence: [{
            size: iNavDefaults.size,
            window: iNavDefaults.window,
            matchPartial: { and: [{ search: { query: queryReturn } }] }
          },
          {
            size: iNavDefaults.size,
            window: iNavDefaults.window,
          }]
        });
        expect(task.next(recommendations).value).to.eql(returnVal);
        task.next();
      });

      it('should call receive navigations only when refinements sort is false', () => {
        const customerId = 'id';
        const config = {
          customerId,
          recommendations: {
            iNav: {
              ...iNavDefaults,
              minSize: undefined,
              navigations: {
                sort: true
              },
              refinements: {
                sort: false
              }
            }
          },
        };
        const url = 'url';
        const body = { a: 'b' };
        const recommendations = {
          result: [{ values: 'truthy' }, { values: false }, { values: 'literally truthy' }]
        };
        const returnVal: any = [{ values: 'truthy' }, { values: 'literally truthy' }];
        const jsonResult = 'hello';

        const buildUrl = stub(RecommendationsAdapter, 'buildUrl').returns(url);
        const buildBody = stub(RecommendationsAdapter, 'buildBody').returns(body);
        const fetch = stub(utils, 'fetch');
        const task = Tasks.fetchNavigations(<any>{}, <any>{ payload: {} });
        const queryReturn = 2;
        const query = stub(Selectors, 'query');

        task.next();
        task.next(config);
        expect(task.next(queryReturn).value).to.eql(effects.call(fetch, url, body));
        expect(buildUrl).to.be.calledWith(customerId, 'refinements', 'Popular');
        expect(task.next({ json: () => jsonResult }).value).to.eql(jsonResult);
        expect(buildBody).to.be.calledWith({
          minSize: iNavDefaults.size,
          sequence: [{
            size: iNavDefaults.size,
            window: iNavDefaults.window,
            matchPartial: { and: [{ search: { query: queryReturn } }] }
          },
          {
            size: iNavDefaults.size,
            window: iNavDefaults.window,
          }]
        });
        expect(task.next(recommendations).value).to.eql(returnVal);
        task.next();
      });

      it('should return nothing when navigations sort is off', () => {
        const customerId = 'id';
        const config =  {
          customerId,
          recommendations: {
            iNav: {
              navigations: {
                sort: false
              },
              refinements: {
                sort: false
              }
            }
          },
        };
        const url = 'url';
        const body = { a: 'b' };
        const recommendations = {
          result: [{ values: 'truthy' }, { values: false }, { values: 'literally truthy' }]
        };
        const returnVal: any = [{ values: 'truthy' }, { values: 'literally truthy' }];
        const jsonResult = 'hello';

        const buildUrl = stub(RecommendationsAdapter, 'buildUrl').returns(url);
        const buildBody = stub(RecommendationsAdapter, 'buildBody').returns(body);
        const fetch = stub(utils, 'fetch');
        const task = Tasks.fetchNavigations(<any>{}, <any>{ payload: {} });

        task.next();
        expect(task.next(config).value).to.eql([]);
      });
      it('should not call any actions when both navigations and refinements sort are off', () => {
        const receiveNavigationSort = spy((val) => val);
        const receiveRecommendationsRefinements = spy((val) => val);
        const customerId = 'id';
        const flux: any = {
          config: {
            customerId,
            recommendations: {
              iNav: {
                navigations: {
                  sort: false
                },
                refinements: {
                  sort: false
                }
              }
            },
          },
          actions: {
            receiveNavigationSort,
            receiveRecommendationsRefinements
          }
        };
        const url = 'url';
        const body = { a: 'b' };
        const recommendations = {
          result: [{ values: 'truthy' }, { values: false }, { values: 'literally truthy' }]
        };
        const returnVal: any = [{ values: 'truthy' }, { values: 'literally truthy' }];
        const jsonResult = 'hello';

        const buildUrl = stub(RecommendationsAdapter, 'buildUrl').returns(url);
        const buildBody = stub(RecommendationsAdapter, 'buildBody').returns(body);
        const fetch = stub(utils, 'fetch');
        const task = Tasks.fetchNavigations(flux, <any>{ payload: {} });

        task.next();
        expect(receiveRecommendationsRefinements).to.not.be.called;
        expect(receiveNavigationSort).to.not.be.called;
        task.next();
      });

      it('should return error on failure', () => {
        const error = new Error();
        const receiveRecommendationsNavigationsAction: any = { a: 'b' };
        const receiveRecommendationsRefinementsAction: any = { a: 'b' };
        const receiveNavigationSort = spy(() => receiveRecommendationsNavigationsAction);
        const receiveRecommendationsRefinements = spy(() => receiveRecommendationsRefinementsAction);
        const flux: any = {
          store: {
            getState: () => 1
          },
          config: {
            recommendations: {
              iNav: {
                navigations: {
                  sort: true
                },
                refinements: {
                  sort: true
                }
              }
            },
          }, actions: {
            receiveNavigationSort, receiveRecommendationsRefinements
          }
        };

        const task = Tasks.fetchNavigations(flux, <any>{ payload: {} });
        task.next();
        expect(task.throw(error).value).to.eq(error);
      });
    });
  });
});
