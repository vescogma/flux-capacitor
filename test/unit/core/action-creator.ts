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
      it('should return a batch action with RESET_PAGE', () => {
        const query = 'rambo';
        stub(Selectors, 'query');
        stub(utils, 'action');
        actions.resetPage = (): any => ACTION;

        const batchAction = actions.updateQuery(query);

        expect(batchAction[0]).to.eql(ACTION);
      });

      it('should return an action', () => {
        const query = 'rambo';
        stub(Selectors, 'query');

        expectAction(() => actions.updateQuery(query)[1], Actions.UPDATE_QUERY, query,
          (meta) => {
            expect(meta.validator.payload[0].func(query)).to.be.true;
            return expect(meta.validator.payload[1].func(query)).to.be.true;
          });
      });

      it('should not return an action when query is invalid', () => {
        const query = '';

        expectAction(() => actions.updateQuery(query)[1], Actions.UPDATE_QUERY, query,
          (meta) => expect(meta.validator.payload[0].func(query)).to.be.false);
      });

      it('should not return an action when query will not change', () => {
        const query = 'umbrella';
        stub(Selectors, 'query').returns(query);

        expectAction(() => actions.updateQuery(query)[1], Actions.UPDATE_QUERY, query,
          (meta) => expect(meta.validator.payload[1].func(query)).to.be.false);
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
      it('should return a batch action with RESET_PAGE', () => {
        const field = 'brand';
        actions.resetPage = (): any => ACTION;
        stub(utils, 'action');

        const batchAction = actions.resetRefinements(field);

        expect(batchAction[0]).to.eq(ACTION);
      });

      it('should return an action', () => {
        const field = 'brand';

        expectAction(() => actions.resetRefinements(field)[1], Actions.RESET_REFINEMENTS, field,
          (meta) => expect(meta.validator.payload[0].func()).to.be.true);
      });

      it('should not return an action when field is invalid', () => {
        const field = false;

        expectAction(() => actions.resetRefinements(field)[1], Actions.RESET_REFINEMENTS, field,
          (meta) => expect(meta.validator.payload[0].func()).to.be.false);
      });

      it('should not return an action when no refinements selected', () => {
        stub(Selectors, 'selectedRefinements').returns([]);

        expectAction(() => actions.resetRefinements()[1], Actions.RESET_REFINEMENTS, undefined,
          (meta) => expect(meta.validator.payload[1].func()).to.be.false);
      });

      it('should not return an action when no refinements selected for field', () => {
        const field = 'brand';
        stub(Selectors, 'selectedRefinements').returns([{}]);
        stub(Selectors, 'navigation').returns({ selected: [] });

        expectAction(() => actions.resetRefinements(field)[1], Actions.RESET_REFINEMENTS, field,
          (meta) => expect(meta.validator.payload[2].func()).to.be.false);
      });
    });

    describe('resetPage()', () => {
      it('should return an action', () => {
        stub(Selectors, 'page').returns(8);

        expectAction(() => actions.resetPage(), Actions.RESET_PAGE, undefined,
          (meta) => expect(meta.validator.payload.func()).to.be.true);
      });

      it('should not return an action', () => {
        stub(Selectors, 'page').returns(1);

        expectAction(() => actions.resetPage(), Actions.RESET_PAGE, undefined,
          (meta) => expect(meta.validator.payload.func()).to.be.false);
      });
    });

    describe('addRefinement()', () => {
      const navigationId = 'book';
      const refinement = { c: 'd' };
      const rangeRefinement = { range: true };

      it('should return a batch action with RESET_PAGE', () => {
        const value = 'a';
        const resetPageAction = { a: 'b' };
        stub(utils, 'refinementPayload').returns(refinement);
        stub(utils, 'action');
        stub(actions, 'resetPage').returns(resetPageAction);

        const batchAction = actions.addRefinement(navigationId, value);

        expect(batchAction[0]).to.eql(resetPageAction);
      });

      it('should return an action with value refinement', () => {
        const value = 'a';
        const refinementPayload = stub(utils, 'refinementPayload').returns(refinement);
        actions.resetPage = spy();

        expectAction(() => actions.addRefinement(navigationId, value)[1], Actions.ADD_REFINEMENT, refinement);
        expect(refinementPayload).to.be.calledWithExactly(navigationId, value, null);
      });

      it('should return an action with range refinement', () => {
        const low = 2;
        const high = 4;
        const refinementPayload = stub(utils, 'refinementPayload').returns(refinement);
        actions.resetPage = spy();

        expectAction(() => actions.addRefinement(navigationId, low, high)[1], Actions.ADD_REFINEMENT, refinement);
        expect(refinementPayload).to.be.calledWithExactly(navigationId, low, high);
      });

      it('should validate navigationId', () => {
        stub(utils, 'refinementPayload').returns(refinement);
        actions.resetPage = spy();

        expectAction(() => actions.addRefinement(null, null)[1], Actions.ADD_REFINEMENT, refinement,
          (meta) => expect(meta.validator.navigationId).to.eq(validators.isString));
      });

      it('should invalidate non-numeric low value', () => {
        stub(utils, 'refinementPayload').returns(rangeRefinement);
        actions.resetPage = spy();

        expectAction(() => actions.addRefinement(null, 'g')[1], Actions.ADD_REFINEMENT, rangeRefinement,
          (meta) => expect(meta.validator.payload[0].func(rangeRefinement)).to.be.false);
      });

      it('should invalidate non-numeric high value', () => {
        stub(utils, 'refinementPayload').returns(rangeRefinement);
        actions.resetPage = spy();

        expectAction(() => actions.addRefinement(null, 2, 'j')[1], Actions.ADD_REFINEMENT, rangeRefinement,
          (meta) => expect(meta.validator.payload[0].func(rangeRefinement)).to.be.false);
      });

      it('should invalidate low greater than high', () => {
        stub(utils, 'refinementPayload').returns(rangeRefinement);
        actions.resetPage = spy();

        expectAction(() => actions.addRefinement(null, 2, 1)[1], Actions.ADD_REFINEMENT, rangeRefinement,
          (meta) => expect(meta.validator.payload[1].func(rangeRefinement)).to.be.false);
      });

      it('should invalidate nonstring value', () => {
        const value = 7;
        const isStringValidator = stub(validators.isString, 'func').returns(false);
        stub(utils, 'refinementPayload').returns(refinement);
        actions.resetPage = spy();

        expectAction(() => actions.addRefinement(null, value)[1], Actions.ADD_REFINEMENT, refinement,
          (meta) => expect(meta.validator.payload[2].func(refinement)).to.be.false);
        expect(isStringValidator).to.be.calledWith(value);
      });

      it('should validate refinement for untracked field', () => {
        const state = { a: 'b' };
        const selectNavigation = stub(Selectors, 'navigation');
        stub(utils, 'refinementPayload').returns(refinement);
        actions.resetPage = spy();

        expectAction(() => actions.addRefinement(navigationId, null)[1], Actions.ADD_REFINEMENT, refinement,
          (meta) => expect(meta.validator.payload[3].func(null, state)).to.be.true);
        expect(selectNavigation).to.be.calledWithExactly(state, navigationId);
      });

      it('should invalidate currently selected value refinement', () => {
        const value = 7;
        const selected = { a: 'b' };
        const refinementsMatch = stub(SearchAdapter, 'refinementsMatch').returns(true);
        stub(utils, 'refinementPayload').returns(refinement);
        stub(Selectors, 'navigation').returns({ selected: [1], refinements: [{}, selected, {}] });
        actions.resetPage = spy();

        expectAction(() => actions.addRefinement(null, value)[1], Actions.ADD_REFINEMENT, refinement,
          (meta) => expect(meta.validator.payload[3].func(refinement)).to.be.false);
        expect(refinementsMatch).to.be.calledWithExactly(refinement, selected, 'Value');
      });

      it('should invalidate currently selected value refinement', () => {
        const value = 7;
        const selected = { a: 'b' };
        const refinementsMatch = stub(SearchAdapter, 'refinementsMatch').returns(true);
        stub(utils, 'refinementPayload').returns(refinement);
        stub(Selectors, 'navigation').returns({ range: true, selected: [1], refinements: [{}, selected, {}] });
        actions.resetPage = spy();

        expectAction(() => actions.addRefinement(null, value)[1], Actions.ADD_REFINEMENT, refinement,
          (meta) => expect(meta.validator.payload[3].func(refinement)).to.be.false);
        expect(refinementsMatch).to.be.calledWithExactly(refinement, selected, 'Range');
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
      it('should return a batch action with RESET_PAGE', () => {
        const isRefinementDeselected = stub(Selectors, 'isRefinementDeselected').returns(true);
        stub(utils, 'action');
        actions.resetPage = (): any => ACTION;

        const batchAction = actions.selectRefinement('', 0);

        expect(batchAction[0]).to.eq(ACTION);
      });

      it('should return a batch action', () => {
        const isRefinementDeselected = stub(Selectors, 'isRefinementDeselected').returns(true);
        const navigationId = 'colour';
        const index = 30;
        const state = { a: 'b' };

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.selectRefinement(navigationId, index)[1], Actions.SELECT_REFINEMENT, { navigationId, index },
          (meta) => {
            expect(meta.validator.payload.func(null, state)).to.be.true;
            return expect(isRefinementDeselected).to.be.calledWithExactly(state, navigationId, index);
          });
      });

      it('should invalidate action when refinement not selectable', () => {
        stub(Selectors, 'isRefinementDeselected').returns(false);

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.selectRefinement('colour', 30)[1], Actions.SELECT_REFINEMENT, { navigationId: 'colour', index: 30 },
          (meta) => expect(meta.validator.payload.func(null, {})).to.be.false);
      });

      describe('deselectRefinement()', () => {
        it('should return a batch action with RESET_PAGE', () => {
          const isRefinementDeselected = stub(Selectors, 'isRefinementDeselected').returns(true);
          stub(utils, 'action');
          actions.resetPage = (): any => ACTION;

          const batchAction = actions.deselectRefinement('', 0);

          expect(batchAction[0]).to.eq(ACTION);
        });

        it('should return a batch action', () => {
          const isRefinementSelected = stub(Selectors, 'isRefinementSelected').returns(true);
          const navigationId = 'colour';
          const index = 30;
          const state = { a: 'b' };

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.deselectRefinement(navigationId, index)[1], Actions.DESELECT_REFINEMENT, { navigationId, index },
            (meta) => {
              expect(meta.validator.payload.func(null, state)).to.be.true;
              return expect(isRefinementSelected).to.be.calledWithExactly(state, navigationId, index);
            });
        });

        it('should invalidate action when refinement not deselectable', () => {
          stub(Selectors, 'isRefinementSelected').returns(false);

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.deselectRefinement('colour', 30)[1], Actions.DESELECT_REFINEMENT, { navigationId: 'colour', index: 30 },
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
