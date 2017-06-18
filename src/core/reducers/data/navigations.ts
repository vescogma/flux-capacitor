import Actions from '../../actions';
import Adapter from '../../adapters/search';
import Store from '../../store';
import Action = Actions.Navigation;

export type State = Store.Indexed<Store.Navigation>;

export const DEFAULTS: State = {
  allIds: [],
  byId: {},
};

export default function updateNavigations(state: State = DEFAULTS, action) {
  switch (action.type) {
    case Actions.UPDATE_SEARCH:
      // TODO: add case for clear
      if (action.clear) {
        return updateSearch(state, action);
      } else {
        return state;
      }
    case Actions.RECEIVE_NAVIGATIONS: return receiveNavigations(state, action);
    case Actions.SELECT_REFINEMENT: return selectRefinement(state, action);
    case Actions.DESELECT_REFINEMENT: return deselectRefinement(state, action);
    case Actions.RECEIVE_MORE_REFINEMENTS: return receiveMoreRefinements(state, action);
    default: return state;
  }
}

export const updateSearch = (state: State, action: Action.UpdateSearch) => {
  const byId = state.allIds.reduce((navs, nav) =>
    Object.assign(navs, { [nav]: { ...state.byId[nav], selected: [] } }), {});

  if ('navigationId' in action) {
    const navigationId = action.navigationId;
    if ('index' in action) {
      const refinementIndex = action.index;

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
    } else {
      return addRefinement(state, action);
    }
  } else {
    return {
      ...state,
      byId,
    };
  }
};

export const receiveNavigations = (state: State, { navigations }: Action.ReceiveNavigations) => {
  const allIds = navigations.map((nav) => nav.field);
  const byId = navigations.reduce((navs, nav) =>
    Object.assign(navs, { [nav.field]: nav }), {});
  return {
    ...state,
    allIds,
    byId,
  };
};

export const selectRefinement = (state: State, { navigationId, index: refinementIndex }: Action.SelectRefinement) => {
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
export const deselectRefinement = (state: State, { navigationId, index: refinementIndex }: Action.DeselectRefinement) => {
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

export const addRefinement = (state: State, { navigationId, value, low, high, range }: Action.UpdateSearch) => {
  const refinement: any = range ? { low, high } : { value };

  if (navigationId in state.byId) {
    const index = state.byId[navigationId].refinements
      .findIndex((ref) => Adapter.refinementsMatch(ref, refinement, range ? 'Range' : 'Value'));

    return {
      ...state,
      byId: {
        ...state.byId,
        [navigationId]: {
          ...state.byId[navigationId],
          ...(index === -1
            ? {
              refinements: [
                ...state.byId[navigationId].refinements,
                refinement
              ],
              selected: [
                ...state.byId[navigationId].selected,
                state.byId[navigationId].refinements.length
              ]
            }
            : {
              selected: [...state.byId[navigationId].selected, index]
            })
        }
      }
    };
  } else {
    return {
      ...state,
      allIds: [...state.allIds, navigationId],
      byId: {
        ...state.byId,
        [navigationId]: {
          field: navigationId,
          label: navigationId,
          range,
          refinements: [refinement],
          selected: [0]
        }
      }
    };
  }
};

// tslint:disable-next-line max-line-length
export const receiveMoreRefinements = (state: State, { navigationId, refinements, selected }: Action.ReceiveMoreRefinements) => {
  if (navigationId && refinements) {
    return {
      ...state,
      byId: {
        ...state.byId,
        [navigationId]: {
          ...state.byId[navigationId],
          refinements,
          selected,
          more: false,
        },
      },
    };
  } else {
    return state;
  }
};
