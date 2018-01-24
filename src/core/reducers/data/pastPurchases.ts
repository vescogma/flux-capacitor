import Actions from '../../actions';
import Adapter from '../../adapters/pastPurchases';
import Store from '../../store';
import * as navigations from './navigations';
import * as page from './page';
import { updateMoreProducts } from './products';

export { DEFAULT_PAGE_SIZE } from './page';

export type Action = Actions.ReceivePastPurchaseSkus
  | Actions.ReceivePastPurchaseProducts
  | Actions.ReceiveMorePastPurchaseProducts
  | Actions.ReceiveSaytPastPurchases
  | Actions.ReceivePastPurchaseRefinements
  | Actions.UpdatePastPurchaseQuery
  | Actions.SelectPastPurchaseSort
  | Actions.ResetPastPurchaseRefinements
  | Actions.SelectPastPurchaseRefinement
  | Actions.DeselectPastPurchaseRefinement
  | Actions.ResetPastPurchasePage
  | Actions.UpdatePastPurchasePageSize
  | Actions.UpdatePastPurchaseCurrentPage
  | Actions.ReceivePastPurchasePage
  | Actions.ReceivePastPurchaseAllRecordCount
  | Actions.ReceivePastPurchaseCurrentRecordCount;
export type State = Store.PastPurchase;

export enum SORT_ENUMS {
  DEFAULT, MOST_PURCHASED, MOST_RECENT
}

export const DEFAULTS: State = <any>{
  defaultSkus: [],
  skus: [],
  saytPastPurchases: [],
  products: [],
  count: {
    currentRecordCount: 0,
    allRecordCount: 0,
  },
  query: '',
  sort: {
    items: [{
      field: 'Default',
      descending: true,
      type: SORT_ENUMS.DEFAULT,
    },
    {
      field: 'Most Recent',
      descending: true,
      type: SORT_ENUMS.MOST_RECENT,
    },
    {
      field: 'Most Purchased',
      descending: true,
      type: SORT_ENUMS.MOST_PURCHASED,
    }],
    selected: 0,
  },
  navigations: {
    byId: {},
    allIds: [],
  },
  page: page.DEFAULTS,
};

export default function updatePastPurchases(state: State = DEFAULTS, action: Action): State {
  // tslint:disable max-line-length
  switch (action.type) {
    case Actions.RECEIVE_PAST_PURCHASE_SKUS: return updatePastPurchaseSkus(state, action);
    case Actions.RECEIVE_PAST_PURCHASE_PRODUCTS: return updatePastPurchaseProducts(state, action);
    case Actions.RECEIVE_MORE_PAST_PURCHASE_PRODUCTS: return updateMorePastPurchaseProducts(state, action);
    case Actions.RECEIVE_PAST_PURCHASE_ALL_RECORD_COUNT: return updatePastPurchaseAllRecordCount(state, action);
    case Actions.RECEIVE_PAST_PURCHASE_CURRENT_RECORD_COUNT: return updatePastPurchaseCurrentRecordCount(state, action);
    case Actions.RECEIVE_SAYT_PAST_PURCHASES: return updateSaytPastPurchases(state, action);
    case Actions.UPDATE_PAST_PURCHASE_QUERY: return updatePastPurchaseQuery(state, action);
    case Actions.SELECT_PAST_PURCHASE_SORT: return updatePastPurchaseSortSelected(state, action);
    case Actions.RECEIVE_PAST_PURCHASE_REFINEMENTS: return applyNavigationReducer(state, action, navigations.receiveNavigations);
    case Actions.SELECT_PAST_PURCHASE_REFINEMENT: return applyNavigationReducer(state, action, navigations.selectRefinement);
    case Actions.DESELECT_PAST_PURCHASE_REFINEMENT: return applyNavigationReducer(state, action, navigations.deselectRefinement);
    case Actions.RESET_PAST_PURCHASE_REFINEMENTS: return applyNavigationReducer(state, action, navigations.resetRefinements);
    case Actions.RESET_PAST_PURCHASE_PAGE: return applyPageReducer(state, action, page.resetPage);
    case Actions.UPDATE_PAST_PURCHASE_CURRENT_PAGE: return applyPageReducer(state, action, page.updateCurrent);
    case Actions.UPDATE_PAST_PURCHASE_PAGE_SIZE: return applyPageReducer(state, action, page.updateSize);
    case Actions.RECEIVE_PAST_PURCHASE_PAGE: return applyPageReducer(state, action, page.receivePage);
    default: return state;
  }
  // tslint:enable max-line-length
}

export const updatePastPurchaseSkus = (state: State, { payload }: Actions.ReceivePastPurchaseSkus) =>
  ({
    ...state,
    defaultSkus: payload,
    skus: payload,
  });

export const updatePastPurchaseProducts = (state: State, { payload }: Actions.ReceivePastPurchaseProducts) =>
  ({
    ...state,
    products: payload,
  });

export const updateMorePastPurchaseProducts = (state: State, action: Actions.ReceiveMorePastPurchaseProducts) =>
  ({
    ...state,
    products: updateMoreProducts(state.products, action),
  });

// tslint:disable-next-line max-line-length
export const updatePastPurchaseCurrentRecordCount = (state: State, { payload }: Actions.ReceivePastPurchaseCurrentRecordCount) => ({
  ...state,
  currentRecordCount: payload
});

// tslint:disable-next-line max-line-length
export const updatePastPurchaseAllRecordCount = (state: State, { payload }: Actions.ReceivePastPurchaseAllRecordCount) => ({
    ...state,
    count: {
      ...state.count,
      allRecordCount: payload,
    }
  });

export const updateSaytPastPurchases = (state: State, { payload }: Actions.ReceiveSaytPastPurchases) =>
  ({
    ...state,
    saytPastPurchases: payload,
  });

export const applyPageReducer = (state: State, { payload }: Action, reducer: Function) =>
  ({
    ...state,
    page: reducer(state.page, payload),
  });

export const applyNavigationReducer = (state: State, { payload }: Action, reducer: Function) =>
  ({
    ...state,
    navigations: reducer(<Store.AvailableNavigations>{
      ...state.navigations,
      sort: []
    }, payload),
  });

export const updatePastPurchaseQuery = (state: State, { payload }: Actions.UpdatePastPurchaseQuery) =>
  ({
    ...state,
    query: payload
  });

export const updatePastPurchaseSortSelected = (state: State, { payload }: Actions.SelectPastPurchaseSort) => {
  let skus = state.defaultSkus;

  switch (state.sort.items[payload].type) {
    case SORT_ENUMS.MOST_PURCHASED:
      skus = Adapter.sortSkus(skus, 'quantity');
      break;
    case SORT_ENUMS.MOST_RECENT:
      skus = Adapter.sortSkus(skus, 'lastPurchased');
      break;
  }

  return {
    ...state,
    skus,
    sort: {
      ...state.sort,
      selected: payload,
    }
  };
};
