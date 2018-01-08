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
import { itemQuantityChanged, cartCreated } from '../reducers/data/cart';

export namespace Tasks {
  export function* addToCart(flux: FluxCapacitor, { payload: product }: Actions.AddToCart) {
    try {
      const cartState = yield effects.select(Selectors.cart);
      let { cartId } = cartState.content;
      if (!cartId) {
        cartId = yield createCartCall(flux, cartState, product);
      }

      return yield addToCartCall(flux, cartId, product);

    } catch (e) {
      console.error(e);
    }
  }

  export function* createCartCall(flux: FluxCapacitor, state: Store.Cart, product: any) {
    const config = yield effects.select(Selectors.config);
    const { visitorId, sessionId } = state.content;
    const customerId = config.customerId;
    // change to include customerId once productionalized
    const url = `https://qa2.groupbycloud.com/api/v0/carts/`;

    const res = yield effects.call(fetch, url,
      {
        method: 'POST',
        body: JSON.stringify({ sessionId, visitorId, cartType: 'cart' })
      });

    const response = yield res.json();
    const { id } = response.result;

    console.log('doi ', id)

    yield effects.put(flux.actions.cartCreated(id));
    return id;
  }

  export function* addToCartCall(flux: FluxCapacitor, cartId: string, product: any) {
    // if certain item already exists, server will add up quantities for POST method and replace quanitity for PUT method
    const url = `https://qa2.groupbycloud.com/api/v0/carts/${cartId}/items/`;
    const res = yield effects.call(fetch, url,
      {
        method: 'POST',
        body: JSON.stringify([product])
      });

    const response = yield res.json();
    yield effects.put(flux.actions.cartServerUpdated(response.result));
  }

  export function* itemQuantityChanged(flux: FluxCapacitor, { payload: { product, quantity } }: Actions.ItemQuantityChanged) {
    const cartState = yield effects.select(Selectors.cart);
    const { cartId } = cartState.content;
    const config = yield effects.select(Selectors.config);
    // todo: need to refactor productTransform
    const productWithCorrectQuantity = { ...product, quantity };
    const url = `https://qa2.groupbycloud.com/api/v0/carts/${cartId}/items/`;
    const res = yield effects.call(fetch, url,
      {
        method: 'PUT',
        body: JSON.stringify([productWithCorrectQuantity])
      });

    const response = yield res.json();
    yield effects.put(flux.actions.cartServerUpdated(response.result));
  }

  export function* removeItem(flux: FluxCapacitor, { payload: product }: Actions.RemoveItem ) {
    const cartState = yield effects.select(Selectors.cart);
    const { cartId } = cartState.content;
    try {
      const deleteUrl = `https://qa2.groupbycloud.com/api/v0/carts/${cartId}/items/${product.sku}`;
      const deleteRes = yield effects.call(fetch, deleteUrl, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }

    try {
      // do I need to validate res?
      const checkCartUrl = `https://qa2.groupbycloud.com/api/v0/carts/${cartId}/`
      const cartRes = yield effects.call(fetch, checkCartUrl, { method: 'GET' });
      const response = yield cartRes.json();
      yield effects.put(flux.actions.cartServerUpdated(response.result));
    } catch (e) {
      console.error(e);
    }
  }
}

export default (flux: FluxCapacitor) => function* cartSaga() {
  yield effects.takeEvery(Actions.ADD_TO_CART, Tasks.addToCart, flux);
  yield effects.takeEvery(Actions.ITEM_QUANTITY_CHANGED, Tasks.itemQuantityChanged, flux);
  yield effects.takeEvery(Actions.REMOVE_ITEM, Tasks.removeItem, flux);
};