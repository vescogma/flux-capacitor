import Adapter from '../../../../src/core/adapters/configuration';
import SearchAdapter from '../../../../src/core/adapters/search';
import { DEFAULT_AREA } from '../../../../src/core/reducers/data/area';
import { DEFAULT_COLLECTION } from '../../../../src/core/reducers/data/collections';
import * as PageReducer from '../../../../src/core/reducers/data/page';
import { DEFAULT as DEFAULT_BIASING } from '../../../../src/core/reducers/data/personalization';
import suite from '../../_suite';

suite('Configuration Adapter', ({ expect, stub }) => {

  describe('initialState()', () => {
    it('should return initialState based on defaults', () => {
      const category = 'cat';
      const sort = 'prices';
      const globalExpiry = 0;
      const config = <any>{
        autocomplete: {
          category
        },
        search: {
          sort
        },
        personalization: {
          realTimeBiasing: {
            globalExpiry
          }
        }
      };

      expect(Adapter.initialState(config)).to.eql({
        data: {
          present: {
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
            recommendations: {
              suggested: { products: [] },
              pastPurchases: { products: [] },
              queryPastPurchases: [],
              orderHistory: [],
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
            },
            personalization: DEFAULT_BIASING
          }
        },
        session: {
          config
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
        options: [10, 20, 50]
      };
      const sort = {
        default: 'stuff',
        options: [{ field: 'stuff', descending: true }, { field: 'other stuff' }]
      };
      const globalExpiry = 2000;
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
        personalization: {
          realTimeBiasing: {
            globalExpiry
          }
        }
      };
      const state = {
        data: {
          present: {
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
            recommendations: {
              suggested: { products: [] },
              pastPurchases: { products: [] },
              queryPastPurchases: [],
              orderHistory: [],
            },
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
            },
            personalization: {
              ...DEFAULT_BIASING,
              biasing: {
                ...DEFAULT_BIASING.biasing,
                globalExpiry
              }
            }
          }
        },
        session: {
          config
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

  describe('extractPageSizes()', () => {
    const defaultValue = 0;

    it('should do nothing if state is not an object', () => {
      const pageSizes = Adapter.extractPageSizes(<any>{
        search: {
          pageSize: false,
        }
      }, defaultValue);

      expect(pageSizes).to.eql({ selected: 0, items: [defaultValue] });
    });

    it('should default items to defaultValue', () => {
      const pageSizes = Adapter.extractPageSizes(<any>{
        search: {
          pageSize: {},
        }
      }, defaultValue);

      expect(pageSizes).to.eql({ selected: 0, items: [defaultValue] });
    });
  });

  describe('extractSorts()', () => {
    it('should do nothing if state does not contain default or options', () => {
      const sort = {};

      const sorts = Adapter.extractSorts(<any>{ search: { sort } });

      expect(sorts).to.eql({ selected: 0, items: [sort] });
    });

    it('should default selected to empty object', () => {
      const sorts = Adapter.extractSorts(<any>{
        search: {
          sort: {
            options: false,
          },
        }
      });

      expect(sorts).to.eql({ selected: 0, items: [] });
    });

    it('should return selected sorts', () => {
      const sort = {
        default: false,
        options: [
          {
            field: true,
            descending: true
          },
          {}
        ]
      };

      expect(Adapter.extractSorts(<any>{
        search: {
          sort
        }
      })).to.eql({ selected: 1, items: sort.options });
    });
  });

  describe('extractNavigationsPinned()', () => {
    it('should return pinned navigations', () => {
      const pinned = 'nav';

      expect(Adapter.extractNavigationsPinned(<any>{
        recommendations: {
          iNav: {
            navigations: {
              pinned
            }
          }
        }
      })).to.eq(pinned);
    });
  });

  describe('extractRefinementsPinned()', () => {
    it('should return pinned refinements', () => {
      const pinned = 'nav';

      expect(Adapter.extractRefinementsPinned(<any>{
        recommendations: {
          iNav: {
            refinements: {
              pinned
            }
          }
        }
      })).to.eq(pinned);
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

  describe('extractLanguage()', () => {
    it('should return global language', () => {
      const language = 'en';

      expect(Adapter.extractLanguage(<any>{ language })).to.eq(language);
    });
  });

  describe('extractAutocompleteLanguage()', () => {
    it('should return autocomplete language', () => {
      const language = 'fr';

      expect(Adapter.extractAutocompleteLanguage(<any>{ autocomplete: { language } })).to.eq(language);
    });
  });

  describe('extractAutocompleteProductLanguage()', () => {
    it('should return autocomplete product language', () => {
      const language = 'fr';

      // tslint:disable-next-line max-line-length
      expect(Adapter.extractAutocompleteProductLanguage(<any>{ autocomplete: { products: { language } } })).to.eq(language);
    });
  });

  describe('extractAutocompleteArea()', () => {
    it('should return autocomplete area', () => {
      const area = 'myProductionArea';

      expect(Adapter.extractAutocompleteArea(<any>{ autocomplete: { area } })).to.eq(area);
    });
  });

  describe('extractAutocompleteProductArea()', () => {
    it('should return autocomplete product area', () => {
      const area = 'myProductionArea';

      expect(Adapter.extractAutocompleteProductArea(<any>{ autocomplete: { products: { area } } })).to.eq(area);
    });
  });

  describe('extractAutocompleteSuggestionCount()', () => {
    it('should return number of autocomplete suggestions to request', () => {
      const suggestionCount = 30;

      // tslint:disable-next-line max-line-length
      expect(Adapter.extractAutocompleteSuggestionCount(<any>{ autocomplete: { suggestionCount } })).to.eq(suggestionCount);
    });
  });

  describe('extractAutocompleteNavigationCount()', () => {
    it('should return number of autocomplete navigations to request', () => {
      const navigationCount = 14;

      // tslint:disable-next-line max-line-length
      expect(Adapter.extractAutocompleteNavigationCount(<any>{ autocomplete: { navigationCount } })).to.eq(navigationCount);
    });
  });

  describe('extractAutocompleteProductCount()', () => {
    it('should return number of autocomplete products to request', () => {
      const count = 23;

      expect(Adapter.extractAutocompleteProductCount(<any>{ autocomplete: { products: { count } } })).to.eq(count);
    });
  });

  describe('isAutocompleteAlphabeticallySorted()', () => {
    it('should return whether to sort autocomplete suggestions alphabetically', () => {
      expect(Adapter.isAutocompleteAlphabeticallySorted(<any>{ autocomplete: { alphabetical: true } })).to.be.true;
      expect(Adapter.isAutocompleteAlphabeticallySorted(<any>{ autocomplete: { alphabetical: false } })).to.be.false;
    });
  });

  describe('isAutocompleteMatchingFuzzily()', () => {
    it('should return whether to use fuzzy matching for autocomplete suggestions', () => {
      expect(Adapter.isAutocompleteMatchingFuzzily(<any>{ autocomplete: { fuzzy: true } })).to.be.true;
      expect(Adapter.isAutocompleteMatchingFuzzily(<any>{ autocomplete: { fuzzy: false } })).to.be.false;
    });
  });

  describe('extractAutocompleteNavigationLabels()', () => {
    it('should return the configured autocomplete navigation labels', () => {
      const labels = { a: 'b' };
      // tslint:disable-next-line max-line-length
      expect(Adapter.extractAutocompleteNavigationLabels(<any>{ autocomplete: { navigations: labels } })).to.eql(labels);
    });
  });

  describe('shouldAddPastPurchaseBias()', () => {
    it('should return true if requesting positive number of biases', () => {
      // tslint:disable-next-line max-line-length
      expect(Adapter.shouldAddPastPurchaseBias(<any>{ recommendations: { pastPurchases: { biasCount: 3 } } })).to.be.true;
    });

    it('should return false if requesting zero biases', () => {
      // tslint:disable-next-line max-line-length
      expect(Adapter.shouldAddPastPurchaseBias(<any>{ recommendations: { pastPurchases: { biasCount: 0 } } })).to.be.false;
    });
  });
});
