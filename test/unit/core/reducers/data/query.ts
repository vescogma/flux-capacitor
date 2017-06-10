import { Actions, ActionCreator, Store } from '../../../../../src/core';
import query from '../../../../../src/core/reducers/data/query';
import suite from '../../../_suite';

suite('query', ({ expect }) => {
  let actions: ActionCreator;
  const original = 'yelloww';
  const corrected = 'yellow';
  const related = [{ value: 'red', url: '/shoes' }];
  const didYouMean = [{ value: 'yell', url: '/shouting' }];
  const rewrites = ['spelling'];
  const state: Store.Query = {
    original, corrected, related, didYouMean, rewrites,
  };
  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateQuery()', () => {
    it('should update original state on UPDATE_SEARCH', () => {
      const newOriginal = 'potatoes';
      const newState = {
        ...state,
        original: newOriginal,
      };

      const reducer = query(state, { type: Actions.UPDATE_SEARCH, query: newOriginal });

      expect(reducer).to.eql(newState);
    });

    it('should update state on RECEIVE_QUERY', () => {
      const newQuery = {
        corrected: 'potato chips',
        related: [],
        didYouMean: [{ value: 'lays potato chips', url: '/chips' }],
        rewrites: [],
      };
      const newState = {
        ...state,
        ...newQuery,
      };

      const reducer = query(state, { type: Actions.RECEIVE_QUERY, ...newQuery });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = query(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
