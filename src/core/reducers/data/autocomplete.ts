import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.UpdateAutocompleteQuery
  | Actions.ReceiveAutocompleteSuggestions
  | Actions.ReceiveAutocompleteProductRecords
  | Actions.ReceiveAutocompleteTemplate;
export type State = Store.Autocomplete;

export const DEFAULTS: State = {
  category: { values: [] },
  products: [],
  navigations: [],
  suggestions: [],
};

export default function updateAutocomplete(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_AUTOCOMPLETE_QUERY: return updateQuery(state, action.payload);
    case Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS: return receiveSuggestions(state, action.payload);
    case Actions.RECEIVE_AUTOCOMPLETE_PRODUCT_RECORDS: return receiveProductRecords(state, action.payload);
    case Actions.RECEIVE_AUTOCOMPLETE_TEMPLATE: return receiveTemplate(state, action.payload);
    default: return state;
  }
}

export const updateQuery = (state: State, query: string) =>
  ({ ...state, query });

// tslint:disable-next-line max-line-length
export const receiveSuggestions = (state: State, { categoryValues, suggestions, navigations }: Actions.Payload.Autocomplete.Suggestions) =>
  ({
    ...state,
    category: {
      ...state.category,
      values: categoryValues,
    },
    navigations,
    suggestions,
  });

export const receiveProductRecords = (state: State, products: Store.Product[]) =>
  ({ ...state, products });

export const receiveTemplate = (state: State, template: Store.Template) =>
  ({ ...state, template });
