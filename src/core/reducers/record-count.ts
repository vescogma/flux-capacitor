import { Action, Store } from '..';

export type State = number;

export default function updateRecordCount(state: State = 0, action): State {
  switch (action.type) {
    case Action.types.RECEIVE_PRODUCTS: return action.recordCount;
    default: return state;
  }
}
