import { Action, Store } from '..';
import Actions = Action.Details;

export type State = Store.Details;

export const DEFAULTS: State = {};

export default function updateDetails(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Action.types.UPDATE_DETAILS_ID: return updateId(state, action);
    case Action.types.RECEIVE_DETAILS_PRODUCT: return receiveProduct(state, action);
    default: return state;
  }
}

export const updateId = (state: State, { id }: Actions.UpdateId) =>
  ({ ...state, id });

export const receiveProduct = (state: State, { product }: Actions.ReceiveProduct) =>
  ({ ...state, product });
