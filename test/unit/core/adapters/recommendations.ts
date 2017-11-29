import ConfigurationAdapter from '../../../../src/core/adapters/configuration';
import RecommendationsAdapter from '../../../../src/core/adapters/recommendations';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('Recommendations Adapter', ({ expect, stub }) => {

  describe('buildUrl()', () => {
    it('should build the request URL', () => {
      // tslint:disable-next-line max-line-length
      expect(RecommendationsAdapter.buildUrl('myCustomer', 'a', 'b')).to.eq('https://myCustomer.groupbycloud.com/wisdom/v2/public/recommendations/a/_getb');
    });
  });

  describe('buildBody()', () => {
    it('should build the body', () => {
      const body: any = { a: 1 };

      expect(RecommendationsAdapter.buildBody(body)).to.eql({
        method: 'POST',
        body: JSON.stringify(body),
      });
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
        }]);
    });
  });

  describe('pastPurchaseBiasing()', () => {
    const idField = 'productId';
    const biasInfluence = 8;
    const biasStrength = 2;
    const state: any = {
      data: {
        present: {
          pastPurchases: {
            skus: [{ sku: 'a' }, { sku: 'b' }, { sku: 'c' }]
          }
        }
      }
    };

    it('should generate biases from past purchase product SKUs', () => {
      const config: any = {
        recommendations: {
          idField,
          pastPurchases: { biasStrength, biasInfluence, biasCount: 10 }
        }
      };
      stub(Selectors, 'config').returns(config);

      const biasing = RecommendationsAdapter.pastPurchaseBiasing(state);

      expect(biasing).to.eql({
        bringToTop: [],
        augmentBiases: true,
        influence: biasInfluence,
        biases: [
          { name: idField, content: 'a', strength: biasStrength },
          { name: idField, content: 'b', strength: biasStrength },
          { name: idField, content: 'c', strength: biasStrength },
        ]
      });
    });

    it('should limit generated biases by biasCount', () => {
      const config: any = {
        recommendations: {
          idField,
          pastPurchases: { biasStrength, biasInfluence, biasCount: 2 }
        }
      };
      stub(Selectors, 'config').returns(config);

      const biasing = RecommendationsAdapter.pastPurchaseBiasing(state);

      expect(biasing.biases).to.eql([
        { name: idField, content: 'a', strength: biasStrength },
        { name: idField, content: 'b', strength: biasStrength }
      ]);
    });
  });

  describe('addLocationToRequest()', () => {
    it('should add matchExact if location enabled and a location is present', () => {
      const config = { minSize: 10, distance: '1km' };
      const configAdapter = stub(ConfigurationAdapter, 'extractLocation').returns(config);
      const latitude = 30.401;
      const longitude = -132.140;
      const location = { latitude, longitude };
      const locationSelector = stub(Selectors, 'location').returns(location);
      const request: any = { a: 1, b: 2, c: 3 };
      const returned = {
        minSize: config.minSize,
        sequence: [
          {
          ...request,
          matchExact: {
            and: [{
              visit: {
                generated: {
                  geo: {
                    location: {
                      distance: config.distance,
                      center: {
                        lat: latitude,
                        lon: longitude
                      }
                    }
                  }
                }
              }
            }]
          }
        },
          request,
        ]
      };
      const state: any = { d: 4 };
      stub(Selectors,'config').returns(config);

      const added = RecommendationsAdapter.addLocationToRequest(request, state);

      expect(added).to.eql(returned);
      expect(configAdapter).to.be.calledWithExactly(config);
      expect(locationSelector).to.be.calledWithExactly(state);
    });

    it('should return original request if location is not present', () => {
      const config = { enabled: true, distance: '1km' };
      const configAdapter = stub(ConfigurationAdapter, 'extractLocation').returns(config);
      const location = { latitude: 30.401, longitude: -132.140 };
      const locationSelector = stub(Selectors, 'location').returns(undefined);
      const request: any = { a: 1, b: 2, c: 3 };
      const state: any = { d: 4};
      stub(Selectors,'config').returns(config);

      const added = RecommendationsAdapter.addLocationToRequest(request, state);

      expect(added).to.eql(request);
    });
  });

  describe('pastPurchaseProducts', () => {
    it('should create an object mapping product.id to each product', () => {
      const product1 = { data: { id: '1' } };
      const product2 = { data: { id: '2' } };
      const product3 = { data: { id: '3' } };
      const products: any = [product1, product2, product3];

      expect(RecommendationsAdapter.pastPurchaseProducts(products)).to.eql({
        1: product1,
        2: product2,
        3: product3,
      });
    });
  });

  describe('sku sorts', () => {
    const product1 = { quantity: 1, lastPurchased: 20 };
    const product2 = { quantity: 3, lastPurchased: 10 };
    const product3 = { quantity: 2, lastPurchased: 30 };
    const oldArr: any = [product1, product2, product3];

    describe('sortSkusMostPurchased', () => {
      it('should sort by quantity', () => {
        const newArr = [product2, product3, product1];

        expect(RecommendationsAdapter.sortSkusMostPurchased(oldArr)).to.eql(newArr);
      });
    });

    describe('sortSkusMostRecent', () => {
      it('should sort by lastPurchased', () => {
        expect(RecommendationsAdapter.sortSkusMostRecent(oldArr)).to.eql([product3, product1, product2]);
      });
    });
  });

  describe('pastPurchaseNavigations()', () => {
    it('should apply config navigation restrictions to given navigations', () => {
      const config: any = 'conf';
      const navigations = {
        cat1: [],
        cat3: ['a', 'c'],
        cat4: [{ value: 'a', display: 'asdf'}, { value: 'no', display: 'not' }],
        cat6: ['j', { value: 'e', display: 'oh' }, 'f'],
      };
      const prefiltered: any = [{
        name: 'cat1',
        a: 1,
        b: 2,
        c: 2,
        refinements: [1,2,3],
      }, {
        name: 'cat2',
        a: 1,
        refinements: [2],
      }, {
        name: 'cat3',
        c: 5,
        refinements: [{ value: 'a' }, { value: 'b' }, { value: 'c' }, { high: 1, low: 4 }],
      }, {
        name: 'cat4',
        j: 0,
        refinements: [{ value: 'a' }, { value: 'j' }, { value: 'no' }, { value: 'h' }]
      }, {
        name: 'cat5',
        i: 1,
        refinements: [3,4,5,6,]
      }, {
        name: 'another',
        p: 6,
        refinements: [4,5,6,7]
      }];
      const extract = stub(ConfigurationAdapter, 'extractPastPurchaseNavigations').returns(navigations);

      const returned = RecommendationsAdapter.pastPurchaseNavigations(config, prefiltered);

      expect(returned).to.eql([
        prefiltered[0], {
          ...prefiltered[2],
          refinements: [{ value: 'a' }, { value: 'c' }],
        }, {
          ...prefiltered[3],
          refinements: [{ value: 'a', display: 'asdf' }, { value: 'no', display: 'not' }],
        },]);
    });
  });
});
