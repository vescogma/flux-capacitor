import { Request } from 'groupby-api';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import Autocomplete from './adapters/autocomplete';
import Configuration from './adapters/configuration';
import Search, { MAX_RECORDS } from './adapters/search';
import AppConfig from './configuration';
import Store from './store';

namespace Selectors {

  /**
   * Returns the applied area.
   */
  export const area = (state: Store.State) =>
    state.data.present.area;

  /**
   * Returns the requested fields.
   */
  export const fields = (state: Store.State) =>
    state.data.present.fields;

  /**
   * Returns the current original query.
   */
  export const query = (state: Store.State) =>
    state.data.present.query.original;

  /**
   * Returns the corrected query if it exists, otherwise returns the original query.
   */
  export const currentQuery = (state: Store.State) => {
    const query = state.data.present.query;
    return query.corrected || query.original;
  };

  /**
   * Returns the collections object.
   */
  export const collections = (state: Store.State) =>
    state.data.present.collections;

  /**
   * Returns the current selected collection.
   */
  export const collection = (state: Store.State) =>
    Selectors.collections(state).selected;

  /**
   * Returns the index of the given collection.
   */
  export const collectionIndex = (state: Store.State, name: string) =>
    Selectors.collections(state).allIds.indexOf(name);

  /**
   * Returns the page sizes object.
   */
  export const pageSizes = (state: Store.State) =>
    state.data.present.page.sizes;

  /**
   * Returns the current selected page size.
   */
  export const pageSize = (state: Store.State) => {
    const selectedPageSizes = Selectors.pageSizes(state);
    return selectedPageSizes.items[selectedPageSizes.selected];
  };

  /**
   * Returns the index of the selected page size.
   */
  export const pageSizeIndex = (state: Store.State) =>
    Selectors.pageSizes(state).selected;

  /**
   * Returns the current page.
   */
  export const page = (state: Store.State) =>
    state.data.present.page.current;

  /**
   * Returns the last page index, ie number of pages
   */
  export const totalPages = (state: Store.State) =>
    state.data.present.page.last;
  /**
   * Returns the sorts object.
   */
  export const sorts = (state: Store.State) =>
    state.data.present.sorts;

  /**
   * Returns the current selected sort.
   */
  export const sort = (state: Store.State) => {
    const selectedSorts = Selectors.sorts(state);
    return selectedSorts.items[selectedSorts.selected];
  };

  /**
   * Returns the index of the current selected sort.
   */
  export const sortIndex = (state: Store.State) =>
    Selectors.sorts(state).selected;

  /**
   * Returns the request skip needed for the current page and given page size.
   */
  export const skip = (state: Store.State, pagesize: number) =>
    (Selectors.page(state) - 1) * pagesize;

  /**
   * Returns the current products
   */
  export const products = (state: Store.State) =>
    state.data.present.products;

  /**
   * Returns the current products extended with metadata
   */
  export const productsWithMetadata = (state: Store.State, idField: string) => {
    const pastPurchases = Selectors.pastPurchaseProductsBySku(state);
    return Selectors.products(state).map((data) => {
      const meta: any = {};

      if (data[idField] in pastPurchases) {
        meta.pastPurchase = true;
      }

      return { data, meta };
    });
  };

  /**
   * Returns the current details object.
   */
  export const details = (state: Store.State) =>
    state.data.present.details;

  /**
   * Returns the current selected refinements.
   */
  export const selectedRefinements = (state: Store.State) =>
    Selectors.navigations(state)
      .reduce((allRefinements, nav) =>
        allRefinements.concat(nav.selected
          .map<any>((refinementIndex) => nav.refinements[refinementIndex])
          .reduce((refs, { low, high, value }) =>
            refs.concat(nav.range
              ? { navigationName: nav.field, type: 'Range', high, low }
              : { navigationName: nav.field, type: 'Value', value }), [])), []);

  /**
   * Returns the maximum value for the given range navigation.
   */
  export const rangeNavigationMax = (state: Store.State, navigationId) =>
    Selectors.navigation(state, navigationId).max;

  /**
   * Returns the minimum value for the given range navigation.
   */
  export const rangeNavigationMin = (state: Store.State, navigationId) =>
    Selectors.navigation(state, navigationId).min;

  /**
   * Returns the navigation object for the given navigationId.
   */
  export const navigation = (state: Store.State, navigationId: string) =>
    state.data.present.navigations.byId[navigationId];

  /**
   * Returns the navigations.
   */
  export const navigations = (state: Store.State) =>
    state.data.present.navigations.allIds.map<Store.Navigation>(Selectors.navigation.bind(null, state));

  /**
   * Returns the navigation sort.
   */
  export const navigationSort = (state: Store.State) =>
    state.data.present.navigations.sort;

  /**
   * Finds the refinement based on the given navigationId and index and returns
   * true if it is not selected, false otherwise.
   */
  export const isRefinementDeselected = (state: Store.State, navigationId: string, index: number) => {
    const nav = Selectors.navigation(state, navigationId);
    return nav && !nav.selected.includes(index);
  };

  /**
   * Finds the refinement based on the given navigationId and index and returns
   * true if it is selected, false otherwise.
   */
  export const isRefinementSelected = (state: Store.State, navigationId: string, index: number) => {
    const nav = Selectors.navigation(state, navigationId);
    return nav && nav.selected.includes(index);
  };

  /**
   * Returns true if the navigation based on the given navigationId has more refinements.
   */
  export const hasMoreRefinements = (state: Store.State, navigationId: string) => {
    const nav = Selectors.navigation(state, navigationId);
    return nav && nav.more;
  };

  /**
   * Returns the refinement object for the given navigationId and index.
   */
  export const refinementCrumb = (state: Store.State, navigationId: string, index: number) => {
    const nav = Selectors.navigation(state, navigationId);
    const { value, low, high } = <any>nav.refinements[index];

    return {
      value,
      low,
      high,
      field: navigationId,
      range: nav.range,
    };
  };

  /**
   * Returns the current record count.
   */
  export const recordCount = (state: Store.State) =>
    state.data.present.recordCount;

  /**
   * Returns the current autocomplete object.
   */
  export const autocomplete = (state: Store.State) =>
    state.data.present.autocomplete;

  /**
   * Returns the currently typed in autocomplete query.
   */
  export const autocompleteQuery = (state: Store.State) =>
    Selectors.autocomplete(state).query;

  /**
   * Returns the set autocomplete category field navigationId.
   */
  export const autocompleteCategoryField = (state: Store.State) =>
    Selectors.autocomplete(state).category.field;

  /**
   * Returns the current values for the autocomplete category field.
   */
  export const autocompleteCategoryValues = (state: Store.State) =>
    Selectors.autocomplete(state).category.values;

  /**
   * Returns the current autocomplete suggestions.
   */
  export const autocompleteSuggestions = (state: Store.State) =>
    Selectors.autocomplete(state).suggestions;

  /**
   * Returns the current autocomplete navigations.
   */
  export const autocompleteNavigations = (state: Store.State) =>
    Selectors.autocomplete(state).navigations;

  /**
   * Returns the current session location.
   */
  export const location = (state: Store.State) =>
    state.session.location;

  /**
   * Returns the current session config
   */
  export const config = (state: Store.State) =>
    state.session.config;

  /**
   * Returns the current recommendations product suggestions.
   */
  export const recommendationsProducts = (state: Store.State) =>
    state.data.present.recommendations.suggested.products;

  /**
   * Returns the SKUs of previously purchased products.
   */
  export const pastPurchaseProductsBySku = (state: Store.State) =>
    state.data.present.recommendations.pastPurchases.products
      .reduce((products, product) => Object.assign(products, { [product.sku]: product.quantity }), {});

  export const pastPurchases = (state: Store.State) =>
    state.data.present.recommendations.pastPurchases.products;

  export const queryPastPurchases = (state: Store.State) =>
    state.data.present.recommendations.queryPastPurchases;

  export const orderHistory = (state: Store.State) =>
    state.data.present.recommendations.orderHistory;
  /**
   * Returns the ui state for the all of the tags with the given tagName.
   */
  export const uiTagStates = (state: Store.State, tagName: string) =>
    state.ui[tagName];

  /**
   * Returns the ui state for the tag with the given tagName and id.
   */
  export const uiTagState = (state: Store.State, tagName: string, id: string) =>
    (Selectors.uiTagStates(state, tagName) || {})[id];
}

export default Selectors;
