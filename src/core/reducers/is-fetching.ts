import Actions from '../actions';
import Store from '../store';

export type State = Store.IsFetching;

export default function updateIsFetching(state: State = {}, action): State {
  switch (action.type) {
    case Actions.SO_FETCHING: return soFetching(state, action);
    case Actions.RECEIVE_MORE_REFINEMENTS: return notFetching(state, 'moreRefinements');
    case Actions.RECEIVE_MORE_PRODUCTS: return notFetching(state, 'moreProducts');
    case Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS: return notFetching(state, 'autocompleteSuggestions');
    case Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS: return notFetching(state, 'autocompleteProducts');
    case Actions.RECEIVE_DETAILS_PRODUCT: return notFetching(state, 'details');
    case Actions.RECEIVE_PRODUCTS: return notFetching(state, 'search');
    default: return state;
  }
}

export const soFetching = (state: State, { requestType }) =>
  ({ ...state, [requestType]: true });

export const notFetching = (state: State, requestType: keyof State) =>
  ({ ...state, [requestType]: false });
