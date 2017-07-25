import Adapter from '../../../../src/core/adapters/recommendations';
import suite from '../../_suite';

suite('Recommendations Adapter', ({ expect }) => {

  describe('buildUrl()', () => {
    it('should build the request URL', () => {
      // tslint:disable-next-line max-line-length
      expect(Adapter.buildUrl('myCustomer')).to.eq('https://myCustomer.groupbycloud.com/wisdom/v2/public/recommendations');
    });
  });
});
