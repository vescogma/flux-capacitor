import { Actions, Store } from '../../../../../src/core';
import products from '../../../../../src/core/reducers/data/products';
import suite from '../../../_suite';

suite('products', ({ expect }) => {
  const state: Store.ProductWithMetadata[] = [
    { index: 3, meta: { collection: 'heyy' }, data: { id: '19232', price: 20, title: 'book' } },
    { index: 4, meta: { collection: 'heyyo' }, data: { id: '23942', price: 50, title: 'another book' } },
  ];

  describe('updateProducts()', () => {
    it('should update state on RECEIVE_PRODUCTS', () => {
      const selectedCollection = 'Department';
      const payload = [
        {
          index: 3,
          meta: { collection: 'heyys' },
          data: { id: '29384', price: 12, title: 'a new book!' }
        },
        {
          index: 4,
          meta: { collection: 'howsa' },
          data: { id: '34392', price: 30, title: 'a really interesting another book' }
        },
      ];

      const reducer = products(state, { type: Actions.RECEIVE_PRODUCT_RECORDS, payload });

      expect(reducer).to.eql(payload);
    });

    it('should return state on default', () => {
      const reducer = products(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });

  describe('updateMoreProducts()', () => {
    it('should prepend products when index is lower', () => {
      const payload = [
        {
          index: 1,
          meta: { collection: 'howdy' },
          data: { id: '29384', price: 12, title: 'a new book!' }
        },
        { index: 2,
          meta: { collection: 'wooah' },
          data: { id: '34392', price: 30, title: 'a really interesting another book' }
        },
      ];

      const reducer = products(state, { type: Actions.RECEIVE_MORE_PRODUCTS, payload });

      expect(reducer).to.eql([...payload, ...state]);
    });

    it('should append products when index is higher', () => {
      const payload = [
        {
          index: 5,
          meta: { collection: 'howdy' },
          data: { id: '29384', price: 12, title: 'a new book!' }
        },
        { index: 6,
          meta: { collection: 'wooah' },
          data: { id: '34392', price: 30, title: 'a really interesting another book' }
        },
      ];

      const reducer = products(state, { type: Actions.RECEIVE_MORE_PRODUCTS, payload });

      expect(reducer).to.eql([...state, ...payload]);
    });

    it('should return state when index is in state', () => {
      const payload = [
        {
          index: 3,
          meta: { collection: 'howdy' },
          data: { id: '29384', price: 12, title: 'a new book!' }
        },
      ];

      const reducer = products(state, { type: Actions.RECEIVE_MORE_PRODUCTS, payload });

      expect(reducer).to.eql(state);
    });
  });
});
