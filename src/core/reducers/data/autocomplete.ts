import { Action, Store } from '../..';
import Actions = Action.Autocomplete;

export type State = Store.Autocomplete;

export const DEFAULTS: State = {
  category: { values: [] },
  products: [],
  suggestions: [],
};

export default function updateAutocomplete(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Action.types.UPDATE_AUTOCOMPLETE_QUERY: return updateQuery(state, action);
    case Action.types.RECEIVE_AUTOCOMPLETE_SUGGESTIONS: return receiveSuggestions(state, action);
    default: return state;
  }
}

export const updateQuery = (state: State, { query }: Actions.UpdateQuery) =>
  ({ ...state, query });

export const receiveSuggestions = (state: State, { categoryValues, suggestions }: Actions.ReceiveSuggestions) =>
  ({
    ...state,
    category: {
      ...state.category,
      values: categoryValues,
    },
    suggestions,
  });
