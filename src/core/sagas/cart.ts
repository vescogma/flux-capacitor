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
  export function* addToCart(flux: FluxCapacitor, { payload: { product, quantity } }: any) {
    try {
      const cartState = yield effects.select(Selectors.cart);
      const config = yield effects.select(Selectors.config);
      console.log('cc', cartState)

      const cartExists = !!cartState.content.cartId;
      const transformed = Adapter.productTransform(product, quantity, config);
      cartExists ? yield addToCartCall(flux, cartState.content.cartId, transformed) : yield createCartAndAddCall(flux, cartState, transformed);
      // todo: needs to compare res with the current state and update state if there is descrapency
    } catch (e) {
      console.error(e);
    }
  }

  export function* createCartAndAddCall(flux: FluxCapacitor, state: Store.Cart, product: any) {
    // todo: make API call
    const config = yield effects.select(Selectors.config);
    const { visitorId, sessionId } = state.content;
    const customerId = config.customerId;
    const url = Adapter.buildUrl(customerId);

    const res = yield effects.call(fetch, url,
      ({
        method: 'POST',
        body: JSON.stringify({ sessionId, visitorId, cartType: 'cart' })
      }));

    const response = yield res.json();
    const { id } = response.result;

    yield effects.put(flux.actions.cartCreated(id));
    return yield addToCartCall(flux, id, product);
  }

  export function* addToCartCall(flux: FluxCapacitor, cartId: string, product: any) {
    const url = `https://qa2.groupbycloud.com/api/v0/carts/${cartId}/items/`;

    const res = yield effects.call(fetch, url,
      ({
        method: 'POST',
        body: JSON.stringify(product)
      }));

    const response = yield res.json();
    console.log(response.result);
    yield effects.put(flux.actions.cartServerUpdated(response.result));
  }
}

export default (flux: FluxCapacitor) => function* cartSaga() {
  yield effects.takeEvery(Actions.ADD_TO_CART, Tasks.addToCart, flux);
};