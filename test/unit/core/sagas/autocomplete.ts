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
        const config = { a: 'b' };
        const receiveAutocompleteSuggestionsAction: any = { c: 'd' };
        const receiveAutocompleteSuggestions = spy(() => receiveAutocompleteSuggestionsAction);
        const flux: any = { clients: { sayt }, actions: { receiveAutocompleteSuggestions }, config };
        const suggestions = ['e', 'f'];
        const request = { g: 'h' };
        const response = { i: 'j' };
        const autocompleteSuggestionsRequest = stub(Selectors, 'autocompleteSuggestionsRequest').returns(request);
        const extractSuggestions = stub(Adapter, 'extractSuggestions').returns(suggestions);

        const task = Tasks.fetchSuggestions(flux, <any>{ payload: query });

        expect(task.next().value).to.eql(effects.select(Selectors.autocompleteCategoryField));
        expect(task.next(field).value).to.eql(effects.call([sayt, autocomplete], query, request));
        expect(task.next(response).value).to.eql(effects.put(receiveAutocompleteSuggestionsAction));
        expect(extractSuggestions).to.be.calledWithExactly(response, field);
        expect(receiveAutocompleteSuggestions).to.be.calledWith(suggestions);
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
