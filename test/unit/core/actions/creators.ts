import * as sinon from 'sinon';
import Actions from '../../../../src/core/actions';
import ActionCreators from '../../../../src/core/actions/creators';
import * as utils from '../../../../src/core/actions/utils';
import * as validators from '../../../../src/core/actions/validators';
import SearchAdapter from '../../../../src/core/adapters/search';
import Selectors from '../../../../src/core/selectors';
import FluxCapacitor from '../../../../src/flux-capacitor';
import suite from '../../_suite';

const ACTION = { y: 'z' };

suite('ActionCreators', ({ expect, spy, stub }) => {
  let createAction: sinon.SinonStub;

  // tslint:disable-next-line max-line-length
  function expectAction<T>(action: Actions.Action<T, any> | Actions.Action<T, any>[], type: T, payload?: any) {
    if (Array.isArray(action)) {
      action.forEach((subAction) => expect(subAction).to.eq(ACTION));
    } else {
      expect(action).to.eq(ACTION);
    }
    expect(createAction).to.be.calledWith(type, payload);
  }

  // tslint:disable-next-line max-line-length
  function expectValidators<T>(action: Actions.Action<T, any> | Actions.Action<T, any>[], type: T, validator: object) {
    const args: any[] = [type, sinon.match.any];
    args.push(sinon.match((actionValidator) => Object.keys(validator)
      .reduce((allValid, key) => {
        if (Array.isArray(validator[key]) !== Array.isArray(actionValidator[key])) {
          return false;
        } else if (Array.isArray(validator[key])) {
          return allValid && actionValidator[key]
            .reduce((valid, subValidator, index) => valid && subValidator === validator[key][index], true);
        } else {
          return allValid && validator[key] === actionValidator[key];
        }
      }, true)));
    expect(createAction).to.be.calledWithExactly(...args);
  }

  beforeEach(() => createAction = stub(utils, 'createAction').returns(ACTION));

  describe('application action creators', () => {
    const state = { c: 'd' };

    describe('refreshState()', () => {
      it('should return state with type REFRESH_STATE', () => {
        expectAction(ActionCreators.refreshState(state), Actions.REFRESH_STATE, state);
      });
    });
  });

  describe('fetch action creators', () => {
    describe('fetchMoreRefinements()', () => {
      it('should return an action', () => {
        const navigationId = 'brand';

        const action = ActionCreators.fetchMoreRefinements(navigationId);

        expectAction(action, Actions.FETCH_MORE_REFINEMENTS, navigationId);
      });
    });

    describe('fetchProducts()', () => {
      it('should return an action', () => {
        expectAction(ActionCreators.fetchProducts(), Actions.FETCH_PRODUCTS, null);
      });
    });

    describe('fetchProductsWhenHydrated()', () => {
      it('should return an action', () => {
        expectAction(ActionCreators.fetchProductsWhenHydrated(), Actions.FETCH_PRODUCTS_WHEN_HYDRATED, ACTION);
      });
    });

    describe('fetchMoreProducts()', () => {
      it('should return an action', () => {
        const amount = 15;

        expectAction(ActionCreators.fetchMoreProducts(amount), Actions.FETCH_MORE_PRODUCTS, { amount, forward: true });
      });
    });

    describe('fetchPastPurchases()', () => {
      it('should return an action with null', () => {
        expectAction(ActionCreators.fetchPastPurchases(), Actions.FETCH_PAST_PURCHASES, null);
      });

      it('should return an action with query', () => {
        const query = 'hat';

        expectAction(ActionCreators.fetchPastPurchases(query), Actions.FETCH_PAST_PURCHASES, query);
      });
    });

    describe('fetchPastPurchaseProducts()', () => {
      it('should return an action with null', () => {
        expectAction(ActionCreators.fetchPastPurchaseProducts(), Actions.FETCH_PAST_PURCHASE_PRODUCTS, null);
      });

      it('should return an action with query', () => {
        const query = 'hat';

        expectAction(ActionCreators.fetchPastPurchaseProducts(query), Actions.FETCH_PAST_PURCHASE_PRODUCTS, query);
      });
    });

    describe('fetchPastPurchaseNavigations()', () => {
      it('should return an action', () => {
        expectAction(ActionCreators.fetchPastPurchaseNavigations(), Actions.FETCH_PAST_PURCHASE_NAVIGATIONS, null);
      });
    });

    describe('fetchSaytPastPurchases()', () => {
      it('should return an action', () => {
        const query = 'hat';

        expectAction(ActionCreators.fetchSaytPastPurchases(query), Actions.FETCH_SAYT_PAST_PURCHASES, query);
      });
    });

    describe('fetchAutocompleteSuggestions()', () => {
      it('should return an action', () => {
        const query = 'barbie';

        const action = ActionCreators.fetchAutocompleteSuggestions(query);

        expectAction(action, Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, query);
      });

      it('should apply validators to FETCH_AUTOCOMPLETE_SUGGESTIONS', () => {
        expectValidators(ActionCreators.fetchAutocompleteSuggestions(''), Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, {
          payload: validators.isString
        });
      });
    });

    describe('fetchAutocompleteProducts()', () => {
      it('should return an action', () => {
        const query = 'barbie';
        const refinements: any[] = ['a', 'b'];

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.fetchAutocompleteProducts(query, refinements), Actions.FETCH_AUTOCOMPLETE_PRODUCTS, { query, refinements });
      });

      it('should default to an empty array of refinements', () => {
        const query = 'barbie';

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.fetchAutocompleteProducts(query), Actions.FETCH_AUTOCOMPLETE_PRODUCTS, { query, refinements: [] });
      });

      it('should apply validators to FETCH_AUTOCOMPLETE_PRODUCTS', () => {
        expectValidators(ActionCreators.fetchAutocompleteProducts(''), Actions.FETCH_AUTOCOMPLETE_PRODUCTS, {
          query: validators.isValidQuery
        });
      });
    });

    describe('fetchCollectionCount()', () => {
      it('should return an action', () => {
        const collection = 'products';

        expectAction(ActionCreators.fetchCollectionCount(collection), Actions.FETCH_COLLECTION_COUNT, collection);
      });
    });

    describe('fetchProductDetails()', () => {
      it('should return an action', () => {
        const id = '12345';

        expectAction(ActionCreators.fetchProductDetails(id), Actions.FETCH_PRODUCT_DETAILS, id);
      });
    });

    describe('fetchRecommendationsProducts()', () => {
      it('should return an action', () => {
        expectAction(ActionCreators.fetchRecommendationsProducts(), Actions.FETCH_RECOMMENDATIONS_PRODUCTS, null);
      });
    });

    describe('fetchPastPurchases()', () => {
      it('should return an action', () => {
        expectAction(ActionCreators.fetchPastPurchases('query'), Actions.FETCH_PAST_PURCHASES, 'query');
      });

      it('should return an action when query is null', () => {
        expectAction(ActionCreators.fetchPastPurchases(), Actions.FETCH_PAST_PURCHASES, null);
      });
    });
  });

  describe('request action creators', () => {
    describe('updateSearch()', () => {
      const resetPageAction = { m: 'n' };

      beforeEach(() => stub(ActionCreators, 'resetPage').returns(resetPageAction));

      it('should return a bulk action', () => {
        const batchAction = ActionCreators.updateSearch({})(null);

        expect(batchAction).to.eql([resetPageAction]);
      });

      it('should return a bulk action with UPDATE_QUERY', () => {
        const query = 'q';
        const updateQuery = stub(ActionCreators, 'updateQuery').returns([ACTION]);

        const batchAction = ActionCreators.updateSearch({ query })(null);

        expect(batchAction).to.eql([resetPageAction, ACTION]);
        expect(updateQuery).to.be.calledWithExactly(query);
      });

      it('should return a bulk action with RESET_REFINEMENTS', () => {
        const clear = 'q';
        const state: any = { a: 'b' };
        const shouldResetRefinements = stub(utils, 'shouldResetRefinements').returns(true);
        const resetRefinements = stub(ActionCreators, 'resetRefinements').returns([ACTION]);

        const batchAction = ActionCreators.updateSearch({ clear })(state);

        expect(batchAction).to.eql([resetPageAction, ACTION]);
        expect(shouldResetRefinements).to.be.calledWithExactly({ clear }, state);
      });

      it('should return a bulk action with SELECT_REFINEMENT', () => {
        const navigationId = 'color';
        const index = 4;
        const selectRefinement = stub(ActionCreators, 'selectRefinement').returns([ACTION]);

        const batchAction = ActionCreators.updateSearch({ navigationId, index })(null);

        expect(batchAction).to.eql([resetPageAction, ACTION]);
        expect(selectRefinement).to.be.calledWithExactly(navigationId, index);
      });

      it('should return a bulk action with value ADD_REFINEMENT', () => {
        const navigationId = 'color';
        const value = 'blue';
        const addRefinement = stub(ActionCreators, 'addRefinement').returns([ACTION]);

        const batchAction = ActionCreators.updateSearch({ navigationId, value })(null);

        expect(batchAction).to.eql([resetPageAction, ACTION]);
        expect(addRefinement).to.be.calledWithExactly(navigationId, value);
      });

      it('should return a bulk action with range ADD_REFINEMENT', () => {
        const navigationId = 'color';
        const range = true;
        const low = 1;
        const high = 2;
        const addRefinement = stub(ActionCreators, 'addRefinement').returns([ACTION]);

        const batchAction = ActionCreators.updateSearch({ navigationId, range, low, high })(null);

        expect(batchAction).to.eql([resetPageAction, ACTION]);
        expect(addRefinement).to.be.calledWithExactly(navigationId, low, high);
      });

      it('should return a bulk action without ADD_REFINEMENT', () => {
        const batchAction = ActionCreators.updateSearch({ navigationId: 'truthy' })(null);

        expect(batchAction).to.eql([resetPageAction]);
      });
    });

    describe('updateQuery()', () => {
      const query = 'rambo';

      it('should return a batch action with RESET_PAGE', () => {
        expectAction(ActionCreators.updateQuery(query), Actions.RESET_PAGE);
      });

      it('should return a batch action with UPDATE_QUERY', () => {
        expectAction(ActionCreators.updateQuery(query), Actions.UPDATE_QUERY, query);
      });

      it('should apply validators to UPDATE_QUERY', () => {
        expectValidators(ActionCreators.updateQuery(query), Actions.UPDATE_QUERY, {
          payload: [
            validators.isValidQuery,
            validators.isDifferentQuery
          ]
        });
      });
    });

    describe('resetQuery()', () => {
      it('should call updateQuery()', () => {
        const updateQueryAction = { m: 'n' };
        const updateQuery = stub(ActionCreators, 'updateQuery').returns(updateQueryAction);

        expect(ActionCreators.resetQuery()).to.eq(updateQueryAction);
        expect(updateQuery).to.be.calledWithExactly(null);
      });
    });

    describe('resetRefinements()', () => {
      const field = 'brand';

      it('should return a batch action with RESET_PAGE', () => {
        expectAction(ActionCreators.resetRefinements(field), Actions.RESET_PAGE);
      });

      it('should return a batch action with RESET_REFINEMENTS', () => {
        expectAction(ActionCreators.resetRefinements(field), Actions.RESET_REFINEMENTS, field);
      });

      it('should apply validators to RESET_REFINEMENTS', () => {
        expectValidators(ActionCreators.resetRefinements(field), Actions.RESET_REFINEMENTS, {
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
        expectAction(ActionCreators.resetPage(), Actions.RESET_PAGE, undefined);
      });

      it('should apply validators to action', () => {
        expectValidators(ActionCreators.resetPage(), Actions.RESET_PAGE, {
          payload: validators.notOnFirstPage
        });
      });
    });

    describe('addRefinement()', () => {
      const navigationId = 'book';
      const refinement = { c: 'd' };
      const rangeRefinement = { range: true };

      it('should return a batch action with RESET_PAGE', () => {
        expectAction(ActionCreators.addRefinement(navigationId, null), Actions.RESET_PAGE);
      });

      it('should return an action with value refinement', () => {
        const value = 'a';
        const refinementPayload = stub(utils, 'refinementPayload').returns(refinement);

        expectAction(ActionCreators.addRefinement(navigationId, value), Actions.ADD_REFINEMENT, refinement);
        expect(refinementPayload).to.be.calledWithExactly(navigationId, value, null);
      });

      it('should return an action with range refinement', () => {
        const low = 2;
        const high = 4;
        const refinementPayload = stub(utils, 'refinementPayload').returns(refinement);

        expectAction(ActionCreators.addRefinement(navigationId, low, high), Actions.ADD_REFINEMENT, refinement);
        expect(refinementPayload).to.be.calledWithExactly(navigationId, low, high);
      });

      it('should apply validators to ADD_REFINEMENT', () => {
        expectValidators(ActionCreators.addRefinement(null, null), Actions.ADD_REFINEMENT, {
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

        const resetRefinements = stub(ActionCreators, 'resetRefinements').returns(resetRefinementsReturn);
        const addRefinement = stub(ActionCreators, 'addRefinement').returns(addRefinementReturn);
        stub(ActionCreators, 'resetPage').returns(resetPageReturn);

        const result = ActionCreators.switchRefinement(navigationId, value);

        expect(result).to.eql([
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
        stub(ActionCreators, 'updateSearch');

        ActionCreators.switchRefinement(navigationId, low, high);

        expect(refinementPayload).to.be.calledWithExactly(navigationId, low, high);
      });
    });

    describe('search()', () => {
      it('should call ActionCreators.updateSearch()', () => {
        const query = 'pineapple';

        const resetRefinementsReturn = 'reset';
        const updateReturn = 'update';
        const resetPageReturn = 'page';

        const resetRefinements = stub(ActionCreators, 'resetRefinements').returns(resetRefinementsReturn);
        const updateQuery = stub(ActionCreators, 'updateQuery').returns(updateReturn);
        stub(ActionCreators, 'resetPage').returns(resetPageReturn);

        const result = ActionCreators.search(query)(null);

        expect(result).to.eql([
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

        const resetRefinements = stub(ActionCreators, 'resetRefinements').returns(resetRefinementsReturn);
        const updateQuery = stub(ActionCreators, 'updateQuery').returns(updateReturn);
        const queryStub = stub(Selectors, 'query').returns(query);
        stub(ActionCreators, 'resetPage').returns(resetPageReturn);

        const result = ActionCreators.search()(null);

        expect(result).to.eql([
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
      const state: any = { g: 'h' };

      it('should call search() if field not provided and return result of search()', () => {
        const searchAction = ['1'];
        const searchThunk = spy(() => searchAction);
        const search = stub(ActionCreators, 'search').returns(searchThunk);

        const batchAction = ActionCreators.resetRecall()(state);

        expect(batchAction).to.eql(searchAction);
        expect(searchThunk).to.be.calledWithExactly(state);
        expect(search).to.be.calledOnce;
      });

      it('should return bulk action with SELECT_REFINEMENT if field and index provided', () => {
        const field = 'color';
        const index = 8;
        const selectRefinementAction = { g: 'h' };
        const selectRefinement = stub(ActionCreators, 'selectRefinement').returns([selectRefinementAction]);
        const searchThunk = spy(() => [
          resetPageAction,
          resetRefinementsAction,
          updateQueryAction,
        ]);
        const search = stub(ActionCreators, 'search').returns(searchThunk);
        const query = '';

        const batchAction = ActionCreators.resetRecall(query, { field, index })(state);

        expect(batchAction).to.eql([
          resetPageAction,
          resetRefinementsAction,
          updateQueryAction,
          selectRefinementAction
        ]);
        expect(searchThunk).to.be.calledWithExactly(state);
        expect(selectRefinement).to.be.calledWithExactly(field, index);
        expect(search).to.be.calledWithExactly(query);
      });
    });

    describe('selectRefinement()', () => {
      const navigationId = 'colour';

      it('should return a batch action with RESET_PAGE', () => {
        expectAction(ActionCreators.selectRefinement(navigationId, null), Actions.RESET_PAGE);
      });

      it('should return a batch action with SELECT_REFINEMENT', () => {
        const index = 30;

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.selectRefinement(navigationId, index), Actions.SELECT_REFINEMENT, { navigationId, index });
      });

      it('should apply validators to SELECT_REFINEMENT', () => {
        expectValidators(ActionCreators.selectRefinement(navigationId, 30), Actions.SELECT_REFINEMENT, {
          payload: validators.isRefinementDeselectedByIndex
        });
      });
    });

    describe('deselectRefinement()', () => {
      const navigationId = 'colour';

      it('should return a batch action with RESET_PAGE', () => {
        expectAction(ActionCreators.deselectRefinement(navigationId, null), Actions.RESET_PAGE);
      });

      it('should return a batch action with DESELECT_REFINEMENT', () => {
        const index = 30;

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.deselectRefinement(navigationId, index), Actions.DESELECT_REFINEMENT, { navigationId, index });
      });

      it('should apply validators to DESELECT_REFINEMENT', () => {
        const index = 30;

        expectValidators(ActionCreators.deselectRefinement(navigationId, index), Actions.DESELECT_REFINEMENT, {
          payload: validators.isRefinementSelectedByIndex
        });
      });
    });

    describe('selectCollection()', () => {
      const collection = 'products';

      it('should return a SELECT_COLLECTION action', () => {
        expectAction(ActionCreators.selectCollection(collection), Actions.SELECT_COLLECTION, collection);
      });

      it('should apply validators to SELECT_COLLECTION', () => {
        expectValidators(ActionCreators.selectCollection(collection), Actions.SELECT_COLLECTION, {
          payload: validators.isCollectionDeselected
        });
      });
    });

    describe('selectSort()', () => {
      const index = 9;

      it('should return a SELECT_SORT action', () => {
        expectAction(ActionCreators.selectSort(index), Actions.SELECT_SORT, index);
      });

      it('should apply validators to SELECT_SORT', () => {
        expectValidators(ActionCreators.selectSort(index), Actions.SELECT_SORT, {
          payload: validators.isSortDeselected
        });
      });
    });

    describe('updatePageSize()', () => {
      const pageSize = 20;

      it('should return an UPDATE_PAGE_SIZE action', () => {
        expectAction(ActionCreators.updatePageSize(pageSize), Actions.UPDATE_PAGE_SIZE, pageSize);
      });

      it('should apply validators to UPDATE_PAGE_SIZE', () => {
        expectValidators(ActionCreators.updatePageSize(pageSize), Actions.UPDATE_PAGE_SIZE, {
          payload: validators.isDifferentPageSize
        });
      });
    });

    describe('updateCurrentPage()', () => {
      const page = 3;

      it('should return an UPDATE_CURRENT_PAGE action', () => {
        expectAction(ActionCreators.updateCurrentPage(page), Actions.UPDATE_CURRENT_PAGE, page);
      });

      it('should apply validators to UPDATE_CURRENT_PAGE', () => {
        expectValidators(ActionCreators.updateCurrentPage(page), Actions.UPDATE_CURRENT_PAGE, {
          payload: [
            validators.isValidPage,
            validators.isOnDifferentPage
          ]
        });
      });
    });

    describe('updateDetails()', () => {
      it('should return an action', () => {
        const product: any = { a: 'b' };

        expectAction(ActionCreators.updateDetails(product), Actions.UPDATE_DETAILS, product);
      });
    });

    describe('setDetails()', () => {
      it('should return an action', () => {
        const product: any = { a: 'b' };

        expectAction(ActionCreators.setDetails(product), Actions.SET_DETAILS, product);
      });
    });

    describe('updateAutocompleteQuery()', () => {
      const query = 'pink elephant';

      it('should return an UPDATE_AUTOCOMPLETE_QUERY action', () => {
        expectAction(ActionCreators.updateAutocompleteQuery(query), Actions.UPDATE_AUTOCOMPLETE_QUERY, query);
      });

      it('should apply validators to UPDATE_AUTOCOMPLETE_QUERY', () => {
        expectValidators(ActionCreators.updateAutocompleteQuery(query), Actions.UPDATE_AUTOCOMPLETE_QUERY, {
          payload: validators.isDifferentAutocompleteQuery
        });
      });
    });

    describe('updateBiasing()', () => {
      it('should return an UPDATE_AUTOCOMPLETE_QUERY thunk action with config injected in', () => {
        const payload: any = {
          a: 'b',
          c: 'd'
        };
        const state: any = 'a';
        const config = {
          personalization: {
            realTimeBiasing: 'real'
          }
        };
        const selector = stub(Selectors, 'config').returns(config);

        expectAction(ActionCreators.updateBiasing(payload)(state), Actions.UPDATE_BIASING, {
          ...payload,
          config: config.personalization.realTimeBiasing
        });

        expectValidators(ActionCreators.updateBiasing(payload)(state), Actions.UPDATE_BIASING, {
          payload: validators.isValidBias
        });
      });
    });
    describe('updateSecuredPayload', () => {
      it('should return an UPDATE_SECURED_PAYLOAD action', () => {
        const payload: any = { a: 'b' };

        expectAction(ActionCreators.updateSecuredPayload(payload), Actions.UPDATE_SECURED_PAYLOAD, payload);
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
        const receivePageFunc = () => receivePageAction;
        const receiveTemplateAction = { mm: 'nn' };
        const products = ['x', 'x'];
        const results: any = {};
        const query: any = { e: 'f' };
        const state: any = { g: 'h' };
        const navigations: any[] = ['k', 'l'];
        const prunedNavigations: any[] = ['l'];
        const page: any = { m: 'n' };
        const template: any = { o: 'p' };
        const recordCount = 24;
        const collection = 'myProducts';
        // tslint:disable-next-line max-line-length
        const receiveProductRecords = stub(ActionCreators, 'receiveProductRecords').returns(receiveProductRecordsAction);
        const receiveCollectionCount = stub(ActionCreators, 'receiveCollectionCount').returns(receiveCollectionCountAction);
        const receiveNavigations = stub(ActionCreators, 'receiveNavigations').returns(receiveNavigationsAction);
        const receiveRecordCount = stub(ActionCreators, 'receiveRecordCount').returns(receiveRecordCountAction);
        const receiveTemplate = stub(ActionCreators, 'receiveTemplate').returns(receiveTemplateAction);
        const combineNavigations = stub(SearchAdapter, 'combineNavigations').returns(navigations);
        const pruneRefinements = stub(SearchAdapter, 'pruneRefinements').returns(prunedNavigations);
        const extractRecordCount = stub(SearchAdapter, 'extractRecordCount').returns(recordCount);
        const receiveQuery = stub(ActionCreators, 'receiveQuery').returns(receiveQueryAction);
        const receivePage = stub(ActionCreators, 'receivePage').returns(receivePageFunc);
        const extractTemplate = stub(SearchAdapter, 'extractTemplate').returns(template);
        const augmentProducts = stub(SearchAdapter, 'augmentProducts').returns(products);
        const selectCollection = stub(Selectors, 'collection').returns(collection);
        const extractQuery = stub(SearchAdapter, 'extractQuery').returns(query);

        const batchAction = ActionCreators.receiveProducts(results)(state);

        expect(createAction).to.be.calledWith(Actions.RECEIVE_PRODUCTS, results);
        expect(receiveQuery).to.be.calledWith(query);
        expect(receiveProductRecords).to.be.calledWith(['x', 'x']);
        expect(receiveNavigations).to.be.calledWith(prunedNavigations);
        expect(receiveRecordCount).to.be.calledWith(recordCount);
        expect(receiveTemplate).to.be.calledWith(template);
        expect(receiveCollectionCount).to.be.calledWith({ collection, count: recordCount });
        expect(receivePage).to.be.calledWith(recordCount);
        expect(extractRecordCount).to.be.calledWith(results);
        expect(extractQuery).to.be.calledWith(results);
        expect(augmentProducts).to.be.calledWith(results);
        expect(combineNavigations).to.be.calledWith(results);
        expect(pruneRefinements).to.be.calledWith(navigations);
        expect(selectCollection).to.be.calledWith(state);
        expect(extractTemplate).to.be.calledWith(results.template);
        expect(batchAction).to.eql([
          ACTION,
          receiveQueryAction,
          receiveProductRecordsAction,
          receiveNavigationsAction,
          receiveRecordCountAction,
          receiveCollectionCountAction,
          receivePageAction,
          receiveTemplateAction,
        ]);
      });

      it('should return an action', () => {
        const results: any = { a: 'b' };
        const action = { error: true };
        createAction.returns(action);

        const batchAction = ActionCreators.receiveProducts(results)(null);

        expect(createAction).to.be.calledWith(Actions.RECEIVE_PRODUCTS, results);
        expect(batchAction).to.eql(action);
      });
    });

    describe('receiveQuery()', () => {
      it('should return an action', () => {
        const query: any = { a: 'b' };

        expectAction(ActionCreators.receiveQuery(query), Actions.RECEIVE_QUERY, query);
      });
    });

    describe('receiveProductRecords()', () => {
      it('should return an action', () => {
        const products: any = ['a', 'b'];

        expectAction(ActionCreators.receiveProductRecords(products), Actions.RECEIVE_PRODUCT_RECORDS, products);
      });
    });

    describe('receiveCollectionCount()', () => {
      it('should return an action', () => {
        const count = {
          collection: 'products',
          count: 10
        };

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.receiveCollectionCount(count), Actions.RECEIVE_COLLECTION_COUNT, count);
      });
    });

    describe('receiveNavigations()', () => {
      it('should return an action', () => {
        const navigations: any[] = ['a', 'b'];

        expectAction(ActionCreators.receiveNavigations(navigations), Actions.RECEIVE_NAVIGATIONS, navigations);
      });
    });

    describe('receivePage()', () => {
      it('should return an action', () => {
        const page: any = { a: 'b' };
        const state: any = { c: 'd' };
        const recordCount = 300;
        const current = 2;
        const payload = stub(SearchAdapter, 'extractPage').returns(page);

        expectAction(ActionCreators.receivePage(recordCount, current)(state), Actions.RECEIVE_PAGE, page);
        expect(payload).to.be.calledWithExactly(state, recordCount, current);
      });
    });

    describe('receiveTemplate()', () => {
      it('should return an action', () => {
        const template: any = { a: 'b' };

        expectAction(ActionCreators.receiveTemplate(template), Actions.RECEIVE_TEMPLATE, template);
      });
    });

    describe('receiveRecordCount()', () => {
      it('should return an action', () => {
        const recordCount = 49;

        expectAction(ActionCreators.receiveRecordCount(recordCount), Actions.RECEIVE_RECORD_COUNT, recordCount);
      });
    });

    describe('receiveRedirect()', () => {
      it('should return an action', () => {
        const redirect = 'page.html';

        expectAction(ActionCreators.receiveRedirect(redirect), Actions.RECEIVE_REDIRECT, redirect);
      });
    });

    describe('receiveMoreRefinements()', () => {
      it('should return an action', () => {
        const navigationId = 'brand';
        const refinements: any[] = ['a', 'b'];
        const selected = [1, 7];

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.receiveMoreRefinements(navigationId, refinements, selected), Actions.RECEIVE_MORE_REFINEMENTS, {
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
        expectAction(ActionCreators.receiveAutocompleteSuggestions(suggestions), Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS, suggestions);
      });
    });

    describe('receiveMoreProducts()', () => {
      it('should return an action', () => {
        const products: any = { a: 'b' };
        const newProds = { c: 'd' };
        const augmentProducts = stub(SearchAdapter, 'augmentProducts').returns(newProds);

        expectAction(ActionCreators.receiveMoreProducts(products)(null), Actions.RECEIVE_MORE_PRODUCTS, newProds);
        expect(augmentProducts).to.be.calledWithExactly(products);
      });
    });

    describe('receiveAutocompleteProducts()', () => {
      it('should return a batch action', () => {
        const template: any = { a: 'b' };
        const response: any = { template };
        const products: any[] = ['c', 'd'];
        const receiveAutocompleteProductRecordsAction = { e: 'f' };
        const receiveAutocompleteTemplateAction = { g: 'h' };
        const augmentProducts = stub(SearchAdapter, 'augmentProducts').returns(products);
        const extractTemplate = stub(SearchAdapter, 'extractTemplate').returns(template);
        // tslint:disable-next-line max-line-length
        const receiveAutocompleteProductRecords = stub(ActionCreators, 'receiveAutocompleteProductRecords').returns(receiveAutocompleteProductRecordsAction);
        const receiveAutocompleteTemplate = stub(ActionCreators, 'receiveAutocompleteTemplate').returns(receiveAutocompleteTemplateAction);

        const batchAction = ActionCreators.receiveAutocompleteProducts(response)(null);

        expect(createAction).to.be.calledWith(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, response);
        expect(receiveAutocompleteProductRecords).to.be.calledWith(products);
        expect(receiveAutocompleteTemplate).to.be.calledWith(template);
        expect(augmentProducts).to.be.calledWithExactly(response);
        expect(batchAction).to.eql([
          ACTION,
          receiveAutocompleteProductRecordsAction,
          receiveAutocompleteTemplateAction
        ]);
      });

      it('should return an action', () => {
        const results: any = {};
        const action = { a: 'b', error: true };
        createAction.returns(action);

        const batchAction = ActionCreators.receiveAutocompleteProducts(results)(null);

        expect(createAction).to.be.calledWith(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, results);
        expect(batchAction).to.eql(action);
      });
    });

    describe('receiveAutocompleteTemplate()', () => {
      it('should return an action', () => {
        const template: any = { a: 'b' };

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.receiveAutocompleteTemplate(template), Actions.RECEIVE_AUTOCOMPLETE_TEMPLATE, template);
      });
    });

    describe('receiveAutocompleteProductRecords()', () => {
      it('should return an action', () => {
        const products: any[] = ['a', 'b'];

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.receiveAutocompleteProductRecords(products), Actions.RECEIVE_AUTOCOMPLETE_PRODUCT_RECORDS, products);
      });
    });

    describe('receiveRecommendationsProducts()', () => {
      it('should return an action', () => {
        const products: any[] = ['a', 'b', 'c'];

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.receiveRecommendationsProducts(products), Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS, products);
      });
    });

    describe('receiveNavigationSort()', () => {
      it('should return an action', () => {
        const navigations: any[] = ['a', 'b', 'c'];

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.receiveNavigationSort(navigations), Actions.RECEIVE_NAVIGATION_SORT, navigations);
      });
    });

    describe('receivePastPurchaseSkus()', () => {
      it('should return an action', () => {
        const products: any[] = ['a', 'b', 'c'];

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.receivePastPurchaseSkus(products), Actions.RECEIVE_PAST_PURCHASE_SKUS, products);
      });
    });

    describe('receiveSaytPastPurchases()', () => {
      it('should return an action', () => {
        const products: any[] = ['a', 'b', 'c'];

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.receiveSaytPastPurchases(products), Actions.RECEIVE_SAYT_PAST_PURCHASES, products);
      });
    });

    describe('receivePastPurchaseProducts()', () => {
      it('should return an action', () => {
        const products: any[] = ['a', 'b', 'c'];

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.receivePastPurchaseProducts(products), Actions.RECEIVE_PAST_PURCHASE_PRODUCTS, products);
      });
    });

    describe('receivePastPurchaseCurrentRecordCount()', () => {
      it('should return an action', () => {
        const recordCount = 6;

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.receivePastPurchaseCurrentRecordCount(recordCount),
                     Actions.RECEIVE_PAST_PURCHASE_CURRENT_RECORD_COUNT, recordCount);
      });
    });

    describe('receivePastPurchaseAllRecordCount()', () => {
      it('should return an action', () => {
        const recordCount = 6;

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.receivePastPurchaseAllRecordCount(recordCount),
                     Actions.RECEIVE_PAST_PURCHASE_ALL_RECORD_COUNT, recordCount);
      });
    });

    describe('receivePastPurchaseRefinements()', () => {
      it('should return an action', () => {
        const refinements: any[] = ['a', 'b', 'c'];

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.receivePastPurchaseRefinements(refinements), Actions.RECEIVE_PAST_PURCHASE_REFINEMENTS, refinements);
      });
    });

    describe('resetPastPurchasePage()', () => {
      it('should return an action', () => {
        expectAction(ActionCreators.resetPastPurchasePage(), Actions.RESET_PAST_PURCHASE_PAGE, undefined);
      });

      it('should return an action with validators', () => {
        expectValidators(ActionCreators.resetPastPurchasePage(), Actions.RESET_PAST_PURCHASE_PAGE, {
          payload: validators.notOnFirstPastPurchasePage
        });
      });
    });

    describe('receivePastPurchasePage()', () => {
      it('should return an action', () => {
        const page: any = 1;

        expectAction(ActionCreators.receivePastPurchasePage(page), Actions.RECEIVE_PAST_PURCHASE_PAGE, page);
      });
    });

    describe('selectPastPurchaseRefinement()', () => {
      const navigationId = 'color';
      const index = 2;

      it('should return a batch action with RESET_PAST_PURCHASE_PAGE', () => {
        expectAction(ActionCreators.selectPastPurchaseRefinement(navigationId, index),
          Actions.RESET_PAST_PURCHASE_PAGE);
      });

      it('should return a batch action with SELECT_PAST_PURCHASE_REFINEMENT', () => {
        expectAction(ActionCreators.selectPastPurchaseRefinement(navigationId, index),
          Actions.SELECT_PAST_PURCHASE_REFINEMENT, { navigationId, index });
      });

      it('should apply validators to SELECT_PAST_PURCHASE_REFINEMENT', () => {
        expectValidators(ActionCreators.selectPastPurchaseRefinement(navigationId, index),
          Actions.SELECT_PAST_PURCHASE_REFINEMENT, {
            payload: validators.isPastPurchaseRefinementDeselectedByIndex,
          });
      });
    });

    describe('resetAndSelectPastPurchaseRefinement()', () => {
      it('should return a batch action and call resetPastPurchaseRefinements and selectPastPurchaseRefinement', () => {
        const navigationId = 'color';
        const index = 3;
        const res: any = { type: 'asdf' };
        const sel: any = { type: 'fsef' };
        const reset = stub(ActionCreators, 'resetPastPurchaseRefinements').returns([res]);
        const select = stub(ActionCreators, 'selectPastPurchaseRefinement').returns([sel]);
        expect(ActionCreators.resetAndSelectPastPurchaseRefinement(navigationId, index)).to.eql([
          res,
          sel
        ]);

        expect(reset).to.be.calledWithExactly(true);
        expect(select).to.be.calledWithExactly(navigationId, index);
      });
    });

    describe('resetPastPurchaseQueryAndSelectRefinement()', () => {
      it('should return a batch action and call updatePastPurchaseQuery and selectPastPurchaseRefinement', () => {
        const navigationId = 'color';
        const index = 3;
        const query: any = { type: 'asdf' };
        const sel: any = { type: 'fsef' };
        const update = stub(ActionCreators, 'updatePastPurchaseQuery').returns([query]);
        const select = stub(ActionCreators, 'selectPastPurchaseRefinement').returns([sel]);
        expect(ActionCreators.resetPastPurchaseQueryAndSelectRefinement(navigationId, index)).to.eql([
          query,
          sel
        ]);

        expect(update).to.be.calledWithExactly('');
        expect(select).to.be.calledWithExactly(navigationId, index);
      });
    });

    describe('deselectPastPurchaseRefinement()', () => {
      const navigationId = 'color';
      const index = 2;
      const obj: any = { navigationId, index };

      it('should return a batch action with RESET_PAST_PURCHASE_PAGE', () => {
        expectAction(ActionCreators.deselectPastPurchaseRefinement(navigationId, index),
          Actions.RESET_PAST_PURCHASE_PAGE);
      });

      it('should return a batch action with DESELECT_PAST_PURCHASE_REFINEMENT', () => {
        expectAction(ActionCreators.deselectPastPurchaseRefinement(navigationId, index),
          Actions.DESELECT_PAST_PURCHASE_REFINEMENT, obj);
      });

      it('should apply validators to SELECT_PAST_PURCHASE_REFINEMENT', () => {
        expectValidators(ActionCreators.deselectPastPurchaseRefinement(navigationId, index),
          Actions.DESELECT_PAST_PURCHASE_REFINEMENT, {
            payload: validators.isPastPurchaseRefinementSelectedByIndex,
          });
      });
    });

    describe('resetPastPurchaseRefinements()', () => {
      const field = 'color';

      it('should return a batch action with RESET_PAST_PURCHASE_PAGE', () => {
        expectAction(ActionCreators.resetPastPurchaseRefinements(field), Actions.RESET_PAST_PURCHASE_PAGE);
      });

      it('should return a batch action with RESET_PAST_PURCHASE_REFINEMENTS', () => {
        expectAction(ActionCreators.resetPastPurchaseRefinements(field),
          Actions.RESET_PAST_PURCHASE_REFINEMENTS, field);
      });

      it('should apply validators to RESET_PAST_PURCHASE_REFINEMENTS', () => {
        expectValidators(ActionCreators.resetPastPurchaseRefinements(field),
          Actions.RESET_PAST_PURCHASE_REFINEMENTS, {
            payload: [
              validators.isValidClearField,
              validators.hasSelectedPastPurchaseRefinements,
              validators.hasSelectedPastPurchaseRefinementsByField,
            ]
          });
      });
    });

    describe('updatePastPurchaseQuery()', () => {
      const query = 'hat';

      it('should return a batch action with resetPastPurchaseRefinements spreaded', () => {
        const array = [1,2,3];
        const resetPastPurchaseRefinements = stub(ActionCreators, 'resetPastPurchaseRefinements').returns(array);

        const action = ActionCreators.updatePastPurchaseQuery(query);

        expect(action).to.eql([...array, ACTION]);
        expect(resetPastPurchaseRefinements).to.be.calledWithExactly(true);
      });

      it('should return a batch action with UPDATE_PAST_PURCHASE_QUERY', () => {
        expectAction(<any>ActionCreators.updatePastPurchaseQuery(query),
          Actions.UPDATE_PAST_PURCHASE_QUERY, query);
      });
    });

    describe('updatePastPurchasePageSize()', () => {
      const size = 6;

      it('should return a batch action with UPDATE_PAST_PURCHASE_PAGE_SIZE', () => {
        expectAction(ActionCreators.updatePastPurchasePageSize(size),
          Actions.UPDATE_PAST_PURCHASE_PAGE_SIZE, size);
      });

      it('should apply validators to UPDATE_PAST_PURCHASE_PAGE_SIZE', () => {
        expectValidators(ActionCreators.updatePastPurchasePageSize(size),
          Actions.UPDATE_PAST_PURCHASE_PAGE_SIZE, {
            payload: validators.isDifferentPastPurchasePageSize,
          });
      });
    });

    describe('updatePastPurchaseCurrentPage()', () => {
      const page = 2;

      it('should return a batch action with UPDATE_PAST_PURCHASE_CURRENT_PAGE', () => {
        expectAction(ActionCreators.updatePastPurchaseCurrentPage(page),
          Actions.UPDATE_PAST_PURCHASE_CURRENT_PAGE, page);
      });

      it('should apply validators to UPDATE_PAST_PURCHASE_CURRENT_PAGE', () => {
        expectValidators(ActionCreators.updatePastPurchaseCurrentPage(page),
          Actions.UPDATE_PAST_PURCHASE_CURRENT_PAGE, {
            payload: [
              validators.isValidPastPurchasePage,
              validators.isOnDifferentPastPurchasePage,
            ],
          });
      });
    });

    describe('selectPastPurchasesSort()', () => {
      const index = 4;

      it('should return a batch action with RESET_PAST_PURCHASE_PAGE', () => {
        expectAction(ActionCreators.selectPastPurchasesSort(index), Actions.RESET_PAST_PURCHASE_PAGE);
      });

      it('should return a batch action with SELECT_PAST_PURCHASE_SORT', () => {
        expectAction(ActionCreators.selectPastPurchasesSort(index),
          Actions.SELECT_PAST_PURCHASE_SORT, index);
      });

      it('should apply validators to SELECT_PAST_PURCHASE_SORT', () => {
        expectValidators(ActionCreators.selectPastPurchasesSort(index),
          Actions.SELECT_PAST_PURCHASE_SORT, {
            payload: validators.isPastPurchasesSortDeselected,
          });
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
        expectAction(ActionCreators.createComponentState(tagName, id, state), Actions.CREATE_COMPONENT_STATE, { tagName, id, state, persist: false });
      });

      it('should return an action with persist true', () => {
        const tagName = 'my-tag';
        const id = '123';
        const state = { a: 'b' };
        const persist = true;

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.createComponentState(tagName, id, state, persist), Actions.CREATE_COMPONENT_STATE, { tagName, id, state, persist: true });
      });

      it('should return an action if no state is passed as an argument', () => {
        const tagName = 'my-tag';
        const id = '123';

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.createComponentState(tagName, id), Actions.CREATE_COMPONENT_STATE, { tagName, id, state: {}, persist: false });
      });
    });

    describe('removeComponentState()', () => {
      it('should create a REMOVE_COMPONENT_STATE action', () => {
        const tagName = 'my-tag';
        const id = '123';

        // tslint:disable-next-line max-line-length
        expectAction(ActionCreators.removeComponentState(tagName, id), Actions.REMOVE_COMPONENT_STATE, { tagName, id });
      });
    });
  });

  describe('updateLocation()', () => {
    it('should return an action', () => {
      const location: any = { a: 'b' };

      expectAction(ActionCreators.updateLocation(location), Actions.UPDATE_LOCATION, location);
    });
  });

  describe('refreshState()', () => {
    it('should create a REFRESH_STATE action', () => {
      const payload = { a: 'b' };

      expectAction(ActionCreators.refreshState(payload), Actions.REFRESH_STATE, payload);
    });
  });

  describe('startApp()', () => {
    it('should return an action', () => {
      expectAction(ActionCreators.startApp(), Actions.START_APP);
    });
  });
});
