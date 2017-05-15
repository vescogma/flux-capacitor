import Actions from '../../actions';
import Store from '../../store';
import Action = Actions.Sort;

export type State = Store.Indexed.Selectable<Store.Sort.Labeled>;

export const DEFAULTS: State = {
  allIds: [],
  byId: {},
};

export default function updateSorts(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Actions.SELECT_SORT: return updateSelected(state, action);
    default: return state;
  }
}

export const updateSelected = (state: State, { id: selected }: Action.UpdateSelected) =>
  ({ ...state, selected });
