import { Actions, Store } from '../../../../../src/core';
import infiniteScroll from '../../../../../src/core/reducers/data/infinite-scroll';
import suite from '../../../_suite';

suite('infiniteScroll', ({ expect }) => {
  const state: Store.InfiniteScroll = { isFetchingForward: false, isFetchingBackward: false };

  describe('updateInfiniteScroll()', () => {
    it('should update state on RECEIVE_INFINITE_SCROLL', () => {
      const selectedCollection = 'Department';
      const payload = { isFetchingForward: true, isFetchingBackward: true };

      const reducer = infiniteScroll(state, { type: Actions.RECEIVE_INFINITE_SCROLL, payload });

      expect(reducer).to.eql(payload);
    });

    it('should return state on default', () => {
      const reducer = infiniteScroll(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
