import Actions from '../../actions';
import Store from '../../store';
import Action = Actions.Details;

export type State = Store.Details;

export const DEFAULTS: State = {};

export default function updateDetails(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Actions.UPDATE_DETAILS_ID: return updateId(state, action);
    case Actions.RECEIVE_DETAILS_PRODUCT: return receiveProduct(state, action);
    default: return state;
  }
}

export const updateId = (state: State, { id }: Action.UpdateId) =>
  ({ ...state, id });

export const receiveProduct = (state: State, { product }: Action.ReceiveProduct) =>
  ({ ...state, product });
