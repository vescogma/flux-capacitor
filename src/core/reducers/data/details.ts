import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.UpdateDetails;
export type State = Store.Details;

export const DEFAULTS: State = {};

export default function updateDetails(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_DETAILS: return update(state, action.payload);
    default: return state;
  }
}

export const update = (state: State, data: Store.Product) =>
  ({ ...state, data });
