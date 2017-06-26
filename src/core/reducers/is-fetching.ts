import Actions from '../actions';
import Store from '../store';

export type Action = Actions.IsFetching
  | Actions.ReceiveMoreRefinements
  | Actions.ReceiveMoreProducts
  | Actions.ReceiveAutocompleteSuggestions
  | Actions.ReceiveAutocompleteProducts
  | Actions.ReceiveDetailsProduct
  | Actions.ReceiveProducts;
export type State = Store.IsFetching;

export namespace Request {
  export const MORE_REFINEMENTS = 'moreRefinements';
  export const PRODUCTS = 'search';
  export const MORE_PRODUCTS = 'moreProducts';
  export const AUTOCOMPLETE_SUGGESTIONS = 'autocompleteSuggestions';
  export const AUTOCOMPLETE_PRODUCTS = 'autocompleteProducts';
  export const DETAILS_PRODUCT = 'details';
}

export default function updateIsFetching(state: State = {}, action: Action): State {
  switch (action.type) {
    case Actions.IS_FETCHING: return setFetching(state, action.payload);
    case Actions.RECEIVE_MORE_REFINEMENTS: return doneFetching(state, Request.MORE_REFINEMENTS);
    case Actions.RECEIVE_MORE_PRODUCTS: return doneFetching(state, Request.MORE_PRODUCTS);
    case Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS: return doneFetching(state, Request.AUTOCOMPLETE_SUGGESTIONS);
    case Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS: return doneFetching(state, Request.AUTOCOMPLETE_PRODUCTS);
    case Actions.RECEIVE_DETAILS_PRODUCT: return doneFetching(state, Request.DETAILS_PRODUCT);
    case Actions.RECEIVE_PRODUCTS: return doneFetching(state, Request.PRODUCTS);
    default: return state;
  }
}

export const setFetching = (state: State, requestType: keyof State) =>
  ({ ...state, [requestType]: true });

export const doneFetching = (state: State, requestType: keyof State) =>
  ({ ...state, [requestType]: false });
