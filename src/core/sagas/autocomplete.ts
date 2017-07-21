import 'isomorphic-fetch';
import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/autocomplete';
import Selectors from '../selectors';
import Store from '../store';

declare function fetch();

export namespace Tasks {
  export function* fetchSuggestions(flux: FluxCapacitor, { payload: query }: Actions.FetchAutocompleteSuggestions) {
    try {
      const field = yield effects.select(Selectors.autocompleteCategoryField);
      const requestSuggestions = effects.call(
        [flux.clients.sayt, flux.clients.sayt.autocomplete],
        query,
        Selectors.autocompleteSuggestionsRequest(flux.config)
      );
      // tslint:disable-next-line max-line-length
      const trendingUrl = `https://${flux.config.customerId}.groupbycloud.com/wisdom/v2/public/recommendations/searches/_getPopular`;
      const requestTrending = effects.call(fetch, trendingUrl, {
        method: 'POST',
        body: JSON.stringify({
          size: flux.config.autocomplete.suggestionTrendingCount,
          matchPartial: {
            and: [{
              search: { query }
            }]
          }
        })
      });
      const [results, trending] = yield effects.all([requestSuggestions, requestTrending]);
      const autocompleteSuggestions = Adapter.extractSuggestions(results, field);
      const trendingSuggestions = Adapter.mergeSuggestions(autocompleteSuggestions.suggestions, yield trending.json());

      yield effects.put(flux.actions.receiveAutocompleteSuggestions({
        ...autocompleteSuggestions,
        suggestions: trendingSuggestions
      }));
    } catch (e) {
      yield effects.put(flux.actions.receiveAutocompleteSuggestions(e));
    }
  }

  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchAutocompleteProducts) {
    try {
      const requestProducts = effects.call(
        [flux.clients.sayt, flux.clients.sayt.productSearch],
        action.payload,
        Selectors.autocompleteProductsRequest(flux.config)
      );

      // tslint:disable-next-line max-line-length
      const trendingUrl = `https://${flux.config.customerId}.groupbycloud.com/wisdom/v2/public/recommendations/products/_getTrending`;
      const requestTrending = effects.call(fetch, trendingUrl, {
        method: 'POST',
        body: JSON.stringify({
          size: flux.config.autocomplete.suggestionTrendingCount,
          type: 'viewProduct',
          target: 'productId'
        })
      });

      const [results, trending] = yield effects.all([requestProducts, requestTrending]);
      const productsSuggestions = Adapter.extractProducts(results);

      yield effects.put(flux.actions.receiveAutocompleteProducts(productsSuggestions));
    } catch (e) {
      yield effects.put(flux.actions.receiveAutocompleteProducts(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* autocompleteSaga() {
  yield effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, Tasks.fetchSuggestions, flux);
  yield effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, Tasks.fetchProducts, flux);
};
