import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import Adapter from '../../../../src/core/adapters/autocomplete';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/autocomplete';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('autocomplete saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, Tasks.fetchSuggestions, flux));
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, Tasks.fetchProducts, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('fetchSuggestions()', () => {
      it('should return sayt suggestions', () => {
        const autocomplete = () => null;
        const sayt = { autocomplete };
        const query = 'rain boots';
        const field = 'popularity';
        const customerId = 'myCustomer';
        const suggestionTrendingCount = 10;
        const config = { a: 'b', customerId, autocomplete: { suggestionTrendingCount } };
        const receiveAutocompleteSuggestionsAction: any = { c: 'd' };
        const receiveAutocompleteSuggestions = spy(() => receiveAutocompleteSuggestionsAction);
        const flux: any = { clients: { sayt }, actions: { receiveAutocompleteSuggestions }, config };
        const suggestions = { e: 'f', suggestions: {} };
        const request = { g: 'h' };
        const response = { i: 'j' };
        const trendingResponseValue = { o: 'p' };
        const trendingBodyPromise = Promise.resolve();
        const trendingResponse = { json: () => trendingBodyPromise };
        const mergedSuggestions = { m: 'n' };
        const autocompleteSuggestionsRequest = stub(Selectors, 'autocompleteSuggestionsRequest').returns(request);
        const extractSuggestions = stub(Adapter, 'extractSuggestions').returns(suggestions);
        const mergeSuggestions = stub(Adapter, 'mergeSuggestions').returns(mergedSuggestions);
        // tslint:disable-next-line max-line-length
        const trendingUrl = `https://${customerId}.groupbycloud.com/wisdom/v2/public/recommendations/searches/_getPopular`;
        const postRequest = {
          method: 'POST',
          body: JSON.stringify({
            size: suggestionTrendingCount,
            matchPartial: {
              and: [{
                search: { query }
              }]
            }
          })
        };

        const task = Tasks.fetchSuggestions(flux, <any>{ payload: query });

        expect(task.next().value).to.eql(effects.select(Selectors.autocompleteCategoryField));
        // tslint:disable-next-line max-line-length
        expect(task.next(field).value).to.eql(effects.all([effects.call([sayt, autocomplete], query, request), effects.call(fetch, trendingUrl, postRequest)]));
        expect(task.next([response, trendingResponse]).value).to.eql(trendingBodyPromise);
        expect(task.next(trendingResponseValue).value).to.eql(effects.put(receiveAutocompleteSuggestionsAction));
        expect(extractSuggestions).to.be.calledWithExactly(response, field);
        expect(mergeSuggestions).to.be.calledWithExactly(suggestions.suggestions, trendingResponseValue);
        // tslint:disable-next-line max-line-length
        expect(receiveAutocompleteSuggestions).to.be.calledWithExactly({...suggestions, suggestions: mergedSuggestions });
        expect(autocompleteSuggestionsRequest).to.be.calledWith(config);
        task.next();
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveAutocompleteSuggestionsAction: any = { a: 'b' };
        const receiveAutocompleteSuggestions = spy(() => receiveAutocompleteSuggestionsAction);
        const flux: any = {
          clients: { sayt: {} },
          actions: { receiveAutocompleteSuggestions }
        };

        const task = Tasks.fetchSuggestions(flux, <any>{});

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveAutocompleteSuggestionsAction));
        expect(receiveAutocompleteSuggestions).to.be.calledWith(error);
        task.next();
      });
    });

    describe('fetchProducts()', () => {
      it('should return sayt products', () => {
        const productSearch = () => null;
        const sayt = { productSearch };
        const query = 'umbrellas';
        const action: any = { payload: query };
        const receiveAutocompleteProductsAction: any = { c: 'd' };
        const receiveAutocompleteProducts = spy(() => receiveAutocompleteProductsAction);
        const flux: any = { clients: { sayt }, actions: { receiveAutocompleteProducts } };
        const products = ['e', 'f'];
        const request = { g: 'h' };
        const response = { i: 'j' };
        const autocompleteProductsRequest = stub(Selectors, 'autocompleteProductsRequest').returns(request);
        const extractProducts = stub(Adapter, 'extractProducts').returns(products);

        const task = Tasks.fetchProducts(flux, action);

        expect(task.next().value).to.eql(effects.call([sayt, productSearch], query, request));
        expect(task.next(response).value).to.eql(effects.put(receiveAutocompleteProductsAction));
        expect(extractProducts).to.be.calledWith(response);
        expect(receiveAutocompleteProducts).to.be.calledWith(products);
        task.next();
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveAutocompleteProductsAction: any = { a: 'b' };
        const receiveAutocompleteProducts = spy(() => receiveAutocompleteProductsAction);
        const flux: any = {
          clients: { sayt: { productSearch: () => null } },
          actions: { receiveAutocompleteProducts }
        };
        stub(Selectors, 'autocompleteProductsRequest');

        const task = Tasks.fetchProducts(flux, <any>{});

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveAutocompleteProductsAction));
        expect(receiveAutocompleteProducts).to.be.calledWith(error);
        task.next();
      });
    });
  });
});
