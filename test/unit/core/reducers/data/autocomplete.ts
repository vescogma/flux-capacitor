import { Actions, ActionCreator, Store } from '../../../../../src/core';
import autocomplete from '../../../../../src/core/reducers/data/autocomplete';
import suite from '../../../_suite';

suite('autocomplete', ({ expect }) => {
  let actions: ActionCreator;
  const query = 'brown shoes';
  const category = { field: 'a', values: ['b'] };
  const suggestions = ['e', 'f', 'g'];
  const navigations = [];
  const products = [];
  const state: Store.Autocomplete = {
    category,
    products,
    navigations,
    suggestions,
  };
  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateAutocomplete()', () => {
    it('should update query state on UPDATE_AUTOCOMPLETE_QUERY', () => {
      const newQuery = 'red shoes';
      const newState = {
        category,
        products,
        query: newQuery,
        navigations,
        suggestions,
      };

      const reducer = autocomplete(state, { type: Actions.UPDATE_AUTOCOMPLETE_QUERY, query: newQuery });

      expect(reducer).to.eql(newState);
    });

    it('should update state on RECEIVE_AUTOCOMPLETE_SUGGESTIONS', () => {
      const categoryValues = ['a', 'c', 'd'];
      const newState = {
        category: { ...category, values: categoryValues },
        products,
        navigations,
        suggestions,
      };

      const reducer = autocomplete(state, {
        type: Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS,
        categoryValues,
        navigations,
        suggestions,
      });

      expect(reducer).to.eql(newState);
    });

    it('should update state on RECEIVE_AUTOCOMPLETE_PRODUCTS', () => {
      const newProducts = [1, 2, 3];
      const newState = {
        category,
        products: newProducts,
        navigations,
        suggestions,
      };

      const reducer = autocomplete(state, {
        type: Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS,
        products: newProducts,
      });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = autocomplete(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
