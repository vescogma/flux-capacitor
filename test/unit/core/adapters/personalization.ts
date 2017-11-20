import Actions from '../../../../src/core/actions/index';
import ConfigAdapter from '../../../../src/core/adapters/configuration';
import Adapter from '../../../../src/core/adapters/personalization';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('Personalization Adapter', ({ expect, stub }) => {

  describe('extractBias()', () => {
    const config = {
      personalization: {
        realTimeBiasing: {
          attributes: {
            color: {}
          }
        }
      }
    };
    const refinement = {
      field: 'color',
      value: 'blue'
    };
    const action: any = {
      payload: {
        navigationId: 'a',
        index: 1
      }
    };
    const store: any = {};

    beforeEach(() => {
      stub(Selectors, 'config').returns(config);
    });

    it('should generate new timeStamp if variant and key do not exist', () => {
      const byId = {};
      const bias = {
        variant: refinement.field,
        key: refinement.value,
        bias: {
          lastUsed: 11111
        }
      };
      stub(Selectors, 'realTimeBiasesById').returns(byId);
      stub(Adapter, 'extractRefinement').returns(refinement);
      stub(Adapter, 'generateNewBias').returns({ lastUsed: 11111 });

      const result = Adapter.extractBias(action, store);

      expect(Selectors.config).to.be.calledWithExactly(store);
      expect(Selectors.realTimeBiasesById).to.be.calledWithExactly(store);
      expect(Adapter.extractRefinement).to.be.calledWithExactly(action, store);
      expect(result).to.deep.equal(bias);
      expect(Adapter.generateNewBias).to.have.been.called;
    });

    it('should overwrite the timestamp if variant and key already exist', () => {
      const byId = { color: { blue: { lastUsed: 11111 } } };
      const s = stub(Date, 'now').returns(20000000);
      const bias = {
        variant: refinement.field,
        key: refinement.value,
        bias: {
          lastUsed: 20000
        }
      };
      stub(Selectors, 'realTimeBiasesById').returns(byId);
      stub(Adapter, 'extractRefinement').returns(refinement);
      stub(Adapter, 'generateNewBias');

      const result = Adapter.extractBias(action, store);

      expect(result).to.deep.equal(bias);
      expect(Adapter.generateNewBias).to.not.have.been.called;
    });

    it('should generate new timestamp if variant exist and key does not exist', () => {
      const byId = { color: { red: { lastUsed: 11111 } } };
      const bias = {
        variant: refinement.field,
        key: refinement.value,
        bias: {
          lastUsed: 22222
        }
      };
      stub(Selectors, 'realTimeBiasesById').returns(byId);
      stub(Adapter, 'extractRefinement').returns(refinement);
      stub(Adapter, 'generateNewBias').returns({ lastUsed: 22222 });

      const result = Adapter.extractBias(action, store);

      expect(Adapter.generateNewBias).to.have.been.called;
      expect(result).to.deep.equal(bias);
    });

    it('should return null if the attribute is not in the config', () => {
      const newRefinement = {
        field: 'brand',
        value: 'Nike'
      };
      const byId = {};
      stub(Selectors, 'realTimeBiasesById').returns(byId);
      stub(Adapter, 'extractRefinement').returns(newRefinement);

      const result = Adapter.extractBias(action, store);

      expect(result).to.deep.equal(null);
    });
  });

  describe('extractRefinement', () => {
    const payload = { field: 'blue', value: 'green' };
    const state: any = { a: 1 };

    it('should extract bias for Actions.ADD_REFINEMENT', () => {
      const type = Actions.ADD_REFINEMENT;
      const newPayload = { ...payload, navigationId: payload.field };
      const action: any = { type, payload: newPayload };

      const refinement = Adapter.extractRefinement(action, state);

      expect(refinement).to.eql(payload);
    });

    it('should not extract bias for Actions.ADD_REFINEMENT if range is defined', () => {
      const type = Actions.ADD_REFINEMENT;
      const action: any = { type, payload: { range: true } };

      const refinement = Adapter.extractRefinement(action, state);

      expect(refinement).to.eql({ value: undefined, field: undefined });
    });

    it('should extract bias for Actions.SELECT_REFINEMENT', () => {
      const type = Actions.SELECT_REFINEMENT;
      const action: any = { type, payload: {} };
      stub(Selectors, 'refinementCrumb').returns(payload);

      const refinement = Adapter.extractRefinement(action, state);

      expect(refinement).to.eql(payload);
    });

    it('should return undefined if Action type is incorrect', () => {
      const type = 'aa';
      const action: any = { type, payload: {} };
      const refinementCrumb = stub(Selectors, 'refinementCrumb');

      const refinement = Adapter.extractRefinement(action, state);

      expect(refinement).to.eql({ value: undefined, field: undefined });
      expect(refinementCrumb).to.not.have.been.called;
    });
  });

  describe('generateNewBias()', () => {
    it('should generate new bias', () => {
      stub(Date, 'now').returns(1000000);

      const result = Adapter.generateNewBias();

      expect(result).to.deep.equal({ lastUsed: 1000000 / 1000 });
    });
  });

  describe('transformToBrowser()', () => {
    it('should return empty array if the state does not have allIds', () => {
      const state: any = { expiry: 2000 };
      const key = 'test';

      const result = Adapter.transformToBrowser(state, key);

      expect(result).to.deep.equal({
        allIds: []
      });
    });

    it('should return data in certain format when allIds exist in the state', () => {
      const state: any = {
        allIds: [{
          variant: 'color',
          key: 'blue',
        }],
        byId: {
          color: {
            blue: {
              lastUsed: 11111
            }
          }
        }
      };
      const key = 'test';

      const result = Adapter.transformToBrowser(state, key);

      expect(result).to.deep.equal({
        allIds: [{
          variant: 'color',
          key: 'blue',
          lastUsed: 11111
        }]
      });
    });
  });

  describe('transformFromBrowser()', () => {
    it('should filter allIds that are older than the set time', () => {
      const oneDayInSec = 86400;
      const now = Date.now() / 1000;
      const expiry = 30;
      const browserStorage = {
        allIds: [{ variant: 'color', key: 'blue', lastUsed: now - oneDayInSec * 5 },
                 { variant: 'brand', key: 'Shoe', lastUsed: now - oneDayInSec * 6 },
                 { variant: 'color', key: 'red', lastUsed: now - oneDayInSec * 21 },
                 { variant: 'brand', key: 'Nike', lastUsed: now - oneDayInSec * 33 }]
      };
      const biasFromBrowser = {
        allIds: [{ variant: 'color', key: 'blue' }, { variant: 'brand', key: 'Shoe'},
                 { variant: 'color', key: 'red' }],
        byId: {
          brand: {
            Shoe: {
              lastUsed: now - oneDayInSec * 6
            }
          },
          color: {
            blue: {
              lastUsed: now - oneDayInSec * 5
            },
            red: {
              lastUsed: now - oneDayInSec * 21
            }
          }
        }
      };
      const realTimeBiasing = 'real';
      const conf = { personalization: { realTimeBiasing } };
      const state: any = 's';
      const config = stub(Selectors, 'config').returns(conf);
      const extractExpiry = stub(ConfigAdapter, 'extractRealTimeBiasingExpiry').returns(expiry);
      const pruneBiases = stub(Adapter, 'pruneBiases').returnsArg(0);

      const result = Adapter.transformFromBrowser(browserStorage, state);

      expect(result).to.deep.equal(biasFromBrowser);
      expect(config).to.be.calledWithExactly(state);
      expect(extractExpiry).to.be.calledWithExactly(conf);
      expect(pruneBiases).to.be.calledTwice.and
        .calledWithExactly(biasFromBrowser.allIds, 'color', 2, realTimeBiasing).and
        .calledWithExactly(biasFromBrowser.allIds, 'brand', 1, realTimeBiasing);
    });
  });

  describe('pruneBiases()', () => {
    const arr = [
      { variant: 'a', key: 1},
      { variant: 'b', key: 2},
      { variant: 'b', key: 5},
      { variant: 'c', key: 3},
    ];

    it('shoud remove last element of a specific variant if it exists ', () => {
      const newArr = [
        { variant: 'a', key: 1 },
        { variant: 'b', key: 2 },
        { variant: 'c', key: 3 },
      ];

      const ret = Adapter.pruneBiases(<any>arr, 'b', 2, <any>{ attributes: {
        b: {
          maxBiases: 1
        }}});

      expect(ret).to.eql(newArr);
    });

    it('should remove last bias if too many total biases', () => {
      const newArr = [
        { variant: 'a', key: 1 },
        { variant: 'b', key: 2 },
        { variant: 'b', key: 5 },
      ];

      const ret = Adapter.pruneBiases(<any>arr, 'b', 2, <any>{
        attributes: {
          b: {
            maxBiases: 8
          },
        },
        maxBiases: 3
      });

      expect(ret).to.eql(newArr);
    });

    it('do nothing if too few biases', () => {
      const newArr = [
        { variant: 'a', key: 1 },
        { variant: 'b', key: 2 },
        { variant: 'b', key: 5 },
      ];

      const ret = Adapter.pruneBiases(<any>arr, 'b', 2, <any>{
        attributes: {
          b: {
            maxBiases: 84343
          },
        },
        maxBiases: 3094234
      });

      expect(ret).to.eql(arr);
    });
  });

  describe('convertBiasToSearch()', () => {
    it('should convert biasing to search API bias format', () => {
      const state: any = {};
      const allIds = [{ variant: 'color', key: 'blue' }, { variant: 'brand', key: 'Nike' }];
      const config = {
        personalization: {
          realTimeBiasing: {
            strength: 'Absolute_Decrease',
            attributes: {
              color: {
                strength: 'Absolute_Increase'
              }
            }
          }
        }
      };
      stub(Selectors, 'realTimeBiasesAllIds').returns(allIds);
      stub(Selectors, 'selectedRefinements').returns([]);
      stub(Selectors, 'config').returns(config);

      const result = Adapter.convertBiasToSearch(state);

      expect(result).to.deep.equal([{
        name: 'color',
        content: 'blue',
        strength: 'Absolute_Increase'
      }, {
        name: 'brand',
        content: 'Nike',
        strength: 'Absolute_Decrease'
      }]);
    });

    it('should exclude selected refinements', () => {
      const state: any = {};
      const allIds = [{ variant: 'color', key: 'blue' }, { variant: 'brand', key: 'Nike' }];
      const config = {
        personalization: {
          realTimeBiasing: {
            strength: 'Absolute_Decrease',
            attributes: {
              color: {
                strength: 'Absolute_Increase'
              }
            }
          }
        }
      };
      stub(Selectors, 'realTimeBiasesAllIds').returns(allIds);
      stub(Selectors, 'selectedRefinements').returns([
        { navigationName: 'color', type: 'Value', value: 'blue' },
        { navigationName: 'color', type: 'Value', value: 'red' }
      ]);
      stub(Selectors, 'config').returns(config);

      const result = Adapter.convertBiasToSearch(state);

      expect(result).to.deep.equal([{
        name: 'brand',
        content: 'Nike',
        strength: 'Absolute_Decrease'
      }]);
    });
  });
});
