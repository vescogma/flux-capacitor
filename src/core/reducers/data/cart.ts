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
export const STORAGE_WHITELIST = ['content'];

export const DEFAULTS: State = {
  content: {
    cartId: '',
    items: [],
    visitorId: '',
    sessionId: ''
  }
};

function updateCart(state: State = DEFAULTS, action: any): State {
  switch (action.type) {
    case Actions.GET_TRACKER_INFO:
      return getTrackerInfo(state, action.payload);
    case Actions.CREATE_CART:
      return createCart(state, action.payload);
    case Actions.CART_CREATED:
      return cartCreated(state, action.payload);
    case Actions.ADD_TO_CART:
      return addToCart(state, action.payload);
    default:
      return state;
  }
}

export const getTrackerInfo = (state: State, { visitorId, sessionId }: Actions.Payload.Cart.CreateCart) => {
  return {
    ...state,
    content: { ...state.content, visitorId, sessionId }
  };
};

export const createCart = (state: State, { visitorId, sessionId }: Actions.Payload.Cart.CreateCart) => {
  return {
    ...state
  };
};

export const cartCreated = (state: State, { cartId }: Actions.Payload.Cart.CartConfirmation) => {
  return ({
    ...state, content: { ...state.content, cartId }
  });
};

export const addToCart = (state: State, item: any) => ({
  ...state, content: { ...state.content, items: [...state.content.items, item] }
});

const cartTransform = createTransform(Adapter.transformToBrowser);

export default persistReducer({
  transforms: [cartTransform], key: STORAGE_KEY, storage, whitelist: STORAGE_WHITELIST
},
  updateCart);
