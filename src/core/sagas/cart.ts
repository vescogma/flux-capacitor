import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/cart';
import ConfigAdapter from '../adapters/configuration';
import Configuration from '../configuration';
import Requests from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import { fetch } from '../utils';

export namespace Tasks {
  export function* createCart(flux: FluxCapacitor, { payload: { loginId, sessionId, visitorId } }: Actions.CreateCart) {
    try {
      const config = yield effects.select(Selectors.config);
      const customerId = config.customerId;
      const url = Adapter.buildUrl(customerId);
      const res = yield effects.call(
        fetch,
        url,
        Adapter.buildCreateCartBody({ loginId, sessionId, visitorId }));

      // check the response is valid
      yield effects.put(flux.actions.receiveRecommendationsProducts(SearchAdapter.augmentProducts(results)));
    } catch (e) {
      console.log(e);
    }
  }
}

export default (flux: FluxCapacitor) => function* cartSaga() {
  // yield effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, Tasks.fetchSuggestions, flux);
  // yield effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, Tasks.fetchProducts, flux);
};