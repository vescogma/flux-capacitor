import { Actions, ActionCreator, Store } from '../../../../../src/core';
import recordCount from '../../../../../src/core/reducers/data/record-count';
import suite from '../../../_suite';

suite('record-count', ({ expect }) => {
  let actions: ActionCreator;
  const state = 2934;
  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateRecordCount()', () => {
    it('should update record count on RECEIVE_PRODUCTS', () => {
      const newCount = 2039;

      const reducer = recordCount(state, { type: Actions.RECEIVE_RECORD_COUNT, recordCount: newCount });

      expect(reducer).to.eql(newCount);
    });

    it('should return state on default', () => {
      const reducer = recordCount(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
