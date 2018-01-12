import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Selectors from '../selectors';
import Store from '../store';
import { fetch } from '../utils';

export namespace Tasks {
  export function* addToCart(flux: FluxCapacitor, { payload: product }: Actions.AddToCart) {
    try {
      const cartState = yield effects.select(Selectors.cart);
      let { cartId } = cartState.content;
      if (!cartId) {
        cartId = yield effects.call(createCartCall, flux, cartState);
      }

      return yield effects.call(addToCartCall, flux, cartId, product);
    } catch (e) {
      return e;
    }
  }

  export function* createCartCall(flux: FluxCapacitor, state: Store.Cart) {
    try {
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

      yield effects.put(flux.actions.cartCreated(id));
      return id;
    } catch (e) {
      yield effects.put(flux.actions.cartCreated(e));
    }
  }

  export function* addToCartCall(flux: FluxCapacitor, cartId: string, product: any) {
    try {
      // if certain item already exists, server will add up quantities for POST method
      // and replace quanitity for PUT method
      const url = `https://qa2.groupbycloud.com/api/v0/carts/${cartId}/items/`;
      const res = yield effects.call(fetch, url,
        {
          method: 'POST',
          body: JSON.stringify([product])
        });

      const response = yield res.json();
      yield effects.put(flux.actions.cartServerUpdated(response.result));
    } catch (e) {
      yield effects.put(flux.actions.cartServerUpdated(e));
    }
  }

  export function* itemQuantityChanged(flux: FluxCapacitor, { payload: { product, quantity } }
    : Actions.ItemQuantityChanged) {
    try {
      const cartState = yield effects.select(Selectors.cart);
      const { cartId } = cartState.content;
      const productWithCorrectQuantity = { ...product, quantity };
      const url = `https://qa2.groupbycloud.com/api/v0/carts/${cartId}/items/`;
      const res = yield effects.call(fetch, url,
        {
          method: 'PUT',
          body: JSON.stringify([productWithCorrectQuantity])
        });

      const response = yield res.json();
      yield effects.put(flux.actions.cartServerUpdated(response.result));
    } catch (e) {
      yield effects.put(flux.actions.cartServerUpdated(e));
    }
  }

  export function* removeItem(flux: FluxCapacitor, { payload: product }: Actions.RemoveItem) {
    try {
      const cartState = yield effects.select(Selectors.cart);
      const { cartId } = cartState.content;
      const deleteUrl = `https://qa2.groupbycloud.com/api/v0/carts/${cartId}/items/${product.sku}`;
      yield effects.call(fetch, deleteUrl, { method: 'DELETE' });

      const checkCartUrl = `https://qa2.groupbycloud.com/api/v0/carts/${cartId}/`;
      const cartRes = yield effects.call(fetch, checkCartUrl, { method: 'GET' });
      const response = yield cartRes.json();
      yield effects.put(flux.actions.cartServerUpdated(response.result));
    } catch (e) {
      yield effects.put(flux.actions.cartServerUpdated(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* cartSaga() {
  yield effects.takeEvery(Actions.ADD_TO_CART, Tasks.addToCart, flux);
  yield effects.takeEvery(Actions.ITEM_QUANTITY_CHANGED, Tasks.itemQuantityChanged, flux);
  yield effects.takeEvery(Actions.REMOVE_ITEM, Tasks.removeItem, flux);
};