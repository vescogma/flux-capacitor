import ConfigurationAdapter from '../../../../src/core/adapters/configuration';
import RecommendationsAdapter from '../../../../src/core/adapters/recommendations';
import suite from '../../_suite';

suite('Recommendations Adapter', ({ expect, stub }) => {

  describe('buildUrl()', () => {
    it('should build the request URL', () => {
      // tslint:disable-next-line max-line-length
      expect(RecommendationsAdapter.buildUrl('myCustomer', 'a', 'b')).to.eq('https://myCustomer.groupbycloud.com/wisdom/v2/public/recommendations/a/_getb');
    });
  });

  describe('pinNavigations() ', () => {
    it('should pin navigations', () => {
      const results: any = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      const extractNavigationsPinned = stub(ConfigurationAdapter, 'extractNavigationsPinned')
        .returns(['b']);

      expect(RecommendationsAdapter.pinNavigations({ results, config: <any>{} }))
        .to.eql([{ name: 'b' }, { name: 'a' }, { name: 'c' }]);
    });
  });

  describe('sortAndPinNavigations() ', () => {
    it('should sort and pin navigations and refinements if conditions are met', () => {
      const sortNavigations = stub(RecommendationsAdapter, 'sortNavigations');
      const pinNavigations = stub(RecommendationsAdapter, 'pinNavigations');
      const sortRefinements = stub(RecommendationsAdapter, 'sortRefinements');
      const pinRefinements = stub(RecommendationsAdapter, 'pinRefinements');

      stub(ConfigurationAdapter, 'extractINav').returns({
        navigations: {
          sort: true,
          pinned: []
        },
        refinements: {
          sort: true,
          pinned: true
        }
      });
      RecommendationsAdapter.sortAndPinNavigations([], [], <any>undefined);

      expect(sortNavigations).to.be.calledOnce;
      expect(pinNavigations).to.be.calledOnce;
      expect(sortRefinements).to.be.calledOnce;
      expect(pinRefinements).to.be.calledOnce;
    });

    it('should not sort nor pin navigations and refinements if conditions are not met', () => {
      const sortNavigations = stub(RecommendationsAdapter, 'sortNavigations');
      const pinNavigations = stub(RecommendationsAdapter, 'pinNavigations');
      const sortRefinements = stub(RecommendationsAdapter, 'sortRefinements');
      const pinRefinements = stub(RecommendationsAdapter, 'pinRefinements');

      stub(ConfigurationAdapter, 'extractINav').returns({
        navigations: {
          sort: false,
          pinned: false
        },
        refinements: {
          sort: false,
          pinned: false
        }
      });

      RecommendationsAdapter.sortAndPinNavigations([], [], <any>undefined);

      expect(sortNavigations).not.to.be.called;
      expect(pinNavigations).not.to.be.called;
      expect(sortRefinements).not.to.be.called;
      expect(pinRefinements).not.to.be.called;
    });

  });

  describe('pinRefinements()', () => {
    it('should pin refinements', () => {
      const results: any = [{
        name: 'a',
        refinements: [{ value: '1' }, { value: '2' }, { value: '3' }]
      }, {
        name: 'b',
        refinements: [{ value: '1' }, { value: '2' }, { value: '3' }]
      }];
      const extractRefinementsPinned = stub(ConfigurationAdapter, 'extractRefinementsPinned')
        .returns({ a: ['2', '3'] });
      stub(ConfigurationAdapter, 'extractRefinementsSort').returns(true);

      expect(RecommendationsAdapter.pinRefinements({ results, config: <any>{} }))
        .to.eql([{
          name: 'a',
          refinements: [{ value: '2' }, { value: '3' }, { value: '1' }]
        }, {
          name: 'b',
          refinements: [{ value: '1' }, { value: '2' }, { value: '3' }]
        }]);
    });
  });

  describe('sortRefinements()', () => {
    it('should sort refinements when sort is an array', () => {
      const results: any = [{
        name: 'a',
        refinements: [{ value: '1' }, { value: '2' }, { value: '3' }]
      }, {
        name: 'b',
        refinements: [{ value: '1' }, { value: '2' }, { value: '3' }]
      }];
      const navigations: any = [{
        name: 'a',
        values: [{ value: '3' }, { value: '1' }]
      }, {
        name: 'b',
        values: [{ value: '3' }, { value: '2' }]
      }];
      stub(ConfigurationAdapter, 'extractRefinementsSort').returns(['a']);

      expect(RecommendationsAdapter.sortRefinements(<any>{ results, navigations, config: 1 }))
        .to.eql([{
          name: 'a',
          refinements: [{ value: '3' }, { value: '1' }, { value: '2' }]
        }, {
          name: 'b',
          refinements: [{ value: '1' }, { value: '2' }, { value: '3' }]
        }]
        );
    });
  });
});
