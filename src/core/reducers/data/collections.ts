import { Action, Store } from '../..';
import Actions = Action.Collections;

export type State = Store.Indexed.Selectable<Store.Collection>;

export const DEFAULTS: State = {
  allIds: [],
  byId: {},
};

export default function updateCollections(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Action.types.SELECT_COLLECTION: return updateSelected(state, action);
    case Action.types.RECEIVE_COLLECTION_COUNT: return receiveCount(state, action);
    default: return state;
  }
}

export const updateSelected = (state: State, { id: selected }: Actions.SelectCollection) =>
  ({ ...state, selected });

export const receiveCount = (state: State, { collection, count: total }: Actions.ReceiveCount) =>
  ({
    ...state,
    byId: {
      ...state.byId,
      [collection]: { ...state.byId[collection], total },
    },
  });
