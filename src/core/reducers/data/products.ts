import Actions from '../../actions';
import Store from '../../store';

export type State = Store.Product[];

export default function updateProducts(state: State = [], action): State {
  switch (action.type) {
    case Actions.RECEIVE_PRODUCTS: return action.products;
    case Actions.RECEIVE_MORE_PRODUCTS: return state.concat(action.products);
    default: return state;
  }
}
