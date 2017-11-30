import Actions from '../../actions';
import Adapter from '../../adapters/search';
import Store from '../../store';

export type Action = Actions.ResetRefinements
  | Actions.AddRefinement
  | Actions.ReceiveNavigations
  | Actions.SelectRefinement
  | Actions.DeselectRefinement
  | Actions.ReceiveMoreRefinements
  | Actions.ReceiveNavigationSort;
export type State = Store.AvailableNavigations;

export const DEFAULTS: State = {
  allIds: [],
  byId: {},
  sort: [],
};

export default function updateNavigations(state: State = DEFAULTS, action: Action) {
  switch (action.type) {
    case Actions.RESET_REFINEMENTS: return resetRefinements(state, action.payload);
    case Actions.RECEIVE_NAVIGATIONS: return receiveNavigations(state, action.payload);
    case Actions.ADD_REFINEMENT: return addRefinement(state, action.payload);
    case Actions.SELECT_REFINEMENT: return selectRefinement(state, action.payload);
    case Actions.DESELECT_REFINEMENT: return deselectRefinement(state, action.payload);
    case Actions.RECEIVE_MORE_REFINEMENTS: return receiveMoreRefinements(state, action.payload);
    case Actions.RECEIVE_NAVIGATION_SORT: return receiveNavigationSort(state, action.payload);
    default: return state;
  }
}

export const resetRefinements = (state: State, navigationId: boolean | string) => {
  if (typeof navigationId === 'boolean') {
    return {
      ...state,
      byId: state.allIds.reduce((navs, nav) =>
        Object.assign(navs, { [nav]: { ...state.byId[nav], selected: [] } }), {})
    };
  } else {
    return {
      ...state,
      byId: {
        ...state.byId,
        [navigationId]: {
          ...state.byId[navigationId],
          selected: []
        }
      }
    };
  }
};

export const receiveNavigations = (state: State, navigations: Store.Navigation[]) => {
  const allIds = navigations.map((nav) => nav.field);
  const byId = navigations.reduce((navs, nav) =>
    Object.assign(navs, { [nav.field]: nav }), {});
  return {
    ...state,
    allIds,
    byId,
  };
};

// tslint:disable-next-line max-line-length
export const selectRefinement = (state: State, { navigationId, index: refinementIndex }: Actions.Payload.Navigation.Refinement) => {
  if (navigationId && refinementIndex != null) {
    return {
      ...state,
      byId: {
        ...state.byId,
        [navigationId]: {
          ...state.byId[navigationId],
          selected: state.byId[navigationId].selected.concat(refinementIndex),
        },
      },
    };
  } else {
    return state;
  }
};

// tslint:disable-next-line max-line-length
// currently only used for pastPurchases hence not used in this reducer yet
export const resetAndSelectRefinement = (state: State, payload: Actions.Payload.Navigation.Refinement) => {
  return selectRefinement(resetRefinements(state, true), payload);
};

// tslint:disable-next-line max-line-length
export const deselectRefinement = (state: State, { navigationId, index: refinementIndex }: Actions.Payload.Navigation.Refinement) => {
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

const generateNavigation = (state: State, navigationId: string, refinement: any, index: number) => ({
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
});

// tslint:disable-next-line max-line-length
export const addRefinement = (state: State, { navigationId, value, low, high, range }: Actions.Payload.Navigation.AddRefinement) => {
  const refinement: any = range ? { low, high } : { value };

  if (navigationId in state.byId) {
    const index = state.byId[navigationId].refinements
      .findIndex((ref) => Adapter.refinementsMatch(ref, refinement, range ? 'Range' : 'Value'));

    return {
      ...state,
      byId: {
        ...state.byId,
        [navigationId]: generateNavigation(state, navigationId, refinement, index)
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
          selected: [0],
          metadata: {}
        }
      }
    };
  }
};

// tslint:disable-next-line max-line-length
export const receiveMoreRefinements = (state: State, { navigationId, refinements, selected }: Actions.Payload.Navigation.MoreRefinements) => {
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

// tslint:disable-next-line max-line-length
export const receiveNavigationSort = (state: State, sort: Store.Recommendations.Navigation[]) => ({
  ...state,
  sort
});
