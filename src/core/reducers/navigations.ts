import { Action, Store } from '..';
import Actions = Action.Navigation;

export type State = Store.Indexed<Store.Navigation>;

export default function updateNavigations(state: State, action) {
  switch (action.type) {
    case Action.types.UPDATE_SEARCH:
      // TODO: add case for clear
      if (action.clear) {
        return updateSearch(state, action);
      }
    case Action.types.RECEIVE_NAVIGATIONS: return receiveNavigations(state, action);
    case Action.types.SELECT_REFINEMENT: return selectRefinement(state, action);
    case Action.types.DESELECT_REFINEMENT: return deselectRefinement(state, action);
    case Action.types.RECEIVE_MORE_REFINEMENTS: return receiveMoreRefinements(state, action);
    default: return state;
  }
}

export const updateSearch = (state: State, { navigationId, index: refinementIndex }: Actions.UpdateSearch) => {
  const byId = state.allIds.reduce(
    (navs, nav) => Object.assign(navs, { [nav]: { ...state.byId[nav], selected: [] } }), {},
  );
  if (!(navigationId && refinementIndex != null)) {
    return {
      ...state,
      byId,
    };
  } else {
    return {
      ...state,
      byId: {
        ...byId,
        [navigationId]: {
          ...state.byId[navigationId],
          // TODO: maybe check if already there
          selected: [refinementIndex],
        },
      },
    };
  }
};

export const receiveNavigations = (state: State, { navigations }: Actions.ReceiveNavigations) => {
  const allIds = navigations.map((nav) => nav.field);
  const byId = navigations.reduce(
    (navs, nav) => Object.assign(navs, { [nav.field]: { ...nav, selected: [] } }), {},
  );
  return {
    ...state,
    allIds,
    byId,
  };
};

export const selectRefinement = (state: State, { navigationId, index: refinementIndex }: Actions.SelectRefinement) => {
  if (navigationId && refinementIndex != null) {
    return {
      ...state,
      byId: {
        ...state.byId,
        [navigationId]: {
          ...state.byId[navigationId],
          // TODO: maybe check if already there
          selected: state.byId[navigationId].selected.concat(refinementIndex),
        },
      },
    };
  } else {
    return state;
  }
};

// tslint:disable-next-line max-line-length
export const deselectRefinement = (state: State, { navigationId, index: refinementIndex }: Actions.DeselectRefinement) => {
  if (navigationId && refinementIndex != null) {
    return {
      ...state,
      byId: {
        ...state.byId,
        [navigationId]: {
          ...state.byId[navigationId],
          selected: state.byId[navigationId].selected.filter((index) => index !== refinementIndex),
        },
      },
    };
  } else {
    return state;
  }
};

export const receiveMoreRefinements = (state: State, { navigationId, refinements }: Actions.ReceiveMoreRefinements) => {
  if (navigationId && refinements) {
    return {
      ...state,
      byId: {
        ...state.byId,
        [navigationId]: {
          ...state.byId[navigationId],
          refinements: state.byId[navigationId].refinements.concat(refinements),
        },
      },
    };
  } else {
    return state;
  }
};
