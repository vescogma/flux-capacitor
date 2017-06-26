import FluxCapacitor from '../../flux-capacitor';
import * as AreaReducer from '../reducers/data/area';
import * as CollectionsReducer from '../reducers/data/collections';
import * as PageReducer from '../reducers/data/page';
import Store from '../store';

namespace Adapter {

  export const initialState = (config: FluxCapacitor.Configuration): Partial<Store.State> =>
    ({
      data: <any>{
        area: Adapter.extractArea(config, AreaReducer.DEFAULT_AREA),
        autocomplete: {
          suggestions: [],
          navigations: [],
          products: [],
          category: {
            field: Adapter.extractSaytCategoryField(config),
            values: []
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
    });

  export const extractArea = (config: FluxCapacitor.Configuration, defaultValue: string) =>
    config.area || defaultValue;

  export const extractFields = (config: FluxCapacitor.Configuration) =>
    config.search.fields || [];

  /**
   * extract current collection from config
   */
  export const extractCollection = (config: FluxCapacitor.Configuration) =>
    typeof config.collection === 'object' ? config.collection.default : config.collection;

  export const extractIndexedState = (state: string | { options: string[], default: string }) => {
    if (typeof state === 'object') {
      return { selected: state.default, allIds: state.options || [state.default] };
    } else {
      return { selected: state, allIds: [state] };
    }
  };

  // tslint:disable-next-line max-line-length
  export const extractCollections = (config: FluxCapacitor.Configuration, defaultValue: string): Store.Indexed.Selectable<Store.Collection> => {
    const { selected, allIds } = Adapter.extractIndexedState(config.collection || defaultValue);

    return {
      selected,
      allIds,
      byId: allIds.reduce((map, name) => Object.assign(map, { [name]: { name } }), {})
    };
  };

  // tslint:disable-next-line max-line-length
  export const extractPageSizes = (config: FluxCapacitor.Configuration, defaultValue: number): Store.SelectableList<number> => {
    const state = config.search.pageSize || defaultValue;
    if (typeof state === 'object') {
      const selected = state.default;
      const items = state.options || [defaultValue];
      const selectedIndex = items.findIndex((pageSize) => pageSize === selected);

      return { items, selected: selectedIndex === -1 ? 0 : selectedIndex };
    } else {
      return { selected: 0, items: [state] };
    }
  };

  export const extractSorts = (config: FluxCapacitor.Configuration): Store.SelectableList<Store.Sort> => {
    const state = config.search.sort;
    if (typeof state === 'object' && ('options' in state || 'default' in state)) {
      const selected: Store.Sort = (<{ default: Store.Sort }>state).default || <any>{};
      const items = ((<{ options: Store.Sort[] }>state).options || []);
      const selectedIndex = items
        .findIndex((sort) => sort.field === selected.field && !sort.descending === !selected.descending);

      return { items, selected: selectedIndex === -1 ? 0 : selectedIndex };
    } else {
      return { selected: 0, items: [<Store.Sort>state] };
    }
  };

  export const extractSaytCategoryField = (config: FluxCapacitor.Configuration) => {
    return config.autocomplete.category;
  };
}

export default Adapter;
