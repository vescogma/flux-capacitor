import PageAdapter from '../../../../src/core/adapters/page';
import Adapter from '../../../../src/core/adapters/search';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('SearchAdapter', ({ expect, stub }) => {

  describe('extractQuery()', () => {
    it('should convert results to query structure', () => {
      const results: any = {
        correctedQuery: 'apple pie',
        didYouMean: ['a', 'b'],
        relatedQueries: ['c', 'd'],
        rewrites: ['e', 'f'],
      };
      const linkMapper = stub().returns('x');

      const query = Adapter.extractQuery(results, linkMapper);

      expect(query).to.eql({
        corrected: 'apple pie',
        didYouMean: ['x', 'x'],
        related: ['x', 'x'],
        rewrites: ['e', 'f'],
      });
      expect(linkMapper).to.be.calledWith('a');
      expect(linkMapper).to.be.calledWith('b');
      expect(linkMapper).to.be.calledWith('c');
      expect(linkMapper).to.be.calledWith('d');
    });
  });

  describe('extractRefinement()', () => {
    it('should return range refinement', () => {
      const refinement = Adapter.extractRefinement(<any>{
        type: 'Range',
        low: 20,
        high: 30,
        count: 50,
        a: 'b',
        c: 'd',
      });

      expect(refinement).to.eql({ low: 20, high: 30, total: 50 });
    });

    it('should return value refinement', () => {
      const refinement = Adapter.extractRefinement(<any>{
        type: 'Value',
        value: 'Nike',
        count: 23,
        a: 'b',
        c: 'd',
      });

      expect(refinement).to.eql({ value: 'Nike', total: 23 });
    });
  });

  describe('extractNavigationSort()', () => {
    it('should return an equivalent sort object', () => {
      expect(Adapter.extractNavigationSort('Count_Ascending')).to.eql({ field: 'count' });
      expect(Adapter.extractNavigationSort('Count_Descending')).to.eql({ field: 'count', descending: true });
      expect(Adapter.extractNavigationSort('Value_Ascending')).to.eql({ field: 'value' });
      expect(Adapter.extractNavigationSort('Value_Descending')).to.eql({ field: 'value', descending: true });
    });
  });

  describe('extractNavigation()', () => {
    it('should convert navigation to storefront navigation structure', () => {
      const navigation: any = {
        name: 'brand',
        displayName: 'Brand',
        moreRefinements: true,
        or: true,
        refinements: ['a', 'b'],
        sort: { c: 'd' },
      };
      const sort = { e: 'f' };
      const extractRefinement = stub(Adapter, 'extractRefinement').returns('x');
      const extractNavigationSort = stub(Adapter, 'extractNavigationSort').returns(sort);

      const extracted = Adapter.extractNavigation(navigation);

      expect(extracted).to.eql({
        field: 'brand',
        label: 'Brand',
        more: true,
        or: true,
        range: false,
        refinements: ['x', 'x'],
        selected: [],
        sort,
      });
      expect(extractRefinement).to.be.calledWith('a');
      expect(extractRefinement).to.be.calledWith('b');
      expect(extractNavigationSort).to.be.calledWith({ c: 'd' });
    });

    it('should ignore sort if not truthy', () => {
      const navigation: any = { refinements: [] };
      const extractNavigationSort = stub(Adapter, 'extractNavigationSort');

      const extracted = Adapter.extractNavigation(navigation);

      expect(extracted.sort).to.be.undefined;
      expect(extractNavigationSort.called).to.be.false;
    });
  });

  describe('refinementsMatch()', () => {
    it('should match value refinements', () => {
      const lhs: any = { type: 'Value', value: 'blue', a: 'b' };
      const rhs: any = { type: 'Value', value: 'blue', c: 'd' };

      expect(Adapter.refinementsMatch(lhs, rhs)).to.be.true;
    });

    it('should not match value refinements', () => {
      const lhs: any = { type: 'Value', value: 'blue' };
      const rhs: any = { type: 'Value', value: 'black' };

      expect(Adapter.refinementsMatch(lhs, rhs)).to.be.false;
    });

    it('should match range refinements', () => {
      const lhs: any = { type: 'Range', low: 20, high: 30, a: 'b' };
      const rhs: any = { type: 'Range', low: 20, high: 30, c: 'd' };

      expect(Adapter.refinementsMatch(lhs, rhs)).to.be.true;
    });

    it('should not match range refinements', () => {
      const lhs: any = { type: 'Range', low: 20, high: 40 };
      const rhs: any = { type: 'Range', low: 10, high: 30 };

      expect(Adapter.refinementsMatch(lhs, rhs)).to.be.false;
    });
  });

  describe('mergeSelectedRefinements()', () => {
    it('should set selected on available navigation', () => {
      const available: any = { refinements: ['a', 'b', 'c', 'd'] };
      const selected: any = { refinements: ['a', 'd'] };
      const refinementsMatch = stub(Adapter, 'refinementsMatch')
        .callsFake((lhs, rhs) => lhs === rhs);

      Adapter.mergeSelectedRefinements(available, selected);

      expect(available.selected).to.eql([0, 3]);
      expect(refinementsMatch).to.be.calledWith('a', 'a')
        .and.calledWith('a', 'd')
        .and.calledWith('b', 'd')
        .and.calledWith('c', 'd')
        .and.calledWith('d', 'd');
    });

    it('should add selected value refinements', () => {
      const available: any = { refinements: ['a', 'b', 'c', 'd'] };
      const selected: any = { refinements: [{ value: 'e', total: 10 }, { value: 'f', total: 13 }] };
      stub(Adapter, 'refinementsMatch').returns(false);

      Adapter.mergeSelectedRefinements(available, selected);

      expect(available.refinements).to.eql([
        'a', 'b', 'c', 'd',
        { value: 'e', total: 10 },
        { value: 'f', total: 13 }
      ]);
      expect(available.selected).to.eql([4, 5]);
    });

    it('should add selected range refinements', () => {
      const available: any = { range: true, refinements: ['a', 'b', 'c', 'd'] };
      const selected: any = { refinements: [{ low: 3, high: 4, total: 10 }, { low: 7, high: 9, total: 13 }] };
      stub(Adapter, 'refinementsMatch').returns(false);

      Adapter.mergeSelectedRefinements(available, selected);

      expect(available.refinements).to.eql([
        'a', 'b', 'c', 'd',
        { low: 3, high: 4, total: 10 },
        { low: 7, high: 9, total: 13 }
      ]);
      expect(available.selected).to.eql([4, 5]);
    });
  });

  describe('combineNavigations()', () => {
    it('should merge selected and available refinements', () => {
      const availableNavigation = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      const extractedAvailable = [
        { name: 'A', refinements: [4, 5] },
        { name: 'B', refinements: [6, 7] },
        { name: 'C', refinements: [8, 9] }
      ];
      const selectedNavigation = [{ name: 'b' }, { name: 'd' }];
      const extractNavigation = stub(Adapter, 'extractNavigation').callsFake((nav) => {
        if (availableNavigation.includes(nav)) {
          return extractedAvailable[availableNavigation.indexOf(nav)];
        } else {
          return { name: 'x', refinements: [1, 2, 3] };
        }
      });
      const mergeSelectedRefinements = stub(Adapter, 'mergeSelectedRefinements');

      const merged = Adapter.combineNavigations(<any>{ availableNavigation, selectedNavigation });

      expect(merged).to.eql([
        ...extractedAvailable,
        { name: 'x', refinements: [1, 2, 3], selected: [0, 1, 2] },
      ]);
      expect(mergeSelectedRefinements).to.be.calledWith(extractedAvailable[1], selectedNavigation[0]);
      expect(extractNavigation).to.have.callCount(4)
        .and.calledWith(availableNavigation[0])
        .and.calledWith(availableNavigation[1])
        .and.calledWith(availableNavigation[2])
        .and.calledWith(selectedNavigation[1]);
    });
  });

  describe('extractZone()', () => {
    it('should extract a content zone', () => {
      const content = 'Canada Day Sale!';
      const name = 'my zone';
      const zone: any = { type: 'Content', name, content };

      expect(Adapter.extractZone(zone)).to.eql({ type: 'content', name, content });
    });

    it('should extract a rich content zone', () => {
      const content = 'Canada Day Sale!';
      const name = 'my zone';
      const zone: any = { type: 'Rich_Content', name, richContent: content };

      expect(Adapter.extractZone(zone)).to.eql({
        type: 'rich_content',
        name,
        content
      });
    });

    it('should extract a record zone', () => {
      const records = [{ allMeta: { a: 'b' } }, { allMeta: { c: 'd' } }];
      const name = 'my zone';
      const query = 'red leather';
      const zone: any = { type: 'Record', name, records, query };

      expect(Adapter.extractZone(zone)).to.eql({
        type: 'products',
        name,
        query,
        products: [{ a: 'b' }, { c: 'd' }],
      });
    });
  });

  describe('extractTemplate()', () => {
    it('should convert template structure', () => {
      const template: any = {
        name: 'banner',
        ruleName: 'my rule',
        zones: {
          'zone 1': 'a',
          'zone 2': 'b',
        },
      };
      const extractZone = stub(Adapter, 'extractZone').returns('x');

      expect(Adapter.extractTemplate(template)).to.eql({
        name: 'banner',
        rule: 'my rule',
        zones: {
          'zone 1': 'x',
          'zone 2': 'x',
        },
      });
      expect(extractZone).to.be.calledWith('a')
        .and.calledWith('b');
    });
  });

  describe('extractPage()', () => {
    it('should build page information', () => {
      const current = 4;
      const previous = 7;
      const next = 2;
      const last = 80;
      const from = 17;
      const to = 30;
      const size = 21;
      const total = 999;
      const state: any = { data: { page: { current } } };
      const pageInfo = { c: 'd' };
      const pageSize = stub(Selectors, 'pageSize').returns(size);
      const finalPage = stub(PageAdapter, 'finalPage').returns(last);
      const fromResult = stub(PageAdapter, 'fromResult').returns(from);
      const toResult = stub(PageAdapter, 'toResult').returns(to);
      const nextPage = stub(PageAdapter, 'nextPage').returns(next);
      const previousPage = stub(PageAdapter, 'previousPage').returns(previous);

      const page = Adapter.extractPage(state, total);

      expect(page).to.eql({
        from,
        to,
        last,
        next,
        previous
      });
      expect(pageSize).to.be.calledWith(state);
      expect(finalPage).to.be.calledWith(size, total);
      expect(fromResult).to.be.calledWith(current, size);
      expect(toResult).to.be.calledWith(current, size, total);
      expect(nextPage).to.be.calledWith(current, last);
      expect(previousPage).to.be.calledWith(current);
    });
  });

  describe('extractProduct()', () => {
    it('should return the allMeta property', () => {
      const allMeta = { a: 'b' };

      expect(Adapter.extractProduct({ allMeta })).to.eq(allMeta);
    });
  });
});
