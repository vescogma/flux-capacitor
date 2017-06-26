import Actions from '../actions';
import Store from '../store';

export type Action = Actions.StartApp | Actions.ShutdownApp;
export type State = boolean;

export default function updateIsRunning(state: State = false, action: Action): State {
  switch (action.type) {
    case Actions.START_APP: return true;
    case Actions.SHUTDOWN_APP: return false;
    default: return state;
  }
}
