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

  export const transformToBrowser = (state: Store.Cart, reducerKey: string): Store.Cart => state;

  // tslint:disable-next-line:max-line-length
  export const transformFromBrowser = (state: Store.Cart): Store.Cart => state;

  export const calculateTotalQuantity = (items: any[]) =>
    items.reduce((acc, item) => {
      return acc + item['quantity'];
    }, 0);

  export const combineLikeItems = (items: any[], item: any, key: string) => {
    console.log(items, item.item.data[key]);
    // todo: handle diffenret structure
    const likeItem = items.find((el: any) => el.item.data[key] === item.item.data[key]);
    if (likeItem) {
      items.forEach((el: any) => {
        if (el.item.data[key] === item.item.data[key]) {
          el.quantity += item.quantity;
        }
      });
      return items;
    } else {
      return [...items, item];
    }
  };

  export interface CartBody {
    loginId?: string;
    sessionId: string;
    visitorId: string;
  }

}

export default Cart;
