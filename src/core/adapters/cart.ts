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
      // ad-hoc: using id for skuId
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

  export const calculateTotalQuantity = (items: CartProduct[]) => items.reduce((acc, item) => (Number(acc) + Number(item['quantity'])), 0);

  export const findItems = (items: CartProduct[], product: CartProduct, key: string) => {
    // todo: handle diffenret structure
    const likeItem = items.find((el: any) => {
      if (el[key]) {
        return el[key] === product[key]
      } else {
        throw "Key is not valid!"
      }
    });
    return likeItem;
  }

  export const combineLikeItems = (items: CartProduct[], product: CartProduct, key: string) => {
    // todo: handle diffenret structure
    const likeItem = findItems(items, product, key);
    console.log('items', items, 'likeItem', likeItem);
    if (likeItem) {
      return items.map((el: any) => {
        if (el[key] === product[key]) {
          el.quantity += product.quantity;
        }
        return el;
      });
    } else {
      return [...items, product];
    }
  };

  export const changeItemQuantity = (items: CartProduct[], product: CartProduct, quantity: number) => {
    items.forEach((el: CartProduct) => {
      if (el.sku === product.sku){
        el.quantity = quantity;
      }
    });
    return items;
  }

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

  export interface CartProduct {
    productId?: string;
    metadata?: Metadata[];
    collection: string;
    price: number;
    sku: string;
    title: string;
    quantity: number;
  }

  export interface Metadata {
    key: string;
    value: string;
  }

}

export default Cart;
