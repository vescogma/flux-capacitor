import Actions from '../../../../src/core/actions';
import * as reducers from '../../../../src/core/reducers';
import * as dataReducer from '../../../../src/core/reducers/data';
import suite from '../../_suite';

suite('reducers', ({ expect, stub }) => {

  describe('updateData()', () => {
    it('should handle REFRESH_STATE action', () => {
      const state = { a: 'b' };

      expect(reducers.updateData({}, { type: Actions.REFRESH_STATE, state })).to.eq(state);
    });

    it('should return default', () => {
      const state = { a: 'b' };
      stub(dataReducer, 'default').returns(state);

      expect(reducers.updateData({}, { type: '' })).to.eq(state);
    });
  });
});
