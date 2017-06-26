import Adapter from '../../../../src/core/adapters/configuration';
import SearchAdapter from '../../../../src/core/adapters/search';
import { DEFAULT_AREA } from '../../../../src/core/reducers/data/area';
import { DEFAULT_COLLECTION } from '../../../../src/core/reducers/data/collections';
import * as PageReducer from '../../../../src/core/reducers/data/page';
import suite from '../../_suite';

suite('SearchAdapter', ({ expect, stub }) => {
  describe('initialState()', () => {
    it('should return initialState based on defaults', () => {
      const category = 'cat';
      const sort = 'prices';
      const config = <any>{
        autocomplete: {
          category
        },
        search: {
          sort
        }
      };
      expect(Adapter.initialState(config)).to.eql({
        data: {
          area: DEFAULT_AREA,
          autocomplete: {
            suggestions: [],
            navigations: [],
            products: [],
            category: {
              field: category,
              values: []
            }
          },
          fields: [],
          collections: {
            selected: DEFAULT_COLLECTION,
            allIds: [DEFAULT_COLLECTION],
            byId: {
              [DEFAULT_COLLECTION]: {
                name: DEFAULT_COLLECTION
              }
            }
          },
          sorts: {
            selected: 0,
            items: [sort]
          },
          page: {
            ...PageReducer.DEFAULTS,
            sizes: {
              selected: 0,
              items: [PageReducer.DEFAULT_PAGE_SIZE]
            }
          }
        }
      });
    });

    it('should return initialState based on config', () => {
      const area = 'test';
      const collection = {
        default: 'All the depts',
        options: ['All the depts', 'idk']
      };
      const category = 'whatevs';
      const fields = ['a', 'b', 'c'];
      const pageSize = {
        default: 50,
        options: [10,20,50]
      };
      const sort = {
        default: 'stuff',
        options: [{ field: 'stuff', descending: true}, { field: 'other stuff' }]
      };
      const config = <any>{
        area,
        collection,
        autocomplete: {
          category
        },
        search: {
          fields,
          pageSize,
          sort
        },
      };
      const state = {
        data: {
          area,
          autocomplete: {
            suggestions: [],
            navigations: [],
            products: [],
            category: {
              field: category,
              values: []
            }
          },
          fields,
          collections: {
            selected: collection.default,
            allIds: collection.options,
            byId: {
              [collection.options[0]]: {
                name: collection.options[0]
              },
              [collection.options[1]]: {
                name: collection.options[1]
              }
            }
          },
          sorts: {
            selected: 0,
            items: sort.options
          },
          page: {
            ...PageReducer.DEFAULTS,
            sizes: {
              selected: 2,
              items: pageSize.options
            }
          }
        }
      };
      expect(Adapter.initialState(config)).to.eql(state);
    });
  });

  describe('extractCollection()', () => {
    it('should return default', () => {
      const defaultCollection = 'All';
      expect(Adapter.extractCollection(<any>{
        collection: {
          default: defaultCollection
        }
      })).to.eq(defaultCollection);
    });

    it('should return collection', () => {
      const collection = 'All';
      expect(Adapter.extractCollection(<any>{ collection })).to.eq(collection);
    });
  });

  describe('extractIndexedState()', () => {
    it('should return indexed state', () => {
      const collectionDefault = 'Im a collection';
      expect(Adapter.extractIndexedState(<any>{ default: collectionDefault })).to.eql({
        selected: collectionDefault,
        allIds: [collectionDefault]
      });
    });
  });
});
