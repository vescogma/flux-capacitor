import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.CreateCart;
export type State = Store.Cart;

export const DEFAULTS: State = {
  cartId: ''
};

export default function updateCart(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.CREATE_CART: return createCart(state, action);
    default: return state;
  }
}

export const createCart = (state: State, { payload }: Actions.CreateCart) =>
({
  ...state,
  userInfo: payload
});