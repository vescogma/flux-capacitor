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
  export function* createCart(flux: FluxCapacitor, { payload: { sessionId, visitorId } }: Actions.CreateCart) {
    try {
      const config = yield effects.select(Selectors.config);
      const customerId = config.customerId;
      const url = Adapter.buildUrl(customerId);
      
      // todo: make API call
      // const res = yield effects.call(
      //   fetch,
      //   url,
      //   Adapter.buildCreateCartBody({ sessionId, visitorId }));

      const cartId = 'bd23d1cce50542b3bf52dd0554203b12';
      yield effects.put(flux.store.dispatch(flux.actions.cartCreated(cartId)));
    } catch (e) {
      console.log(e);
    }
  }
}

export default (flux: FluxCapacitor) => function* cartSaga() {
  // takeLatest or takeEvery
  yield effects.takeLatest(Actions.CREATE_CART, Tasks.createCart, flux);
};