import Actions from '.';
import SearchAdapter from '../adapters/search';
import Selectors from '../selectors';
import Store from '../store';

export interface Validator<T = any> {
  func: (payload?: T, state?: Store.State) => boolean;
  msg: string;
}

export const isString: Validator<string> = {
  func: (value: any) => typeof value === 'string' && value.trim().length !== 0,
  msg: 'must be a non-empty string'
};

export const isValidQuery: Validator<string> = {
  func: (query) => isString.func(query) || query === null,
  msg: 'search term is empty'
};

export const isDifferentQuery: Validator<string> = {
  func: (query, state) => query !== Selectors.query(state),
  msg: 'search term is not different'
};

export const isRangeRefinement: Validator<Actions.Payload.Navigation.AddRefinement> = {
  func: ({ range, low, high }) => !range || (typeof low === 'number' && typeof high === 'number'),
  msg: 'low and high values must be numeric'
};

export const isValueRefinement: Validator<Actions.Payload.Navigation.AddRefinement> = {
  func: ({ range, value }) => !!range || isString.func(value),
  msg: `value ${isString.msg}`
};

export const isRefinementDeselectedByValue: Validator<Actions.Payload.Navigation.AddRefinement> = {
  func: (payload, state) => {
    const navigation = Selectors.navigation(state, payload.navigationId);
    // tslint:disable-next-line max-line-length
    return !navigation || navigation.selected
      .findIndex((index) => SearchAdapter.refinementsMatch(<any>payload, <any>navigation.refinements[index], navigation.range ? 'Range' : 'Value')) === -1;
  },
  msg: 'refinement is already selected'
};

export const isNotFullRange: Validator<Actions.Payload.Navigation.AddRefinement> = {
  // tslint:disable-next-line max-line-length
  func: ({ navigationId, range, low, high }, state) => !range || !(Selectors.rangeNavigationMax(state, navigationId) === high && Selectors.rangeNavigationMin(state, navigationId) === low),
  msg: 'range must be smaller than full range'
};

export const isValidRange: Validator<Actions.Payload.Navigation.AddRefinement> = {
  func: ({ range, low, high }) => !range || low < high,
  msg: 'low value must be lower than high'
};

export const isValidClearField: Validator<string | boolean> = {
  func: (field) => field === true || isString.func(<string>field),
  msg: 'clear must be a string or true'
};

export const hasSelectedRefinements: Validator = {
  func: (_, state) => Selectors.selectedRefinements(state).length !== 0,
  msg: 'no refinements to clear'
};

export const hasSelectedRefinementsByField: Validator<string> = {
  // tslint:disable-next-line max-line-length
  func: (field, state) => typeof field === 'boolean' || Selectors.navigation(state, field).selected.length !== 0,
  msg: 'no refinements to clear for field'
};

export const notOnFirstPage: Validator = {
  func: (_, state) => Selectors.page(state) !== 1,
  msg: 'page must not be on first page'
};

export const isRefinementDeselectedByIndex: Validator<Actions.Payload.Navigation.Refinement> = {
  func: ({ navigationId, index }, state) => Selectors.isRefinementDeselected(state, navigationId, index),
  msg: 'navigation does not exist or refinement is already selected'
};

export const isRefinementSelectedByIndex: Validator<Actions.Payload.Navigation.Refinement> = {
  func: ({ navigationId, index }, state) => Selectors.isRefinementSelected(state, navigationId, index),
  msg: 'navigation does not exist or refinement is not selected'
};

export const isPastPurchaseRefinementDeselectedByIndex: Validator<Actions.Payload.Navigation.Refinement> = {
  func: ({ navigationId, index }, state) => Selectors.isPastPurchaseRefinementDeselected(state, navigationId, index),
  msg: 'navigation does not exist or refinement is already selected'
};

export const isPastPurchaseRefinementSelectedByIndex: Validator<Actions.Payload.Navigation.Refinement> = {
  func: ({ navigationId, index }, state) => Selectors.isPastPurchaseRefinementSelected(state, navigationId, index),
  msg: 'navigation does not exist or refinement is not selected'
};

export const isPastPurchasesSortDeselected: Validator<number> = {
  func: (index, state) => Selectors.pastPurchaseSort(state).selected !== index,
  msg: 'past purchases sort is already selected'
};

export const notOnFirstPastPurchasePage: Validator = {
  func: (_, state) => Selectors.pastPurchasePage(state) !== 1,
  msg: 'page must not be on first page'
};

export const isDifferentPastPurchasePageSize: Validator<number> = {
  func: (size, state) => Selectors.pastPurchasePageSize(state) !== size,
  msg: 'page size is already selected'
};

export const isOnDifferentPastPurchasePage: Validator<number> = {
  func: (page, state) => Selectors.pastPurchasePage(state) !== page,
  msg: 'page is already selected'
};

export const isValidPastPurchasePage: Validator<number> = {
  func: (page, state) => typeof page === 'number' && page <= Selectors.pastPurchaseTotalPages(state) && page >= 1,
  msg: 'page is invalid'
};

export const hasSelectedPastPurchaseRefinements: Validator = {
  func: (_, state) => Selectors.pastPurchaseSelectedRefinements(state).length !== 0,
  msg: 'no refinements to clear'
};

export const hasSelectedPastPurchaseRefinementsByField: Validator<string> = {
  // tslint:disable-next-line max-line-length
  func: (field, state) => typeof field === 'boolean' || Selectors.pastPurchaseNavigation(state, field).selected.length !== 0,
  msg: 'no refinements to clear for field'
};

export const isCollectionDeselected: Validator<string> = {
  func: (id, state) => Selectors.collection(state) !== id,
  msg: 'collection is already selected'
};

export const isSortDeselected: Validator<number> = {
  func: (index, state) => Selectors.sortIndex(state) !== index,
  msg: 'sort is already selected'
};

export const isDifferentPageSize: Validator<number> = {
  func: (size, state) => Selectors.pageSize(state) !== size,
  msg: 'page size is already selected'
};

export const isOnDifferentPage: Validator<number> = {
  func: (page, state) => Selectors.page(state) !== page,
  msg: 'page is already selected'
};

export const isValidPage: Validator<number> = {
  func: (page, state) => typeof page === 'number' && page <= Selectors.totalPages(state) && page >= 1,
  msg: 'page is invalid'
};

export const isDifferentAutocompleteQuery: Validator<string> = {
  func: (query, state) => Selectors.autocompleteQuery(state) !== query,
  msg: 'suggestions for query have already been requested'
};

export const isValidBias: Validator<Actions.Payload.Personalization.Biasing> = {
  func: (payload) => Boolean(payload && payload.field && payload.value),
  msg: 'bias is invalid'
};

export const isNotFetching: Validator<boolean> = {
  // func: (forward) => forward ?
  //   Selectors.infiniteScroll(state).isFetchingForward :
  //   Selectors.infiniteScroll(state).isFetchingBackward;
  func: (forward) => true,
  msg: 'is already fetching'
};
