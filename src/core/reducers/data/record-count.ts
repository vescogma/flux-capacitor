import Actions from '../../actions';

export type State = number;

export default function updateRecordCount(state: State = 0, action): State {
  switch (action.type) {
    case Actions.RECEIVE_RECORD_COUNT: return action.recordCount;
    default: return state;
  }
}
