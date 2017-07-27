import * as utils from '../../../src/core/utils';
import suite from '../_suite';

const ACTION = 'MY_ACTION';

suite('utils', ({ expect, spy }) => {

  describe('rayify()', () => {
    it('should return an array if the argument is a value', () => {
      expect(utils.rayify(20)).to.eql([20]);
      expect(utils.rayify('apple')).to.eql(['apple']);
      expect(utils.rayify({ a: 'b' })).to.eql([{ a: 'b' }]);
      expect(utils.rayify(true)).to.eql([true]);
    });

    it('should return the original argument if it is an array', () => {
      const array = [{ a: 'b' }, { c: 'd' }];

      expect(utils.rayify(array)).to.eq(array);
    });
  });

  describe('action()', () => {
    it('should build an FSA compliant action with empty meta', () => {
      expect(utils.action(ACTION)).to.eql({ type: ACTION, meta: {} });
    });

    it('should build an FSA compliant action with empty meta and a payload', () => {
      const payload = { a: 'b' };

      expect(utils.action(ACTION, payload)).to.eql({ type: ACTION, payload, meta: {} });
    });

    it('should build an FSA compliant action with meta and a payload', () => {
      const payload = { a: 'b' };
      const meta = { e: 'f' };

      expect(utils.action(ACTION, payload, meta)).to.eql({ type: ACTION, payload, meta });
    });

    it('should add error flag if payload is an Error', () => {
      const payload = new Error('request failed');
      const meta = { e: 'f' };

      expect(utils.action(ACTION, payload, meta)).to.eql({ type: ACTION, payload, meta, error: true });
    });
  });

  describe('refinementPayload()', () => {
    it('should create a value refinement payload', () => {
      const navigationId = 'brand';
      const value = 'arm and hammer';

      expect(utils.refinementPayload(navigationId, value)).to.eql({ navigationId, value });
    });

    it('should create a range refinement payload', () => {
      const navigationId = 'brand';
      const low = 14;
      const high = 49;

      expect(utils.refinementPayload(navigationId, low, high)).to.eql({ navigationId, low, high, range: true });
    });
  });
});
