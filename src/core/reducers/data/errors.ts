import { Action, Store } from '../..';

export default function updateErrors(state: string[] = [], action) {
  switch (action.type) {
    // case Actions.UPDATE_ERRORS:
    //   return { ...state };
    default:
      return state;
  }
}
