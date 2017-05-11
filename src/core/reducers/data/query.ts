import { Action, Store } from '../..';
import Actions = Action.Query;

export type State = Store.Query;

export const DEFAULTS: State = {
  didYouMean: [],
  related: [],
  rewrites: [],
};

export default function updateQuery(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Action.types.UPDATE_SEARCH: return updateOriginal(state, action);
    case Action.types.RECEIVE_QUERY: return receiveQuery(state, action);
    default: return state;
  }
}

export const updateOriginal = (state: State, { query: original }: Actions.UpdateOriginal) =>
  ({ ...state, original });

export const receiveQuery = (state: State, { corrected, didYouMean, related, rewrites }: Actions.ReceiveQuery) =>
  ({ ...state, corrected, didYouMean, related, rewrites });
