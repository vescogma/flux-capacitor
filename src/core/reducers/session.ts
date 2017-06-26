import Actions from '../actions';
import Store from '../store';

export type Action = Actions.Action<string, any, Actions.Metadata>;
export type State = Store.Session;

export default function updateSession(state: State = {}, { metadata = <Actions.Metadata>{} }: Action): State {
  if ('recallId' in metadata) {
    state = updateRecallId(state, metadata);
  }
  if ('searchId' in metadata) {
    state = updateSearchId(state, metadata);
  }
  if ('tag' in metadata) {
    state = updateOrigin(state, metadata);
  }

  return state;
}

export const updateRecallId = (state: State, { recallId }: Actions.Metadata) =>
  ({ ...state, recallId });

export const updateSearchId = (state: State, { searchId }: Actions.Metadata) =>
  ({ ...state, searchId });

export const updateOrigin = (state: State, { tag: origin }: Actions.Metadata) =>
  ({ ...state, origin });
