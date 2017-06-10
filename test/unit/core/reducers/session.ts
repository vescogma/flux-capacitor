import { Actions, ActionCreator, Store } from '../../../../src/core';
import session from '../../../../src/core/reducers/session';
import suite from '../../_suite';

suite('session', ({ expect }) => {
  let actions: ActionCreator;

  const recallId = 'aksd';
  const searchId = 'aslkf';
  const state: Store.Session = {
    recallId,
    searchId
  }

  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateSession()', () => {
    it('should update state when recallId in action', () => {
      const recallId = 'new thingay';
      const newState = {
        recallId,
        searchId
      };

      const reducer = session(state, { recallId });

      expect(reducer).to.eql(newState);
    });

    it('should update state when searchId in action', () => {
      const searchId = 'new stuffs';
      const newState = {
        recallId,
        searchId
      };

      const reducer = session(state, { searchId });

      expect(reducer).to.eql(newState);
    });

    it('should update state when both recallId and searchId in action', () => {
      const recallId = 'thingomojigjog';
      const searchId = 'new stuffys';
      const newState = {
        recallId,
        searchId
      };

      const reducer = session(state, { searchId, recallId });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = session(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
