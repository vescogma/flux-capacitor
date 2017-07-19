import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/autocomplete';
import Selectors from '../selectors';
import Store from '../store';

export namespace Tasks {
  export function* fetchSuggestions(flux: FluxCapacitor, { payload: query }: Actions.FetchAutocompleteSuggestions) {
    try {
      const field = yield effects.select(Selectors.autocompleteCategoryField);
      const res = yield effects.call(
        [flux.clients.sayt, flux.clients.sayt.autocomplete],
        query,
        Selectors.autocompleteSuggestionsRequest(flux.config)
      );
      const suggestions = Adapter.extractSuggestions(res, field);

      yield effects.put(flux.actions.receiveAutocompleteSuggestions(suggestions));
    } catch (e) {
      yield effects.put(flux.actions.receiveAutocompleteSuggestions(e));
    }
  }

  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchAutocompleteProducts) {
    try {
      const res = yield effects.call(
        [flux.clients.sayt, flux.clients.sayt.productSearch],
        action.payload,
        Selectors.autocompleteProductsRequest(flux.config)
      );
      const products = Adapter.extractProducts(res);

      yield effects.put(flux.actions.receiveAutocompleteProducts(products));
    } catch (e) {
      yield effects.put(flux.actions.receiveAutocompleteProducts(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* autocompleteSaga() {
  yield effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, Tasks.fetchSuggestions, flux);
  yield effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, Tasks.fetchProducts, flux);
};
