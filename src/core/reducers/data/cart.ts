import Actions from "../../actions";
import Store from "../../store";

export type Action = Actions.CreateCart | Actions.CartCreated;
export type State = Store.Cart;

export default function updateCart(state: State = null, action: Action): State {
  switch (action.type) {
    case Actions.CREATE_CART:
      return createCart(state, action.payload);
    case Actions.CART_CREATED:
      return cartCreated(state, action.payload);
    default:
      return state;
  }
}

export const createCart = (state: State, { visitorId, sessionId }: Actions.Payload.Cart.CreateCart) => ({
  ...state,
  visitorId,
  sessionId
});

export const cartCreated = (state: State, { cartId }: Actions.Payload.Cart.CartConfirmation) => ({
  ...state,
  cartId
});
