import _Action, * as Actions from '../../actions';
import Store from '../../store';
import Action = _Action.Autocomplete;

export type State = Store.Autocomplete;

export const DEFAULTS: State = {
  category: { values: [] },
  products: [],
  suggestions: [],
};

export default function updateAutocomplete(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Actions.UPDATE_AUTOCOMPLETE_QUERY: return updateQuery(state, action);
    case Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS: return receiveSuggestions(state, action);
    default: return state;
  }
}

export const updateQuery = (state: State, { query }: Action.UpdateQuery) =>
  ({ ...state, query });

export const receiveSuggestions = (state: State, { categoryValues, suggestions }: Action.ReceiveSuggestions) =>
  ({
    ...state,
    category: {
      ...state.category,
      values: categoryValues,
    },
    suggestions,
  });
