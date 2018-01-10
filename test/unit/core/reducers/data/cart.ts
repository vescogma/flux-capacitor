import { Actions, Store } from '../../../../../src/core';
import Adapter from '../../../../../src/core/adapters/cart';
import cart from '../../../../../src/core/reducers/data/cart';
import suite from '../../../_suite';

suite('cart', ({ expect, stub }) => {
  let state: Store.Cart = {
    content: {
      cartId: '',
      totalQuantity: 0,
      items: [],
      visitorId: '',
      sessionId: '',
      generatedTotalPrice: 0,
      lastModified: null,
    }
  };

  describe('updateCart()', () => {
    it('should update cart state on GET_TRACKER_INFO', () => {
      const payload = { visitorId: 'v', sessionId: 's' };
      const newState = {
        content: {
          cartId: '',
          totalQuantity: 0,
          items: [],
          visitorId: 'v',
          sessionId: 's',
          generatedTotalPrice: 0,
          lastModified: null,
        }
      };

      const reducer = cart(state, { type: Actions.GET_TRACKER_INFO, payload });

      expect(reducer).to.eql(newState);
    });

    it('should update cart state on ADD_TO_CART', () => {
      const payload = { data: 'fruit' };
      const combined = [{ data: 'juice' }];
      const quantity = 1;
      const newState = {
        content: {
          cartId: '',
          totalQuantity: quantity,
          items: combined,
          visitorId: '',
          sessionId: '',
          generatedTotalPrice: 0,
          lastModified: null,
        }
      };
      const combineLikeItems = stub(Adapter, 'combineLikeItems').returns(combined);
      const calculateTotalQuantity = stub(Adapter, 'calculateTotalQuantity').returns(quantity);

      const reducer = cart(state, { type: Actions.ADD_TO_CART, payload });

      expect(reducer).to.eql(newState);
    });

    it('should update cart state on CART_CREATED', () => {
      const cartId = 'cartId';
      const newState = {
        content: {
          cartId,
          totalQuantity: 0,
          items: [],
          visitorId: '',
          sessionId: '',
          generatedTotalPrice: 0,
          lastModified: null,
        }
      };

      const reducer = cart(state, { type: Actions.CART_CREATED, payload: cartId });

      expect(reducer).to.eql(newState);
    });

    it('should update cart state on CART_SERVER_UPDATED', () => {
      const content = { generatedTotalPrice: 100, totalQuantity: 10, items: ['a'], lastModified: 123456 };
      const newState = {
        content: {
          cartId: '',
          totalQuantity: 10,
          items: ['a'],
          visitorId: '',
          sessionId: '',
          generatedTotalPrice: 100,
          lastModified: 123456,
        }
      };

      const reducer = cart(state, { type: Actions.CART_SERVER_UPDATED, payload: content });

      expect(reducer).to.eql(newState);
    });

    it('should update cart state on REMOVE_ITEM', () => {
      const quantity = 10;
      const payload = { product: 'a', quantity };

      const newState = {
        content: {
          cartId: '',
          totalQuantity: 10,
          items: [{ product: 'a', quantity: 10 }],
          visitorId: '',
          sessionId: '',
          generatedTotalPrice: 0,
          lastModified: null,
        }
      };
      const calculateTotalQuantity = stub(Adapter, 'calculateTotalQuantity').returns(quantity);
      const changeItemQuantity = stub(Adapter, 'changeItemQuantity').returns([payload]);

      const reducer = cart(state, { type: Actions.ITEM_QUANTITY_CHANGED, payload });

      expect(reducer).to.eql(newState);
      expect(calculateTotalQuantity).to.be.calledWithExactly([payload]);
      expect(changeItemQuantity).to.be.calledWithExactly([], 'a', quantity);
    });

    it('should update cart state on REMOVE_ITEM', () => {
      const items = ['a', 'b'];
      state = {
        content: {
          cartId: '',
          totalQuantity: 0,
          items,
          visitorId: '',
          sessionId: '',
          generatedTotalPrice: 0,
          lastModified: null,
        }
      };
      const quantity = 5;
      const product = 'a';
      const newState = {
        content: {
          cartId: '',
          totalQuantity: 5,
          items: ['b'],
          visitorId: '',
          sessionId: '',
          generatedTotalPrice: 0,
          lastModified: null,
        }
      };
      const calculateTotalQuantity = stub(Adapter, 'calculateTotalQuantity').returns(quantity);
      const removeItem = stub(Adapter, 'removeItem').returns(['b']);

      const reducer = cart(state, { type: Actions.REMOVE_ITEM, payload: product });

      expect(reducer).to.eql(newState);
      expect(calculateTotalQuantity).to.be.calledWithExactly(['b']);
      expect(removeItem).to.be.calledWithExactly(items, product);
    });
  });
});
