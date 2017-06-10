import { Actions, ActionCreator, Store } from '../../../../src/core';
import isFetching from '../../../../src/core/reducers/is-fetching';
import suite from '../../_suite';

suite('isFetching', ({ expect }) => {
  let actions: ActionCreator;
  const moreRefinements = true;
  const moreProducts = true;
  const search = true;
  const autocompleteSuggestions = true;
  const autocompleteProducts = false;
  const details = true;
  const state: Store.IsFetching = {
    moreRefinements,
    moreProducts,
    search,
    autocompleteSuggestions,
    autocompleteProducts,
    details
  };
  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateIsFetching()', () => {
    it('should update state on SO_FETCHING', () => {
      const newState = {
        moreRefinements,
        moreProducts,
        search,
        autocompleteSuggestions: true,
        autocompleteProducts,
        details
      };

      const reducer = isFetching(state, { type: Actions.SO_FETCHING, requestType: 'autocompleteSuggestions' });

      expect(reducer).to.eql(newState);
    });

    it('should update state on RECEIVE_MORE_REFINEMENTS', () => {
      const newState = {
        moreRefinements: false,
        moreProducts,
        search,
        autocompleteSuggestions,
        autocompleteProducts,
        details
      };

      const reducer = isFetching(state, { type: Actions.RECEIVE_MORE_REFINEMENTS });

      expect(reducer).to.eql(newState);
    });

    it('should update state on RECEIVE_MORE_PRODUCTS', () => {
      const newState = {
        moreRefinements,
        moreProducts: false,
        search,
        autocompleteSuggestions,
        autocompleteProducts,
        details
      };

      const reducer = isFetching(state, { type: Actions.RECEIVE_MORE_PRODUCTS });

      expect(reducer).to.eql(newState);
    });

    it('should update state on RECEIVE_AUTOCOMPLETE_SUGGESTIONS', () => {
      const newState = {
        moreRefinements,
        moreProducts,
        search,
        autocompleteSuggestions: false,
        autocompleteProducts,
        details
      };

      const reducer = isFetching(state, { type: Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS });

      expect(reducer).to.eql(newState);
    });

    it('should update state on RECEIVE_AUTOCOMPLETE_PRODUCTS', () => {
      const newState = {
        moreRefinements,
        moreProducts,
        search,
        autocompleteSuggestions,
        autocompleteProducts: false,
        details
      };

      const reducer = isFetching({ ...state, autocompleteProducts: true }, { type: Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS });

      expect(reducer).to.eql(newState);
    });

    it('should update state on RECEIVE_DETAILS_PRODUCT', () => {
      const newState = {
        moreRefinements,
        moreProducts,
        search,
        autocompleteSuggestions,
        autocompleteProducts,
        details: false
      };

      const reducer = isFetching(state, { type: Actions.RECEIVE_DETAILS_PRODUCT });

      expect(reducer).to.eql(newState);
    });

    it('should update state on RECEIVE_PRODUCTS', () => {
      const newState = {
        moreRefinements,
        moreProducts,
        search: false,
        autocompleteSuggestions,
        autocompleteProducts,
        details
      };

      const reducer = isFetching(state, { type: Actions.RECEIVE_PRODUCTS });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = isFetching(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
