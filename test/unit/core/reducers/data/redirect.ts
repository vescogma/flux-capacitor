import { Actions, Store } from '../../../../../src/core';
import redirect from '../../../../../src/core/reducers/data/redirect';
import suite from '../../../_suite';

suite('redirect', ({ expect }) => {
  const state = '/go-here';

  describe('updateRedirect()', () => {
    it('should update redirect on RECEIVE_REDIRECT', () => {
      const payload = '/no-go-here-instead';

      const reducer = redirect(state, { type: Actions.RECEIVE_REDIRECT, payload });

      expect(reducer).to.eql(payload);
    });

    it('should return state on default', () => {
      const reducer = redirect(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
