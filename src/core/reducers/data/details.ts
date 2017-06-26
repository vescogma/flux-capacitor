import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.UpdateDetails | Actions.ReceiveDetailsProduct;
export type State = Store.Details;

export const DEFAULTS: State = {};

export default function updateDetails(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_DETAILS: return update(state, action.payload);
    case Actions.RECEIVE_DETAILS_PRODUCT: return receiveProduct(state, action.payload);
    default: return state;
  }
}

export const update = (state: State, { id, title }: Actions.Payload.Details) =>
  ({ ...state, id, title });

export const receiveProduct = (state: State, product: Store.Product) =>
  ({ ...state, product });
