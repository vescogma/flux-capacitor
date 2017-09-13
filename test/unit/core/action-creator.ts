import * as sinon from 'sinon';
import createActions from '../../../src/core/action-creator';
import Actions from '../../../src/core/actions';
import SearchAdapter from '../../../src/core/adapters/search';
import Selectors from '../../../src/core/selectors';
import * as utils from '../../../src/core/utils';
import FluxCapacitor from '../../../src/flux-capacitor';
import suite from '../_suite';

const ACTION = { y: 'z' };

suite('ActionCreator', ({ expect, spy, stub }) => {
  let actions: typeof FluxCapacitor.prototype.actions;
  let flux: any;

  beforeEach(() => actions = createActions(flux = <any>{})(() => null));

  // tslint:disable-next-line max-line-length
  function expectAction<T>(fn: () => Actions.Action<T, any>, type: T, payload?: any, metadataTest?: (meta: any) => any) {
    const createAction = stub(utils, 'action').returns(ACTION);

    const action = fn();

    expect(action).to.eq(ACTION);
    const args: any[] = [type, payload];
    if (metadataTest) {
      args.push(sinon.match(metadataTest));
    } else {
      args.push(sinon.match.any);
    }
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
      it('should return an action with validation if search contains query', () => {
        const search: any = { a: 'b', query: 'q' };

        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
          (meta) => {
            expect(meta.validator.payload[0].func({})).to.be.false;
            expect(meta.validator.payload[0].func({ query: '' })).to.be.false;
            expect(meta.validator.payload[0].func({ query: undefined })).to.be.false;
            return expect(meta.validator.payload[0].func({ query: null })).to.be.true;
          });
      });

      it('should return an action with validation if search does not contain query', () => {
        const search: any = { a: 'b' };

        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
          (meta) => {
            expect(meta.validator.payload[0].func({})).to.be.true;
            return expect(meta.validator.payload[0].func({ query: 'q' })).to.be.true;
          });
      });

      it('should return an action with validation if search term is not different', () => {
        const query = 'book';
        const search: any = { a: 'b' };
        const state = { a: 'b' };
        stub(Selectors, 'query').returns(query);
        stub(Selectors, 'selectedRefinements').returns([]);

        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
          (meta) => expect(meta.validator.payload[1].func({ query }, state)).to.be.false);
      });

      it('should return an action with validation if search term is different', () => {
        const search: any = { a: 'b' };
        const state = { a: 'b' };
        stub(Selectors, 'query').returns('book');
        stub(Selectors, 'selectedRefinements').returns([]);

        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
          (meta) => expect(meta.validator.payload[1].func({ query: 'boot' }, state)).to.be.true);
      });

      it('should return an action with validation that evaluates to ' +
        'false if search term is null and refinements are same', () => {
        const query = null;
        const search: any = { a: 'b' };
        const state = { a: 'b' };
        stub(Selectors, 'query').returns(query);
        stub(Selectors, 'selectedRefinements').returns([]);

        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
          (meta) => expect(meta.validator.payload[1].func({ query }, state)).to.be.false);
      });

      it('should return an action with validation that evaluates to ' +
        'true if search term is same and refinements are different', () => {
        const query = 'a';
        const search: any = { query: 'b' };
        const refinement = { navigationId : 'a', value: 'b' };
        const state = { a: 'b' };
        stub(Selectors, 'query').returns(query);
        stub(Selectors, 'selectedRefinements').returns([]);

        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
          (meta) => expect(meta.validator.payload[1].func({ ...refinement, query }, state)).to.be.true);
      });

      it('should return an action with validation that evaluates to ' +
      'false if search term is same and refinements are same', () => {
        const query = 'a';
        const search: any = { query: 'a' };
        const refinement = { navigationId : 'a', value: 'b' };
        const state = { a: 'b' };
        stub(Selectors, 'query').returns(query);
        stub(Selectors, 'selectedRefinements').returns([{ navigationName: 'a', value: 'b'}]);

        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
          (meta) => expect(meta.validator.payload[1].func({ ...refinement, query }, state)).to.be.false);
      });

      it('should return an action with validation that evaluates to ' +
      'true if search term is same and there is more than 1 refinement and 1 of them matches', () => {
        const query = 'a';
        const search: any = { query: 'a' };
        const refinement = { navigationId : 'a', value: 'b' };
        const state = { a: 'b' };
        stub(Selectors, 'query').returns(query);
        stub(Selectors, 'selectedRefinements').returns(
          [{ navigationName: 'aa', value: 'bb'},
          { navigationName: 'a', value: 'b'}]);

        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
          (meta) => expect(meta.validator.payload[1].func({ ...refinement, query }, state)).to.be.true);
      });

      it('should return an action with validation that evaluates to ' +
      'true if there is one refinement and refinement navigationName matches but different value', () => {
        const query = 'a';
        const search: any = { query: 'a' };
        const refinement = { navigationId : 'a', value: 'b' };
        const state = { a: 'b' };
        stub(Selectors, 'query').returns(query);
        stub(Selectors, 'selectedRefinements').returns(
        [{ navigationName: 'a', value: 'bb'}]);

        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
          (meta) => expect(meta.validator.payload[1].func({ ...refinement, query }, state)).to.be.true);
      });

      it('should return an action with validation that evaluates to ' +
      'true if there is one refinement and refinement value matches but navigationName is different', () => {
        const query = 'a';
        const search: any = { query: 'a' };
        const refinement = { navigationId : 'a', value: 'b' };
        const state = { a: 'b' };
        stub(Selectors, 'query').returns(query);
        stub(Selectors, 'selectedRefinements').returns(
          [{ navigationName: 'aa', value: 'b'}]);

        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
          (meta) => expect(meta.validator.payload[1].func({ ...refinement, query }, state)).to.be.true);
      });

      it('should return an action with validation that evaluates to ' +
        'false if there is an index and current refinement but no search refinement', () => {
          const query = 'a';
          const search: any = { query: 'a' };
          const refinement = { navigationId: 'aa', index: 0 };
          const state = {};
          stub(Selectors, 'query').returns(query);
          stub(Selectors, 'selectedRefinements').returns(
            [{ navigationName: 'aa', value: 'bb', range: true, low: 1, high: 2}]);
          stub(Selectors, 'refinementCrumb').returns(
            { navigationName: 'aa', value: 'bb', range: true, low: 1, high: 2});
          expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
          (meta) => expect(meta.validator.payload[1].func({ ...refinement, query }, state)).to.be.false);
      });

      it('should return an action with validation that evaluates to ' +
      'true if there is an index and current refinement but no search refinement', () => {
        const query = 'a';
        const search: any = { query: 'a' };
        const refinement = { navigationId: 'aaa', index: 0 };
        const state = {};
        stub(Selectors, 'query').returns(query);
        stub(Selectors, 'selectedRefinements').returns(
          [{ navigationName: 'aa', value: 'bb', range: true, low: 1, high: 2}]);
        stub(Selectors, 'refinementCrumb').returns(
          { navigationName: 'aa', value: 'bb', range: true, low: 1, high: 3});
        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
        (meta) => expect(meta.validator.payload[1].func({ ...refinement, query }, state)).to.be.true);
      });

      it('should return an action with validation that evaluates to ' +
      'false if there is only one refinement with the same range', () => {
        const query = 'a';
        const search: any = { query: 'a' };
        const refinement = { navigationId: 'aa', range: true, low: 1, high: 2 };
        const state = {};
        stub(Selectors, 'query').returns(query);
        stub(Selectors, 'selectedRefinements').returns(
          [{ navigationName: 'aa', value: 'bb', range: true, low: 1, high: 2}]);
        stub(Selectors, 'refinementCrumb').returns(
          [{ navigationName: 'aa', value: 'bb', range: true, low: 1, high: 2}]);
        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
        (meta) => expect(meta.validator.payload[1].func({ ...refinement, query }, state)).to.be.false);
      });

      it('should return an action with validation that evaluates to ' +
      'true if low value for the range is different', () => {
        const query = 'a';
        const search: any = { query: 'a' };
        const refinement = { navigationId: 'aa', range: true, low: 3, high: 2 };
        const state = {};
        stub(Selectors, 'query').returns(query);
        stub(Selectors, 'selectedRefinements').returns(
          [{ navigationName: 'aa', value: 'bb', range: true, low: 1, high: 2}]);
        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
        (meta) => expect(meta.validator.payload[1].func({ ...refinement, query }, state)).to.be.true);
      });

      it('should return an action with validation that evaluates to ' +
      'true if high value for the range is different', () => {
        const query = 'a';
        const search: any = { query: 'a' };
        const refinement = { navigationId: 'aa', range: true, low: 1, high: 222 };
        const state = {};
        stub(Selectors, 'query').returns(query);
        stub(Selectors, 'selectedRefinements').returns(
          [{ navigationName: 'aa', value: 'bb', range: true, low: 1, high: 2}]);
        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
        (meta) => expect(meta.validator.payload[1].func({ ...refinement, query }, state)).to.be.true);
      });

      it('should return an action with validation that evaluates to ' +
      'true if both low and high values for the range are different', () => {
        const query = 'a';
        const search: any = { query: 'a' };
        const refinement = { navigationId: 'aa', range: true, low: 3, high: 22 };
        const state = {};
        stub(Selectors, 'query').returns(query);
        stub(Selectors, 'selectedRefinements').returns(
          [{ navigationName: 'aa', value: 'bb', range: true, low: 1, high: 2}]);
        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
        (meta) => expect(meta.validator.payload[1].func({ ...refinement, query }, state)).to.be.true);
      });

      it('should return an action with validation that evaluates to ' +
      'true if both low and high values for the range are same but navigationId is different', () => {
        const query = 'a';
        const search: any = { query: 'a' };
        const refinement = { navigationId: 'ab', range: true, low: 1, high: 2 };
        const state = {};
        stub(Selectors, 'query').returns(query);
        stub(Selectors, 'selectedRefinements').returns(
          [{ navigationName: 'aa', value: 'bb', range: true, low: 1, high: 2}]);
        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
        (meta) => expect(meta.validator.payload[1].func({ ...refinement, query }, state)).to.be.true);
      });

      it('should call Selectors.selectedRefinements and Selectors.query with state', () => {
        const query = 'a';
        const search = { query: 'a' };
        const refinement = { navigationId: 'aa', range: true, low: 1, high: 2 };
        const state = {};
        const selectedRefinements = stub(Selectors, 'selectedRefinements').returns([]);
        const selectorsQuery = stub(Selectors, 'query').returns(query);
        actions.updateSearch(search);
        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, search,
        (meta) => expect(meta.validator.payload[1].func({ ...refinement, query }, state)).to.be.true);
        expect(selectedRefinements).to.be.calledWith(state);
        expect(selectorsQuery).to.be.calledWith(state);
      });

      it('should trim query', () => {
        const search: any = { query: '  untrimmed \n \r  ' };

        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH, { query: 'untrimmed' });
      });
    });

    describe('addRefinement()', () => {
      const navigationId = 'book';

      it('should add a value refinement', () => {
        const action = { a: 'b' };
        const refinement = { c: 'd' };
        const value = 'a';
        const updateSearch = stub(actions, 'updateSearch').returns(action);
        const refinementPayload = stub(utils, 'refinementPayload').returns(refinement);

        const result = actions.addRefinement(navigationId, value);

        expect(result).to.be.eq(action);
        expect(updateSearch).to.be.calledWithExactly(refinement);
        expect(refinementPayload).to.be.calledWithExactly(navigationId, value, null);
      });

      it('should add a range refinement', () => {
        const low = 20;
        const high = 57;
        const refinementPayload = stub(utils, 'refinementPayload');
        stub(actions, 'updateSearch');

        actions.addRefinement(navigationId, low, high);

        expect(refinementPayload).to.be.calledWithExactly(navigationId, low, high);
      });
    });

    describe('switchRefinement()', () => {
      const navigationId = 'book';

      it('should clear the refinements and add a value refinement', () => {
        const value = 'a';
        const action = { a: 'b' };
        const updateSearch = stub(actions, 'updateSearch').returns(action);
        const refinementPayload = stub(utils, 'refinementPayload').returns({ c: 'd' });

        const result = actions.switchRefinement(navigationId, value);

        expect(result).to.be.eq(action);
        expect(updateSearch).to.be.calledWithExactly({ c: 'd', clear: navigationId });
        expect(refinementPayload).to.be.calledWithExactly(navigationId, value, null);
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

    describe('resetRefinements()', () => {
      it('should reset refinements', () => {
        const action = { a: 'b' };
        const updateSearch = stub(actions, 'updateSearch').returns(action);

        const result = actions.resetRefinements();

        expect(result).to.be.eq(action);
        expect(updateSearch).to.be.calledWithExactly({ clear: true });
      });
    });

    describe('search()', () => {
      it('should call actions.updateSearch()', () => {
        const query = 'pineapple';
        const updateSearch = actions.updateSearch = spy();

        actions.search(query);

        expect(updateSearch).to.be.calledWithExactly({ query, clear: true });
      });

      it('should fall back to current query', () => {
        const query = 'pineapple';
        const state = { a: 'b' };
        const updateSearch = actions.updateSearch = spy();
        const selectQuery = stub(Selectors, 'query').returns(query);
        flux.store = { getState: () => state };

        actions.search();

        expect(updateSearch).to.be.calledWithExactly({ query, clear: true });
        expect(selectQuery).to.be.calledWithExactly(state);
      });
    });

    describe('resetRecall()', () => {
      it('should call actions.updateSearch() with falsey params to clear request state', () => {
        const updateSearch = actions.updateSearch = spy();

        actions.resetRecall();

        // tslint:disable-next-line max-line-length
        expect(updateSearch).to.be.calledWithExactly({ query: null, navigationId: undefined, index: undefined, clear: true });
      });

      it('should call actions.updateSearch() with a query', () => {
        const query = 'pineapple';
        const updateSearch = actions.updateSearch = spy();

        actions.resetRecall(query);

        expect(updateSearch).to.be.calledWithExactly({ query, navigationId: undefined, index: undefined, clear: true });
      });

      it('should call actions.updateSearch() with a query and refinement', () => {
        const query = 'pineapple';
        const navigationId = 'brand';
        const index = 9;
        const updateSearch = actions.updateSearch = spy();

        actions.resetRecall(query, { field: navigationId, index });

        expect(updateSearch).to.be.calledWithExactly({ query, navigationId, index, clear: true });
      });
    });

    describe('selectRefinement()', () => {
      it('should return an action', () => {
        const isRefinementDeselected = stub(Selectors, 'isRefinementDeselected').returns(true);
        const navigationId = 'colour';
        const index = 30;
        const state = { a: 'b' };

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.selectRefinement(navigationId, index), Actions.SELECT_REFINEMENT, { navigationId, index },
          (meta) => {
            expect(meta.validator.payload.func(null, state)).to.be.true;
            return expect(isRefinementDeselected).to.be.calledWithExactly(state, navigationId, index);
          });
      });

      it('should invalidate action when refinement not selectable', () => {
        stub(Selectors, 'isRefinementDeselected').returns(false);

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.selectRefinement('colour', 30), Actions.SELECT_REFINEMENT, { navigationId: 'colour', index: 30 },
          (meta) => expect(meta.validator.payload.func(null, {})).to.be.false);
      });

      describe('deselectRefinement()', () => {
        it('should return an action', () => {
          const isRefinementSelected = stub(Selectors, 'isRefinementSelected').returns(true);
          const navigationId = 'colour';
          const index = 30;
          const state = { a: 'b' };

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.deselectRefinement(navigationId, index), Actions.DESELECT_REFINEMENT, { navigationId, index },
            (meta) => {
              expect(meta.validator.payload.func(null, state)).to.be.true;
              return expect(isRefinementSelected).to.be.calledWithExactly(state, navigationId, index);
            });
        });

        it('should invalidate action when refinement not deselectable', () => {
          stub(Selectors, 'isRefinementSelected').returns(false);

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.deselectRefinement('colour', 30), Actions.DESELECT_REFINEMENT, { navigationId: 'colour', index: 30 },
            (meta) => expect(meta.validator.payload.func(null, {})).to.be.false);
        });
      });

      describe('selectCollection()', () => {
        it('should return an action', () => {
          const collection = 'otherCollection';
          const state = { a: 'b' };
          const selectCollection = stub(Selectors, 'collection').returns('someCollection');

          expectAction(() => actions.selectCollection(collection), Actions.SELECT_COLLECTION, collection,
            (meta) => {
              expect(meta.validator.payload.func(null, state)).to.be.true;
              return expect(selectCollection).to.be.calledWith(state);
            });
        });

        it('should invalidate action if collection is already selected', () => {
          const collection = 'otherCollection';
          stub(Selectors, 'collection').returns(collection);

          expectAction(() => actions.selectCollection(collection), Actions.SELECT_COLLECTION, collection,
            (meta) => expect(meta.validator.payload.func(null, { a: 'b' })).to.be.false);
        });
      });

      describe('selectSort()', () => {
        it('should return an action', () => {
          const index = 9;
          const state = { a: 'b' };
          const sortIndex = stub(Selectors, 'sortIndex').returns(2);

          expectAction(() => actions.selectSort(index), Actions.SELECT_SORT, index,
            (meta) => {
              expect(meta.validator.payload.func(null, state)).to.be.true;
              return expect(sortIndex).to.be.calledWith(state);
            });
        });

        it('should invalidate action if sort is already selected', () => {
          const index = 9;
          stub(Selectors, 'sortIndex').returns(index);

          expectAction(() => actions.selectSort(index), Actions.SELECT_SORT, index,
            (meta) => expect(meta.validator.payload.func(null, { a: 'b' })).to.be.false);
        });
      });

      describe('updatePageSize()', () => {
        it('should return an action', () => {
          const pageSize = stub(Selectors, 'pageSize').returns(14);
          const size = 12;
          const state = { a: 'b' };

          expectAction(() => actions.updatePageSize(size), Actions.UPDATE_PAGE_SIZE, size,
            (meta) => {
              expect(meta.validator.payload.func(null, state)).to.be.true;
              return expect(pageSize).to.be.calledWithExactly(state);
            });
        });

        it('should invalidate action if selected page size is the same', () => {
          const size = 12;
          stub(Selectors, 'pageSize').returns(size);

          expectAction(() => actions.updatePageSize(size), Actions.UPDATE_PAGE_SIZE, size,
            (meta) => expect(meta.validator.payload.func(null, {})).to.be.false);
        });
      });

      describe('updateCurrentPage()', () => {
        it('should return an action', () => {
          const page = 5;
          const state = { a: 'b' };
          const pageSelector = stub(Selectors, 'page').returns(8);

          expectAction(() => actions.updateCurrentPage(page), Actions.UPDATE_CURRENT_PAGE, page,
            (meta) => {
              expect(meta.validator.payload.func(null, state)).to.be.true;
              return expect(pageSelector).to.be.calledWith(state);
            });
        });

        it('should invalidate action if page is the same as current page', () => {
          const page = 5;
          stub(Selectors, 'page').returns(page);

          expectAction(() => actions.updateCurrentPage(page), Actions.UPDATE_CURRENT_PAGE, page,
            (meta) => expect(meta.validator.payload.func(null, { a: 'b' })).to.be.false);
        });

        it('should invalidate action if page is null', () => {
          expectAction(() => actions.updateCurrentPage(null), Actions.UPDATE_CURRENT_PAGE, null,
            (meta) => expect(meta.validator.payload.func(null, {})).to.be.false);
        });
      });

      describe('updateDetails()', () => {
        it('should return an action', () => {
          const id = '4123';
          const title = 'my-product';

          expectAction(() => actions.updateDetails(id, title), Actions.UPDATE_DETAILS, { id, title });
        });
      });

      describe('updateAutocompleteQuery()', () => {
        it('should return an action', () => {
          const query = 'pink elephant';
          const state = { a: 'b' };
          const autocompleteQuery = stub(Selectors, 'autocompleteQuery').returns('red elephant');

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.updateAutocompleteQuery(query), Actions.UPDATE_AUTOCOMPLETE_QUERY, query,
            (meta) => {
              expect(meta.validator.payload.func(null, state)).to.be.true;
              return expect(autocompleteQuery).to.be.calledWith(state);
            });
        });

        it('should invalidate action if queries are the same', () => {
          const query = 'pink elephant';
          const state = { a: 'b' };
          stub(Selectors, 'autocompleteQuery').returns(query);

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.updateAutocompleteQuery(query), Actions.UPDATE_AUTOCOMPLETE_QUERY, query,
            (meta) => expect(meta.validator.payload.func(null, state)).to.be.false);
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
        const receiveQuery = actions.receiveQuery = spy(() => receiveQueryAction);
        const receiveProductRecords = actions.receiveProductRecords = spy(() => receiveProductRecordsAction);
        const receiveNavigations = actions.receiveNavigations = spy(() => receiveNavigationsAction);
        const receiveRecordCount = actions.receiveRecordCount = spy(() => receiveRecordCountAction);
        const receiveCollectionCount = actions.receiveCollectionCount = spy(() => receiveCollectionCountAction);
        const receivePage = actions.receivePage = spy(() => receivePageAction);
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
        const receiveAutocompleteProductRecords = actions.receiveAutocompleteProductRecords = spy(() => receiveAutocompleteProductRecordsAction);
        const receiveAutocompleteTemplate = actions.receiveAutocompleteTemplate = spy(() => receiveAutocompleteTemplateAction);

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
