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

  describe('requestSort()', () => {
    it('should return a descending sort', () => {
      const field = 'height';

      expect(Selectors.requestSort({ field, descending: true })).to.eql({ field, order: 'Descending' });
    });

    it('should return an ascending sort', () => {
      const field = 'height';

      expect(Selectors.requestSort({ field })).to.eql({ field, order: undefined });
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
      const products = { a: 'b' };

      expect(Selectors.products(<any>{ data: { present: { products } } })).to.eq(products);
    });
  });

  describe('details()', () => {
    it('should return all details data', () => {
      const details = { a: 'b' };

      expect(Selectors.details(<any>{ data: { present: { details } } })).to.eq(details);
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

  describe('recommendationsProducts()', () => {
    it('should return the currently recommended products', () => {
      const products = ['a', 'b', 'c'];

      expect(Selectors.recommendationsProducts(<any>{
        data: { present: { recommendations: { products } } }
      })).to.eq(products);
    });
  });
});
