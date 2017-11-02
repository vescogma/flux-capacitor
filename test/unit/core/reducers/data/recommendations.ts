import { Actions, Store } from '../../../../../src/core';
import recommendations from '../../../../../src/core/reducers/data/recommendations';
import suite from '../../../_suite';

suite('recommendations', ({ expect }) => {
  describe('updateRecommendations()', () => {
    const state: Store.Recommendations = <any>{
      suggested: {
        products: <any[]>['c', 'd', 'e']
      }
    };

    it('should update state on RECEIVE_RECOMMENDATIONS_PRODUCTS', () => {
      const payload: any[] = ['a', 'b', 'c'];
      const newState = {
        suggested: {
          products: payload
        }
      };

      const reducer = recommendations(state, { type: Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS, payload });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = recommendations(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });

  describe('updatePastPurchases()', () => {
    const state: Store.Recommendations = <any>{
      pastPurchases: {
        products: [{ sku: '123', quantity: 3 }, { sku: '0923821', quantity: 2 }, { sku: '2874', quantity: 2 }]
      }
    };

    it('should update state on RECEIVE_PAST_PURCHASES', () => {
      const payload = [{ sku: '274', quantity: 1 }];
      const newState = {
        pastPurchases: {
          products: payload
        }
      };

      const reducer = recommendations(state, { type: Actions.RECEIVE_PAST_PURCHASES, payload });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = recommendations(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });

  describe('updateOrderHistory()', () => {
    const state: Store.Recommendations = <any>{
      orderHistory: [{ a: 1 }]
    };

    it('should update state on RECEIVE_ORDER_HISTORY', () => {
      const payload = [{ a: 1 }];
      const newState = {
        orderHistory: payload
      };

      const reducer = recommendations(state, <any>{ type: Actions.RECEIVE_ORDER_HISTORY, payload });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = recommendations(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });

  describe('updateQueryPastPurchases()', () => {
    const state: Store.Recommendations = <any>{
      queryPastPurchases: [{ a: 1 }]
    };

    it('should update state on RECEIVE_QUERY_PAST_PURCHASES', () => {
      const payload = [{ a: 1 }];
      const newState = {
        queryPastPurchases: payload
      };

      const reducer = recommendations(state, <any>{ type: Actions.RECEIVE_QUERY_PAST_PURCHASES, payload });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = recommendations(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
