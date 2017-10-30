
import Actions from '../../actions';
import Selectors from '../../selectors';
import Store from '../../store';
import Adapter from '../../adapters/personalization';

export type Action = Actions.UpdateBiasing;
export type State = Store.Personalization;

export default function updatePersonalization(state: State = <any>{}, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_BIASING: return updateBiasing(state, action.payload);
    default: return state;
  }
}

export const updateBiasing = (state: State, payload: Actions.Payload.Personalization.Biasing) => {
  const byId = {
    ...state.byId,
    [payload.variant]: {
      ...state.byId[payload.variant],
      [payload.key]: payload.bias
    }
  };

  let allIds = insertSorted(state.allIds, { variant: payload.variant, key: payload.key });
  const keyCount = Object.keys(byId[payload.variant]).length;
  const config = payload.config.personalization.realtimeBiasing;
  if (config.attributes[payload.variant] && (keyCount > config.attributes[payload.variant].maxBiases)) {
    allIds = removeLast(allIds, payload.variant);
  }
  if (allIds.length > config.globalMaxBiases) {
    allIds = allIds.slice(0, config.globalMaxBiases);
  }

  return { ...state, byId, allIds };
};

const insertSorted = (allIds: Store.Personalization.BiasKey[], { variant, key }: Store.Personalization.BiasKey) => {
  const noDuplicate = allIds.filter((id) => !(id.variant === variant && id.key === key));
  return [{ variant, key }, ...noDuplicate]; //TODO: insert sorted
};

const removeLast = (allIds, variant) => {
  for (let i = allIds.length - 1; i >= 0; i--) {
    if (allIds[i].variant === variant) {
      return [...allIds.slice(0, i), ...allIds.slice(i + 1)];
    }
  }
  return allIds;
};
