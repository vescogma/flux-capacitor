import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.UpdateQuery | Actions.ReceiveQuery;
export type State = Store.Query;

export const DEFAULTS: State = {
  didYouMean: [],
  related: [],
  rewrites: [],
};

export default function updateQuery(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_QUERY: return updateOriginal(state, action.payload);
    case Actions.RECEIVE_QUERY: return receiveQuery(state, action.payload);
    default: return state;
  }
}

export const updateOriginal = (state: State, query: string) =>
  ({ ...state, original: query });

export const receiveQuery = (state: State, { corrected, didYouMean, related, rewrites }: Actions.Payload.Query) =>
  ({ ...state, corrected, didYouMean, related, rewrites });
