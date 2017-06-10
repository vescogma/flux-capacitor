import Selectors from '../../../src/core/selectors';
import suite from '../_suite';

suite('selectors', ({ expect, stub }) => {

  describe('navigation()', () => {
    it('should select a navigation from the state', () => {
      const id = 'my navigation';
      const navigation = { a: 'b' };
      const state: any = { data: { navigations: { byId: { [id]: navigation } } } };

      expect(Selectors.navigation(state, id)).to.eq(navigation);
    });
  });

  describe('isRefinementDeselected()', () => {
    it('should return false if navigation does not exist', () => {
      const navigation = stub(Selectors, 'navigation');

      expect(Selectors.isRefinementDeselected(<any>{}, 'my navigation', 4)).to.not.be.ok;
    });

    it('should return false if refinement is selected already', () => {
      const navigation = { selected: [4] };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.isRefinementDeselected(<any>{}, 'my navigation', 4)).to.not.be.ok;
    });

    it('should return true if refinement is not selected already', () => {
      const navigation = { selected: [8, 3] };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.isRefinementDeselected(<any>{}, 'my navigation', 4)).to.be.true;
    });
  });

  describe('isRefinementSelected()', () => {
    it('should return false if navigation does not exist', () => {
      const navigation = stub(Selectors, 'navigation');

      expect(Selectors.isRefinementSelected(<any>{}, 'my navigation', 4)).to.not.be.ok;
    });

    it('should return false if refinement is deselected already', () => {
      const navigation = { selected: [8, 3] };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.isRefinementSelected(<any>{}, 'my navigation', 4)).to.not.be.ok;
    });

    it('should return true if refinement is selected already', () => {
      const navigation = { selected: [4] };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.isRefinementSelected(<any>{}, 'my navigation', 4)).to.be.true;
    });
  });

  describe('hasMoreRefinements()', () => {
    it('should return false if navigation does not exist', () => {
      const navigation = stub(Selectors, 'navigation');

      expect(Selectors.hasMoreRefinements(<any>{}, 'my navigation')).to.not.be.ok;
    });

    it('should return false if navigation has no more refinements', () => {
      const navigationStub = stub(Selectors, 'navigation').returns({});

      expect(Selectors.hasMoreRefinements(<any>{}, 'my navigation')).to.not.be.ok;
    });

    it('should return true if navigation has more refinements', () => {
      const navigation = { more: true };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.hasMoreRefinements(<any>{}, 'my navigation')).to.be.true;
    });
  });
});
