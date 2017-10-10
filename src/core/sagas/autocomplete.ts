import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/autocomplete';
import ConfigAdapter from '../adapters/configuration';
import RecommendationsAdapter from '../adapters/recommendations';
import SearchAdapter from '../adapters/search';
import Configuration from '../configuration';
import Requests from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import { fetch } from '../utils';

export namespace Tasks {
  // tslint:disable-next-line max-line-length
  export function* fetchSuggestions(flux: FluxCapacitor, { payload: query }: Actions.FetchAutocompleteSuggestions) {
    try {
      const state = yield effects.select();
      const field = Selectors.autocompleteCategoryField(state);
      const suggestionsRequest = effects.call(
        [flux.clients.sayt, flux.clients.sayt.autocomplete],
        query,
        Requests.autocompleteSuggestions(flux.config)
      );
      const config = flux.config.autocomplete.recommendations;
      // fall back to default mode "popular" if not provided
      // "popular" default will likely provide the most consistently strong data
      const suggestionMode = Configuration.RECOMMENDATION_MODES[config.suggestionMode || 'popular'];
      // tslint:disable-next-line max-line-length
      const trendingUrl = RecommendationsAdapter.buildUrl(flux.config.customerId, 'searches', suggestionMode);
      const trendingBody: any = {
        size: config.suggestionCount,
        matchPartial: {
          and: [{
            search: { query }
          }]
        }
      };
      const trendingRequest = effects.call(fetch, trendingUrl, {
        method: 'POST',
        body: JSON.stringify(
          RecommendationsAdapter.addLocationToRequest(trendingBody, state, flux.config))
      });
      const requests = [suggestionsRequest];
      if (config.suggestionCount > 0) {
        requests.push(trendingRequest);
      }

      const responses = yield effects.all(requests);
      const navigationLabels = ConfigAdapter.extractAutocompleteNavigationLabels(flux.config);
      const autocompleteSuggestions = Adapter.extractSuggestions(responses[0], query, field, navigationLabels);
      const suggestions = config.suggestionCount > 0 ?
        {
          ...autocompleteSuggestions,
          suggestions: Adapter.mergeSuggestions(autocompleteSuggestions.suggestions, yield responses[1].json())
        } :
        autocompleteSuggestions;

      yield effects.put(flux.actions.receiveAutocompleteSuggestions(suggestions));
    } catch (e) {
      yield effects.put(flux.actions.receiveAutocompleteSuggestions(e));
    }
  }

  // tslint:disable-next-line max-line-length
  export function* fetchProducts(flux: FluxCapacitor, { payload: { query, refinements } }: Actions.FetchAutocompleteProducts) {
    try {
      const request = yield effects.select(Requests.autocompleteProducts, flux.config);
      const res = yield effects.call(
        [flux.clients.bridge, flux.clients.bridge.search],
        {
          ...request,
          query,
          refinements: refinements.map(({ field, value }) => ({ type: 'Value', navigationName: field, value }))
        }
      );

      yield effects.put(flux.actions.receiveAutocompleteProducts(res));
    } catch (e) {
      yield effects.put(flux.actions.receiveAutocompleteProducts(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* autocompleteSaga() {
  yield effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, Tasks.fetchSuggestions, flux);
  yield effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, Tasks.fetchProducts, flux);
};
