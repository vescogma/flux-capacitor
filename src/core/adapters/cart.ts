import Store from '../store';

namespace Cart {
  // tslint:disable-next-line:max-line-length
  export const calculateTotalQuantity = (items: CartProduct[]) => items.reduce((acc, item) => (Number(acc) + Number(item['quantity'])), 0);

  export const findItems = (items: CartProduct[], product: CartProduct) => {
    const likeItem = items.find((el: any) => {
      if (el.sku && product.sku) {
        return el.sku === product.sku;
      } else {
        throw 'The field sku does not exist!';
      }
    });
    return likeItem;
  };

  export const combineLikeItems = (items: CartProduct[], product: CartProduct) => {
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
      if (el.sku === product.sku) {
        el.quantity = quantity;
      }
    });
    return items;
  };

  export const removeItem = (items: CartProduct[], product: CartProduct) => {
    const index = items.findIndex((item) => item.sku === product.sku);
    items.splice(index, 1);
    return items;
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
