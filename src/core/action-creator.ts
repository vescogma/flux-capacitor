import { Results } from 'groupby-api';
import FluxCapacitor from '../flux-capacitor';
import Actions from './actions';
import SearchAdapter from './adapters/search';
import Selectors from './selectors';
import Store from './store';
import { action as createAction, handleError, refinementPayload, shouldResetRefinements } from './utils';
import * as validators from './validators';

export function createActions(flux: FluxCapacitor) {

  return (meta: () => any) => {
    const metadata = meta();
    const action = <T extends string>(type: T, payload: any, validator: any = {}) =>
      createAction(type, payload, { ...metadata, validator });
    const actions = ({
      refreshState: (state: any): Actions.RefreshState =>
        action(Actions.REFRESH_STATE, state),

      // fetch action creators
      fetchMoreRefinements: (navigationId: string): Actions.FetchMoreRefinements =>
        action(Actions.FETCH_MORE_REFINEMENTS, navigationId),

      fetchProducts: (): Actions.FetchProducts =>
        action(Actions.FETCH_PRODUCTS, null),

      fetchMoreProducts: (amount: number): Actions.FetchMoreProducts =>
        action(Actions.FETCH_MORE_PRODUCTS, amount),

      fetchAutocompleteSuggestions: (query: string): Actions.FetchAutocompleteSuggestions =>
        action(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, query, {
          payload: validators.isString,
        }),

      // tslint:disable-next-line max-line-length
      fetchAutocompleteProducts: (query: string, refinements: Actions.Payload.Autocomplete.Refinement[] = []): Actions.FetchAutocompleteProducts =>
        action(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, { query, refinements }, {
          query: validators.isString,
        }),

      fetchCollectionCount: (collection: string): Actions.FetchCollectionCount =>
        action(Actions.FETCH_COLLECTION_COUNT, collection),

      fetchProductDetails: (id: string): Actions.FetchProductDetails =>
        action(Actions.FETCH_PRODUCT_DETAILS, id),

      fetchRecommendationsProducts: () =>
        action(Actions.FETCH_RECOMMENDATIONS_PRODUCTS, null),

      fetchPastPurchases: () =>
        action(Actions.FETCH_PAST_PURCHASES, null),

      // request action creators
      updateSearch: (search: Actions.Payload.Search): Actions.UpdateSearch => {
        const searchActions: Actions.UpdateSearch = [actions.resetPage()];

        if ('query' in search) {
          searchActions.push(...actions.updateQuery(search.query));
        }
        if ('clear' in search && shouldResetRefinements(search, flux.store.getState())) {
          searchActions.push(...actions.resetRefinements(search.clear));
        }
        if ('navigationId' in search) {
          if ('index' in search) {
            searchActions.push(...actions.selectRefinement(search.navigationId, search.index));
          } else if (search.range) {
            searchActions.push(...actions.addRefinement(search.navigationId, search.low, search.high));
          } else if ('value' in search) {
            searchActions.push(...actions.addRefinement(search.navigationId, search.value));
          }
        }

        return searchActions;
      },

      updateQuery: (query: string): Actions.ResetPageAndUpdateQuery => [
        actions.resetPage(),
        action(Actions.UPDATE_QUERY, query && query.trim(), {
          payload: [
            validators.isValidQuery,
            validators.isDifferentQuery
          ]
        })
      ],

      resetQuery: () => actions.updateQuery(null),

      addRefinement: (field: string, valueOrLow: any, high: any = null): Actions.ResetPageAndAddRefinement => [
        actions.resetPage(),
        action(Actions.ADD_REFINEMENT, refinementPayload(field, valueOrLow, high), {
          navigationId: validators.isString,
          payload: [
            validators.isRangeRefinement,
            validators.isValidRange,
            validators.isValueRefinement,
            validators.isNotFullRange,
            validators.isRefinementDeselectedByValue
          ]
        })
      ],

      switchRefinement: (field: string, valueOrLow: any, high: any = null): Actions.SwitchRefinement => <any>[
        actions.resetPage(),
        ...actions.resetRefinements(field),
        ...actions.addRefinement(field, valueOrLow, high)
      ],

      resetRefinements: (field?: boolean | string): Actions.ResetPageAndResetRefinements => [
        actions.resetPage(),
        action(Actions.RESET_REFINEMENTS, field, {
          payload: [
            validators.isValidClearField,
            validators.hasSelectedRefinements,
            validators.hasSelectedRefinementsByField
          ]
        })
      ],

      resetPage: (): Actions.ResetPage =>
        action(Actions.RESET_PAGE, undefined, {
          payload: validators.notOnFirstPage
        }),

      search: (query: string = Selectors.query(flux.store.getState())): Actions.Search => <any>[
        actions.resetPage(),
        ...actions.resetRefinements(true),
        ...actions.updateQuery(query)
      ],

      // tslint:disable-next-line max-line-length
      resetRecall: (query: string = null, { field, index }: { field: string, index: number } = <any>{}): Actions.ResetRecall => {
        const resetActions: any[] = actions.search();
        if (field) {
          resetActions.push(...actions.selectRefinement(field, index));
        }

        return <Actions.ResetRecall>resetActions;
      },

      selectRefinement: (navigationId: string, index: number): Actions.ResetPageAndSelectRefinement => [
        actions.resetPage(),
        action(Actions.SELECT_REFINEMENT, { navigationId, index }, {
          payload: validators.isRefinementDeselectedByIndex
        })],

      deselectRefinement: (navigationId: string, index: number): Actions.ResetPageAndDeselectRefinement => [
        actions.resetPage(),
        action(Actions.DESELECT_REFINEMENT, { navigationId, index }, {
          payload: validators.isRefinementSelectedByIndex
        })],

      selectCollection: (id: string): Actions.SelectCollection =>
        action(Actions.SELECT_COLLECTION, id, {
          payload: validators.isCollectionDeselected
        }),

      selectSort: (index: number): Actions.SelectSort =>
        action(Actions.SELECT_SORT, index, {
          payload: validators.isSortDeselected
        }),

      updatePageSize: (size: number): Actions.UpdatePageSize =>
        action(Actions.UPDATE_PAGE_SIZE, size, {
          payload: validators.isDifferentPageSize
        }),

      updateCurrentPage: (page: number): Actions.UpdateCurrentPage =>
        action(Actions.UPDATE_CURRENT_PAGE, page, {
          payload: validators.isOnDifferentPage
        }),

      updateDetails: (product: Store.Product): Actions.UpdateDetails =>
        action(Actions.UPDATE_DETAILS, product),

      updateAutocompleteQuery: (query: string): Actions.UpdateAutocompleteQuery =>
        action(Actions.UPDATE_AUTOCOMPLETE_QUERY, query, {
          payload: validators.isDifferentAutocompleteQuery
        }),

      // response action creators
      receiveQuery: (query: Actions.Payload.Query): Actions.ReceiveQuery =>
        action(Actions.RECEIVE_QUERY, query),

      receiveProducts: (res: Results): Actions.Action<string, any>[] | Actions.ReceiveProducts => {
        const receiveProducts = action(Actions.RECEIVE_PRODUCTS, res);

        return handleError(receiveProducts, () => {
          const state = flux.store.getState();
          const recordCount = SearchAdapter.extractRecordCount(res);

          return [
            receiveProducts,
            actions.receiveQuery(SearchAdapter.extractQuery(res)),
            actions.receiveProductRecords(SearchAdapter.extractProducts(res)),
            actions.receiveNavigations(SearchAdapter.combineNavigations(res)),
            actions.receiveRecordCount(recordCount),
            actions.receiveCollectionCount({
              collection: Selectors.collection(state),
              count: recordCount
            }),
            actions.receivePage(SearchAdapter.extractPage(state, recordCount)),
            actions.receiveTemplate(SearchAdapter.extractTemplate(res.template)),
          ];
        });
      },

      receiveProductRecords: (products: Store.Product[]): Actions.ReceiveProductRecords =>
        action(Actions.RECEIVE_PRODUCT_RECORDS, products),

      receiveCollectionCount: (count: Actions.Payload.Collection.Count): Actions.ReceiveCollectionCount =>
        action(Actions.RECEIVE_COLLECTION_COUNT, count),

      receiveNavigations: (navigations: Store.Navigation[]): Actions.ReceiveNavigations =>
        action(Actions.RECEIVE_NAVIGATIONS, navigations),

      receivePage: (page: Actions.Payload.Page): Actions.ReceivePage =>
        action(Actions.RECEIVE_PAGE, page),

      receiveTemplate: (template: Store.Template): Actions.ReceiveTemplate =>
        action(Actions.RECEIVE_TEMPLATE, template),

      receiveRecordCount: (recordCount: number): Actions.ReceiveRecordCount =>
        action(Actions.RECEIVE_RECORD_COUNT, recordCount),

      receiveRedirect: (redirect: string): Actions.ReceiveRedirect =>
        action(Actions.RECEIVE_REDIRECT, redirect),

      // tslint:disable-next-line max-line-length
      receiveMoreRefinements: (navigationId: string, refinements: Store.Refinement[], selected: number[]): Actions.ReceiveMoreRefinements =>
        action(Actions.RECEIVE_MORE_REFINEMENTS, { navigationId, refinements, selected }),

      // tslint:disable-next-line max-line-length
      receiveAutocompleteSuggestions: (suggestions: Actions.Payload.Autocomplete.Suggestions): Actions.ReceiveAutocompleteSuggestions =>
        action(Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS, suggestions),

      receiveMoreProducts: (products: Store.Product[]): Actions.ReceiveMoreProducts =>
        action(Actions.RECEIVE_MORE_PRODUCTS, products),

      receiveAutocompleteProducts: (res: Results): Actions.ReceiveAutocompleteProducts => {
        const receiveProducts = action(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, res);

        return handleError(receiveProducts, () => [
          receiveProducts,
          actions.receiveAutocompleteProductRecords(SearchAdapter.extractProducts(res)),
          actions.receiveAutocompleteTemplate(SearchAdapter.extractTemplate(res.template)),
        ]);
      },

      receiveAutocompleteProductRecords: (products: Store.Product[]): Actions.ReceiveAutocompleteProductRecords =>
        action(Actions.RECEIVE_AUTOCOMPLETE_PRODUCT_RECORDS, products),

      receiveAutocompleteTemplate: (template: Store.Template): Actions.ReceiveAutocompleteTemplate =>
        action(Actions.RECEIVE_AUTOCOMPLETE_TEMPLATE, template),

      receiveDetailsProduct: (product: Store.Product): Actions.ReceiveDetailsProduct =>
        action(Actions.RECEIVE_DETAILS_PRODUCT, product),

      receiveRecommendationsProducts: (products: Store.Product[]) =>
        action(Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS, products),

      receivePastPurchases: (products: Store.Recommendations.PastPurchase[]) =>
        action(Actions.RECEIVE_PAST_PURCHASES, products),

      // tslint:disable-next-line max-line-length
      receiveNavigationSort: (navigations: Store.Recommendations.Navigation[]): Actions.ReceiveNavigationSort =>
        action(Actions.RECEIVE_NAVIGATION_SORT, navigations),

      // ui action creators
      createComponentState: (tagName: string, id: string, state: any = {}): Actions.CreateComponentState =>
        action(Actions.CREATE_COMPONENT_STATE, { tagName, id, state }),

      removeComponentState: (tagName: string, id: string): Actions.RemoveComponentState =>
        action(Actions.REMOVE_COMPONENT_STATE, { tagName, id }),

      // session action creators
      updateLocation: (location: Store.Geolocation): Actions.UpdateLocation =>
        action(Actions.UPDATE_LOCATION, location),

      // app action creators
      startApp: (): Actions.StartApp =>
        action<typeof Actions.START_APP>(Actions.START_APP, undefined)
    });

    return actions;
  };
}

export default createActions;
