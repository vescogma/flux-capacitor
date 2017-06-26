import Actions from '../../actions';
import Store from '../../store';
import Action = Actions.Details;

export type State = Store.Details;

export const DEFAULTS: State = {};

export default function updateDetails(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Actions.UPDATE_DETAILS: return update(state, action);
    case Actions.RECEIVE_DETAILS_PRODUCT: return receiveProduct(state, action);
    default: return state;
  }
}

export const update = (state: State, { id, title }: Action.Update) =>
  ({ ...state, id, title });

export const receiveProduct = (state: State, { product }: Action.ReceiveProduct) =>
  ({ ...state, product });
