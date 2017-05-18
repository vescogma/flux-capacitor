import Actions from '../../actions';
import Store from '../../store';
import Action = Actions.Page;

export type State = Store.Page;

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULTS: State = {
  current: 1,
  first: 1,
  from: 1,
  limit: 5,
  range: [],
  sizes: {
    items: [DEFAULT_PAGE_SIZE],
    selected: 0
  },
};

export default function updatePage(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Actions.UPDATE_SEARCH:
    case Actions.SELECT_SORT:
    case Actions.SELECT_COLLECTION:
    case Actions.SELECT_REFINEMENT:
    case Actions.DESELECT_REFINEMENT:
      return resetPage(state);
    case Actions.UPDATE_CURRENT_PAGE: return updateCurrent(state, action);
    case Actions.UPDATE_PAGE_SIZE: return updateSize(state, action);
    case Actions.RECEIVE_PAGE: return receivePage(state, action);
    default: return state;
  }
}

// conditional reducer here only because reset page is a side effect of other actions
export const resetPage = (state: State) =>
  state.current === 1 ? state : ({ ...state, current: 1 });

export const updateCurrent = (state: State, { page: current }: Action.UpdateCurrent) =>
  ({ ...state, current });

export const updateSize = (state: State, { size }: Action.UpdateSize) => {
  const selected = state.sizes.items.findIndex((pageSize) => pageSize === size);
  return selected === -1 ? state : { ...state, current: 1, sizes: { ...state.sizes, selected } };
};

export const receivePage = (state: State, { from, to, last, next, previous, range }: Action.ReceivePage) =>
  ({ ...state, from, to, last, next, previous, range });
