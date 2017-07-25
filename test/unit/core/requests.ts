import * as sinon from 'sinon';
import ConfigAdapter from '../../../src/core/adapters/configuration';
import { MAX_RECORDS } from '../../../src/core/adapters/search';
import Requests from '../../../src/core/requests';
import Selectors from '../../../src/core/selectors';
import suite from '../_suite';

suite('requests', ({ expect, stub }) => {

  describe('search()', () => {
    const remainingRecords = 2;
    const originalPageSize = MAX_RECORDS - 1;
    const originalSkip = MAX_RECORDS - remainingRecords;
    let sortSelector: sinon.SinonStub;
    let requestSortSelector: sinon.SinonStub;

    beforeEach(() => {
      sortSelector = stub(Selectors, 'sort');
      requestSortSelector = stub(Selectors, 'requestSort');
      stub(Selectors, 'area');
      stub(Selectors, 'fields');
      stub(Selectors, 'query');
      stub(Selectors, 'collection');
      stub(Selectors, 'selectedRefinements');
      stub(Selectors, 'pageSize').returns(originalPageSize);
      stub(Selectors, 'skip').returns(originalSkip);
    });

    it('should decrease page size to prevent exceeding MAX_RECORDS', () => {
      const { pageSize, skip } = Requests.search(<any>{}, <any>{ search: {} });

      expect(pageSize).to.eq(remainingRecords);
      expect(skip).to.eq(originalSkip);
    });

    it('should include language when truthy', () => {
      const language = 'en';
      const extractLanguage = stub(ConfigAdapter, 'extractLanguage').returns(language);

      const request = Requests.search(<any>{}, <any>{ search: {} });

      expect(request.language).to.eq(language);
    });

    it('should include sort when truthy', () => {
      const sort = { a: 'b' };
      sortSelector.returns(true);
      requestSortSelector.returns(sort);

      const request = Requests.search(<any>{}, <any>{ search: {} });

      expect(request.sort).to.eq(sort);
    });

    it('should apply defaults', () => {
      const defaults = { a: 'b', c: 'd' };

      const request: any = Requests.search(<any>{}, <any>{ search: { defaults } });

      expect(request.a).to.eq('b');
      expect(request.c).to.eq('d');
    });

    it('should apply overrides', () => {
      const pageSize = 32;
      const skip = 22;
      const overrides = { pageSize, skip };

      const request = Requests.search(<any>{}, <any>{ search: { overrides } });

      expect(request.pageSize).to.eq(pageSize);
      expect(request.skip).to.eq(skip);
    });

    it('should override defaults', () => {
      const defaults = { a: 'b', c: 'd' };
      const overrides = { c: 'd1' };

      const request: any = Requests.search(<any>{}, <any>{ search: { defaults, overrides } });

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
      const config: any = {
        autocomplete: {
          area,
          language,
          suggestionCount,
          navigationCount,
          alphabetical: true,
          fuzzy: true,
          defaults: {},
          overrides: {},
        }
      };

      const request = Requests.autocompleteSuggestions(config);

      expect(request).to.eql({
        language,
        numSearchTerms: suggestionCount,
        numNavigations: navigationCount,
        sortAlphabetically: true,
        fuzzyMatch: true,
      });
    });

    it('should apply overrides', () => {
      const language = 'fr';
      const config: any = {
        autocomplete: {
          language: 'en',
          defaults: {},
          overrides: { suggestions: { language } },
        }
      };

      const request: any = Requests.autocompleteSuggestions(config);

      expect(request.language).to.eq(language);
    });

    it('should apply defaults', () => {
      const config: any = {
        autocomplete: {
          defaults: { suggestions: { c: 'd' } },
          overrides: {},
        }
      };

      const request: any = Requests.autocompleteSuggestions(config);

      expect(request.c).to.eq('d');
    });

    it('should override defaults', () => {
      const config: any = {
        autocomplete: {
          defaults: { suggestions: { c: 'd' } },
          overrides: { suggestions: { a: 'b', c: 'd1' } },
        }
      };

      const request: any = Requests.autocompleteSuggestions(config);

      expect(request.a).to.eq('b');
      expect(request.c).to.eq('d1');
    });
  });

  describe('autocompleteProducts()', () => {
    it('should create a products request', () => {
      const area = 'myArea';
      const language = 'en';
      const productCount = 41;
      const config: any = {
        autocomplete: {
          area,
          language,
          productCount,
          defaults: {},
          overrides: {},
        }
      };

      const request = Requests.autocompleteProducts(config);

      expect(request).to.eql({
        area,
        language,
        numProducts: productCount
      });
    });

    it('should apply overrides', () => {
      const language = 'fr';
      const config: any = {
        autocomplete: {
          language: 'en',
          defaults: {},
          overrides: { products: { language } },
        }
      };

      const request: any = Requests.autocompleteProducts(config);

      expect(request.language).to.eq(language);
    });

    it('should apply defaults', () => {
      const config: any = {
        autocomplete: {
          defaults: { products: { c: 'd' } },
          overrides: {},
        }
      };

      const request: any = Requests.autocompleteProducts(config);

      expect(request.c).to.eq('d');
    });

    it('should override defaults', () => {
      const config: any = {
        autocomplete: {
          defaults: { products: { c: 'd' } },
          overrides: { products: { a: 'b', c: 'd1' } },
        }
      };

      const request: any = Requests.autocompleteProducts(config);

      expect(request.a).to.eq('b');
      expect(request.c).to.eq('d1');
    });
  });
});
