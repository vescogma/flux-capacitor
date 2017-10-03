import reducer from '../../../../../src/core/reducers/data';
import suite from '../../../_suite';

suite('reducers', ({ expect, stub }) => {
  describe('fields', () => {
    const type = 'NOT AN ACTUAL ACTION';

    it('should have the default state in field be an array', () => {
      expect(reducer({}, { type, payload: undefined })['fields']).to.eql([]);
    });

    it('should just return the given state if anything else passed in', () => {
      const fields = 'test';

      expect(reducer({ fields  }, { type, payload: undefined }) ['fields']).to.eql(fields);
    });
  });
});
