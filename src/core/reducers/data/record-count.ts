import Actions from '../../actions';

export type Action = Actions.ReceiveRecordCount;
export type State = number;

export default function updateRecordCount(state: State = null, action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_RECORD_COUNT: return action.payload;
    default: return state;
  }
}
