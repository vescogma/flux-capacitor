import { Action, Store } from '..';

export type State = Store.Product[];

export default function updateProducts(state: State = [], action) {
  switch (action.type) {
    case Action.types.RECEIVE_PRODUCTS: return action.products;
    default: return state;
  }
}
