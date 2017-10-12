import SearchAdapter from '../../../src/core/adapters/search';
import Selectors from '../../../src/core/selectors';
import * as utils from '../../../src/core/utils';
import suite from '../_suite';

const ACTION = 'MY_ACTION';

suite('utils', ({ expect, spy, stub }) => {

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

  describe('sortBasedOn()', () => {
    it('should sort array based on basis array', () => {
      const firstArray = [1, 5, 2, 3, 9];
      const secondArray = [5, 3, 8];

      expect(utils.sortBasedOn(firstArray, secondArray)).to.eql([5, 3, 1, 2, 9]);
    });

    it('should sort array based on basis array and cb', () => {
      const firstArray = [{ value: 1 }, { value: 3 }, { value: 5 }, { value: 2 }, { value: 9 }];
      const secondArray = [{ value: 5 }, { value: 3 }, { value: 8 }];
      const comparison = (first, second) => first.value === second.value;

      expect(utils.sortBasedOn(firstArray, secondArray, comparison)).to.eql([
        { value: 5 },
        { value: 3 },
        { value: 1 },
        { value: 2 },
        { value: 9 }
      ]);
    });
  });
});
