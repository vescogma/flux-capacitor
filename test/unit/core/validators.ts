import * as validators from '../../../src/core/validators';
import suite from '../_suite';

suite('Validator', ({ expect, spy, stub }) => {

  describe('isString()', () => {
    const validator = validators.isString;
    it('should be valid if value is a string', () => {
      expect(validator.func('test')).to.be.true;
    });
    it('should be valid if value is a string', () => {
      expect(validator.func(<any>false)).to.be.false;
    });
  });
});
