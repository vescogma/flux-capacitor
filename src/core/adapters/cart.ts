import { Navigation, ValueRefinement } from 'groupby-api';
import * as effects from 'redux-saga/effects';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';
import { fetch, sortBasedOn } from '../utils';
import ConfigurationAdapter from './configuration';

namespace Cart {

  export const buildUrl = (customerId: string) =>
    `https://${customerId}.groupbycloud.com/v0/carts`;

  export const buildCreateCartBody = (body: CartBody) => ({
    method: 'POST',
    body: JSON.stringify(body)
  });

  export const transformToBrowser = (state: Store.Cart): any => ({
    cartId: state.cartId
  });
}

export interface CartBody {
  loginId?: string;
  sessionId: string;
  visitorId: string;
}

export default Cart;
