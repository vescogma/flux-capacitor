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
  export function* addToCart(flux: FluxCapacitor, { payload: item }: any) {
    try {
      const cartState = yield effects.select(Selectors.cart);
      const cartExists = !!cartState.content.cartId;
      const res = cartExists ? yield addToCartCall(flux) : yield createCartAndAdd(flux);
      // todo: needs to compare res with the current state and update state if there is descrapency
    } catch (e) {
      console.error(e);
    }
  }

  export function* createCartAndAdd(flux: FluxCapacitor) {
    // todo: make API call
    const config = yield effects.select(Selectors.config);
    const { visitorId, sessionId } = yield effects.select(Selectors.cart);
    const customerId = config.customerId;
    const url = Adapter.buildUrl(customerId);

    // const res = yield effects.call(
    //   fetch,
    //   url,
    //   /Adapter.buildCreateCartBody({ sessionId, visitorId }));

    // todo: calls are faked and not written out, response is faked
    const res = yield effects.call(() => ({ results: { id: '663c0a60009c48b49f42eadc325f483b' } }));
    yield effects.put(flux.actions.cartCreated(res.results.id));
    return yield addToCartCall(flux);
  }

  export function* addToCartCall(flux: FluxCapacitor) {
    return yield effects.call(() => ({
      id: '663c0a60009c48b49f42eadc325f483b',
      totalPrice: 2517.72,
      generatedTotalPrice: 3017.72,
      items: []
    }));
  }
}

export default (flux: FluxCapacitor) => function* cartSaga() {
  yield effects.takeEvery(Actions.ADD_TO_CART, Tasks.addToCart, flux);
};