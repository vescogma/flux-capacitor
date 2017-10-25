import * as sinon from 'sinon';
import ConfigAdapter from '../../../src/core/adapters/configuration';
import RecommendationsAdapter from '../../../src/core/adapters/recommendations';
import SearchAdapter, { MAX_RECORDS } from '../../../src/core/adapters/search';
import Requests from '../../../src/core/requests';
import Selectors from '../../../src/core/selectors';
import suite from '../_suite';

suite('requests', ({ expect, stub }) => {

  describe('search()', () => {
    const remainingRecords = 2;
    const originalPageSize = MAX_RECORDS - 1;
    const originalSkip = MAX_RECORDS - remainingRecords;
    let sortSelector: sinon.SinonStub;
    let requestSortAdapter: sinon.SinonStub;
    let pastPurchaseBiasingAdapter: sinon.SinonStub;

    beforeEach(() => {
      sortSelector = stub(Selectors, 'sort');
      requestSortAdapter = stub(SearchAdapter, 'requestSort');
      pastPurchaseBiasingAdapter = stub(ConfigAdapter, 'shouldAddPastPurchaseBias');
      stub(Selectors, 'area');
      stub(Selectors, 'fields');
      stub(Selectors, 'query');
      stub(Selectors, 'collection');
      stub(Selectors, 'selectedRefinements');
      stub(Selectors, 'pageSize').returns(originalPageSize);
      stub(Selectors, 'skip').returns(originalSkip);
    });

    it('should decrease page size to prevent exceeding MAX_RECORDS', () => {
      stub(Selectors,'config').returns({ search: {} });

      const { pageSize, skip } = Requests.search(<any>{});

      expect(pageSize).to.eq(remainingRecords);
      expect(skip).to.eq(originalSkip);
    });

    it('should include language when truthy', () => {
      const language = 'en';
      const extractLanguage = stub(ConfigAdapter, 'extractLanguage').returns(language);
      stub(Selectors,'config').returns({ search: {} });

      const request = Requests.search(<any>{});

      expect(request.language).to.eq(language);
    });

    it('should include sort when truthy', () => {
      const sort = { a: 'b' };
      sortSelector.returns(true);
      requestSortAdapter.returns(sort);
      stub(Selectors,'config').returns({ search: {} });

      const request = Requests.search(<any>{});

      expect(request.sort).to.eq(sort);
    });

    it('should add past purchase biasing', () => {
      const biasing = { c: 'd' };
      const state: any = { e: 'f' };
      const config: any = { search: {} };
      const pastPurchaseBiasing = stub(RecommendationsAdapter, 'pastPurchaseBiasing').returns(biasing);
      pastPurchaseBiasingAdapter.returns(true);
      stub(Selectors,'config').returns(config);

      const request = Requests.search(state);

      expect(request.biasing).to.eq(biasing);
      expect(pastPurchaseBiasing).to.be.calledWithExactly(state);
    });

    it('should apply defaults', () => {
      const defaults = { a: 'b', c: 'd' };
      stub(Selectors,'config').returns({ search: { defaults } });

      const request: any = Requests.search(<any>{});

      expect(request.a).to.eq('b');
      expect(request.c).to.eq('d');
    });

    it('should apply overrides', () => {
      const pageSize = 32;
      const skip = 22;
      const overrides = { pageSize, skip };
      stub(Selectors,'config').returns({ search: { overrides } });

      const request = Requests.search(<any>{});

      expect(request.pageSize).to.eq(pageSize);
      expect(request.skip).to.eq(skip);
    });

    it('should override defaults', () => {
      const defaults = { a: 'b', c: 'd' };
      const overrides = { c: 'd1' };
      stub(Selectors,'config').returns({ search: { defaults, overrides } });

      const request: any = Requests.search(<any>{});

      expect(request.a).to.eq('b');
      expect(request.c).to.eq('d1');
    });
  });

  describe('autocompleteSuggestions()', () => {
    it('should create a suggestions request', () => {
      const area = 'myArea';
      const language = 'en';
      const suggestionCount = 31;
      const navigationCount = 3;
      const defaults = { a: 'b' };
      const overrides = { c: 'd' };
      const config: any = {
        autocomplete: {
          area,
          language,
          suggestionCount,
          navigationCount,
          alphabetical: true,
          fuzzy: true,
          defaults: { suggestions: defaults },
          overrides: { suggestions: overrides },
        }
      };
      const chained = { e: 'f' };
      const chain = stub(Requests, 'chain').returns(chained);

      const request = Requests.autocompleteSuggestions(config);

      expect(request).to.eql(chained);
      expect(chain).to.be.calledWithExactly(defaults, {
        language,
        numSearchTerms: suggestionCount,
        numNavigations: navigationCount,
        sortAlphabetically: true,
        fuzzyMatch: true,
      }, overrides);
    });
  });

  describe('autocompleteProducts()', () => {
    it('should create a products request', () => {
      const area = 'myArea';
      const language = 'en';
      const productCount = 41;
      const defaults = { a: 'b' };
      const overrides = { c: 'd' };
      const config: any = {
        autocomplete: {
          area,
          language,
          products: { count: productCount },
          defaults: { products: defaults },
          overrides: { products: overrides },
        }
      };
      const chained = { e: 'f' };
      const state: any = {};
      const chain = stub(Requests, 'chain').returns(chained);
      const search = stub(Requests, 'search').returns({ i: 'j' });
      stub(Selectors,'config').returns(config);

      const request = Requests.autocompleteProducts(state);

      expect(request).to.eql(chained);
      expect(chain).to.be.calledWith(defaults, {
        i: 'j',
        skip: 0,
        refinements: [],
        sort: undefined,
        area,
        language,
        pageSize: productCount,
      }, overrides);
    });
  });

  describe('chain()', () => {
    it('should apply transformations and merge objects', () => {
      expect(Requests.chain({ a: 'b' }, (x) => ({ ...x, c: 'd' }), { e: 'f' })).to.eql({ a: 'b', c: 'd', e: 'f' });
    });

    it('should merge source if tranformation returned falsey', () => {
      expect(Requests.chain({ a: 'b' }, (x) => null, { e: 'f' })).to.eql({ a: 'b', e: 'f' });
    });
  });
});
