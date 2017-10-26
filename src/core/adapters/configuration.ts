import Configuration from '../configuration';
import * as AreaReducer from '../reducers/data/area';
import * as CollectionsReducer from '../reducers/data/collections';
import * as PageReducer from '../reducers/data/page';
import Store from '../store';

namespace Adapter {

  export const initialState = (config: Configuration): Partial<Store.State> =>
    ({
      data: <any>{
        present: {
          area: Adapter.extractArea(config, AreaReducer.DEFAULT_AREA),
          autocomplete: {
            suggestions: [],
            navigations: [],
            products: [],
            category: {
              field: Adapter.extractSaytCategoryField(config),
              values: []
            },
          },
          recommendations: {
            suggested: { products: [] },
            pastPurchases: { products: []},
            queryPastPurchases: [],
            orderHistory: []
          },
          personalization: {
            realtimeBiases: {
              totalBiases: 2,
              allBiases: {
                brand: [
                  {
                    name: 'nike',
                    created: 111111111,
                    timesClicked: 10
                  },
                  {
                    name: 'adidas',
                    created: 222222222,
                    timesClicked: 9
                  },
                ],
                color: [
                  {
                    name: 'red',
                    created: 111111111,
                    timesClicked: 7,
                  },
                  {
                    name: 'blue',
                    created: 222222222,
                    timesClicked: 8,
                  },
                ]
              }
            }
          },
          fields: Adapter.extractFields(config),
          collections: Adapter.extractCollections(config, CollectionsReducer.DEFAULT_COLLECTION),
          sorts: Adapter.extractSorts(config),
          page: {
            ...PageReducer.DEFAULTS,
            sizes: Adapter.extractPageSizes(config, PageReducer.DEFAULT_PAGE_SIZE)
          }
        }
      },
      session: { config }
    });

  export const extractArea = (config: Configuration, defaultValue?: string) =>
    config.area || defaultValue;

  export const extractAutocompleteArea = (config: Configuration) =>
    config.autocomplete.area;

  export const extractAutocompleteProductArea = (config: Configuration) =>
    config.autocomplete.products.area;

  export const extractFields = (config: Configuration) =>
    config.search.fields || [];

  export const extractLanguage = (config: Configuration) =>
    config.language;

  export const extractAutocompleteLanguage = (config: Configuration) =>
    config.autocomplete.language;

  export const extractAutocompleteProductLanguage = (config: Configuration) =>
    config.autocomplete.products.language;

  /**
   * extract current collection from config
   */
  export const extractCollection = (config: Configuration) =>
    typeof config.collection === 'object' ? config.collection.default : config.collection;

  export const extractAutocompleteCollection = (config: Configuration) =>
    config.autocomplete.collection;

  export const extractAutocompleteSuggestionCount = (config: Configuration) =>
    config.autocomplete.suggestionCount;

  export const extractAutocompleteProductCount = (config: Configuration) =>
    config.autocomplete.products.count;

  export const extractAutocompleteNavigationCount = (config: Configuration) =>
    config.autocomplete.navigationCount;

  export const isAutocompleteAlphabeticallySorted = (config: Configuration) =>
    config.autocomplete.alphabetical;

  export const isAutocompleteMatchingFuzzily = (config: Configuration) =>
    config.autocomplete.fuzzy;

  export const extractIndexedState = (state: string | { options: string[], default: string }) => {
    if (typeof state === 'object') {
      return { selected: state.default, allIds: state.options || [state.default] };
    } else {
      return { selected: state, allIds: [state] };
    }
  };

  // tslint:disable-next-line max-line-length
  export const extractCollections = (config: Configuration, defaultValue: string): Store.Indexed.Selectable<Store.Collection> => {
    const { selected, allIds } = Adapter.extractIndexedState(config.collection || defaultValue);

    return {
      selected,
      allIds,
      byId: allIds.reduce((map, name) => Object.assign(map, { [name]: { name } }), {})
    };
  };

  // tslint:disable-next-line max-line-length
  export const extractPageSizes = (config: Configuration, defaultValue: number): Store.SelectableList<number> => {
    const state = config.search.pageSize || defaultValue;
    if (typeof state === 'object') {
      const selected = state.default;
      const items = state.options || [defaultValue];
      const selectedIndex = items.findIndex((pageSize) => pageSize === selected);

      return { items, selected: (selectedIndex === -1 ? 0 : selectedIndex) };
    } else {
      return { selected: 0, items: [state] };
    }
  };

  export const extractSorts = (config: Configuration): Store.SelectableList<Store.Sort> => {
    const state = config.search.sort;
    if (typeof state === 'object' && ('options' in state || 'default' in state)) {
      const selected: Store.Sort = (<{ default: Store.Sort }>state).default || <any>{};
      const items = (<{ options: Store.Sort[] }>state).options || [];
      const selectedIndex = items
        .findIndex((sort) => sort.field === selected.field && !sort.descending === !selected.descending);

      return { items, selected: (selectedIndex === -1 ? 0 : selectedIndex) };
    } else {
      return { selected: 0, items: [<Store.Sort>state] };
    }
  };

  export const extractSaytCategoryField = (config: Configuration) =>
    config.autocomplete.category;

  export const extractAutocompleteNavigationLabels = (config: Configuration) => {
    return config.autocomplete.navigations;
  };

  export const extractINav = (config: Configuration) =>
    config.recommendations.iNav;

  export const extractNavigationsPinned = (config: Configuration) =>
    extractINav(config).navigations.pinned;

  export const extractRefinementsPinned = (config: Configuration) =>
    extractINav(config).refinements.pinned;

  export const extractRefinementsSort = (config: Configuration) =>
    extractINav(config).refinements.sort;

  export const extractLocation = (config: Configuration) =>
    config.recommendations.location;

  export const shouldAddPastPurchaseBias = (config: Configuration) =>
    config.recommendations.pastPurchases.biasCount > 0;
}

export default Adapter;
