import { Action, Store } from '..';

export default function updateIsRunning(state: boolean = false, action) {
  switch (action.type) {
    case Action.types.START_APP: return true;
    case Action.types.SHUTDOWN_APP: return false;
    default: return state;
  }
}
