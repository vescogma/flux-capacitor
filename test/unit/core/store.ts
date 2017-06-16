import * as uuid from 'uuid';
import Suite, { idGenerator } from '../../../src/core/store';
import suite from '../_suite';

suite('Store', ({ expect, stub }) => {

  describe('idGenerator()', () => {
    it('should add id if action type is in whitelist', (done) => {
      const id = '1234';
      const idKey = 'myId';
      const v1 = stub(uuid, 'v1').returns(id);
      const whitelist = ['a', 'b', 'c'];

      idGenerator(idKey, whitelist)(null)((action) => {
        expect(action).to.eql({ type: 'b', c: 'd', [idKey]: id });
        done();
      })({ type: 'b', c: 'd' });
    });

    it('should not modify action if type not in whitelist', (done) => {
      const idKey = 'myId';
      const originalAction = { a: 'b', type: 'c' };

      idGenerator(idKey, ['e', 'f', 'g'])(null)((action) => {
        expect(action).to.eq(originalAction);
        done();
      })(originalAction);
    });
  });
});
