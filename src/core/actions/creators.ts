import { Results } from 'groupby-api';
import Actions from '.';
import SearchAdapter from '../adapters/search';
import Selectors from '../selectors';
import Store from '../store';
import { createAction, handleError, refinementPayload, shouldResetRefinements } from './utils';
import * as validators from './validators';

namespace ActionCreators {
  export function refreshState(state: any): Actions.RefreshState {
    return createAction(Actions.REFRESH_STATE, state);
  }

  // fetch action creators
  export function fetchMoreRefinements(navigationId: string): Actions.FetchMoreRefinements {
    return createAction(Actions.FETCH_MORE_REFINEMENTS, navigationId);
  }

  export function fetchProducts(): Actions.FetchProducts {
    return createAction(Actions.FETCH_PRODUCTS, null);
  }

  export function fetchMoreProducts(amount: number): Actions.FetchMoreProducts {
    return createAction(Actions.FETCH_MORE_PRODUCTS, amount);
  }

  export function fetchAutocompleteSuggestions(query: string): Actions.FetchAutocompleteSuggestions {
    return createAction(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, query, {
      payload: validators.isString,
    });
  }

  // tslint:disable-next-line max-line-length
  export function fetchAutocompleteProducts(query: string, refinements: Actions.Payload.Autocomplete.Refinement[] = []): Actions.FetchAutocompleteProducts {
    return createAction(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, { query, refinements }, {
      query: validators.isString,
    });
  }

  export function fetchCollectionCount(collection: string): Actions.FetchCollectionCount {
    return createAction(Actions.FETCH_COLLECTION_COUNT, collection);
  }

  export function fetchProductDetails(id: string): Actions.FetchProductDetails {
    return createAction(Actions.FETCH_PRODUCT_DETAILS, id);
  }

  export function fetchRecommendationsProducts() {
    return createAction(Actions.FETCH_RECOMMENDATIONS_PRODUCTS, null);
  }

  export function fetchPastPurchases() {
    return createAction(Actions.FETCH_PAST_PURCHASES, null);
  }

  // request action creators
  export function updateSearch(search: Actions.Payload.Search) {
    return (state: Store.State): Actions.UpdateSearch => {
      const searchActions: Actions.UpdateSearch = [ActionCreators.resetPage()];

      if ('query' in search) {
        searchActions.push(...ActionCreators.updateQuery(search.query));
      }
      if ('clear' in search && shouldResetRefinements(search, state)) {
        searchActions.push(...ActionCreators.resetRefinements(search.clear));
      }
      if ('navigationId' in search) {
        if ('index' in search) {
          searchActions.push(...ActionCreators.selectRefinement(search.navigationId, search.index));
        } else if (search.range) {
          searchActions.push(...ActionCreators.addRefinement(search.navigationId, search.low, search.high));
        } else if ('value' in search) {
          searchActions.push(...ActionCreators.addRefinement(search.navigationId, search.value));
        }
      }

      return searchActions;
    };
  }

  export function updateQuery(query: string): Actions.ResetPageAndUpdateQuery {
    return [
      ActionCreators.resetPage(),
      createAction(Actions.UPDATE_QUERY, query && query.trim(), {
        payload: [
          validators.isValidQuery,
          validators.isDifferentQuery
        ]
      })
    ];
  }

  export function resetQuery(): Actions.ResetPageAndUpdateQuery {
    return ActionCreators.updateQuery(null);
  }

  // tslint:disable-next-line max-line-length
  export function addRefinement(field: string, valueOrLow: any, high: any = null): Actions.ResetPageAndAddRefinement {
    return [
      ActionCreators.resetPage(),
      createAction(Actions.ADD_REFINEMENT, refinementPayload(field, valueOrLow, high), {
        navigationId: validators.isString,
        payload: [
          validators.isRangeRefinement,
          validators.isValidRange,
          validators.isValueRefinement,
          validators.isNotFullRange,
          validators.isRefinementDeselectedByValue
        ]
      })
    ];
  }

  export function switchRefinement(field: string, valueOrLow: any, high: any = null): Actions.SwitchRefinement {
    return <any>[
      ActionCreators.resetPage(),
      ...ActionCreators.resetRefinements(field),
      ...ActionCreators.addRefinement(field, valueOrLow, high)
    ];
  }

  export function resetRefinements(field?: boolean | string): Actions.ResetPageAndResetRefinements {
    return [
      ActionCreators.resetPage(),
      createAction(Actions.RESET_REFINEMENTS, field, {
        payload: [
          validators.isValidClearField,
          validators.hasSelectedRefinements,
          validators.hasSelectedRefinementsByField
        ]
      })
    ];
  }

  export function resetPage(): Actions.ResetPage {
    return createAction(Actions.RESET_PAGE, undefined, {
      payload: validators.notOnFirstPage
    });
  }

  export function search(query?: string) {
    return (state: Store.State): Actions.Search => <any>[
      ActionCreators.resetPage(),
      ...ActionCreators.resetRefinements(true),
      ...ActionCreators.updateQuery(query || Selectors.query(state))
    ];
  }

  // tslint:disable-next-line max-line-length
  export function resetRecall(query: string = null, { field, index }: { field: string, index: number } = <any>{}) {
    return (state: Store.State): Actions.ResetRecall => {
      const resetActions: any[] = ActionCreators.search()(state);
      if (field) {
        resetActions.push(...ActionCreators.selectRefinement(field, index));
      }

      return <Actions.ResetRecall>resetActions;
    };
  }

  export function selectRefinement(navigationId: string, index: number): Actions.ResetPageAndSelectRefinement {
    return [
      ActionCreators.resetPage(),
      createAction(Actions.SELECT_REFINEMENT, { navigationId, index }, {
        payload: validators.isRefinementDeselectedByIndex
      })
    ];
  }

  export function deselectRefinement(navigationId: string, index: number): Actions.ResetPageAndDeselectRefinement {
    return [
      ActionCreators.resetPage(),
      createAction(Actions.DESELECT_REFINEMENT, { navigationId, index }, {
        payload: validators.isRefinementSelectedByIndex
      })
    ];
  }

  export function selectCollection(id: string): Actions.SelectCollection {
    return createAction(Actions.SELECT_COLLECTION, id, {
      payload: validators.isCollectionDeselected
    });
  }

  export function selectSort(index: number): Actions.SelectSort {
    return createAction(Actions.SELECT_SORT, index, {
      payload: validators.isSortDeselected
    });
  }

  export function updatePageSize(size: number): Actions.UpdatePageSize {
    return createAction(Actions.UPDATE_PAGE_SIZE, size, {
      payload: validators.isDifferentPageSize
    });
  }

  export function updateCurrentPage(page: number): Actions.UpdateCurrentPage {
    return createAction(Actions.UPDATE_CURRENT_PAGE, page, {
      payload: validators.isOnDifferentPage
    });
  }

  export function updateDetails(product: Store.Product): Actions.UpdateDetails {
    return createAction(Actions.UPDATE_DETAILS, product);
  }

  export function updateAutocompleteQuery(query: string): Actions.UpdateAutocompleteQuery {
    return createAction(Actions.UPDATE_AUTOCOMPLETE_QUERY, query, {
      payload: validators.isDifferentAutocompleteQuery
    });
  }

  // response action creators
  export function receiveQuery(query: Actions.Payload.Query): Actions.ReceiveQuery {
    return createAction(Actions.RECEIVE_QUERY, query);
  }

  export function receiveProducts(res: Results) {
    return (state: Store.State): Actions.Action<string, any>[] | Actions.ReceiveProducts => {
      const receiveProductsAction = createAction(Actions.RECEIVE_PRODUCTS, res);

      return handleError(receiveProductsAction, () => {
        const recordCount = SearchAdapter.extractRecordCount(res);

        return [
          receiveProductsAction,
          ActionCreators.receiveQuery(SearchAdapter.extractQuery(res)),
          ActionCreators.receiveProductRecords(SearchAdapter.extractProducts(res)),
          ActionCreators.receiveNavigations(SearchAdapter.combineNavigations(res)),
          ActionCreators.receiveRecordCount(recordCount),
          ActionCreators.receiveCollectionCount({
            collection: Selectors.collection(state),
            count: recordCount
          }),
          ActionCreators.receivePage(SearchAdapter.extractPage(state, recordCount)),
          ActionCreators.receiveTemplate(SearchAdapter.extractTemplate(res.template)),
        ];
      });
    };
  }

  export function receiveProductRecords(products: Store.Product[]): Actions.ReceiveProductRecords {
    return createAction(Actions.RECEIVE_PRODUCT_RECORDS, products);
  }

  export function receiveCollectionCount(count: Actions.Payload.Collection.Count): Actions.ReceiveCollectionCount {
    return createAction(Actions.RECEIVE_COLLECTION_COUNT, count);
  }

  export function receiveNavigations(navigations: Store.Navigation[]): Actions.ReceiveNavigations {
    return createAction(Actions.RECEIVE_NAVIGATIONS, navigations);
  }

  export function receivePage(page: Actions.Payload.Page): Actions.ReceivePage {
    return createAction(Actions.RECEIVE_PAGE, page);
  }

  export function receiveTemplate(template: Store.Template): Actions.ReceiveTemplate {
    return createAction(Actions.RECEIVE_TEMPLATE, template);
  }

  export function receiveRecordCount(recordCount: number): Actions.ReceiveRecordCount {
    return createAction(Actions.RECEIVE_RECORD_COUNT, recordCount);
  }

  export function receiveRedirect(redirect: string): Actions.ReceiveRedirect {
    return createAction(Actions.RECEIVE_REDIRECT, redirect);
  }

  // tslint:disable-next-line max-line-length
  export function receiveMoreRefinements(navigationId: string, refinements: Store.Refinement[], selected: number[]): Actions.ReceiveMoreRefinements {
    return createAction(Actions.RECEIVE_MORE_REFINEMENTS, { navigationId, refinements, selected });
  }

  // tslint:disable-next-line max-line-length
  export function receiveAutocompleteSuggestions(suggestions: Actions.Payload.Autocomplete.Suggestions): Actions.ReceiveAutocompleteSuggestions {
    return createAction(Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS, suggestions);
  }

  export function receiveMoreProducts(products: Store.Product[]): Actions.ReceiveMoreProducts {
    return createAction(Actions.RECEIVE_MORE_PRODUCTS, products);
  }

  export function receiveAutocompleteProducts(res: Results): Actions.ReceiveAutocompleteProducts {
    const receiveProductsAction = createAction(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, res);

    return handleError(receiveProductsAction, () => [
      receiveProductsAction,
      ActionCreators.receiveAutocompleteProductRecords(SearchAdapter.extractProducts(res)),
      ActionCreators.receiveAutocompleteTemplate(SearchAdapter.extractTemplate(res.template)),
    ]);
  }

  // tslint:disable-next-line max-line-length
  export function receiveAutocompleteProductRecords(products: Store.Product[]): Actions.ReceiveAutocompleteProductRecords {
    return createAction(Actions.RECEIVE_AUTOCOMPLETE_PRODUCT_RECORDS, products);
  }

  export function receiveAutocompleteTemplate(template: Store.Template): Actions.ReceiveAutocompleteTemplate {
    return createAction(Actions.RECEIVE_AUTOCOMPLETE_TEMPLATE, template);
  }

  export function receiveDetailsProduct(product: Store.Product): Actions.ReceiveDetailsProduct {
    return createAction(Actions.RECEIVE_DETAILS_PRODUCT, product);
  }

  export function receiveRecommendationsProducts(products: Store.Product[]) {
    return createAction(Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS, products);
  }

  export function receivePastPurchases(products: Store.Recommendations.PastPurchase[]) {
    return createAction(Actions.RECEIVE_PAST_PURCHASES, products);
  }

  // tslint:disable-next-line max-line-length
  export function receiveNavigationSort(navigations: Store.Recommendations.Navigation[]): Actions.ReceiveNavigationSort {
    return createAction(Actions.RECEIVE_NAVIGATION_SORT, navigations);
  }

  // ui action creators
  export function createComponentState(tagName: string, id: string, state: any = {}): Actions.CreateComponentState {
    return createAction(Actions.CREATE_COMPONENT_STATE, { tagName, id, state });
  }

  export function removeComponentState(tagName: string, id: string): Actions.RemoveComponentState {
    return createAction(Actions.REMOVE_COMPONENT_STATE, { tagName, id });
  }

  // session action creators
  export function updateLocation(location: Store.Geolocation): Actions.UpdateLocation {
    return createAction(Actions.UPDATE_LOCATION, location);
  }

  // app action creators
  export function startApp(): Actions.StartApp {
    return createAction(Actions.START_APP, undefined);
  }
}

export default ActionCreators;
