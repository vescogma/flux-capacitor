import { Action, Store } from '..';
import State = Store.Session;

export default function updateSession(state: State = {}, action) {
  if ('recallId' in action) {
    return updateRecallId(state, action);
  }
  if ('searchId' in action) {
    return updateSearchId(state, action);
  }

  return state;
}

export const updateRecallId = (state: State, { recallId }) =>
  ({ ...state, recallId });

export const updateSearchId = (state: State, { searchId }) =>
  ({ ...state, searchId });
