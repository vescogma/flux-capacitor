import { Actions, Store } from '../../../../src/core';
import session from '../../../../src/core/reducers/session';
import suite from '../../_suite';

suite('session', ({ expect }) => {

  const RECALL_ID = 'aksd';
  const SEARCH_ID = 'aslkf';
  const state: Store.Session = {
    recallId: RECALL_ID,
    searchId: SEARCH_ID
  };

  describe('updateSession()', () => {
    it('should update state when recallId in action', () => {
      const recallId = 'new thingay';
      const newState = {
        recallId,
        searchId: SEARCH_ID
      };

      const reducer = session(state, <any>{ metadata: { recallId } });

      expect(reducer).to.eql(newState);
    });

    it('should update state when searchId in action', () => {
      const searchId = 'new stuffs';
      const newState = {
        recallId: RECALL_ID,
        searchId
      };

      const reducer = session(state, <any>{ metadata: { searchId } });

      expect(reducer).to.eql(newState);
    });

    it('should update state when both recallId and searchId in action', () => {
      const recallId = 'thingomojigjog';
      const searchId = 'new stuffys';
      const newState = { recallId, searchId };

      const reducer = session(state, <any>{ metadata: { searchId, recallId } });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = session(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
