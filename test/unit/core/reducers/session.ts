import { Store } from '../../../../src/core';
import session from '../../../../src/core/reducers/session';
import suite from '../../_suite';

suite('session', ({ expect }) => {

  const RECALL_ID = 'aksd';
  const SEARCH_ID = 'aslkf';
  const ORIGIN: any = { y: 'z' };
  const state: Store.Session = {
    recallId: RECALL_ID,
    searchId: SEARCH_ID,
    origin: ORIGIN
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

    it('should return state on default', () => {
      const reducer = session(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
