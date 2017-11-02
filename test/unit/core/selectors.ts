import ConfigurationAdapter from '../../../src/core/adapters/configuration';
import Selectors from '../../../src/core/selectors';
import suite from '../_suite';

suite('selectors', ({ expect, stub }) => {
  describe('navigation()', () => {
    it('should select a navigation from the state', () => {
      const id = 'my navigation';
      const navigation = { a: 'b' };
      const state: any = { data: { present: { navigations: { byId: { [id]: navigation } } } } };

      expect(Selectors.navigation(state, id)).to.eq(navigation);
    });
  });

  describe('navigationSort()', () => {
    it('should select navigationSort from the state', () => {
      const sort = { d: 'r' };
      const state: any = { data: { present: { navigations: { sort } } } };

      expect(Selectors.navigationSort(state)).to.eq(sort);
    });
  });

  describe('isRefinementDeselected()', () => {
    it('should return false if navigation does not exist', () => {
      const navigation = stub(Selectors, 'navigation');

      expect(Selectors.isRefinementDeselected(<any>{}, 'my navigation', 4)).to.not.be.ok;
    });

    it('should return false if refinement is selected already', () => {
      const navigation = { selected: [4] };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.isRefinementDeselected(<any>{}, 'my navigation', 4)).to.not.be.ok;
    });

    it('should return true if refinement is not selected already', () => {
      const navigation = { selected: [8, 3] };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.isRefinementDeselected(<any>{}, 'my navigation', 4)).to.be.true;
    });
  });
  describe('rangeNavigationMin()', () => {
    it('should return the min', () => {
      const min = 4;
      const id = 'hello';
      const state: any = { data: { present: { navigations: { byId: { [id]: { min } } } } } };

      expect(Selectors.rangeNavigationMin(state, id)).to.be.eq(min);
    });
  });

  describe('rangeNavigationMax()', () => {
    it('should return the max', () => {
      const max = 4;
      const id = 'hello';
      const state: any = { data: { present: { navigations: { byId: { [id]: { max } } } } } };

      expect(Selectors.rangeNavigationMax(state, id)).to.be.eq(max);
    });
  });

  describe('isRefinementSelected()', () => {
    it('should return false if navigation does not exist', () => {
      const navigation = stub(Selectors, 'navigation');

      expect(Selectors.isRefinementSelected(<any>{}, 'my navigation', 4)).to.not.be.ok;
    });

    it('should return false if refinement is deselected already', () => {
      const navigation = { selected: [8, 3] };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.isRefinementSelected(<any>{}, 'my navigation', 4)).to.not.be.ok;
    });

    it('should return true if refinement is selected already', () => {
      const navigation = { selected: [4] };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.isRefinementSelected(<any>{}, 'my navigation', 4)).to.be.true;
    });
  });

  describe('hasMoreRefinements()', () => {
    it('should return false if navigation does not exist', () => {
      const navigation = stub(Selectors, 'navigation');

      expect(Selectors.hasMoreRefinements(<any>{}, 'my navigation')).to.not.be.ok;
    });

    it('should return false if navigation has no more refinements', () => {
      const navigationStub = stub(Selectors, 'navigation').returns({});

      expect(Selectors.hasMoreRefinements(<any>{}, 'my navigation')).to.not.be.ok;
    });

    it('should return true if navigation has more refinements', () => {
      const navigation = { more: true };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.hasMoreRefinements(<any>{}, 'my navigation')).to.be.true;
    });
  });

  describe('area()', () => {
    it('should return the active area', () => {
      const area = 'myArea';

      expect(Selectors.area(<any>{ data: { present: { area } } })).to.eq(area);
    });
  });

  describe('fields()', () => {
    it('should return the whitelisted fields', () => {
      const fields = ['a', 'b'];

      expect(Selectors.fields(<any>{ data: { present: { fields } } })).to.eq(fields);
    });
  });

  describe('query()', () => {
    it('should return the current query', () => {
      const query = 'pineapple';

      expect(Selectors.query(<any>{ data: { present: { query: { original: query } } } })).to.eq(query);
    });
  });

  describe('currentQuery()', () => {
    it('should return the original query', () => {
      const query = 'pineyapple';

      expect(Selectors.currentQuery(<any>{ data: { present: { query: { original: query } } } })).to.eq(query);
    });

    it('should return the corrected query', () => {
      const query = 'pineyappley';

      expect(Selectors.currentQuery(<any>{
        data: {
          present: {
            query: {
              original: 'test',
              corrected: query
            }
          }
        }
      })).to.eq(query);
    });
  });

  describe('collections()', () => {
    it('should return indexed collections data', () => {
      const collections = { a: 'b' };

      expect(Selectors.collections(<any>{ data: { present: { collections } } })).to.eq(collections);
    });
  });

  describe('collection()', () => {
    it('should return the active collection', () => {
      const collection = 'myCollection';
      const state: any = { a: 'b' };
      const collectionsSelector = stub(Selectors, 'collections').returns({ selected: collection });

      expect(Selectors.collection(state)).to.eq(collection);
      expect(collectionsSelector).to.be.calledWith(state);
    });
  });

  describe('collectionIndex()', () => {
    it('should return the index of the active collection', () => {
      const state: any = { a: 'b' };
      const collectionsSelector = stub(Selectors, 'collections').returns({ allIds: ['a', 'b', 'c'] });

      expect(Selectors.collectionIndex(state, 'b')).to.eq(1);
      expect(collectionsSelector).to.be.calledWith(state);
    });
  });

  describe('pageSizes()', () => {
    it('should return indexed page size data', () => {
      const pageSizes = { a: 'b' };

      expect(Selectors.pageSizes(<any>{ data: { present: { page: { sizes: pageSizes } } } })).to.eq(pageSizes);
    });
  });

  describe('pageSize()', () => {
    it('should return the currently selected page', () => {
      const state: any = { a: 'b' };
      const pageSizes = { items: ['c', 'd', 'e'], selected: 1 };
      const pageSizesSelector = stub(Selectors, 'pageSizes').returns(pageSizes);

      expect(Selectors.pageSize(state)).to.eq('d');
      expect(pageSizesSelector).to.be.calledWith(state);
    });
  });

  describe('pageSizeIndex()', () => {
    it('should return selected page size index', () => {
      const selected = 4;
      const state: any = { a: 'b' };
      const pageSizes = { selected };
      const pageSizesSelector = stub(Selectors, 'pageSizes').returns(pageSizes);

      expect(Selectors.pageSizeIndex(state)).to.eq(selected);
      expect(pageSizesSelector).to.be.calledWith(state);
    });
  });

  describe('page()', () => {
    it('should return indexed page size data', () => {
      const page = 7;

      expect(Selectors.page(<any>{ data: { present: { page: { current: page } } } })).to.eq(page);
    });
  });

  describe('totalPages()', () => {
    it('should return last page', () => {
      const last = 555;

      expect(Selectors.totalPages(<any>{ data: { present: { page: { last } } } })).to.eq(last);
    });
  });

  describe('sorts()', () => {
    it('should return indexed sort data', () => {
      const sorts = { a: 'b' };

      expect(Selectors.sorts(<any>{ data: { present: { sorts } } })).to.eq(sorts);
    });
  });

  describe('sort()', () => {
    it('should return the currently selected sort', () => {
      const state: any = { a: 'b' };
      const sorts = { items: ['c', 'd', 'e'], selected: 1 };
      const sortSelector = stub(Selectors, 'sorts').returns(sorts);

      expect(Selectors.sort(state)).to.eq('d');
      expect(sortSelector).to.be.calledWith(state);
    });
  });

  describe('sortIndex()', () => {
    it('should return selected sort index', () => {
      const selected = 4;
      const state: any = { a: 'b' };
      const sorts = { selected };
      const sortsSelector = stub(Selectors, 'sorts').returns(sorts);

      expect(Selectors.sortIndex(state)).to.eq(selected);
      expect(sortsSelector).to.be.calledWith(state);
    });
  });

  describe('skip()', () => {
    it('should return number of skipped records', () => {
      const state: any = { a: 'b' };
      const pageSelector = stub(Selectors, 'page').returns(4);

      expect(Selectors.skip(state, 23)).to.eq(69);
    });
  });

  describe('products()', () => {
    it('should return all products', () => {
      const products = [{ data: { a: 'b' } }];
      const extracted = [{ a: 'b' }];

      expect(Selectors.products(<any>{ data: { present: { products } } })).to.eql(extracted);
    });
  });

  describe('findProduct()', () => {
    it('should find autocomplete product with given id', () => {
      const products = [{ id: '3' }, { id: '4' }, { id: '7' }, { id: '2' }];
      const state: any = { data: { present: { products } } };
      const autocompleteSelector = stub(Selectors, 'autocompleteProducts').returns(products);

      expect(Selectors.findProduct(state, '7')).to.eql(products[2]);
      expect(autocompleteSelector).to.be.calledWith(state);
    });

    it('should find product with given id', () => {
      const products = [{ id: '3' }, { id: '4' }, { id: '7' }, { id: '2' }];
      const state: any = { data: { present: { products } } };
      const productSelector = stub(Selectors, 'products').returns(products);
      stub(Selectors, 'autocompleteProducts').returns([{ id: 'asdfasdf' }]);

      expect(Selectors.findProduct(state, '7')).to.eql(products[2]);
      expect(productSelector).to.be.calledWith(state);
    });

    it('should find recommendations product with given id', () => {
      const products = [{ id: '3' }, { id: '4' }, { id: '7' }, { id: '2' }];
      const state: any = { data: { present: { products } } };
      const recommendations = stub(Selectors, 'recommendationsProducts').returns(products);
      stub(Selectors, 'autocompleteProducts').returns([{ id: 'asdfasdf' }]);
      stub(Selectors, 'products').returns([{ id: 'fdfdf' }]);

      expect(Selectors.findProduct(state, '7')).to.eql(products[2]);
      expect(recommendations).to.be.calledWith(state);
    });
  });

  describe('productsWithPastPurchase()', () => {
    it('should return products with pastPurchase metadata', () => {
      const state: any = { a: 'b' };
      const pastPurchaseProductsBySku = stub(Selectors, 'pastPurchaseProductsBySku').returns({ a: {}, c: {} });
      const products = stub(Selectors, 'products').returns([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);

      expect(Selectors.productsWithPastPurchase(state, 'id')).to.eql([
        { data: { id: 'a' }, meta: { pastPurchase: true } },
        { data: { id: 'b' }, meta: {} },
        { data: { id: 'c' }, meta: { pastPurchase: true } },
      ]);
      expect(pastPurchaseProductsBySku).to.be.calledWithExactly(state);
      expect(products).to.be.calledWithExactly(state);
    });

    it('should use provided id field', () => {
      const state: any = { a: 'b' };
      stub(Selectors, 'pastPurchaseProductsBySku').returns({ a: {}, c: {} });
      stub(Selectors, 'products').returns([{ sku: 'a' }, { sku: 'b' }, { sku: 'c' }]);

      expect(Selectors.productsWithPastPurchase(state, 'sku')).to.eql([
        { data: { sku: 'a' }, meta: { pastPurchase: true } },
        { data: { sku: 'b' }, meta: {} },
        { data: { sku: 'c' }, meta: { pastPurchase: true } },
      ]);
    });
  });

  describe('productsWithMetadata()', () => {
    it('should return products with metadata', () => {
      const products = [
        { data: { id: 'a' }, id: 1, meta: { pastPurchase: true } },
        { data: { id: 'b' }, id: 2, meta: {} },
        { data: { id: 'c' }, id: 3, meta: { pastPurchase: true } },
      ];
      const state: any = { a: 'b', data: { present: { products } } };

      expect(Selectors.productsWithMetadata(state)).to.eql(products);
    });
  });

  describe('details()', () => {
    it('should return all details data', () => {
      const details = { a: 'b' };

      expect(Selectors.details(<any>{ data: { present: { details } } })).to.eq(details);
    });
  });

  describe('selectedRefinements()', () => {
    it('should return selected refinements', () => {
      const state: any = { a: 'b' };
      const navigations = [
        { selected: [0, 1], range: true, field: 'Main', refinements: [{ low: 0, high: 5 }, { low: 10, high: 20 }] },
        { selected: [0], range: false, field: 'Main stuff', refinements: [{ value: 'idk' }, { value: 'test' }] }
      ];
      const selectedRefinements = [
        // tslint:disable-next-line max-line-length
        { navigationName: navigations[0].field, type: 'Range', high: navigations[0].refinements[0]['high'], low: navigations[0].refinements[0]['low'] },
        // tslint:disable-next-line max-line-length
        { navigationName: navigations[0].field, type: 'Range', high: navigations[0].refinements[1]['high'], low: navigations[0].refinements[1]['low'] },
        { navigationName: navigations[1].field, type: 'Value', value: navigations[1].refinements[0]['value'] }
      ];
      stub(Selectors, 'navigations').returns(navigations);

      expect(Selectors.selectedRefinements(state)).to.eql(selectedRefinements);
    });
  });

  describe('navigations()', () => {
    it('should return indexed navigations data', () => {
      const navigations = { allIds: ['a', 'b', 'c'] };
      const state: any = { data: { present: { navigations } } };
      const navigationSelector = stub(Selectors, 'navigation').returns('x');

      expect(Selectors.navigations(state)).to.eql(['x', 'x', 'x']);
      expect(navigationSelector).to.be.calledThrice
        .and.calledWith(state, 'a')
        .and.calledWith(state, 'b')
        .and.calledWith(state, 'c');
    });
  });

  describe('recordCount()', () => {
    it('should return the current number of products returned by the latest search', () => {
      const recordCount = 77;

      expect(Selectors.recordCount(<any>{ data: { present: { recordCount } } })).to.eq(recordCount);
    });
  });

  describe('autocomplete()', () => {
    it('should return the autocomplete data', () => {
      const autocomplete = { a: 'b' };

      expect(Selectors.autocomplete(<any>{ data: { present: { autocomplete } } })).to.eq(autocomplete);
    });
  });

  describe('autocompleteQuery()', () => {
    it('should return the current autocomplete query', () => {
      const query = 'blanket';
      const state: any = { a: 'b' };
      const autocompleteSelector = stub(Selectors, 'autocomplete').returns({ query });

      expect(Selectors.autocompleteQuery(state)).to.eq(query);
      expect(autocompleteSelector).to.be.calledWith(state);
    });
  });

  describe('autocompleteCategoryField()', () => {
    it('should return the autocomplete category field', () => {
      const field = 'author';
      const state: any = { a: 'b' };
      const autocompleteSelector = stub(Selectors, 'autocomplete').returns({ category: { field } });

      expect(Selectors.autocompleteCategoryField(state)).to.eq(field);
      expect(autocompleteSelector).to.be.calledWith(state);
    });
  });

  describe('autocompleteCategoryValues()', () => {
    it('should return the current autocomplete category values', () => {
      const state: any = { a: 'b' };
      const values = ['c', 'd'];
      const autocompleteSelector = stub(Selectors, 'autocomplete').returns({ category: { values } });

      expect(Selectors.autocompleteCategoryValues(state)).to.eq(values);
      expect(autocompleteSelector).to.be.calledWith(state);
    });
  });

  describe('autocompleteSuggestions()', () => {
    it('should return the current autocomplete suggestions', () => {
      const state: any = { a: 'b' };
      const suggestions = ['c', 'd'];
      const autocompleteSelector = stub(Selectors, 'autocomplete').returns({ suggestions });

      expect(Selectors.autocompleteSuggestions(state)).to.eq(suggestions);
      expect(autocompleteSelector).to.be.calledWith(state);
    });
  });

  describe('autocompleteNavigations()', () => {
    it('should return the current autocomplete navigations', () => {
      const state: any = { a: 'b' };
      const navigations = ['c', 'd'];
      const autocompleteSelector = stub(Selectors, 'autocomplete').returns({ navigations });

      expect(Selectors.autocompleteNavigations(state)).to.eq(navigations);
      expect(autocompleteSelector).to.be.calledWith(state);
    });
  });

  describe('autocompleteProducts()', () => {
    it('should return the current autocomplete products', () => {
      const state: any = { a: 'b' };
      const products = [{ data: 'c' }, { data: 'd' }];
      const autocompleteSelector = stub(Selectors, 'autocomplete').returns({ products });

      expect(Selectors.autocompleteProducts(state)).to.eql(['c', 'd']);
      expect(autocompleteSelector).to.be.calledWith(state);
    });
  });

  describe('refinementCrumb()', () => {
    it('should convert refinement to breadcrumb', () => {
      const field = 'brand';
      const value = 'Apple';
      const low = 4;
      const high = 5;
      const refinementIndex = 1;
      const navigation = { range: true, refinements: [{}, { value, low, high }, {}] };
      const state: any = { a: 'b' };
      const navigationSelector = stub(Selectors, 'navigation').returns(navigation);

      const crumb = Selectors.refinementCrumb(state, field, refinementIndex);

      expect(crumb).to.eql({ field, value, low, high, range: true });
    });
  });

  describe('location()', () => {
    it('should return the current session location', () => {
      const location = { a: 'b' };

      expect(Selectors.location(<any>{ session: { location } })).to.eq(location);
    });
  });

  describe('config()', () => {
    it('should return the current session config', () => {
      const config = { a: 'b' };

      expect(Selectors.config(<any>{ session: { config } })).to.eq(config);
    });
  });

  describe('recommendationsProducts()', () => {
    it('should return the currently recommended products', () => {
      const products = ['a', 'b', 'c'];
      const givenProducts = [{ data: 'a' }, { data: 'b' }, { data: 'c' }];

      expect(Selectors.recommendationsProducts(<any>{
        data: { present: { recommendations: { suggested: { products: givenProducts } } } }
      })).to.eql(products);
    });
  });

  describe('pastPurchaseProductsBySku()', () => {
    it('should return a map of past purchase products by sku', () => {
      const state: any = {
        data: {
          present: {
            recommendations: {
              pastPurchases: {
                products: [
                  { sku: 'a', quantity: 4 },
                  { sku: 'b', quantity: 5 },
                  { sku: 'c', quantity: 8 }
                ]
              }
            }
          }
        }
      };

      expect(Selectors.pastPurchaseProductsBySku(state)).to.eql({ a: 4, b: 5, c: 8, });
    });
  });

  describe('pastPurchases()', () => {
    it('should return pastPurchases', () => {
      const pastPurchases = { products: [{ a: 1 }] };
      const state = { data: { present: { recommendations: { pastPurchases } } } };

      expect(Selectors.pastPurchases(<any>state)).to.eql([{ a: 1 }]);
    });
  });

  describe('orderHistory()', () => {
    it('should return orderHistory', () => {
      const orderHistory = [{ a: 1 }];
      const state = { data: { present: { recommendations: { orderHistory } } } };

      expect(Selectors.orderHistory(<any>state)).to.eql([{ a: 1 }]);
    });
  });

  describe('QueryPastPurchases()', () => {
    it('should return QueryPastPurchases', () => {
      const queryPastPurchases = [{ a: 1 }];
      const state = { data: { present: { recommendations: { queryPastPurchases } } } };

      expect(Selectors.queryPastPurchases(<any>state)).to.eql([{ a: 1 }]);
    });
  });

  describe('realTimeBiasesById()', () => {
    it('should return byId', () => {
      const allIds = [1,2,3,4,5];
      const byId = {
        1: 1,
        2: 2,
        3: 3
      };
      const state = {
        data: {
          present: {
            personalization: {
              biasing: {
                allIds,
                byId
              }
            }
          }
        }
      };

      expect(Selectors.realTimeBiasesById(<any>state)).to.eq(byId);
    });
  });

  describe('realTimeBiasesAllIds()', () => {
    it('should return allIds', () => {
      const allIds = [1,2,3,4,5];
      const byId = {
        1: 1,
        2: 2,
        3: 3
      };
      const state = {
        data: {
          present: {
            personalization: {
              biasing: {
                allIds,
                byId
              }
            }
          }
        }
      };

      expect(Selectors.realTimeBiasesAllIds(<any>state)).to.eq(allIds);
    });
  });

  describe('realTimeBiasesHydrated()', () => {
    it('should be true on false/true', () => {
      const state = {
        data: {
          present: {
            personalization: {
              _persist: {
                rehydrated: true
              }
            }
          }
        }
      };
      const isRealTimeBiasEnabled = stub(ConfigurationAdapter, 'isRealTimeBiasEnabled').returns(false);
      const config = stub(Selectors, 'config');

      expect(Selectors.realTimeBiasesHydrated(<any>state)).to.be.true;
    });

    it('should be true on false/false', () => {
      const state = {
        data: {
          present: {
            personalization: {
              _persist: {
                rehydrated: false
              }
            }
          }
        }
      };
      const isRealTimeBiasEnabled = stub(ConfigurationAdapter, 'isRealTimeBiasEnabled').returns(false);
      const config = stub(Selectors, 'config');

      expect(Selectors.realTimeBiasesHydrated(<any>state)).to.be.true;
    });

    it('should be true on true/true', () => {
      const state = {
        data: {
          present: {
            personalization: {
              _persist: {
                rehydrated: true
              }
            }
          }
        }
      };
      const isRealTimeBiasEnabled = stub(ConfigurationAdapter, 'isRealTimeBiasEnabled').returns(true);
      const config = stub(Selectors, 'config');

      expect(Selectors.realTimeBiasesHydrated(<any>state)).to.be.true;
    });

    it('should be false on true/false', () => {
      const state = {
        data: {
          present: {
            personalization: {
              _persist: {
                rehydrated: false
              }
            }
          }
        }
      };
      const isRealTimeBiasEnabled = stub(ConfigurationAdapter, 'isRealTimeBiasEnabled').returns(true);
      const config = stub(Selectors, 'config');

      expect(Selectors.realTimeBiasesHydrated(<any>state)).to.be.false;
    });
  });

  describe('uiTagName()', () => {
    it('should return ui tagName state', () => {
      const tagName = 'gb-navigation';
      const state = { a: 'b' };

      expect(Selectors.uiTagStates(<any>{ ui: { [tagName]: state } }, tagName)).to.eq(state);
    });
  });

  describe('tagId()', () => {
    it('should return ui tag id state', () => {
      const tagName = 'gb-navigation-display';
      const id = 'Main';
      const tagIdState = { c: 'd' };
      const state: any = { ui: { [tagName]: { [id]: tagIdState } } };

      expect(Selectors.uiTagState(state, tagName, id)).to.eq(tagIdState);
    });

    it('should not throw', () => {
      const tagName = 'gb-navigation-display';
      const id = 'Main';
      const tagIdState = { c: 'd' };
      const state: any = { ui: {} };

      expect(() => Selectors.uiTagState(state, tagName, id)).to.not.throw();
    });
  });
});
