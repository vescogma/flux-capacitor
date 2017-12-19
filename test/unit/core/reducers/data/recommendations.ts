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
});
