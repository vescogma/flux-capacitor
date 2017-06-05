import Actions from '../../actions';
import Store from '../../store';
import Action = Actions.Autocomplete;

export type State = Store.Autocomplete;

export const DEFAULTS: State = {
  category: { values: [] },
  products: [],
  navigations: [],
  suggestions: [],
};

export default function updateAutocomplete(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Actions.UPDATE_AUTOCOMPLETE_QUERY: return updateQuery(state, action);
    case Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS: return receiveSuggestions(state, action);
    case Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS: return receiveProducts(state, action);
    default: return state;
  }
}

export const updateQuery = (state: State, { query }: Action.UpdateQuery) =>
  ({ ...state, query });

// tslint:disable-next-line max-line-length
export const receiveSuggestions = (state: State, { categoryValues, suggestions, navigations }: Action.ReceiveSuggestions) =>
  ({
    ...state,
    category: {
      ...state.category,
      values: categoryValues,
    },
    navigations,
    suggestions,
  });

export const receiveProducts = (state: State, { products }: Action.ReceiveProducts) =>
  ({ ...state, products });
