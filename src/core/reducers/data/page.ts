import { Action, Store } from '../..';
import Actions = Action.Page;

export type State = Store.Page;

export const DEFAULTS: State = {
  current: 1,
  first: 1,
  limit: 5,
  range: [],
  size: 10,
};

export default function updatePage(state: State = DEFAULTS, action): State {
  switch (action.type) {
    case Action.types.UPDATE_SEARCH:
    case Action.types.SELECT_SORT:
    case Action.types.SELECT_COLLECTION:
    case Action.types.SELECT_REFINEMENT:
    case Action.types.DESELECT_REFINEMENT:
      return resetPage(state);
    case Action.types.UPDATE_CURRENT_PAGE: return updateCurrent(state, action);
    case Action.types.UPDATE_PAGE_SIZE: return updateSize(state, action);
    case Action.types.RECEIVE_PAGE: return receivePage(state, action);
    default: return state;
  }
}

// conditional reducer here only because reset page is a side effect of other actions
export const resetPage = (state: State) =>
  state.current === 1 ? state : ({ ...state, current: 1 });

export const updateCurrent = (state: State, { page: current }: Actions.UpdateCurrent) =>
  ({ ...state, current });

export const updateSize = (state: State, { size }: Actions.UpdateSize) =>
  ({ ...state, current: 1, size });

export const receivePage = (state: State, { from, to, last, next, previous, range }: Actions.ReceivePage) =>
  ({ ...state, from, to, last, next, previous, range });
