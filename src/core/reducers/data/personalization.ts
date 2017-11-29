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
    [payload.field]: {
      ...state.biasing.byId[payload.field],
      [payload.value]: payload.bias
    }
  };

  const allIds = Adapter.pruneBiases(insertSorted(state.biasing.allIds, { field: payload.field, value: payload.value }),
    payload.field, Object.keys(byId[payload.field]).length, payload.config);

  return { ...state, biasing: { ...state.biasing, byId, allIds }};
};

// tslint:disable-next-line max-line-length
export const insertSorted = (allIds: Store.Personalization.BiasKey[], { field, value }: Store.Personalization.BiasKey) => {
  const noDuplicate = allIds.filter((id) => !(id.field === field && id.value === value));
  return [{ field, value }, ...noDuplicate];
};

const personalizationTransform = createTransform(
  // transform state coming from redux on its way to being serialized and stored
  Adapter.transformToBrowser,
  // configuration options (if any)
);

export default persistReducer({ transforms: [personalizationTransform], key: STORAGE_KEY, storage,
                                whitelist: STORAGE_WHITELIST },
                              updatePersonalization);
