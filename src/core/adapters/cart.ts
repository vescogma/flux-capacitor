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

  export const transformToBrowser = (state: Store.Cart, reducerKey: string): any => state;

  // tslint:disable-next-line:max-line-length
  export const transformFromBrowser = (incomingState: Store.Cart): Store.Cart => {
    return incomingState;
  };

  export const calculateQuantity = (items: any[]) =>
    items.reduce((acc, item) => {
      return acc + item['quantity'];
    }, 0);

  export interface CartBody {
    loginId?: string;
    sessionId: string;
    visitorId: string;
  }

}

export default Cart;
