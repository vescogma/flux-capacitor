import { Request } from 'groupby-api';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import Autocomplete from './adapters/autocomplete';
import Configuration from './adapters/configuration';
import { MAX_RECORDS } from './adapters/search';
import AppConfig from './configuration';
import Store from './store';

namespace Selectors {

  export const searchRequest = (state: Store.State, config: AppConfig): Request => {
    const sort = Selectors.sort(state);
    const pageSize = Selectors.pageSize(state);
    const skip = Selectors.skip(state, pageSize);
    const request: Partial<Request> = {
      pageSize: Math.min(pageSize, MAX_RECORDS - skip),
      area: Selectors.area(state),
      fields: Selectors.fields(state),
      query: Selectors.query(state),
      collection: Selectors.collection(state),
      refinements: Selectors.selectedRefinements(state),
      skip
    };

    const language = Configuration.extractLanguage(config);
    if (language) {
      request.language = language;
    }
    if (sort) {
      request.sort = <any>Selectors.requestSort(sort);
    }

    return <Request>{
      ...config.search.defaults,
      ...request,
      ...config.search.overrides,
    };
  };

  export const autocompleteSuggestionsRequest = (config: AppConfig): QueryTimeAutocompleteConfig => {
    return {
      ...config.autocomplete.defaults.suggestions,
      language: Autocomplete.extractLanguage(config),
      numSearchTerms: Configuration.extractAutocompleteSuggestionCount(config),
      numNavigations: Configuration.extractAutocompleteNavigationCount(config),
      sortAlphabetically: Configuration.isAutocompleteAlphabeticallySorted(config),
      fuzzyMatch: Configuration.isAutocompleteMatchingFuzzily(config),
      ...config.autocomplete.overrides.suggestions,
    };
  };

  export const autocompleteProductsRequest = (config: AppConfig): QueryTimeProductSearchConfig => {
    return {
      ...config.autocomplete.defaults.products,
      language: Autocomplete.extractLanguage(config),
      area: Autocomplete.extractArea(config),
      numProducts: Configuration.extractAutocompleteProductCount(config),
      ...config.autocomplete.overrides.products,
    };
  };

  export const area = (state: Store.State) =>
    state.data.area;

  export const fields = (state: Store.State) =>
    state.data.fields;

  export const query = (state: Store.State) =>
    state.data.query.original;

  export const collection = (state: Store.State) =>
    state.data.collections.selected;

  export const pageSize = (state: Store.State) =>
    state.data.page.sizes.items[state.data.page.sizes.selected];

  export const requestSort = ({ field, descending }: Store.Sort) =>
    ({ field, order: descending && 'Descending' });

  export const sort = (state: Store.State) =>
    state.data.sorts.items[state.data.sorts.selected];

  export const skip = (state: Store.State, pagesize: number) =>
    (state.data.page.current - 1) * pagesize;

  export const products = (state: Store.State) =>
    state.data.products;

  export const details = (state: Store.State) =>
    state.data.details;

  export const selectedRefinements = (state: Store.State) =>
    Selectors.navigations(state)
      .reduce((allRefinements, nav) =>
        allRefinements.concat(nav.selected
          .map<any>((refinementIndex) => nav.refinements[refinementIndex])
          .reduce((refs, { low, high, value }) =>
            refs.concat(nav.range
              ? { navigationName: nav.field, type: 'Range', high, low }
              : { navigationName: nav.field, type: 'Value', value }), [])), []);

  export const navigation = (state: Store.State, navigationId: string) =>
    state.data.navigations.byId[navigationId];

  export const navigations = (state: Store.State) =>
    state.data.navigations.allIds.map((id) => Selectors.navigation(state, id));

  export const isRefinementDeselected = (state: Store.State, navigationId: string, index: number) => {
    const nav = Selectors.navigation(state, navigationId);
    return nav && !nav.selected.includes(index);
  };

  export const isRefinementSelected = (state: Store.State, navigationId: string, index: number) => {
    const nav = Selectors.navigation(state, navigationId);
    return nav && nav.selected.includes(index);
  };

  export const hasMoreRefinements = (state: Store.State, navigationId: string) => {
    const nav = Selectors.navigation(state, navigationId);
    return nav && nav.more;
  };

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

  export const recordCount = (state: Store.State) =>
    state.data.recordCount;
}

export default Selectors;
