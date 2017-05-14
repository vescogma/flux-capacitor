import _Action, * as Actions from '../../actions';
import Store from '../../store';
import Action = _Action.Query;

export type State = Store.Query;

export const DEFAULTS: State = {
  didYouMean: [],
  related: [],
  rewrites: [],
};

export default function updateQuery(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Actions.UPDATE_SEARCH: return updateOriginal(state, action);
    case Actions.RECEIVE_QUERY: return receiveQuery(state, action);
    default: return state;
  }
}

export const updateOriginal = (state: State, { query: original }: Action.UpdateOriginal) =>
  ({ ...state, original });

export const receiveQuery = (state: State, { corrected, didYouMean, related, rewrites }: Action.ReceiveQuery) =>
  ({ ...state, corrected, didYouMean, related, rewrites });
