import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.SelectSort;
export type State = Store.SelectableList<Store.Sort>;

export const DEFAULTS: State = {
  items: []
};

export default function updateSorts(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.SELECT_SORT: return updateSelected(state, action.payload);
    default: return state;
  }
}

export const updateSelected = (state: State, selected: number) =>
  ({ ...state, selected });
