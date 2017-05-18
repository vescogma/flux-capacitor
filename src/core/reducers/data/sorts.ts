import Actions from '../../actions';
import Store from '../../store';
import Action = Actions.Sort;

export type State = Store.SelectableList<Store.Sort>;

export const DEFAULTS: State = {
  items: []
};

export default function updateSorts(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Actions.SELECT_SORT: return updateSelected(state, action);
    default: return state;
  }
}

export const updateSelected = (state: State, { index: selected }: Action.UpdateSelected) =>
  ({ ...state, selected });
