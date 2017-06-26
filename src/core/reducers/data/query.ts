import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.UpdateSearch | Actions.ReceiveQuery;
export type State = Store.Query;

export const DEFAULTS: State = {
  didYouMean: [],
  related: [],
  rewrites: [],
};

export default function updateQuery(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_SEARCH: return updateOriginal(state, action.payload);
    case Actions.RECEIVE_QUERY: return receiveQuery(state, action.payload);
    default: return state;
  }
}

export const updateOriginal = (state: State, { query: original }: Actions.Payload.Search) =>
  ({ ...state, original });

export const receiveQuery = (state: State, { corrected, didYouMean, related, rewrites }: Actions.Payload.Query) =>
  ({ ...state, corrected, didYouMean, related, rewrites });
