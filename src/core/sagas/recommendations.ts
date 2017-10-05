import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/recommendations';
import SearchAdapter from '../adapters/search';
import Configuration from '../configuration';
import Requests from '../requests';
import Store from '../store';
import { fetch } from '../utils';

export namespace Tasks {
  // tslint:disable-next-line max-line-length
  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchRecommendationsProducts) {
    try {
      const state = yield effects.select();
      const config = flux.config.recommendations.productSuggestions;
      const productCount = config.productCount;
      if (productCount > 0) {
        // fall back to default mode "popular" if not provided
        // "popular" default will likely provide the most consistently strong data
        const mode = Configuration.RECOMMENDATION_MODES[config.mode || 'popular'];
        const recommendationsUrl = Adapter.buildUrl(flux.config.customerId, 'products', mode);
        const recommendationsResponse = yield effects.call(fetch, recommendationsUrl, Adapter.buildBody({
          size: config.productCount,
          type: 'viewProduct',
          target: config.idField
        }));
        const recommendations = yield recommendationsResponse.json();
        const refinements = recommendations.result
        .filter(({ productId }) => productId)
        .map(({ productId }) => ({ navigationName: config.idField, type: 'Value', value: productId }));
        const { records } = yield effects.call(
          [flux.clients.bridge, flux.clients.bridge.search],
          {
            ...Requests.search(state, flux.config),
            pageSize: config.productCount,
            includedNavigations: [],
            skip: 0,
            refinements
          }
        );

        yield effects.put(flux.actions.receiveRecommendationsProducts(records.map(SearchAdapter.extractProduct)));
      }
      return [];
    } catch (e) {
      yield effects.put(flux.actions.receiveRecommendationsProducts(e));
    }
  }

  export function* fetchPastPurchases(flux: FluxCapacitor, action: Actions.FetchPastPurchases) {
    try {
      const config = flux.config.recommendations.pastPurchases;
      const productCount = config.productCount;
      if (productCount > 0) {
        const url = `http://${flux.config.customerId}.groupbycloud.com/orders/public/skus/popular`;
        // TODO: change to be the real/right request
        const response = yield effects.call(fetch, url, Adapter.buildBody({
          size: productCount
        }));
        const result = yield response.json();
        // TODO: modify data so it's in the right form?

        yield effects.put(flux.actions.receivePastPurchases(result.result));
      }
      return [];
    } catch (e) {
      return effects.put(flux.actions.receivePastPurchases(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* recommendationsSaga() {
  yield effects.takeLatest(Actions.FETCH_RECOMMENDATIONS_PRODUCTS, Tasks.fetchProducts, flux);
  yield effects.takeLatest(Actions.FETCH_PAST_PURCHASES, Tasks.fetchPastPurchases, flux);
};
