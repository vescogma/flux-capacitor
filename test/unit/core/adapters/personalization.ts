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

    it('should generate new timeStamp if field and value do not exist', () => {
      const byId = {};
      const bias = {
        field: refinement.field,
        value: refinement.value,
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
      expect(result).to.eql(bias);
      expect(Adapter.generateNewBias).to.have.been.called;
    });

    it('should overwrite the timestamp if field and value already exist', () => {
      const byId = { color: { blue: { lastUsed: 11111 } } };
      const bias = {
        field: refinement.field,
        value: refinement.value,
        bias: {
          lastUsed: 20000
        }
      };
      stub(Selectors, 'realTimeBiasesById').returns(byId);
      stub(Adapter, 'extractRefinement').returns(refinement);
      stub(Adapter, 'generateNewBias');
      stub(Date, 'now').returns(20000000);

      const result = Adapter.extractBias(action, store);

      expect(result).to.eql(bias);
      expect(Adapter.generateNewBias).to.not.have.been.called;
    });

    it('should generate new timestamp if field exist and value does not exist', () => {
      const byId = { color: { red: { lastUsed: 11111 } } };
      const bias = {
        field: refinement.field,
        value: refinement.value,
        bias: {
          lastUsed: 22222
        }
      };
      stub(Selectors, 'realTimeBiasesById').returns(byId);
      stub(Adapter, 'extractRefinement').returns(refinement);
      stub(Adapter, 'generateNewBias').returns({ lastUsed: 22222 });

      const result = Adapter.extractBias(action, store);

      expect(Adapter.generateNewBias).to.have.been.called;
      expect(result).to.eql(bias);
    });

    it('should return null if the attribute is not in the config', () => {
      const newRefinement = {
        field: 'brand',
        value: 'Nike'
      };
      stub(Selectors, 'realTimeBiasesById').returns({});
      stub(Adapter, 'extractRefinement').returns(newRefinement);

      const result = Adapter.extractBias(action, store);

      expect(result).to.be.undefined;
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

      expect(result).to.eql({ lastUsed: 1000000 / 1000 });
    });
  });

  describe('transformToBrowser()', () => {
    it('should return data in certain format when allIds exist in the state', () => {
      const state: any = {
        allIds: [{
          field: 'color',
          value: 'blue',
        }],
        byId: {
          color: {
            blue: {
              lastUsed: 11111
            }
          }
        }
      };
      const result = Adapter.transformToBrowser(state, 'test');

      expect(result).to.eql({
        allIds: [{
          field: 'color',
          value: 'blue',
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
        allIds: [
          { field: 'color', value: 'blue', lastUsed: now - oneDayInSec * 5 },
          { field: 'brand', value: 'Shoe', lastUsed: now - oneDayInSec * 6 },
          { field: 'color', value: 'red', lastUsed: now - oneDayInSec * 21 },
          { field: 'brand', value: 'Nike', lastUsed: now - oneDayInSec * 33 }
        ]
      };
      const biasFromBrowser = {
        allIds: [
          { field: 'color', value: 'blue' }, { field: 'brand', value: 'Shoe'},
          { field: 'color', value: 'red' }
        ],
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
      const realTimeBiasing = {
        maxBiases: 8,
        attributes: {
          color: {
            maxBiases: 8,
          },
          brand: {
            maxBiases: 3,
          },
        }
      };
      const conf = { personalization: { realTimeBiasing } };
      const state: any = {};
      const config = stub(Selectors, 'config').returns(conf);
      const extractExpiry = stub(ConfigAdapter, 'extractRealTimeBiasingExpiry').returns(expiry);

      const result = Adapter.transformFromBrowser(browserStorage, state);

      expect(result).to.eql(biasFromBrowser);
      expect(config).to.be.calledWithExactly(state);
      expect(extractExpiry).to.be.calledWithExactly(conf);
    });

    it('should not add in biases if too many', () => {
      const oneDayInSec = 86400;
      const now = Date.now() / 1000;
      const expiry = 30;
      const browserStorage = {
        allIds: [
          { field: 'color', value: 'blue', lastUsed: now - oneDayInSec * 5 },
          { field: 'brand', value: 'Shoe', lastUsed: now - oneDayInSec * 6 },
          { field: 'color', value: 'red', lastUsed: now - oneDayInSec * 21 },
          { field: 'brand', value: 'Nike', lastUsed: now - oneDayInSec * 24 }
        ]
      };
      const biasFromBrowser = {
        allIds: [
          { field: 'color', value: 'blue' }, { field: 'brand', value: 'Shoe'},
          { field: 'color', value: 'red' }
        ],
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
      const realTimeBiasing = {
        maxBiases: 3,
        attributes: {
          color: {
            maxBiases: 8,
          },
          brand: {
            maxBiases: 8,
          },
        }
      };
      const conf = { personalization: { realTimeBiasing } };
      const state: any = {};
      const config = stub(Selectors, 'config').returns(conf);
      const extractExpiry = stub(ConfigAdapter, 'extractRealTimeBiasingExpiry').returns(expiry);

      const result = Adapter.transformFromBrowser(browserStorage, state);

      expect(result).to.eql(biasFromBrowser);
      expect(config).to.be.calledWithExactly(state);
      expect(extractExpiry).to.be.calledWithExactly(conf);
    });

    it('should not add in biases if too many of a brand', () => {
      const oneDayInSec = 86400;
      const now = Date.now() / 1000;
      const expiry = 30;
      const browserStorage = {
        allIds: [
          { field: 'color', value: 'blue', lastUsed: now - oneDayInSec * 5 },
          { field: 'brand', value: 'Shoe', lastUsed: now - oneDayInSec * 6 },
          { field: 'color', value: 'red', lastUsed: now - oneDayInSec * 21 },
          { field: 'brand', value: 'Nike', lastUsed: now - oneDayInSec * 24 }]
      };
      const biasFromBrowser = {
        allIds: [
          { field: 'color', value: 'blue' }, { field: 'brand', value: 'Shoe'},
          { field: 'brand', value: 'Nike' }
        ],
        byId: {
          brand: {
            Shoe: {
              lastUsed: now - oneDayInSec * 6
            },
            Nike: {
              lastUsed: now - oneDayInSec * 24,
            }
          },
          color: {
            blue: {
              lastUsed: now - oneDayInSec * 5
            }
          }
        }
      };
      const realTimeBiasing = {
        maxBiases: 8,
        attributes: {
          color: {
            maxBiases: 1,
          },
          brand: {
            maxBiases: 8,
          },
        }
      };
      const conf = { personalization: { realTimeBiasing } };
      const state: any = {};
      const config = stub(Selectors, 'config').returns(conf);
      const extractExpiry = stub(ConfigAdapter, 'extractRealTimeBiasingExpiry').returns(expiry);

      const result = Adapter.transformFromBrowser(browserStorage, state);

      expect(result).to.eql(biasFromBrowser);
      expect(config).to.be.calledWithExactly(state);
      expect(extractExpiry).to.be.calledWithExactly(conf);
    });
  });

  describe('pruneBiases()', () => {
    const arr: any[] = [
      { field: 'a', value: 1},
      { field: 'b', value: 2},
      { field: 'b', value: 5},
      { field: 'c', value: 3},
    ];

    it('shoud remove last element of a specific field if it exists ', () => {
      const newArr = [
        { field: 'a', value: 1 },
        { field: 'b', value: 2 },
        { field: 'c', value: 3 },
      ];

      const ret = Adapter.pruneBiases(arr, 'b', 2, <any>{
        attributes: {
          b: {
            maxBiases: 1
          }
        }
      });

      expect(ret).to.eql(newArr);
    });

    it('shoud remove last element of a specific field if too many ', () => {
      const newArr = [
        { field: 'a', value: 1 },
        { field: 'b', value: 2 },
        { field: 'c', value: 3 },
      ];

      const ret = Adapter.pruneBiases(arr, 'b', 2, <any>{
        attributeDefaultBiases: 1,
        attributes: {
          b: {
          }
        }
      });

      expect(ret).to.eql(newArr);
    });

    it('should remove last bias if too many total biases', () => {
      const newArr = [
        { field: 'a', value: 1 },
        { field: 'b', value: 2 },
        { field: 'b', value: 5 },
      ];

      const ret = Adapter.pruneBiases(arr, 'b', 2, <any>{
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
        { field: 'a', value: 1 },
        { field: 'b', value: 2 },
        { field: 'b', value: 5 },
      ];

      const ret = Adapter.pruneBiases(arr, 'b', 2, <any>{
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
      const allIds = [
        { field: 'color', value: 'blue' },
        { field: 'brand', value: 'Nike' },
        { field: 'other', value: 'f' }
      ];
      const config = {
        personalization: {
          realTimeBiasing: {
            strength: 'Absolute_Decrease',
            attributes: {
              color: {
                strength: 'Absolute_Increase'
              },
              brand: {}
            }
          }
        }
      };
      stub(Selectors, 'realTimeBiasesAllIds').returns(allIds);
      stub(Selectors, 'selectedRefinements').returns([]);
      stub(Selectors, 'config').returns(config);

      const result = Adapter.convertBiasToSearch(state);

      expect(result).to.eql([{
        name: 'color',
        content: 'blue',
        strength: 'Absolute_Increase'
      },{
        name: 'brand',
        content: 'Nike',
        strength: 'Absolute_Decrease'
      }]);
    });

    it('should exclude selected refinements', () => {
      const state: any = {};
      const allIds = [{ field: 'color', value: 'blue' }, { field: 'brand', value: 'Nike' }];
      const config = {
        personalization: {
          realTimeBiasing: {
            strength: 'Absolute_Decrease',
            attributes: {
              color: {
                strength: 'Absolute_Increase'
              },
              brand: {
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

      expect(result).to.eql([{
        name: 'brand',
        content: 'Nike',
        strength: 'Absolute_Decrease'
      }]);
    });
  });
});
