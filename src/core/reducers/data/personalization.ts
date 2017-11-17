import { createTransform, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import Actions from '../../actions';
import Adapter from '../../adapters/personalization';
import Selectors from '../../selectors';
import Store from '../../store';

export type Action = Actions.UpdateBiasing;
export type State = Store.Personalization;

export const STORAGE_KEY = 'gb-personalization';
export const STORAGE_WHITELIST = ['biasing'];

export const DEFAULT: State = {
  biasing: {
    allIds: [],
    byId: {},
    expiry: 0
  }
};

function updatePersonalization(state: State = DEFAULT, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_BIASING: return updateBiasing(state, action.payload);
    default: return state;
  }
}

export const updateBiasing = (state: State, payload: Actions.Payload.Personalization.Biasing) => {
  const byId = {
    ...state.biasing.byId,
    [payload.variant]: {
      ...state.biasing.byId[payload.variant],
      [payload.key]: payload.bias
    }
  };

  let allIds = insertSorted(state.biasing.allIds, { variant: payload.variant, key: payload.key });
  const keyCount = Object.keys(byId[payload.variant]).length;
  const config = payload.config;
  // TODO MAGIC NUMBER
  if (config.attributes[payload.variant] && (keyCount > (config.attributes[payload.variant].maxBiases || 3))) {
    allIds = removeOldest(allIds, payload.variant);
  }
  if (allIds.length > config.maxBiases) {
    allIds = allIds.slice(0, config.maxBiases);
  }

  return { ...state, biasing: { ...state.biasing, byId, allIds }};
};

// tslint:disable-next-line max-line-length
export const insertSorted = (allIds: Store.Personalization.BiasKey[], { variant, key }: Store.Personalization.BiasKey) => {
  const noDuplicate = allIds.filter((id) => !(id.variant === variant && id.key === key));
  return [{ variant, key }, ...noDuplicate]; //TODO: insert sorted
};

export const removeOldest = (allIds, variant) => {
  for (let i = allIds.length - 1; i >= 0; i--) {
    if (allIds[i].variant === variant) {
      return [...allIds.slice(0, i), ...allIds.slice(i + 1)];
    }
  }
  return allIds;
};

const personalizationTransform = createTransform(
  // transform state coming from redux on its way to being serialized and stored
  Adapter.transformToBrowser,
  // transform state coming from storage, on its way to be rehydrated into redux
  Adapter.transformFromBrowser,
  // configuration options (if any)
);

export default persistReducer({ transforms: [personalizationTransform], key: STORAGE_KEY, storage,
                                whitelist: STORAGE_WHITELIST },
                              updatePersonalization);
