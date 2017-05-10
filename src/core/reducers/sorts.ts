import { Action, Store } from '..';
import Actions = Action.Sort;

export type State = Store.Indexed.Selectable<Store.Sort.Labeled>;

export const DEFAULTS: State = {
  allIds: [],
  byId: {},
};

export default function updateSorts(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Action.types.SELECT_SORT: return updateSelected(state, action);
    default: return state;
  }
}

export const updateSelected = (state: State, { id: selected }: Actions.UpdateSelected) =>
  ({ ...state, selected });
