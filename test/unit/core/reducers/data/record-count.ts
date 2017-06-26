import { Actions, Store } from '../../../../../src/core';
import recordCount from '../../../../../src/core/reducers/data/record-count';
import suite from '../../../_suite';

suite('record-count', ({ expect }) => {
  const state = 2934;

  describe('updateRecordCount()', () => {
    it('should update record count on RECEIVE_PRODUCTS', () => {
      const payload = 2039;

      const reducer = recordCount(state, { type: Actions.RECEIVE_RECORD_COUNT, payload });

      expect(reducer).to.eql(payload);
    });

    it('should return state on default', () => {
      const reducer = recordCount(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
