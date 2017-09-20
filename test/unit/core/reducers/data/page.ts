import { Actions, Store } from '../../../../../src/core';
import page from '../../../../../src/core/reducers/data/page';
import suite from '../../../_suite';

suite('page', ({ expect }) => {
  const current = 3;
  const first = 1;
  const from = 21;
  const items = [10, 20, 30];
  const selected = 0;
  const sizes = {
    items,
    selected
  };
  const state: Store.Page = {
    first, sizes, current, from
  };

  describe('updatePage()', () => {
    describe('should reset current state on', () => {
      const newState = {
        ...state,
        current: 1,
      };

      it('RESET_PAGE', () => {
        const reducer = page(state, { type: Actions.RESET_PAGE });

        expect(reducer).to.eql(newState);
      });

      it('UPDATE_SORTS', () => {
        const reducer = page(state, { type: Actions.SELECT_SORT });

        expect(reducer).to.eql(newState);
      });

      it('SELECT_COLLECTION', () => {
        const reducer = page(state, { type: Actions.SELECT_COLLECTION });

        expect(reducer).to.eql(newState);
      });

      it('should return state if current is already 1', () => {
        state.current = 1;
        const reducer = page(state, { type: Actions.RESET_PAGE });

        expect(reducer).to.eql(state);
      });
    });

    it('should update current state on UPDATE_CURRENT_PAGE', () => {
      const payload = 20;
      const newState = {
        ...state,
        current: payload,
      };

      const reducer = page(state, { type: Actions.UPDATE_CURRENT_PAGE, payload });

      expect(reducer).to.eql(newState);
    });

    it('should update sizes and reset current on UPDATE_PAGE_SIZE', () => {
      const payload = 20;
      const newState = {
        ...state,
        current: 1,
        sizes: {
          ...sizes,
          selected: 1
        }
      };

      const reducer = page(state, { type: Actions.UPDATE_PAGE_SIZE, payload });

      expect(reducer).to.eql(newState);
    });

    it('should return state on UPDATE_PAGE_SIZE if selected not among pageSizes', () => {
      const payload = 50;

      const reducer = page(state, { type: Actions.UPDATE_PAGE_SIZE, payload });

      expect(reducer).to.eql(state);
    });

    it('should update state on RECEIVE_PAGE', () => {
      const payload = {
        from: 31,
        last: 49,
        next: 5,
        previous: 3,
        to: 40,
      };
      const pageSize = 25;
      const newState = {
        ...state,
        ...payload,
      };

      const reducer = page(state, { type: Actions.RECEIVE_PAGE, payload });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = page(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
