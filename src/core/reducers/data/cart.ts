import { createTransform, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import Actions from '../../actions';
import Adapter from '../../adapters/cart';
import Store from '../../store';

export type Action = Actions.GetTrackerInfo
  | Actions.CartCreated
  | Actions.AddToCart
  | Actions.CartServerUpdated;
export type State = Store.Cart;

export const STORAGE_KEY = 'gb-cart';
export const STORAGE_WHITELIST = ['content'];

export const DEFAULTS: any = {
  content: {
    cartId: '',
    totalQuantity: 0,
    items: [],
    visitorId: '',
    sessionId: '',
    generatedTotalPrice: 0,
    lastModified: null,
  }
};

function updateCart(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.GET_TRACKER_INFO:
      return getTrackerInfo(state, action.payload);
    case Actions.ADD_TO_CART:
      return addToCart(state, action.payload);
    case Actions.CART_CREATED:
      return cartCreated(state, action.payload);
    case Actions.CART_SERVER_UPDATED:
      return updateWithServerData(state, action.payload);
    default:
      return state;
  }
}

export const getTrackerInfo = (state: State, { visitorId, sessionId }: Actions.Payload.Cart.TrackerInfo) =>
  ({
    ...state,
    content: { ...state.content, visitorId, sessionId }
  });

export const addToCart = (state: State, { product, quantity }) => {
  console.log('product');
  const combinedItems = Adapter.combineLikeItems(state.content.items, { item: product, quantity }, 'id');
  return {
    // tslint:disable-next-line:max-line-length
    ...state, content: { ...state.content, totalQuantity: Adapter.calculateTotalQuantity(combinedItems), items: combinedItems }
  };
};

export const cartCreated = (state: State, cartId: string) =>
  ({
    ...state, content: { ...state.content, cartId }
  });

// tslint:disable-next-line:max-line-length
export const updateWithServerData = (state: State, { generatedTotalPrice, totalQuantity, items, lastModified }: any) => ({
  ...state, content: {
    ...state.content,
    totalQuantity,
    items,
    generatedTotalPrice,
    lastModified
  }
});

const cartTransform = createTransform((state: State, key: string) => state, (state: State, key: string) => state);

export default persistReducer({
  transforms: [cartTransform], key: STORAGE_KEY, storage, whitelist: STORAGE_WHITELIST
},
  updateCart);
