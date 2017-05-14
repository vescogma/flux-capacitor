import * as Actions from '../actions';
import Store from '../store';

export type State = boolean;

export default function updateIsRunning(state: State = false, action): State {
  switch (action.type) {
    case Actions.START_APP: return true;
    case Actions.SHUTDOWN_APP: return false;
    default: return state;
  }
}
