import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.SelectCollection | Actions.ReceiveCollectionCount;
export type State = Store.Indexed.Selectable<Store.Collection>;

export const DEFAULT_COLLECTION = 'default';
export const DEFAULTS: State = {
  allIds: [DEFAULT_COLLECTION],
  byId: { [DEFAULT_COLLECTION]: { name: DEFAULT_COLLECTION } },
};

export default function updateCollections(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.SELECT_COLLECTION: return updateSelected(state, action.payload);
    case Actions.RECEIVE_COLLECTION_COUNT: return receiveCount(state, action.payload);
    default: return state;
  }
}

export const updateSelected = (state: State, selected: string) =>
  ({ ...state, selected });

export const receiveCount = (state: State, { collection, count: total }: Actions.Payload.Collection.Count) =>
  ({
    ...state,
    byId: {
      ...state.byId,
      [collection]: { ...state.byId[collection], total },
    },
  });
