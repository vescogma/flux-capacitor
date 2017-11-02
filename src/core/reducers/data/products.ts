import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.ReceiveProductRecords | Actions.ReceiveMoreProducts;
export type State = Store.ProductWithMetadata[];

export default function updateProducts(state: State = [], action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_PRODUCT_RECORDS: return action.payload;
    case Actions.RECEIVE_MORE_PRODUCTS: return state.concat(action.payload);
    default: return state;
  }
}
