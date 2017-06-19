import * as sinon from 'sinon';
import { Actions, ActionCreator, Selectors } from '../../../src/core';
import AutocompleteAdapter from '../../../src/core/adapters/autocomplete';
import SearchAdapter from '../../../src/core/adapters/search';
import * as utils from '../../../src/core/utils';
import suite from '../_suite';

suite('ActionCreator', ({ expect, spy, stub }) => {
  let actions: ActionCreator;
  const flux: any = { a: 'b' };

  beforeEach(() => actions = new ActionCreator(flux, { search: '/search' }));

  describe('constructor()', () => {
    it('should set properties', () => {
      expect(actions['flux']).to.eq(flux);
      expect(actions['linkMapper']).to.be.a('function');
    });

    describe('linkMapper()', () => {
      it('should return mapped link', () => {
        expect(actions.linkMapper('test')).to.eql({ value: 'test', url: '/search/test' });
      });
    });
  });

  describe('fetch action creators', () => {
    describe('fetchMoreRefinements()', () => {
      it('should return a thunk', () => {
        const thunk = actions.fetchMoreRefinements('brand');

        expect(thunk).to.be.a('function');
      });

      it('should not fetch if more refinements not available', () => {
        const navigationId = 'brand';
        const state = { a: 'b' };
        const dispatch = spy();
        const getStore = spy(() => state);
        const hasMoreRefinements = stub(Selectors, 'hasMoreRefinements').returns(false);
        const action = actions.fetchMoreRefinements(navigationId);

        action(dispatch, getStore);

        expect(getStore).to.be.called;
        expect(hasMoreRefinements).to.be.calledWith(state, navigationId);
        expect(dispatch).to.not.be.called;
      });

      it('should fetch more refinements', () => {
        const name = 'brand';
        const state: any = { a: 'b' };
        const search = { e: 'f' };
        const action = actions.fetchMoreRefinements(name);
        const refinements = stub().resolves({ navigation: { name, refinements: ['c', 'd'] } });
        const searchRequest = stub(Selectors, 'searchRequest').returns(search);
        stub(Selectors, 'navigation').returns({ refinements: [] });
        stub(Selectors, 'hasMoreRefinements').returns(true);
        stub(actions, 'receiveMoreRefinements');
        stub(SearchAdapter, 'extractRefinement').callsFake((s) => s);
        flux.clients = { bridge: { refinements } };

        return action(() => null, () => state)
          .then(() => {
            expect(searchRequest).to.be.calledWith(state);
            expect(refinements).to.be.calledWith(search, name);
          });
      });

      it('should store more refinements result', () => {
        const name = 'brand';
        const state: any = { a: 'b' };
        const moreRefinementsAction = { e: 'f' };
        const action = actions.fetchMoreRefinements(name);
        const dispatch = spy();
        const extractRefinement = stub(SearchAdapter, 'extractRefinement').callsFake((value) => value);
        const receiveMoreRefinements = stub(actions, 'receiveMoreRefinements').returns(moreRefinementsAction);
        stub(Selectors, 'navigation').returns({ refinements: [] });
        stub(Selectors, 'hasMoreRefinements').returns(true);
        stub(Selectors, 'searchRequest');
        flux.clients = {
          bridge: {
            refinements: stub().resolves({ navigation: { name, refinements: ['c', 'd'] } })
          }
        };

        return action(dispatch, () => state)
          .then(() => {
            expect(extractRefinement).to.be.calledWith('c')
              .and.calledWith('d');
            expect(receiveMoreRefinements).to.be.calledWith(name, ['c', 'd'], []);
            expect(dispatch).to.be.calledWith(moreRefinementsAction);
          });
      });

      it('should apply selected refinements', () => {
        const name = 'brand';
        const state: any = { a: 'b' };
        const moreRefinementsAction = { e: 'f' };
        const action = actions.fetchMoreRefinements(name);
        const dispatch = spy();
        const extractRefinement = stub(SearchAdapter, 'extractRefinement').callsFake((value) => value);
        const receiveMoreRefinements = stub(actions, 'receiveMoreRefinements').returns(moreRefinementsAction);
        stub(SearchAdapter, 'refinementsMatch').returns(true);
        stub(Selectors, 'navigation').returns({ refinements: ['a', 'b', 'c'], selected: [1, 2] });
        stub(Selectors, 'hasMoreRefinements').returns(true);
        stub(Selectors, 'searchRequest');
        flux.clients = {
          bridge: {
            refinements: stub().resolves({ navigation: { name, refinements: ['c', 'd'] }, selected: [0, 3] })
          }
        };

        return action(dispatch, () => state)
          .then(() => {
            expect(extractRefinement).to.be.calledWith('c')
              .and.calledWith('d');
            expect(receiveMoreRefinements).to.be.calledWith(name, ['c', 'd'], [0, 1]);
            expect(dispatch).to.be.calledWith(moreRefinementsAction);
          });
      });

      it('should catch error and clear fetching flag', () => {
        const moreRefinementsAction = { e: 'f' };
        const action = actions.fetchMoreRefinements('brand');
        const dispatch = spy();
        const receiveMoreRefinements = stub(actions, 'receiveMoreRefinements').returns(moreRefinementsAction);
        stub(Selectors, 'searchRequest');
        stub(Selectors, 'hasMoreRefinements').returns(true);
        flux.clients = { bridge: { refinements: () => Promise.reject('') } };

        return action(dispatch, () => <any>({}))
          .then(() => {
            expect(receiveMoreRefinements).to.be.calledWith(null, [], []);
            expect(dispatch).to.be.calledWith(moreRefinementsAction);
          });
      });
    });

    describe('fetchProducts()', () => {
      it('should return a thunk', () => {
        const thunk = actions.fetchProducts();

        expect(thunk).to.be.a('function');
      });

      it('should call flux.clients.bridge.search()', () => {
        const request = { a: 'b' };
        const response = { c: 'd' };
        const state: any = { isFetching: {} };
        const receiveSearchResponseAction = () => null;
        const dispatch = spy();
        const search = stub().resolves(response);
        const searchRequest = stub(Selectors, 'searchRequest').returns(request);
        const receiveSearchResponse = stub(actions, 'receiveSearchResponse').returns(receiveSearchResponseAction);
        const action = actions.fetchProducts();
        flux.clients = { bridge: { search } };

        return action(dispatch, () => state)
          .then(() => {
            expect(searchRequest).to.be.calledWith(state);
            expect(search).to.be.calledWith(request);
            expect(receiveSearchResponse).to.be.calledWith(response);
            expect(dispatch).to.be.calledWith(receiveSearchResponseAction);
          });
      });

      it('should catch error and clear fetching flag', () => {
        const products = ['e', 'f', 'g'];
        const state: any = { isFetching: {} };
        const receiveProductsAction = () => null;
        const dispatch = spy();
        const selectProducts = stub(Selectors, 'products').returns(products);
        const receiveProducts = stub(actions, 'receiveProducts').returns(receiveProductsAction);
        const action = actions.fetchProducts();
        stub(Selectors, 'searchRequest');
        flux.clients = { bridge: { search: () => Promise.reject('') } };

        return action(dispatch, () => state)
          .then(() => {
            expect(selectProducts).to.be.calledWith(state);
            expect(receiveProducts).to.be.calledWith(products);
            expect(dispatch).to.be.calledWith(receiveProductsAction);
          });
      });
    });

    describe('fetchMoreProducts()', () => {
      it('should return a thunk', () => {
        const thunk = actions.fetchMoreProducts(10);

        expect(thunk).to.be.a('function');
      });

      it('should not fetch if already fetching', () => {
        const state = { a: 'b', isFetching: { moreProducts: true } };
        const dispatch = spy();
        const getStore = spy(() => state);
        const action = actions.fetchMoreProducts(20);

        action(dispatch, getStore);

        expect(getStore).to.be.called;
        expect(dispatch).to.not.be.called;
      });

      it('should fetch more products', () => {
        const request = { a: 'b' };
        const response = { c: 'd' };
        const amount = 5;
        const products = [1, 2, 3, 4, 5];
        const state: any = { a: 'b', isFetching: { moreProducts: false } };
        const moreProductsAction = { e: 'f' };
        const soFetchingAction = { g: 'h' };
        const dispatch = spy();
        const getStore = spy(() => state);
        const search = stub().resolves(response);
        const searchRequest = stub(Selectors, 'searchRequest').returns(request);
        const receiveMoreProducts = stub(actions, 'receiveMoreProducts').returns(moreProductsAction);
        const action = actions.fetchMoreProducts(amount);
        const soFetching = stub(actions, 'soFetching').returns(soFetchingAction);
        const extractProducts = stub(AutocompleteAdapter, 'extractProducts').callsFake((s) => s);
        stub(Selectors, 'products').returns(products);
        flux.clients = { bridge: { search } };

        return action(dispatch, getStore)
          .then(() => {
            expect(search).to.be.calledWith({ ...request, pageSize: amount, skip: products.length });
            expect(soFetching).to.be.calledWith('moreProducts');
            expect(searchRequest).to.be.calledWith(state);
            expect(extractProducts).to.be.calledWith(response);
            expect(dispatch).to.be.calledTwice
              .and.calledWith(soFetchingAction)
              .and.calledWith(moreProductsAction);
          });
      });

      it('should catch error and clear fetching flag', () => {
        const request = { a: 'b' };
        const response = { c: 'd' };
        const moreProductsAction = { e: 'f' };
        const state: any = { a: 'b', isFetching: { moreProducts: false } };
        const dispatch = spy();
        const receiveMoreProducts = stub(actions, 'receiveMoreProducts').returns(moreProductsAction);
        const action = actions.fetchMoreProducts(5);
        stub(Selectors, 'searchRequest').returns(request);
        stub(actions, 'soFetching');
        stub(Selectors, 'products').returns([]);
        flux.clients = { bridge: { search: () => Promise.reject('') } };

        return action(dispatch, () => state)
          .then(() => {
            expect(receiveMoreProducts).to.be.calledWith([]);
            expect(dispatch).to.be.calledWith(moreProductsAction);
          });
      });
    });

    describe('fetchAutocompleteSuggestions()', () => {
      it('should return a thunk', () => {
        const thunk = actions.fetchAutocompleteSuggestions('', {});

        expect(thunk).to.be.a('function');
      });

      it('should call flux.clients.sayt.autocomplete()', () => {
        const query = 'red app';
        const config = { a: 'b' };
        const response = { c: 'd' };
        const suggestions = ['e', 'f'];
        const categoryValues = ['g', 'h'];
        const receiveAutocompleteSuggestionsAction = () => null;
        const dispatch = spy();
        const autocomplete = stub().resolves(response);
        const extractAutocompleteSuggestions = stub(AutocompleteAdapter, 'extractSuggestions')
          .returns({ suggestions, categoryValues });
        const receiveAutocompleteSuggestions = stub(actions, 'receiveAutocompleteSuggestions')
          .returns(receiveAutocompleteSuggestionsAction);
        const action = actions.fetchAutocompleteSuggestions(query, config);
        flux.clients = { sayt: { autocomplete } };

        return action(dispatch, () => <any>({ data: { autocomplete: { category: { field: 'brand' } } } }))
          .then(() => {
            expect(autocomplete).to.be.calledWith(query, config);
            expect(extractAutocompleteSuggestions).to.be.calledWith(response);
            expect(receiveAutocompleteSuggestions).to.be.calledWith(suggestions, categoryValues);
            expect(dispatch).to.be.calledWith(receiveAutocompleteSuggestionsAction);
          });
      });

      it('should catch error and clear fetching flag', () => {
        const receiveAutocompleteSuggestionsAction = () => null;
        const dispatch = spy();
        const receiveAutocompleteSuggestions = stub(actions, 'receiveAutocompleteSuggestions')
          .returns(receiveAutocompleteSuggestionsAction);
        const action = actions.fetchAutocompleteSuggestions('red app', {});
        flux.clients = { sayt: { autocomplete: () => Promise.reject('') } };

        return action(dispatch, () => <any>({ data: { autocomplete: { category: { field: 'brand' } } } }))
          .then(() => {
            expect(receiveAutocompleteSuggestions).to.be.calledWith([], [], []);
            expect(dispatch).to.be.calledWith(receiveAutocompleteSuggestionsAction);
          });
      });
    });

    describe('fetchAutocompleteProducts()', () => {
      it('should return a thunk', () => {
        const thunk = actions.fetchAutocompleteProducts('', {});

        expect(thunk).to.be.a('function');
      });

      it('should call flux.sayt.productSearch()', () => {
        const query = 'red app';
        const config = { a: 'b' };
        const response = { c: 'd' };
        const products = ['e', 'f'];
        const receiveAutocompleteProductsAction = () => null;
        const dispatch = spy();
        const productSearch = stub().resolves(response);
        const extractAutocompleteProducts = stub(AutocompleteAdapter, 'extractProducts').returns(products);
        const receiveAutocompleteProducts = stub(actions, 'receiveAutocompleteProducts')
          .returns(receiveAutocompleteProductsAction);
        const action = actions.fetchAutocompleteProducts(query, config);
        flux.clients = { sayt: { productSearch } };

        return action(dispatch)
          .then(() => {
            expect(productSearch).to.be.calledWith(query, config);
            expect(extractAutocompleteProducts).to.be.calledWith(response);
            expect(receiveAutocompleteProducts).to.be.calledWith(products);
            expect(dispatch).to.be.calledWith(receiveAutocompleteProductsAction);
          });
      });

      it('should catch error and clear fetching flag', () => {
        const receiveAutocompleteProductsAction = () => null;
        const dispatch = spy();
        const receiveAutocompleteProducts = stub(actions, 'receiveAutocompleteProducts')
          .returns(receiveAutocompleteProductsAction);
        const action = actions.fetchAutocompleteProducts('red app', {});
        flux.clients = { sayt: { productSearch: () => Promise.reject('') } };

        return action(dispatch)
          .then(() => {
            expect(receiveAutocompleteProducts).to.be.calledWith([]);
            expect(dispatch).to.be.calledWith(receiveAutocompleteProductsAction);
          });
      });
    });

    describe('fetchCollectionCount()', () => {
      it('should return a thunk', () => {
        const thunk = actions.fetchCollectionCount('');

        expect(thunk).to.be.a('function');
      });

      it('should call flux.clients.bridge.search()', () => {
        const collection = 'department';
        const state = { a: 'b' };
        const response = { c: 'd' };
        const recordCount = 10293;
        const dispatch = spy();
        const getStore = spy(() => state);
        const search = stub().resolves(response);
        const action = actions.fetchCollectionCount(collection);
        const searchRequest = stub(Selectors, 'searchRequest').returns(state);
        const receiveCollectionCount = stub(actions, 'receiveCollectionCount').returns(response);
        const extractRecordCount = stub(SearchAdapter, 'extractRecordCount').returns(recordCount);
        flux.clients = { bridge: { search } };

        return action(dispatch, getStore)
          .then(() => {
            expect(search).to.be.calledWith({ ...state, collection });
            expect(receiveCollectionCount).to.be.calledWith(collection, recordCount);
            expect(extractRecordCount).to.be.calledWith(response);
          });
      });

      describe('fetchProductDetails()', () => {
        it('should return a thunk', () => {
          const thunk = actions.fetchProductDetails('');

          expect(thunk).to.be.a('function');
        });

        it('should call flux.clients.bridge.search()', () => {
          const id = '1923';
          const state = { a: 'b' };
          const allMeta = 'hey';
          const response = { c: 'd', records: [{ allMeta }] };
          const detailsProduct = '10293';
          const dispatch = spy();
          const getStore = spy(() => state);
          const search = stub().resolves(response);
          const action = actions.fetchProductDetails(id);
          const searchRequest = stub(Selectors, 'searchRequest').returns(state);
          const receiveDetailsProduct = stub(actions, 'receiveDetailsProduct').returns(detailsProduct);
          flux.clients = { bridge: { search } };

          return action(dispatch, getStore)
            .then(() => {
              expect(search).to.be.calledWith({
                ...state,
                refinements: [{ navigationName: 'id', type: 'Value', value: id }]
              });
              expect(dispatch).to.be.calledWith(detailsProduct);
              expect(receiveDetailsProduct).to.be.calledWith(allMeta);
            });
        });

        it('should catch error and clear fetching flag', () => {
          const detailsProduct = '10293';
          const dispatch = spy();
          const action = actions.fetchProductDetails('1923');
          const receiveDetailsProduct = stub(actions, 'receiveDetailsProduct').returns(detailsProduct);
          stub(Selectors, 'searchRequest').returns({});
          flux.clients = { bridge: { search: () => Promise.reject('') } };

          return action(dispatch, () => <any>({}))
            .then(() => {
              expect(dispatch).to.be.calledWith(detailsProduct);
              expect(receiveDetailsProduct).to.be.calledWith({});
            });
        });
      });
    });

    describe('request action creators', () => {
      describe('updateSearch()', () => {
        it('should create an UPDATE_SEARCH action', () => {
          const search: Actions.Search = { query: 'harry' };
          const dispatch = spy();

          actions.updateSearch(search)(dispatch);

          expect(dispatch).to.be.calledWith({ type: Actions.UPDATE_SEARCH, ...<any>search });
        });

        it('should not create an UPDATE_SEARCH action when query string is empty', () => {
          const search: Actions.Search = { query: '' };
          const dispatch = () => expect.fail();

          actions.updateSearch(search)(dispatch);
        });

        it('should trim query string', () => {
          const search: Actions.Search = { query: '\t  h  a  r\tr  y  \t' };
          const dispatch = spy();

          actions.updateSearch(search)(dispatch);

          expect(dispatch).to.be.calledWith({ type: Actions.UPDATE_SEARCH, query: 'h  a  r\tr  y' });
        });

        it('should not create an UPDATE_SEARCH action when query string only contains whitespace', () => {
          const search: Actions.Search = { query: '  \t  ' };
          const dispatch = () => expect.fail();

          actions.updateSearch(search)(dispatch);
        });

        it('should create an UPDATE_SEARCH action with null query', () => {
          const search: Actions.Search = { query: null };
          const dispatch = spy();

          actions.updateSearch(search)(dispatch);

          expect(dispatch).to.be.calledWith({ type: Actions.UPDATE_SEARCH, query: null });
        });
      });

      describe('selectRefinement()', () => {
        it('should create a SELECT_REFINEMENT action', () => {
          const navigationId = 'brand';
          const index = 3;
          const state = { a: 'b' };
          const conditional = stub(utils, 'conditional');
          const isRefinementDeselected = stub(Selectors, 'isRefinementDeselected');

          actions.selectRefinement(navigationId, index);

          expect(conditional).to.be.calledWith(sinon.match((predicate) => {
            predicate(state);
            return expect(isRefinementDeselected.calledWith(state, navigationId, index)).to.be.true;
          }), Actions.SELECT_REFINEMENT, { navigationId, index });
        });
      });

      describe('deselectRefinement()', () => {
        it('should create a DESELECT_REFINEMENT action', () => {
          const navigationId = 'brand';
          const index = 3;
          const state = { a: 'b' };
          const conditional = stub(utils, 'conditional');
          const isRefinementSelected = stub(Selectors, 'isRefinementSelected');

          actions.deselectRefinement(navigationId, index);

          expect(conditional).to.be.calledWith(sinon.match((predicate) => {
            predicate(state);
            return expect(isRefinementSelected.calledWith(state, navigationId, index)).to.be.true;
          }), Actions.DESELECT_REFINEMENT, { navigationId, index });
        });
      });

      describe('selectCollection()', () => {
        it('should create a SELECT_COLLECTION action', () => {
          const id = 'products';
          const conditional = stub(utils, 'conditional');

          actions.selectCollection(id);

          expect(conditional).to.be.calledWith(sinon.match((predicate) =>
            predicate({ data: { collections: { selected: 'tutorials' } } })),
            Actions.SELECT_COLLECTION, { id });
        });
      });

      describe('updateSorts()', () => {
        it('should create a UPDATE_SORTS action', () => {
          const index = 1;
          const conditional = stub(utils, 'conditional');

          actions.selectSort(index);

          expect(conditional).to.be.calledWith(sinon.match((predicate) =>
            predicate({ data: { sorts: { selected: 2 } } })),
            Actions.SELECT_SORT, { index });
        });
      });

      describe('updatePageSize()', () => {
        it('should create an UPDATE_PAGE_SIZE action', () => {
          const size = 34;
          const conditional = stub(utils, 'conditional');

          actions.updatePageSize(size);

          expect(conditional).to.be.calledWith(sinon.match((predicate) =>
            predicate({ data: { page: { sizes: { items: [10, 20, 80], selected: 20 } } } })),
            Actions.UPDATE_PAGE_SIZE, { size });
        });
      });

      describe('updateCurrentPage()', () => {
        it('should create an UPDATE_CURRENT_PAGE action', () => {
          const page = 4;
          const conditional = stub(utils, 'conditional');

          actions.updateCurrentPage(page);

          expect(conditional).to.be.calledWith(sinon.match((predicate) =>
            predicate({ data: { page: { current: 3 } } })),
            Actions.UPDATE_CURRENT_PAGE, { page });
        });
      });

      describe('updateDetailsId()', () => {
        it('should create an UPDATE_CURRENT_PAGE action', () => {
          const id = '123';
          const thunk = stub(utils, 'thunk');

          actions.updateDetailsId(id);

          expect(thunk).to.be.calledWith(Actions.UPDATE_DETAILS_ID, { id });
        });
      });

      describe('updateAutocompleteQuery()', () => {
        it('should create an UPDATE_AUTOCOMPLETE_QUERY action', () => {
          const query = 'William Shake';
          const conditional = stub(utils, 'conditional');

          actions.updateAutocompleteQuery(query);

          expect(conditional).to.be.calledWith(sinon.match((predicate) =>
            predicate({ data: { autocomplete: { query: 'Fred Flinsto' } } })),
            Actions.UPDATE_AUTOCOMPLETE_QUERY, { query });
        });
      });

      describe('refreshState()', () => {
        it('should create a REFRESH_STATE action', () => {
          const state = { a: 'b' };

          expect(actions.refreshState(state)).to.eql({
            type: Actions.REFRESH_STATE,
            state
          });
        });
      });
    });

    describe('response action creators', () => {
      describe('receiveSearchResponse()', () => {
        it('should return a thunk', () => {
          const results: any = {};

          const thunk = actions.receiveSearchResponse(results);

          expect(thunk).to.be.a('function');
        });

        it('should dispatch actions', () => {
          const receiveRedirectAction = () => null;
          const receiveQueryAction = () => null;
          const receiveProductsAction = () => null;
          const receiveNavigationsAction = () => null;
          const receivePageAction = () => null;
          const receiveTemplateAction = () => null;
          const receiveCollectionCountAction = () => null;
          const linkMapper = actions['linkMapper'] = () => null;
          const results: any = {
            records: [
              { allMeta: { u: 'v' } },
              { allMeta: { w: 'x' } },
            ],
            redirect: 'page.html',
            template: { m: 'n' },
            totalRecordCount: 41,
          };
          const query: any = { y: 'z' };
          const navigations: any[] = ['a', 'b'];
          const page: any = { p: 'q' };
          const template: any = { c: 'd' };
          const state: any = { data: { collections: { selected: 'products' } } };
          const getStore = () => state;
          const dispatch = spy();
          const extractQuery = stub(SearchAdapter, 'extractQuery').returns(query);
          const combineNavigations = stub(SearchAdapter, 'combineNavigations').returns(navigations);
          const extractProduct = stub(SearchAdapter, 'extractProduct').returns('x');
          const extractPage = stub(SearchAdapter, 'extractPage').returns(page);
          const extractTemplate = stub(SearchAdapter, 'extractTemplate').returns(template);
          const receiveRedirect = stub(actions, 'receiveRedirect').returns(receiveRedirectAction);
          const receiveQuery = stub(actions, 'receiveQuery').returns(receiveQueryAction);
          const receiveProducts = stub(actions, 'receiveProducts').returns(receiveProductsAction);
          const receiveNavigations = stub(actions, 'receiveNavigations').returns(receiveNavigationsAction);
          const receivePage = stub(actions, 'receivePage').returns(receivePageAction);
          const receiveTemplate = stub(actions, 'receiveTemplate').returns(receiveTemplateAction);
          const receiveCollectionCount = stub(actions, 'receiveCollectionCount').returns(receiveCollectionCountAction);
          const thunk = actions.receiveSearchResponse(results);

          thunk(dispatch, getStore);

          expect(receiveRedirect).to.be.calledWith(results.redirect);
          expect(dispatch).to.be.calledWith(receiveRedirectAction);
          expect(receiveQuery).to.be.calledWith(query);
          expect(extractQuery).to.be.calledWith(results, linkMapper);
          expect(dispatch).to.be.calledWith(receiveQueryAction);
          expect(receiveProducts).to.be.calledWith(['x', 'x']);
          expect(extractProduct).to.be.calledWith({ allMeta: { u: 'v' } })
            .and.calledWith({ allMeta: { w: 'x' } });
          expect(dispatch).to.be.calledWith(receiveProductsAction);
          expect(receiveNavigations).to.be.calledWith(navigations);
          expect(combineNavigations).to.be.calledWith(results);
          expect(dispatch).to.be.calledWith(receiveNavigationsAction);
          expect(receivePage).to.be.calledWith(page);
          expect(extractPage).to.be.calledWith(state);
          expect(dispatch).to.be.calledWith(receivePageAction);
          expect(receiveTemplate).to.be.calledWith(template);
          expect(extractTemplate).to.be.calledWith(results.template);
          expect(dispatch).to.be.calledWith(receiveTemplateAction);
          expect(receiveCollectionCount).to.be.calledWith(state.data.collections.selected, results.totalRecordCount);
          expect(dispatch).to.be.calledWith(receiveCollectionCountAction);
        });
      });

      describe('receiveQuery()', () => {
        it('should create a RECEIVE_QUERY action', () => {
          const query: any = { a: 'b' };
          const thunk = stub(utils, 'thunk');

          actions.receiveQuery(query);

          expect(thunk).to.be.calledWith(Actions.RECEIVE_QUERY, query);
        });
      });

      describe('receiveProducts()', () => {
        it('should create a RECEIVE_PRODUCTS action', () => {
          const products: any = ['a', 'b'];
          const thunk = stub(utils, 'thunk');

          actions.receiveProducts(products);

          expect(thunk).to.be.calledWith(Actions.RECEIVE_PRODUCTS, { products });
        });
      });

      describe('receiveCollectionCount()', () => {
        it('should create a RECEIVE_NAVIGATIONS action', () => {
          const collection = 'products';
          const count = 10;
          const thunk = stub(utils, 'thunk');

          actions.receiveCollectionCount(collection, count);

          expect(thunk).to.be.calledWith(Actions.RECEIVE_COLLECTION_COUNT, { collection, count });
        });
      });

      describe('receiveNavigations()', () => {
        it('should create a RECEIVE_NAVIGATIONS action', () => {
          const navigations: any[] = ['a', 'b'];
          const thunk = stub(utils, 'thunk');

          actions.receiveNavigations(navigations);

          expect(thunk).to.be.calledWith(Actions.RECEIVE_NAVIGATIONS, { navigations });
        });
      });

      describe('receivePage()', () => {
        it('should create a RECEIVE_PAGE action', () => {
          const page: any = { a: 'b' };
          const thunk = stub(utils, 'thunk');

          actions.receivePage(page);

          expect(thunk).to.be.calledWith(Actions.RECEIVE_PAGE, page);
        });
      });

      describe('receiveTemplate()', () => {
        it('should create a RECEIVE_PAGE action', () => {
          const template: any = { a: 'b' };
          const thunk = stub(utils, 'thunk');

          actions.receiveTemplate(template);

          expect(thunk).to.be.calledWith(Actions.RECEIVE_TEMPLATE, { template });
        });
      });

      describe('receiveRedirect()', () => {
        it('should create a RECEIVE_PAGE action', () => {
          const redirect = 'page.html';
          const thunk = stub(utils, 'thunk');

          actions.receiveRedirect(redirect);

          expect(thunk).to.be.calledWith(Actions.RECEIVE_REDIRECT, { redirect });
        });
      });

      describe('receiveMoreRefinements()', () => {
        it('should create a RECEIVE_MORE_REFINEMENTS action', () => {
          const navigationId = 'brand';
          const refinements: any[] = ['a', 'b'];
          const selected = [1, 7];
          const thunk = stub(utils, 'thunk');

          actions.receiveMoreRefinements(navigationId, refinements, selected);

          expect(thunk).to.be.calledWith(Actions.RECEIVE_MORE_REFINEMENTS, { navigationId, refinements, selected });
        });
      });

      describe('receiveAutocompleteSuggestions()', () => {
        it('should create a RECEIVE_AUTOCOMPLETE_SUGGESTIONS action', () => {
          const suggestions = ['a', 'b'];
          const categoryValues = ['c', 'd'];
          const navigations: any[] = ['e', 'f'];
          const thunk = stub(utils, 'thunk');

          actions.receiveAutocompleteSuggestions(suggestions, categoryValues, navigations);

          expect(thunk).to.be.calledWith(Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS, {
            suggestions,
            categoryValues,
            navigations
          });
        });
      });

      describe('receiveMoreProducts()', () => {
        it('should create a RECEIVE_MORE_PRODUCTS action', () => {
          const products: any[] = ['a', 'b'];
          const thunk = stub(utils, 'thunk');

          actions.receiveMoreProducts(products);

          expect(thunk).to.be.calledWith(Actions.RECEIVE_MORE_PRODUCTS, { products });
        });
      });

      describe('receiveAutocompleteProducts()', () => {
        it('should create a RECEIVE_AUTOCOMPLETE_PRODUCTS action', () => {
          const products: any[] = ['a', 'b'];
          const thunk = stub(utils, 'thunk');

          actions.receiveAutocompleteProducts(products);

          expect(thunk).to.be.calledWith(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, { products });
        });
      });

      describe('receiveDetailsProduct()', () => {
        it('should create a RECEIVE_DETAILS_PRODUCT action', () => {
          const product: any = { a: 'b' };
          const thunk = stub(utils, 'thunk');

          actions.receiveDetailsProduct(product);

          expect(thunk).to.be.calledWith(Actions.RECEIVE_DETAILS_PRODUCT, { product });
        });
      });

      describe('createComponentState()', () => {
        it('should create a CREATE_COMPONENT_STATE action', () => {
          const tagName = 'my-tag';
          const id = '123';
          const state = { a: 'b' };
          const thunk = stub(utils, 'thunk');

          actions.createComponentState(tagName, id, state);

          expect(thunk).to.be.calledWith(Actions.CREATE_COMPONENT_STATE, { tagName, id, state });
        });
      });

      describe('removeComponentState()', () => {
        it('should create a CREATE_COMPONENT_STATE action', () => {
          const tagName = 'my-tag';
          const id = '123';
          const thunk = stub(utils, 'thunk');

          actions.removeComponentState(tagName, id);

          expect(thunk).to.be.calledWith(Actions.REMOVE_COMPONENT_STATE, { tagName, id });
        });
      });
    });
  });
});
