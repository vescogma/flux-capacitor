import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.ReceiveProductRecords | Actions.ReceiveMoreProducts;
export type State = Store.ProductWithMetadata[];

export default function updateProducts(state: State = [], action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_PRODUCT_RECORDS: return action.payload;
    case Actions.RECEIVE_MORE_PRODUCTS: return updateMoreProducts(state, action);
    default: return state;
  }
}

export function updateMoreProducts(state: State, { payload }: Actions.ReceiveMoreProducts) {
  if (state[0].index > payload[payload.length - 1].index) {
    return [...payload, ...state];
  } else if (state[state.length - 1].index < payload[0].index) {
    return [...state, ...payload];
  } else {
    return state;
  }
}
