import * as sinon from 'sinon';
import createActions from '../../../src/core/action-creator';
import Actions from '../../../src/core/actions';
import SearchAdapter from '../../../src/core/adapters/search';
import Selectors from '../../../src/core/selectors';
import * as utils from '../../../src/core/utils';
import * as validators from '../../../src/core/validators';
import FluxCapacitor from '../../../src/flux-capacitor';
import suite from '../_suite';

const ACTION = { y: 'z' };

suite('ActionCreator', ({ expect, spy, stub }) => {
  let actions: typeof FluxCapacitor.prototype.actions;
  let flux: any;

  beforeEach(() => actions = createActions(flux = <any>{})(() => null));

  // tslint:disable-next-line max-line-length
  function expectAction<T>(fn: () => Actions.Action<T, any> | Actions.Action<T, any>[], type: T, payload?: any) {
    const createAction = stub(utils, 'action').returns(ACTION);

    const action = fn();

    if (Array.isArray(action)) {
      action.forEach((subAction) => expect(subAction).to.eq(ACTION));
    } else {
      expect(action).to.eq(ACTION);
    }
    expect(createAction).to.be.calledWithExactly(type, payload, sinon.match.any);
  }

  // tslint:disable-next-line max-line-length
  function expectValidators<T>(fn: () => Actions.Action<T, any> | Actions.Action<T, any>[], type: T, validator: object) {
    const createAction = stub(utils, 'action').returns(ACTION);

    fn();

    const args: any[] = [type, sinon.match.any];
    args.push(sinon.match((meta) => Object.keys(validator)
      .reduce((allValid, key) => {
        if (Array.isArray(validator[key]) !== Array.isArray(meta.validator[key])) {
          return false;
        } else if (Array.isArray(validator[key])) {
          return allValid && meta.validator[key]
            .reduce((valid, subValidator, index) => valid && subValidator === validator[key][index], true);
        } else {
          return allValid && validator[key] === meta.validator[key];
        }
      }, true)));
    expect(createAction).to.be.calledWithExactly(...args);
  }

  describe('application action creators', () => {
    const state = { c: 'd' };

    describe('refreshState()', () => {
      it('should return state with type REFRESH_STATE', () => {
        const created = { f: 'g' };
        const createAction = stub(utils, 'action').returns(created);

        const action = actions.refreshState(state);

        expect(createAction).to.be.calledWith(Actions.REFRESH_STATE, state);
        expect(action).to.eq(created);
      });
    });
  });

  describe('fetch action creators', () => {
    describe('fetchMoreRefinements()', () => {
      it('should return an action', () => {
        const navigationId = 'brand';

        expectAction(() => actions.fetchMoreRefinements(navigationId), Actions.FETCH_MORE_REFINEMENTS, navigationId);
      });
    });

    describe('fetchProducts()', () => {
      it('should return an action', () => {
        expectAction(() => actions.fetchProducts(), Actions.FETCH_PRODUCTS, null);
      });
    });

    describe('fetchMoreProducts()', () => {
      it('should return an action', () => {
        const amount = 15;

        expectAction(() => actions.fetchMoreProducts(amount), Actions.FETCH_MORE_PRODUCTS, amount);
      });
    });

    describe('fetchAutocompleteSuggestions()', () => {
      it('should return an action', () => {
        const query = 'barbie';

        expectAction(() => actions.fetchAutocompleteSuggestions(query), Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, query);
      });
    });

    describe('fetchAutocompleteProducts()', () => {
      it('should return an action', () => {
        const query = 'barbie';
        const refinements: any[] = ['a', 'b'];

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.fetchAutocompleteProducts(query, refinements), Actions.FETCH_AUTOCOMPLETE_PRODUCTS, { query, refinements });
      });

      it('should default to an empty array of refinements', () => {
        const query = 'barbie';

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.fetchAutocompleteProducts(query), Actions.FETCH_AUTOCOMPLETE_PRODUCTS, { query, refinements: [] });
      });
    });

    describe('fetchCollectionCount()', () => {
      it('should return an action', () => {
        const collection = 'products';

        expectAction(() => actions.fetchCollectionCount(collection), Actions.FETCH_COLLECTION_COUNT, collection);
      });
    });

    describe('fetchProductDetails()', () => {
      it('should return an action', () => {
        const id = '12345';

        expectAction(() => actions.fetchProductDetails(id), Actions.FETCH_PRODUCT_DETAILS, id);
      });
    });

    describe('fetchRecommendationsProducts()', () => {
      it('should return an action', () => {
        expectAction(() => actions.fetchRecommendationsProducts(), Actions.FETCH_RECOMMENDATIONS_PRODUCTS, null);
      });
    });
  });

  describe('request action creators', () => {
    describe('updateSearch()', () => {
      const resetPageAction = { m: 'n' };

      beforeEach(() => actions.resetPage = spy(() => resetPageAction));

      it('should return a bulk action', () => {
        const batchAction = actions.updateSearch({});

        expect(batchAction).to.eql([resetPageAction]);
      });

      it('should return a bulk action with UPDATE_QUERY', () => {
        const query = 'q';
        const updateQuery = stub(actions, 'updateQuery').returns([ACTION]);

        const batchAction = actions.updateSearch({ query });

        expect(batchAction).to.eql([resetPageAction, ACTION]);
        expect(updateQuery).to.be.calledWithExactly(query);
      });

      it('should return a bulk action with RESET_REFINEMENTS', () => {
        flux.store = { getState: () => null };
        const clear = 'q';
        const shouldResetRefinements = stub(utils, 'shouldResetRefinements').returns(true);
        const resetRefinements = stub(actions, 'resetRefinements').returns([ACTION]);

        const batchAction = actions.updateSearch({ clear });

        expect(batchAction).to.eql([resetPageAction, ACTION]);
        expect(shouldResetRefinements).to.be.calledWithExactly({ clear }, null);
      });

      it('should return a bulk action with SELECT_REFINEMENT', () => {
        const navigationId = 'color';
        const index = 4;
        const selectRefinement = stub(actions, 'selectRefinement').returns([ACTION]);

        const batchAction = actions.updateSearch({ navigationId, index });

        expect(batchAction).to.eql([resetPageAction, ACTION]);
        expect(selectRefinement).to.be.calledWithExactly(navigationId, index);
      });

      it('should return a bulk action with value ADD_REFINEMENT', () => {
        const navigationId = 'color';
        const value = 'blue';
        const addRefinement = stub(actions, 'addRefinement').returns([ACTION]);

        const batchAction = actions.updateSearch({ navigationId, value });

        expect(batchAction).to.eql([resetPageAction, ACTION]);
        expect(addRefinement).to.be.calledWithExactly(navigationId, value);
      });

      it('should return a bulk action with range ADD_REFINEMENT', () => {
        const navigationId = 'color';
        const range = true;
        const low = 1;
        const high = 2;
        const addRefinement = stub(actions, 'addRefinement').returns([ACTION]);

        const batchAction = actions.updateSearch({ navigationId, range, low, high });

        expect(batchAction).to.eql([resetPageAction, ACTION]);
        expect(addRefinement).to.be.calledWithExactly(navigationId, low, high);
      });

      it('should return a bulk action without ADD_REFINEMENT', () => {
        const batchAction = actions.updateSearch({ navigationId: 'truthy' });

        expect(batchAction).to.eql([resetPageAction]);
      });
    });

    describe('updateQuery()', () => {
      const query = 'rambo';

      it('should return a batch action with RESET_PAGE', () => {
        expectAction(() => actions.updateQuery(query), Actions.RESET_PAGE);
      });

      it('should return a batch action with UPDATE_QUERY', () => {
        expectAction(() => actions.updateQuery(query), Actions.UPDATE_QUERY, query);
      });

      it('should apply validators to UPDATE_QUERY', () => {
        expectValidators(() => actions.updateQuery(query), Actions.UPDATE_QUERY, {
          payload: [
            validators.isValidQuery,
            validators.isDifferentQuery
          ]
        });
      });
    });

    describe('resetQuery()', () => {
      it('should call updateQuery()', () => {
        const updateQuery = actions.updateQuery = spy(() => ACTION);

        expect(actions.resetQuery()).to.eq(ACTION);
        expect(updateQuery).to.be.calledWithExactly(null);
      });
    });

    describe('resetRefinements()', () => {
      const field = 'brand';

      it('should return a batch action with RESET_PAGE', () => {
        expectAction(() => actions.resetRefinements(field), Actions.RESET_PAGE);
      });

      it('should return a batch action with RESET_REFINEMENTS', () => {
        expectAction(() => actions.resetRefinements(field), Actions.RESET_REFINEMENTS, field);
      });

      it('should apply validators to RESET_REFINEMENTS', () => {
        expectValidators(() => actions.resetRefinements(field), Actions.RESET_REFINEMENTS, {
          payload: [
            validators.isValidClearField,
            validators.hasSelectedRefinements,
            validators.hasSelectedRefinementsByField
          ]
        });
      });
    });

    describe('resetPage()', () => {
      it('should return an action', () => {
        expectAction(() => actions.resetPage(), Actions.RESET_PAGE, undefined);
      });

      it('should apply validators to action', () => {
        expectValidators(() => actions.resetPage(), Actions.RESET_PAGE, {
          payload: validators.notOnFirstPage
        });
      });
    });

    describe('addRefinement()', () => {
      const navigationId = 'book';
      const refinement = { c: 'd' };
      const rangeRefinement = { range: true };

      it('should return a batch action with RESET_PAGE', () => {
        expectAction(() => actions.addRefinement(navigationId, null), Actions.RESET_PAGE);
      });

      it('should return an action with value refinement', () => {
        const value = 'a';
        const refinementPayload = stub(utils, 'refinementPayload').returns(refinement);

        expectAction(() => actions.addRefinement(navigationId, value), Actions.ADD_REFINEMENT, refinement);
        expect(refinementPayload).to.be.calledWithExactly(navigationId, value, null);
      });

      it('should return an action with range refinement', () => {
        const low = 2;
        const high = 4;
        const refinementPayload = stub(utils, 'refinementPayload').returns(refinement);

        expectAction(() => actions.addRefinement(navigationId, low, high), Actions.ADD_REFINEMENT, refinement);
        expect(refinementPayload).to.be.calledWithExactly(navigationId, low, high);
      });

      it('should apply validators to ADD_REFINEMENT', () => {
        expectValidators(() => actions.addRefinement(null, null), Actions.ADD_REFINEMENT, {
          navigationId: validators.isString,
          payload: [
            validators.isRangeRefinement,
            validators.isValidRange,
            validators.isValueRefinement,
            validators.isNotFullRange,
            validators.isRefinementDeselectedByValue
          ]
        });
      });
    });

    describe('switchRefinement()', () => {
      const navigationId = 'book';

      it('should clear the refinements and add a value refinement', () => {
        const value = 'a';
        const resetRefinementsReturn = 'reset';
        const addRefinementReturn = 'add';
        const resetPageReturn = 'page';

        const resetRefinements = stub(actions, 'resetRefinements').returns(resetRefinementsReturn);
        const addRefinement = stub(actions, 'addRefinement').returns(addRefinementReturn);
        stub(actions, 'resetPage').returns(resetPageReturn);

        const result = actions.switchRefinement(navigationId, value);

        expect(result).to.be.eql([
          resetPageReturn,
          resetRefinementsReturn,
          addRefinementReturn
        ]);
        expect(resetRefinements).to.be.calledWithExactly(navigationId);
        expect(addRefinement).to.be.calledWithExactly(navigationId, value, null);
      });

      it('should clear the refinements and add a range refinement', () => {
        const low = 10;
        const high = 24;
        const refinementPayload = stub(utils, 'refinementPayload');
        stub(actions, 'updateSearch');

        actions.switchRefinement(navigationId, low, high);

        expect(refinementPayload).to.be.calledWithExactly(navigationId, low, high);
      });
    });

    describe('search()', () => {
      it('should call actions.updateSearch()', () => {
        const query = 'pineapple';

        const resetRefinementsReturn = 'reset';
        const updateReturn = 'update';
        const resetPageReturn = 'page';

        const resetRefinements = stub(actions, 'resetRefinements').returns(resetRefinementsReturn);
        const updateQuery = stub(actions, 'updateQuery').returns(updateReturn);
        stub(actions, 'resetPage').returns(resetPageReturn);

        const result = actions.search(query);

        expect(result).to.be.eql([
          resetPageReturn,
          resetRefinementsReturn,
          updateReturn,
        ]);
        expect(resetRefinements).to.be.calledWithExactly(true);
        expect(updateQuery).to.be.calledWithExactly(query);
      });

      it('should fall back to current query', () => {
        const query = 'pineapple';

        const resetRefinementsReturn = 'reset';
        const updateReturn = 'update';
        const resetPageReturn = 'page';

        const resetRefinements = stub(actions, 'resetRefinements').returns(resetRefinementsReturn);
        const updateQuery = stub(actions, 'updateQuery').returns(updateReturn);
        const queryStub = stub(Selectors, 'query').returns(query);
        stub(actions, 'resetPage').returns(resetPageReturn);
        flux.store = { getState: () => null };

        const result = actions.search();

        expect(result).to.be.eql([
          resetPageReturn,
          resetRefinementsReturn,
          updateReturn,
        ]);
        expect(resetRefinements).to.be.calledWithExactly(true);
        expect(updateQuery).to.be.calledWithExactly(query);
      });
    });

    describe('resetRecall()', () => {
      const resetPageAction = { a: 'b' };
      const resetRefinementsAction = { c: 'd' };
      const updateQueryAction = { e: 'f' };

      it('should call search() if field not provided and return result of search()', () => {
        const ret = ['1'];
        const search = stub(actions, 'search').returns(ret);

        const batchAction = actions.resetRecall();

        expect(batchAction).to.eql(ret);
        expect(search).to.be.calledOnce;
      });

      it('should return bulk action with SELECT_REFINEMENT if field and index provided', () => {
        const field = 'color';
        const index = 8;
        const selectRefinementAction = { g: 'h' };
        const selectRefinement = stub(actions, 'selectRefinement').returns([selectRefinementAction]);
        const search = stub(actions, 'search').returns([
          resetPageAction,
          resetRefinementsAction,
          updateQueryAction,
        ]);

        const batchAction = actions.resetRecall('', { field, index });

        expect(batchAction).to.eql([
          resetPageAction,
          resetRefinementsAction,
          updateQueryAction,
          selectRefinementAction
        ]);
        expect(selectRefinement).to.be.calledWithExactly(field, index);
      });
    });

    describe('selectRefinement()', () => {
      const navigationId = 'colour';

      it('should return a batch action with RESET_PAGE', () => {
        expectAction(() => actions.selectRefinement(navigationId, null), Actions.RESET_PAGE);
      });

      it('should return a batch action with SELECT_REFINEMENT', () => {
        const index = 30;

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.selectRefinement(navigationId, index), Actions.SELECT_REFINEMENT, { navigationId, index });
      });

      it('should apply validators to SELECT_REFINEMENT', () => {
        expectValidators(() => actions.selectRefinement(navigationId, 30), Actions.SELECT_REFINEMENT, {
          payload: validators.isRefinementDeselectedByIndex
        });
      });
    });

    describe('deselectRefinement()', () => {
      const navigationId = 'colour';

      it('should return a batch action with RESET_PAGE', () => {
        expectAction(() => actions.deselectRefinement(navigationId, null), Actions.RESET_PAGE);
      });

      it('should return a batch action with DESELECT_REFINEMENT', () => {
        const index = 30;

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.deselectRefinement(navigationId, index), Actions.DESELECT_REFINEMENT, { navigationId, index });
      });

      it('should apply validators to DESELECT_REFINEMENT', () => {
        const index = 30;

        expectValidators(() => actions.deselectRefinement(navigationId, index), Actions.DESELECT_REFINEMENT, {
          payload: validators.isRefinementSelectedByIndex
        });
      });
    });

    describe('selectCollection()', () => {
      const collection = 'products';

      it('should return a SELECT_COLLECTION action', () => {
        expectAction(() => actions.selectCollection(collection), Actions.SELECT_COLLECTION, collection);
      });

      it('should apply validators to SELECT_COLLECTION', () => {
        expectValidators(() => actions.selectCollection(collection), Actions.SELECT_COLLECTION, {
          payload: validators.isCollectionDeselected
        });
      });
    });

    describe('selectSort()', () => {
      const index = 9;

      it('should return a SELECT_SORT action', () => {
        expectAction(() => actions.selectSort(index), Actions.SELECT_SORT, index);
      });

      it('should apply validators to SELECT_SORT', () => {
        expectValidators(() => actions.selectSort(index), Actions.SELECT_SORT, {
          payload: validators.isSortDeselected
        });
      });
    });

    describe('updatePageSize()', () => {
      const pageSize = 20;

      it('should return an UPDATE_PAGE_SIZE action', () => {
        expectAction(() => actions.updatePageSize(pageSize), Actions.UPDATE_PAGE_SIZE, pageSize);
      });

      it('should apply validators to UPDATE_PAGE_SIZE', () => {
        expectValidators(() => actions.updatePageSize(pageSize), Actions.UPDATE_PAGE_SIZE, {
          payload: validators.isDifferentPageSize
        });
      });
    });

    describe('updateCurrentPage()', () => {
      const page = 3;

      it('should return an UPDATE_CURRENT_PAGE action', () => {
        expectAction(() => actions.updateCurrentPage(page), Actions.UPDATE_CURRENT_PAGE, page);
      });

      it('should apply validators to UPDATE_CURRENT_PAGE', () => {
        expectValidators(() => actions.updateCurrentPage(page), Actions.UPDATE_CURRENT_PAGE, {
          payload: validators.isOnDifferentPage
        });
      });
    });

    describe('updateDetails()', () => {
      it('should return an action', () => {
        const product: any = { a: 'b' };

        expectAction(() => actions.updateDetails(product), Actions.UPDATE_DETAILS, product);
      });
    });

    describe('updateAutocompleteQuery()', () => {
      const query = 'pink elephant';

      it('should return an UPDATE_AUTOCOMPLETE_QUERY action', () => {
        expectAction(() => actions.updateAutocompleteQuery(query), Actions.UPDATE_AUTOCOMPLETE_QUERY, query);
      });

      it('should apply validators to UPDATE_AUTOCOMPLETE_QUERY', () => {
        expectValidators(() => actions.updateAutocompleteQuery(query), Actions.UPDATE_AUTOCOMPLETE_QUERY, {
          payload: validators.isDifferentAutocompleteQuery
        });
      });
    });
  });

  describe('response action creators', () => {
    describe('receiveProducts()', () => {
      it('should return a batch action', () => {
        const receiveQueryAction = { aa: 'bb' };
        const receiveProductRecordsAction = { cc: 'dd' };
        const receiveNavigationsAction = { ee: 'ff' };
        const receiveRecordCountAction = { gg: 'hh' };
        const receiveCollectionCountAction = { ii: 'jj' };
        const receivePageAction = { kk: 'll' };
        const receiveTemplateAction = { mm: 'nn' };
        const products = ['x', 'x'];
        const results: any = {};
        const query: any = { e: 'f' };
        const state: any = { g: 'h' };
        const action = { i: 'j' };
        const navigations: any[] = ['k', 'l'];
        const page: any = { m: 'n' };
        const template: any = { o: 'p' };
        const recordCount = 24;
        const collection = 'myProducts';
        const createAction = stub(utils, 'action').returns(action);
        const extractQuery = stub(SearchAdapter, 'extractQuery').returns(query);
        const combineNavigations = stub(SearchAdapter, 'combineNavigations').returns(navigations);
        const extractPage = stub(SearchAdapter, 'extractPage').returns(page);
        const extractTemplate = stub(SearchAdapter, 'extractTemplate').returns(template);
        const extractRecordCount = stub(SearchAdapter, 'extractRecordCount').returns(recordCount);
        const extractProducts = stub(SearchAdapter, 'extractProducts').returns(products);
        const selectCollection = stub(Selectors, 'collection').returns(collection);
        const receiveQuery = stub(actions, 'receiveQuery').returns(receiveQueryAction);
        const receiveProductRecords = stub(actions, 'receiveProductRecords').returns(receiveProductRecordsAction);
        const receiveNavigations = actions.receiveNavigations = spy(() => receiveNavigationsAction);
        const receiveRecordCount = stub(actions, 'receiveRecordCount').returns(receiveRecordCountAction);
        const receiveCollectionCount = actions.receiveCollectionCount = spy(() => receiveCollectionCountAction);
        const receivePage = stub(actions, 'receivePage').returns(receivePageAction);
        const receiveTemplate = actions.receiveTemplate = spy(() => receiveTemplateAction);
        flux.store = { getState: () => state };

        const batchAction = actions.receiveProducts(results);

        expect(createAction).to.be.calledWith(Actions.RECEIVE_PRODUCTS, results);
        expect(receiveQuery).to.be.calledWith(query);
        expect(receiveProductRecords).to.be.calledWith(['x', 'x']);
        expect(receiveNavigations).to.be.calledWith(navigations);
        expect(receiveRecordCount).to.be.calledWith(recordCount);
        expect(receiveTemplate).to.be.calledWith(template);
        expect(receiveCollectionCount).to.be.calledWith({ collection, count: recordCount });
        expect(receivePage).to.be.calledWith(page);
        expect(extractRecordCount).to.be.calledWith(results);
        expect(extractQuery).to.be.calledWith(results);
        expect(extractProducts).to.be.calledWith(results);
        expect(combineNavigations).to.be.calledWith(results);
        expect(selectCollection).to.be.calledWith(state);
        expect(extractPage).to.be.calledWith(state);
        expect(extractTemplate).to.be.calledWith(results.template);
        expect(batchAction).to.eql([
          action,
          receiveQueryAction,
          receiveProductRecordsAction,
          receiveNavigationsAction,
          receiveRecordCountAction,
          receiveCollectionCountAction,
          receivePageAction,
          receiveTemplateAction
        ]);
      });

      it('should return an action', () => {
        const results: any = { a: 'b' };
        const action = { error: true };
        const createAction = stub(utils, 'action').returns(action);

        const batchAction = actions.receiveProducts(results);

        expect(createAction).to.be.calledWith(Actions.RECEIVE_PRODUCTS, results);
        expect(batchAction).to.eql(action);
      });
    });

    describe('receiveQuery()', () => {
      it('should return an action', () => {
        const query: any = { a: 'b' };

        expectAction(() => actions.receiveQuery(query), Actions.RECEIVE_QUERY, query);
      });
    });

    describe('receiveProductRecords()', () => {
      it('should return an action', () => {
        const products: any = ['a', 'b'];

        expectAction(() => actions.receiveProductRecords(products), Actions.RECEIVE_PRODUCT_RECORDS, products);
      });
    });

    describe('receiveCollectionCount()', () => {
      it('should return an action', () => {
        const count = {
          collection: 'products',
          count: 10
        };

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.receiveCollectionCount(count), Actions.RECEIVE_COLLECTION_COUNT, count);
      });
    });

    describe('receiveNavigations()', () => {
      it('should return an action', () => {
        const navigations: any[] = ['a', 'b'];

        expectAction(() => actions.receiveNavigations(navigations), Actions.RECEIVE_NAVIGATIONS, navigations);
      });
    });

    describe('receivePage()', () => {
      it('should return an action', () => {
        const page: any = { a: 'b' };

        expectAction(() => actions.receivePage(page), Actions.RECEIVE_PAGE, page);
      });
    });

    describe('receiveTemplate()', () => {
      it('should return an action', () => {
        const template: any = { a: 'b' };

        expectAction(() => actions.receiveTemplate(template), Actions.RECEIVE_TEMPLATE, template);
      });
    });

    describe('receiveRecordCount()', () => {
      it('should return an action', () => {
        const recordCount = 49;

        expectAction(() => actions.receiveRecordCount(recordCount), Actions.RECEIVE_RECORD_COUNT, recordCount);
      });
    });

    describe('receiveRedirect()', () => {
      it('should return an action', () => {
        const redirect = 'page.html';

        expectAction(() => actions.receiveRedirect(redirect), Actions.RECEIVE_REDIRECT, redirect);
      });
    });

    describe('receiveMoreRefinements()', () => {
      it('should return an action', () => {
        const navigationId = 'brand';
        const refinements: any[] = ['a', 'b'];
        const selected = [1, 7];

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.receiveMoreRefinements(navigationId, refinements, selected), Actions.RECEIVE_MORE_REFINEMENTS, {
          navigationId,
          refinements,
          selected
        });
      });
    });

    describe('receiveAutocompleteSuggestions()', () => {
      it('should return an action', () => {
        const suggestions: any = { a: 'b' };

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.receiveAutocompleteSuggestions(suggestions), Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS, suggestions);
      });
    });

    describe('receiveMoreProducts()', () => {
      it('should return an action', () => {
        const products: any[] = ['a', 'b'];

        expectAction(() => actions.receiveMoreProducts(products), Actions.RECEIVE_MORE_PRODUCTS, products);
      });
    });

    describe('receiveAutocompleteProducts()', () => {
      it('should return a batch action', () => {
        const template: any = { a: 'b' };
        const response: any = { template };
        const products: any[] = ['c', 'd'];
        const receiveAutocompleteProductRecordsAction = { e: 'f' };
        const receiveAutocompleteTemplateAction = { g: 'h' };
        const action = { i: 'j' };
        const createAction = stub(utils, 'action').returns(action);
        const extractProducts = stub(SearchAdapter, 'extractProducts').returns(products);
        const extractTemplate = stub(SearchAdapter, 'extractTemplate').returns(template);
        // tslint:disable-next-line max-line-length
        const receiveAutocompleteProductRecords = stub(actions, 'receiveAutocompleteProductRecords').returns(receiveAutocompleteProductRecordsAction);
        const receiveAutocompleteTemplate = stub(actions, 'receiveAutocompleteTemplate').returns(receiveAutocompleteTemplateAction);

        const batchAction = actions.receiveAutocompleteProducts(response);

        expect(createAction).to.be.calledWith(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, response);
        expect(receiveAutocompleteProductRecords).to.be.calledWith(products);
        expect(receiveAutocompleteTemplate).to.be.calledWith(template);
        expect(batchAction).to.eql([
          action,
          receiveAutocompleteProductRecordsAction,
          receiveAutocompleteTemplateAction
        ]);
      });

      it('should return an action', () => {
        const results: any = {};
        const action = { a: 'b', error: true };
        const createAction = stub(utils, 'action').returns(action);

        const batchAction = actions.receiveAutocompleteProducts(results);

        expect(createAction).to.be.calledWith(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, results);
        expect(batchAction).to.eql(action);
      });
    });

    describe('receiveAutocompleteTemplate()', () => {
      it('should return an action', () => {
        const template: any = { a: 'b' };

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.receiveAutocompleteTemplate(template), Actions.RECEIVE_AUTOCOMPLETE_TEMPLATE, template);
      });
    });

    describe('receiveAutocompleteProductRecords()', () => {
      it('should return an action', () => {
        const products: any[] = ['a', 'b'];

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.receiveAutocompleteProductRecords(products), Actions.RECEIVE_AUTOCOMPLETE_PRODUCT_RECORDS, products);
      });
    });

    describe('receiveDetailsProduct()', () => {
      it('should return an action', () => {
        const product: any = { a: 'b' };

        expectAction(() => actions.receiveDetailsProduct(product), Actions.RECEIVE_DETAILS_PRODUCT, product);
      });
    });

    describe('receiveRecommendationsProducts()', () => {
      it('should return an action', () => {
        const products: any[] = ['a', 'b', 'c'];

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.receiveRecommendationsProducts(products), Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS, products);
      });
    });
  });

  describe('ui action creators', () => {
    describe('createComponentState()', () => {
      it('should return an action', () => {
        const tagName = 'my-tag';
        const id = '123';
        const state = { a: 'b' };

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.createComponentState(tagName, id, state), Actions.CREATE_COMPONENT_STATE, { tagName, id, state });
      });

      it('should return an action if no state is passed as an argument', () => {
        const tagName = 'my-tag';
        const id = '123';

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.createComponentState(tagName, id), Actions.CREATE_COMPONENT_STATE, { tagName, id, state: {} });
      });
    });

    describe('removeComponentState()', () => {
      it('should create a CREATE_COMPONENT_STATE action', () => {
        const tagName = 'my-tag';
        const id = '123';

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.removeComponentState(tagName, id), Actions.REMOVE_COMPONENT_STATE, { tagName, id });
      });
    });
  });

  describe('updateLocation()', () => {
    it('should return an action', () => {
      const location: any = { a: 'b' };

      expectAction(() => actions.updateLocation(location), Actions.UPDATE_LOCATION, location);
    });
  });

  describe('refreshState()', () => {
    it('should create a REFRESH_STATE action', () => {
      const payload = { a: 'b' };

      expectAction(() => actions.refreshState(payload), Actions.REFRESH_STATE, payload);
    });
  });

  describe('startApp()', () => {
    it('should return an action', () => {
      expectAction(() => actions.startApp(), Actions.START_APP);
    });
  });
});
