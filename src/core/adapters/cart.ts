import Actions from '../actions';
import { Navigation, ValueRefinement } from 'groupby-api';
import * as effects from 'redux-saga/effects';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';
import { fetch, sortBasedOn } from '../utils';
import ConfigurationAdapter from './configuration';
import { Adapters } from '../../index';

namespace Cart {
  export const transformToBrowser = (state: Store.Cart, reducerKey: string): Store.Cart => state;

  // tslint:disable-next-line:max-line-length
  export const transformFromBrowser = (state: Store.Cart): Store.Cart => state;

  export const calculateTotalQuantity = (items: CartProduct[]) => items.reduce((acc, item) => (Number(acc) + Number(item['quantity'])), 0);

  export const findItems = (items: CartProduct[], product: CartProduct) => {
    // todo: handle diffenret structure
    const likeItem = items.find((el: any) => {
      if (el.sku) {
        return el.sku === product.sku
      } else {
        throw "Key is not valid!"
      }
    });
    return likeItem;
  }

  export const combineLikeItems = (items: CartProduct[], product: CartProduct) => {

    // todo: handle diffenret structure
    const likeItem = findItems(items, product);
    if (likeItem) {
      return items.map((el: any) => {
        if (el.sku === product.sku) {
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
