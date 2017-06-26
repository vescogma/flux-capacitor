import { Actions, Store } from '../../../../src/core';
import isRunning from '../../../../src/core/reducers/is-running';
import suite from '../../_suite';

suite('isRunning', ({ expect }) => {
  describe('updateIsRunning()', () => {
    it('should return true on START_APP', () => {
      const newState = true;

      const reducer = isRunning(false, { type: Actions.START_APP });

      expect(reducer).to.eql(newState);
    });

    it('should return false on SHUTDOWN_APP', () => {
      const newState = false;

      const reducer = isRunning(true, { type: Actions.SHUTDOWN_APP });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const state = true;
      const reducer = isRunning(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
