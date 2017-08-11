import { Request } from 'groupby-api';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import Autocomplete from './adapters/autocomplete';
import Configuration from './adapters/configuration';
import Search, { MAX_RECORDS } from './adapters/search';
import AppConfig from './configuration';
import Store from './store';

namespace Selectors {

  export const area = (state: Store.State) =>
    state.data.present.area;

  export const fields = (state: Store.State) =>
    state.data.present.fields;

  export const query = (state: Store.State) =>
    state.data.present.query.original;

  export const currentQuery = (state: Store.State) => {
    const query = state.data.present.query;
    return query.corrected || query.original;
  };

  export const collections = (state: Store.State) =>
    state.data.present.collections;

  export const collection = (state: Store.State) =>
    Selectors.collections(state).selected;

  export const collectionIndex = (state: Store.State, name: string) =>
    Selectors.collections(state).allIds.indexOf(name);

  export const pageSizes = (state: Store.State) =>
    state.data.present.page.sizes;

  export const pageSize = (state: Store.State) => {
    const selectedPageSizes = Selectors.pageSizes(state);
    return selectedPageSizes.items[selectedPageSizes.selected];
  };

  export const pageSizeIndex = (state: Store.State) =>
    Selectors.pageSizes(state).selected;

  export const page = (state: Store.State) =>
    state.data.present.page.current;

  export const requestSort = ({ field, descending }: Store.Sort) =>
    ({ field, order: descending && 'Descending' });

  export const sorts = (state: Store.State) =>
    state.data.present.sorts;

  export const sort = (state: Store.State) => {
    const selectedSorts = Selectors.sorts(state);
    return selectedSorts.items[selectedSorts.selected];
  };

  export const sortIndex = (state: Store.State) =>
    Selectors.sorts(state).selected;

  export const skip = (state: Store.State, pagesize: number) =>
    (Selectors.page(state) - 1) * pagesize;

  export const products = (state: Store.State) =>
    state.data.present.products;

  export const details = (state: Store.State) =>
    state.data.present.details;

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
    state.data.present.navigations.byId[navigationId];

  export const navigations = (state: Store.State) =>
    state.data.present.navigations.allIds.map<Store.Navigation>(Selectors.navigation.bind(null, state));

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
    state.data.present.recordCount;

  export const autocomplete = (state: Store.State) =>
    state.data.present.autocomplete;

  export const autocompleteQuery = (state: Store.State) =>
    Selectors.autocomplete(state).query;

  export const autocompleteCategoryField = (state: Store.State) =>
    Selectors.autocomplete(state).category.field;

  export const autocompleteCategoryValues = (state: Store.State) =>
    Selectors.autocomplete(state).category.values;

  export const autocompleteSuggestions = (state: Store.State) =>
    Selectors.autocomplete(state).suggestions;

  export const autocompleteNavigations = (state: Store.State) =>
    Selectors.autocomplete(state).navigations;

  export const location = (state: Store.State) =>
    state.session.location;

  export const recommendationsProducts = (state: Store.State) =>
    state.data.present.recommendations.products;

  export const uiTagStates = (state: Store.State, tagName: string) =>
    state.ui[tagName];

  export const uiTagState = (state: Store.State, tagName: string, id: string) =>
    (Selectors.uiTagStates(state, tagName) || {})[id];
}

export default Selectors;
