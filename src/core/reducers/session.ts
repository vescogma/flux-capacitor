import Actions from '../actions';
import Configuration from '../configuration';
import Store from '../store';

export type Action = Actions.UpdateLocation | Actions.UpdateSecuredPayload  |
  Actions.Action<string, any>;
export type State = Store.Session;

export default function updateSession(state: State = {}, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_LOCATION: return updateLocation(state, action.payload);
    case Actions.UPDATE_SECURED_PAYLOAD: return updateSecuredPayload(state, action.payload);
    default: {
      if (action.meta) {
        if ('recallId' in action.meta) {
          state = updateRecallId(state, action.meta);
        }
        if ('searchId' in action.meta) {
          state = updateSearchId(state, action.meta);
        }
        if ('tag' in action.meta) {
          state = updateOrigin(state, action.meta);
        }
      }
      return state;
    }
  }
}

export const updateSecuredPayload = (state, securedPayload: Configuration.Recommendations.SecuredPayload) =>
  ({
    ...state,
    config: {
      ...state.config,
      recommendations: {
        ...state.config.recommendations,
        pastPurchases: {
          ...state.config.recommendations.pastPurchases,
          securedPayload
        }
      }
    }
  });

export const updateLocation = (state: State, location: Store.Geolocation) =>
  ({ ...state, location });

export const updateRecallId = (state: State, { recallId }: Actions.Metadata) =>
  ({ ...state, recallId });

export const updateSearchId = (state: State, { searchId }: Actions.Metadata) =>
  ({ ...state, searchId });

export const updateOrigin = (state: State, { tag: origin }: Actions.Metadata) =>
  ({ ...state, origin });
