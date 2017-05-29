import { Results } from 'groupby-api';
import { Dispatch } from 'redux';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import FluxCapacitor from '../flux-capacitor';
import Actions from './actions';
import Adapters from './adapters';
import Selectors from './selectors';
import Store from './store';
import { conditional, thunk } from './utils';

export default class Creator {

  linkMapper: (value: string) => { value: string, url: string };

  constructor(private flux: FluxCapacitor, paths: Actions.Paths) {
    this.linkMapper = (value: string) => ({ value, url: `${paths.search}/${value}` });
  }

  soFetching = (requestType: keyof Store.IsFetching) =>
    ({ type: Actions.SO_FETCHING, requestType })

  // fetch action creators
  fetchMoreRefinements = (navigationId: string) =>
    (dispatch: Dispatch<any>, getStore: () => Store.State) => {
      const state = getStore();
      if (Selectors.hasMoreRefinements(state, navigationId)) {
        dispatch(this.soFetching('moreRefinements'));
        return this.flux.clients.bridge.refinements(Selectors.searchRequest(state), navigationId)
          .then(({ navigation: { name, refinements } }) => {
            const remapped = refinements.map(Adapters.Search.extractRefinement);
            return dispatch(this.receiveMoreRefinements(name, remapped));
          });
      }
    }

  fetchProducts = () =>
    (dispatch: Dispatch<any>, getStore: () => Store.State) => {
      const state = getStore();
      if (!state.isFetching.search) {
        dispatch(this.soFetching('search'));
        return this.flux.clients.bridge.search(Selectors.searchRequest(state))
          .then((res) => dispatch(this.receiveSearchResponse(res)));
      }
    }

  fetchAutocompleteSuggestions = (query: string, config: QueryTimeAutocompleteConfig) =>
    (dispatch: Dispatch<any>) => {
      dispatch(this.soFetching('autocompleteSuggestions'));
      return this.flux.clients.sayt.autocomplete(query, config)
        .then((res) => {
          const { suggestions, categoryValues } = Adapters.Search.extractAutocompleteSuggestions(res);
          dispatch(this.receiveAutocompleteSuggestions(suggestions, categoryValues));
        });
    }

  fetchAutocompleteProducts = (query: string, config: QueryTimeProductSearchConfig) =>
    (dispatch: Dispatch<any>) => {
      dispatch(this.soFetching('autocompleteProducts'));
      return this.flux.clients.sayt.productSearch(query, config)
        .then((res) => {
          const products = Adapters.Search.extractAutocompleteProducts(res);
          dispatch(this.receiveAutocompleteProducts(products));
        });
    }

  fetchCollectionCount = (collection: string) => (dispatch: Dispatch<any>, getStore: () => Store.State) =>
    this.flux.clients.bridge.search({ ...Selectors.searchRequest(getStore()), collection })
      .then((res) => dispatch(this.receiveCollectionCount(collection, res.totalRecordCount)))

  fetchProductDetails = (id: string) => (dispatch: Dispatch<any>, getStore: () => Store.State) =>
    this.flux.clients.bridge.search({
      ...Selectors.searchRequest(getStore()),
      refinements: [<any>{ navigationName: 'id', type: 'Value', value: id }]
    }).then((res) => dispatch(this.receiveDetailsProduct(res.records[0].allMeta)))

  // request action creators
  updateSearch = (search: Actions.Search) =>
    thunk(Actions.UPDATE_SEARCH, Object.assign(search))

  selectRefinement = (navigationId: string, index: number) =>
    conditional<Actions.Navigation.SelectRefinement>((state) =>
      Selectors.isRefinementDeselected(state, navigationId, index),
      Actions.SELECT_REFINEMENT, { navigationId, index })

  deselectRefinement = (navigationId: string, index: number) =>
    conditional<Actions.Navigation.DeselectRefinement>((state) =>
      Selectors.isRefinementSelected(state, navigationId, index),
      Actions.DESELECT_REFINEMENT, { navigationId, index })

  selectCollection = (id: string) =>
    conditional<Actions.Collections.SelectCollection>((state) =>
      state.data.collections.selected !== id,
      Actions.SELECT_COLLECTION, { id })

  selectSort = (index: number) =>
    conditional<Actions.Sort.UpdateSelected>((state) =>
      state.data.sorts.selected !== index,
      Actions.SELECT_SORT, { index })

  updatePageSize = (size: number) =>
    conditional<Actions.Page.UpdateSize>((state) =>
      Selectors.pageSize(state) !== size,
      Actions.UPDATE_PAGE_SIZE, { size })

  updateCurrentPage = (page: number) =>
    conditional<Actions.Page.UpdateCurrent>((state) =>
      page !== null && state.data.page.current !== page,
      Actions.UPDATE_CURRENT_PAGE, { page })

  updateDetailsId = (id: string) =>
    thunk<Actions.Details.UpdateId>(Actions.UPDATE_DETAILS_ID, { id })

  updateAutocompleteQuery = (query: string) =>
    conditional<Actions.Autocomplete.UpdateQuery>((state) => {
      // console.log('WTFFF', query);
      return state.data.autocomplete.query !== query;
      // return false;
    },
      Actions.UPDATE_AUTOCOMPLETE_QUERY, { query })

  // response action creators
  receiveSearchResponse = (results: Results) =>
    (dispatch: Dispatch<any>, getStore: () => Store.State) => {
      const state = getStore();
      if (results.redirect) {
        dispatch(this.receiveRedirect(results.redirect));
      }
      dispatch(this.receiveQuery(Adapters.Search.extractQuery(results, this.linkMapper)));
      dispatch(this.receiveProducts(results.records.map(Adapters.Search.extractProduct)));
      // tslint:disable-next-line max-line-length
      dispatch(this.receiveNavigations(Adapters.Search.combineNavigations(results.availableNavigation, results.selectedNavigation)));
      dispatch(this.receiveRecordCount(results.totalRecordCount));
      dispatch(this.receiveCollectionCount(state.data.collections.selected, results.totalRecordCount));
      dispatch(this.receivePage(Adapters.Search.extractPage(state, results)));
      dispatch(this.receiveTemplate(Adapters.Search.extractTemplate(results.template)));
    }

  receiveQuery = (query: Actions.Query) =>
    thunk<Actions.Query.ReceiveQuery>(Actions.RECEIVE_QUERY, query)

  receiveProducts = (products: Store.Product[]) =>
    thunk(Actions.RECEIVE_PRODUCTS, { products })

  receiveCollectionCount = (collection: string, count: number) =>
    thunk<Actions.Collections.ReceiveCount>(
      Actions.RECEIVE_COLLECTION_COUNT, { collection, count })

  receiveNavigations = (navigations: Store.Navigation[]) =>
    thunk<Actions.Navigation.ReceiveNavigations>(
      Actions.RECEIVE_NAVIGATIONS, { navigations })

  receivePage = (page: Actions.Page) =>
    thunk<Actions.Page.ReceivePage>(
      Actions.RECEIVE_PAGE, page)

  receiveTemplate = (template: Store.Template) =>
    thunk(Actions.RECEIVE_TEMPLATE, { template })

  receiveRecordCount = (recordCount: number) =>
    thunk(Actions.RECEIVE_RECORD_COUNT, { recordCount })

  receiveRedirect = (redirect: string) =>
    thunk(Actions.RECEIVE_REDIRECT, { redirect })

  receiveMoreRefinements = (navigationId: string, refinements: any) =>
    thunk(Actions.RECEIVE_MORE_REFINEMENTS, { navigationId, refinements })

  receiveAutocompleteSuggestions = (suggestions: string[], categoryValues: string[]) =>
    thunk(Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS, { suggestions, categoryValues })

  receiveAutocompleteProducts = (products: Store.Product[]) =>
    thunk(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, { products })

  receiveDetailsProduct = (product: Store.Product) =>
    thunk<Actions.Details.ReceiveProduct>(Actions.RECEIVE_DETAILS_PRODUCT, { product })

  // ui action creators
  createComponentState = (tagName: string, id: string, state: any = {}) =>
    thunk<Actions.UI.CreateComponentState>(Actions.CREATE_COMPONENT_STATE, { tagName, id, state })

  removeComponentState = (tagName: string, id: string) =>
    thunk<Actions.UI.RemoveComponentState>(Actions.REMOVE_COMPONENT_STATE, { tagName, id })

  // app action creators
  startApp = () => ({ type: Actions.START_APP });
}
