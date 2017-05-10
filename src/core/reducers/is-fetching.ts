import { Action, Store } from '..';
import State = Store.IsFetching;

export default function updateIsFetching(state: State, action): State {
  switch (action.type) {
    case Action.types.SO_FETCHING: return soFetching(state, action);
    case Action.types.RECEIVE_MORE_REFINEMENTS: return notFetching(state, 'moreRefinements');
    case Action.types.RECEIVE_AUTOCOMPLETE_SUGGESTIONS: return notFetching(state, 'autocompleteSuggestions');
    case Action.types.RECEIVE_AUTOCOMPLETE_PRODUCTS: return notFetching(state, 'autocompleteProducts');
    case Action.types.RECEIVE_DETAILS_PRODUCT: return notFetching(state, 'details');
    case Action.types.RECEIVE_PRODUCTS: return notFetching(state, 'search');
    default: return state;
  }
}

export const soFetching = (state: State, { requestType }) =>
  ({ ...state, [requestType]: true });

export const notFetching = (state: State, requestType: keyof State) =>
  ({ ...state, [requestType]: false });
