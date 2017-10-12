import Actions from '../actions';
import Store from '../store';

export type Action = Actions.Action<string, any, Actions.Metadata>;
export type State = Store.Session;

// tslint:disable-next-line max-line-length
export default function updateSession(state: State = {}, { type, payload, meta = <Actions.Metadata>{} }: Action): State {
  switch (type) {
    case Actions.UPDATE_LOCATION: return updateLocation(state, payload);
    default: {
      if ('recallId' in meta) {
        state = updateRecallId(state, meta);
      }
      if ('searchId' in meta) {
        state = updateSearchId(state, meta);
      }
      if ('tag' in meta) {
        state = updateOrigin(state, meta);
      }

      return state;
    }
  }
}

export const updateLocation = (state: State, location: Store.Geolocation) =>
  ({ ...state, location });

export const updateRecallId = (state: State, { recallId }: Actions.Metadata) =>
  ({ ...state, recallId });

export const updateSearchId = (state: State, { searchId }: Actions.Metadata) =>
  ({ ...state, searchId });

export const updateOrigin = (state: State, { tag: origin }: Actions.Metadata) =>
  ({ ...state, origin });
