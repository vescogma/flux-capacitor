import Adapter from '../../../../src/core/adapters/refinements';
import Search from '../../../../src/core/adapters/search';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('Refinements Adapter', ({ expect, stub }) => {

  describe('mergeRefinements()', () => {
    it('should merge refinements', () => {
      const name = 'brand';
      const refinements = ['a', 'b', 'c', 'd'];
      const state: any = { e: 'f' };
      const navigation = { range: false, refinements: ['g', 'h', 'i', 'j'], selected: [1, 3] };
      const navigationSelector = stub(Selectors, 'navigation').returns(navigation);
      const extractRefinement = stub(Search, 'extractRefinement').returns('x');
      const refinementsMatch = stub(Search, 'refinementsMatch').returns(true);

      const merged = Adapter.mergeRefinements(<any>{ navigation: { name, refinements } }, state);

      expect(merged).to.eql({
        navigationId: name,
        refinements: ['x', 'x', 'x', 'x'],
        selected: [0, 1, 2, 3]
      });
      expect(navigationSelector).to.be.calledWith(state, name);
      expect(extractRefinement).to.have.callCount(4)
        .and.calledWith('a')
        .and.calledWith('b')
        .and.calledWith('d')
        .and.calledWith('c');
      expect(refinementsMatch).to.have.callCount(4)
        .and.calledWith('x', 'h', 'Value');
    });

    it('should not select non-matching refinements', () => {
      const name = 'brand';
      const refinements = ['a', 'b', 'c', 'd'];
      const state: any = { e: 'f' };
      const navigation = { range: false, refinements: ['g', 'h', 'i', 'j'], selected: [1, 3] };
      const navigationSelector = stub(Selectors, 'navigation').returns(navigation);
      const extractRefinement = stub(Search, 'extractRefinement').returns('x');
      const refinementsMatch = stub(Search, 'refinementsMatch').returns(false);

      const merged = Adapter.mergeRefinements(<any>{ navigation: { name, refinements } }, state);

      expect(merged).to.eql({
        navigationId: name,
        refinements: ['x', 'x', 'x', 'x'],
        selected: []
      });
      expect(navigationSelector).to.be.calledWith(state, name);
      expect(extractRefinement).to.have.callCount(4)
        .and.calledWith('a')
        .and.calledWith('b')
        .and.calledWith('d')
        .and.calledWith('c');
      expect(refinementsMatch).to.have.callCount(8)
        .and.calledWith('x', 'h', 'Value');
    });

    it('should merge range refinements', () => {
      const name = 'brand';
      const refinements = ['a', 'b', 'c', 'd'];
      const state: any = { e: 'f' };
      const navigation = { range: true, refinements: ['g', 'h', 'i', 'j'], selected: [1, 3] };
      const navigationSelector = stub(Selectors, 'navigation').returns(navigation);
      const extractRefinement = stub(Search, 'extractRefinement').returns('x');
      const refinementsMatch = stub(Search, 'refinementsMatch').returns(true);

      const merged = Adapter.mergeRefinements(<any>{ navigation: { name, refinements } }, state);

      expect(merged).to.eql({
        navigationId: name,
        refinements: ['x', 'x', 'x', 'x'],
        selected: [0, 1, 2, 3]
      });
      expect(navigationSelector).to.be.calledWith(state, name);
      expect(extractRefinement).to.have.callCount(4)
        .and.calledWith('a')
        .and.calledWith('b')
        .and.calledWith('d')
        .and.calledWith('c');
      expect(refinementsMatch).to.have.callCount(4)
        .and.calledWith('x', 'h', 'Range');
    });
  });
});
