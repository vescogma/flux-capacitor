import { Actions, Store } from '../../../../src/core';
import session from '../../../../src/core/reducers/session';
import suite from '../../_suite';

suite('session', ({ expect }) => {

  const RECALL_ID = 'aksd';
  const SEARCH_ID = 'aslkf';
  const ORIGIN: any = { y: 'z' };
  const state: Store.Session = {
    recallId: RECALL_ID,
    searchId: SEARCH_ID,
    origin: ORIGIN,
    config: <any>{
      recommendations: {
        pastPurchases: {
          securedPayload: { c: 'd' }
        }
      }
    }
  };

  describe('updateSession()', () => {
    it('should update state when recallId in meta', () => {
      const recallId = 'new thingay';
      const newState = {
        ...state,
        recallId
      };

      const reducer = session(state, <any>{ meta: { recallId } });

      expect(reducer).to.eql(newState);
    });

    it('should update state when searchId in meta', () => {
      const searchId = 'new stuffs';
      const newState = {
        ...state,
        searchId
      };

      const reducer = session(state, <any>{ meta: { searchId } });

      expect(reducer).to.eql(newState);
    });

    it('should update state when tag in meta', () => {
      const origin = { a: 'b' };
      const newState = {
        ...state,
        origin
      };

      const reducer = session(state, <any>{ meta: { tag: origin } });

      expect(reducer).to.eql(newState);
    });

    it('should update state on UPDATE_LOCATION', () => {
      const location = { a: 'b' };
      const newState = {
        ...state,
        location
      };

      const reducer = session(state, <any>{ type: Actions.UPDATE_LOCATION, payload: location });

      expect(reducer).to.eql(newState);
    });

    it('should update secured payload on UPDATE_SECURED_PAYLOAD', () => {
      const securedPayload = { a: 'b' };
      const newState = {
        ...state,
        config: {
          ...state.config,
          recommendations: {
            ...state.config.recommendations,
            pastPurchases: {
              ...state.config.recommendations.pastPurchases,
              securedPayload
            }
          }
        }
      };

      expect(session(state, <any>{ type: Actions.UPDATE_SECURED_PAYLOAD, payload: securedPayload })).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = session(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
