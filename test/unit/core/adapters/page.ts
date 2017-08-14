import Adapter from '../../../../src/core/adapters/page';
import suite from '../../_suite';

suite('Page Adapter', ({ expect }) => {

  describe('previousPage()', () => {
    it('should return previous page', () => {
      expect(Adapter.previousPage(4)).to.eq(3);
    });

    it('should return null if no previous page', () => {
      expect(Adapter.previousPage(0)).to.be.null;
    });
  });

  describe('nextPage()', () => {
    it('should return next page', () => {
      expect(Adapter.nextPage(7, 9)).to.eq(8);
    });

    it('should return null if no next page available', () => {
      expect(Adapter.nextPage(9, 9)).to.be.null;
    });
  });

  describe('finalPage()', () => {
    it('should return the final page', () => {
      expect(Adapter.finalPage(15, 203)).to.eq(14);
    });

    it('should return at least 1', () => {
      expect(Adapter.finalPage(15, 0)).to.eq(1);
    });
  });

  describe('fromResult()', () => {
    it('should return the first record index on page', () => {
      expect(Adapter.fromResult(4, 32)).to.eq(97);
    });
  });

  describe('toResult()', () => {
    it('should return totalRecords when there is only one page and totalRecords is less than pageSize', () => {
      expect(Adapter.toResult(1, 10, 6)).to.eq(6);
    });

    // tslint:disable-next-line max-line-length
    it('should return totalRecords when it is the last page and the number of items on the page is less than pageSize', () => {
      expect(Adapter.toResult(2, 10, 12)).to.eq(12);
    });

    it('should return the product of currentPage and pageSize when totalRecords is greater than pageSize', () => {
      expect(Adapter.toResult(1, 10, 16)).to.eq(10);
    });
  });
});
