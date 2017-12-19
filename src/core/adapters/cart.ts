import { Navigation, ValueRefinement } from 'groupby-api';
import * as effects from 'redux-saga/effects';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';
import { fetch, sortBasedOn } from '../utils';
import ConfigurationAdapter from './configuration';

namespace Cart {

  export const buildUrl = (customerId: string) =>
    `https://qa2.groupbycloud.com/api/v0/carts/`;

  export const buildCreateCartBody = (body: CartBody) => ({
    method: 'POST',
    body: JSON.stringify(body)
  });

  export const productTransform = (product: any, quantity: number, config: any) => {
    // todo: should take in structure

    return {
      // ad-hoc: using is for skuId
      sku: product.data.id,
      productId: product.data.id,
      collection: config.collection,
      price: product.data.price,
      quantity: Number(quantity),
      title: product.data.title,
      metadata: [{
        key: 'image',
        value: product.data.image
      }]
    };
  };

  export const transformToBrowser = (state: Store.Cart, reducerKey: string): Store.Cart => state;

  // tslint:disable-next-line:max-line-length
  export const transformFromBrowser = (state: Store.Cart): Store.Cart => state;

  export const calculateTotalQuantity = (items: any[]) =>
    items.reduce((acc, item) => {
      return acc + item['quantity'];
    }, 0);

  export const combineLikeItems = (items: any[], item: any, key: string) => {
    // todo: handle diffenret structure
    const likeItem = items.find((el: any) => el[key] === item[key]);
    console.log('items', items, 'likeItem', likeItem);
    if (likeItem) {
      items.forEach((el: any) => {
        if (el[key] === item[key]) {
          el.quantity += item.quantity;
        }
      });
      return items;
    } else {
      return [...items, item];
    }
  };

  // may not need this any more
  export const mergeServerItemsWithState = (stateItems: any, serverItems: any) => {
    const mergedItems = serverItems.map((item: any) => {
      const stateItem = stateItems.find((el: any) => el.sku === item.sku);
      item.quantity = Number(item.quantity);

      console.log('m', stateItem, item);
      return { ...stateItem, ...item };
    });
    return mergedItems;
  };

  export interface CartBody {
    loginId?: string;
    sessionId: string;
    visitorId: string;
    cartType: string;
  }

}

export default Cart;
