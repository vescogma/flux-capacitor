import Actions from '../../actions';
import Store from '../../store';
import { transformProducts } from '../../utils';

export type Action = Actions.ReceiveProductRecords | Actions.ReceiveMoreProducts;
export type State = Store.AllProducts;

export const DEFAULTS = {
  products: [],
  transformedProducts: []
};

export default function updateProducts(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_PRODUCT_RECORDS: return overwriteProducts(state, action.payload);
    case Actions.RECEIVE_MORE_PRODUCTS: return appendProducts(state, action.payload);
    default: return state;
  }
}

export const overwriteProducts = (state: State, payload: Actions.Payload.Products.Records) => ({
  products: payload.products,
  transformedProducts: transformProducts(payload.products, payload.structure)
});

export const appendProducts = (state: State, payload: Actions.Payload.Products.Records) => ({
  products: state.products.concat(payload.products),
  transformedProducts: state.transformedProducts.concat(transformProducts(payload.products, payload.structure)),
});
