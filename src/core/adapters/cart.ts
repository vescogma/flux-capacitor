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
    // console.log(items, item);
    // // todo: handle diffenret structure
    // const likeItemIndex = items.indexOf((el: any) => el.data[key] === item.data[key]);
    // console.log('index', likeItemIndex);
    // // tslint:disable-next-line:max-line-length
    // const combinedItems = likeItemIndex > -1 ? [...itemscalculateTotalQuantity([...items[likeItemIndex], item]) : [...items, item];
    // console.log('combined', combinedItems);
    // return likeItemIndex ? items.splice(likeItemIndex, 1, combinedItems) : items;
  };

  export interface CartBody {
    loginId?: string;
    sessionId: string;
    visitorId: string;
  }

}

export default Cart;
