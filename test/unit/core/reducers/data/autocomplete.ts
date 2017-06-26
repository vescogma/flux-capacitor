import { Actions, Store } from '../../../../../src/core';
import autocomplete from '../../../../../src/core/reducers/data/autocomplete';
import suite from '../../../_suite';

suite('autocomplete', ({ expect }) => {
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

  describe('updateAutocomplete()', () => {
    it('should update query state on UPDATE_AUTOCOMPLETE_QUERY', () => {
      const payload = 'red shoes';
      const newState = {
        category,
        products,
        query: payload,
        navigations,
        suggestions,
      };

      const reducer = autocomplete(state, { type: Actions.UPDATE_AUTOCOMPLETE_QUERY, payload });

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
        payload: {
          categoryValues,
          navigations,
          suggestions,
        }
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

      const reducer = autocomplete(state, <any>{
        type: Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS,
        payload: newProducts,
      });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = autocomplete(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
