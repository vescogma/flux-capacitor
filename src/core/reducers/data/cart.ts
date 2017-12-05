import { createTransform, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import Actions from '../../actions';
import Adapter from '../../adapters/cart';
import Store from '../../store';

export type Action = Actions.GetTrackerInfo
  | Actions.CreateCart
  | Actions.CartCreated;
export type State = Store.Cart;

export const STORAGE_KEY = 'gb-cart';

export const DEFAULTS: State = {
  cartId: '',
  items: []
};

function updateCart(state: State = DEFAULTS, action: any): State {
  console.log('in reducer',action.type)
  switch (action.type) {
    case Actions.GET_TRACKER_INFO:
      return createCart(state, action.payload);
    case Actions.CREATE_CART:
      return createCart(state, action.payload);
    case Actions.CART_CREATED:
      return cartCreated(state, action.payload);
    default:
      return state;
  }
}

export const createCart = (state: State, { visitorId, sessionId }: Actions.Payload.Cart.CreateCart) => {
  console.log('here', visitorId);
  return {
    ...state,
    visitorId,
    sessionId
  };
};

export const cartCreated = (state: State, { cartId }: Actions.Payload.Cart.CartConfirmation) => ({
  ...state,
  cartId
});

const cartTransform = createTransform(Adapter.transformToBrowser);

export default persistReducer({
  transforms: [cartTransform], key: STORAGE_KEY, storage,
},
  updateCart);
