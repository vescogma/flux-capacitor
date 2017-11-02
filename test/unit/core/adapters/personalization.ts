import Adapter from '../../../../src/core/adapters/personalization';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('Personalization Adapter', ({ expect, stub }) => {

  describe('extractBias()', () => {
    let config = {
      personalization: {
        realTimeBiasing: {
          attributes: {
            color: {}
          }
        }
      }
    };

    let refinement = {
      field: 'color',
      value: 'blue'
    };

    let action: any = {
      payload: {
        navigationId: 'a',
        index: 1
      }
    };

    let store: any = {};

    beforeEach(() => {
      stub(Selectors, 'config').returns(config);
    });

    it('should generate new timeStamp if variant and key do not exist', () => {
      const byId = {};
      stub(Selectors, 'realTimeBiasesById').returns(byId);
      stub(Selectors, 'refinementCrumb').returns(refinement);
      stub(Adapter, 'generateNewBias').returns({ lastUsed: 11111 });

      const bias = {
        variant: refinement.field,
        key: refinement.value,
        bias: {
          lastUsed: 11111
        }
      };

      const result = Adapter.extractBias(action, store);

      expect(Selectors.config).to.be.calledWithExactly(store);
      expect(Selectors.realTimeBiasesById).to.be.calledWithExactly(store);
      expect(Selectors.refinementCrumb).to.be.calledWithExactly(
        store, action.payload.navigationId, action.payload.index
      );
      expect(result).to.deep.equal(bias);
      expect(Adapter.generateNewBias).to.have.been.called;

    });

    it('should overwrite the timestamp if variant and key already exist', () => {
      const byId = { color: { blue: { lastUsed: 11111 }}};
      stub(Selectors, 'realTimeBiasesById').returns(byId);
      stub(Selectors, 'refinementCrumb').returns(refinement);
      stub(Adapter, 'generateNewBias');
      const s = stub(Date, 'now').returns(20000000);
      const bias = {
        variant: refinement.field,
        key: refinement.value,
        bias: {
          lastUsed: 20000
        }
      };

      const result = Adapter.extractBias(action, store);
      expect(result).to.deep.equal(bias);
      expect(Adapter.generateNewBias).to.not.have.been.called;
      //s.restore();
    });

    it('should generate new timestamp if variant exist and key does not exist', () => {
      const byId = { color: { red: { lastUsed: 11111 }}};
      stub(Selectors, 'realTimeBiasesById').returns(byId);
      stub(Selectors, 'refinementCrumb').returns(refinement);
      stub(Adapter, 'generateNewBias').returns({ lastUsed: 22222 });
      const bias = {
        variant: refinement.field,
        key: refinement.value,
        bias: {
          lastUsed: 22222
        }
      };

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
      stub(Selectors, 'refinementCrumb').returns(newRefinement);

      const result = Adapter.extractBias(action, store);
      expect(result).to.deep.equal(null);
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
      const state: any = {
        globalExpiry: 2000
      };
      const key = 'test';
      const result = Adapter.transformToBrowser(state, key);
      expect(result).to.deep.equal({
        expiry: 2000,
        allIds: []
      });
    });

    it('should return data in certain format when allIds exist in the state', () => {
      const state: any = {
        globalExpiry: 2000,
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
        expiry: 2000,
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
      const key = 'test';
      const now = Date.now() / 1000;
      const browserStorage = {
        expiry: oneDayInSec * 30,
        allIds: [{ variant: 'color', key: 'blue', lastUsed: now - oneDayInSec * 5 },
        { variant: 'color', key: 'red', lastUsed: now - oneDayInSec * 21 },
        { variant: 'brand', key: 'Nike', lastUsed: now - oneDayInSec * 33 }]
      };

      const result = Adapter.transformFromBrowser(browserStorage, key);
      const biasFromBrowser = {
        globalExpiry: oneDayInSec * 30,
        allIds: [{ variant: 'color', key: 'blue' }, { variant: 'color', key: 'red' }],
        byId: {
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
      expect(result).to.deep.equal(biasFromBrowser);
    });
  });

  describe('convertBiasToSearch()', () => {
    it('should convert biasing to search API bias format', () => {
      const state: any = {};
      const allIds = [{ variant: 'color', key: 'blue' }, { variant: 'brand', key: 'Nike' }];
      const config = {
        personalization: {
          realTimeBiasing: {
            globalStrength: 'Absolute_Decrease',
            attributes: {
              color: {
                strength: 'Absolute_Increase'
              }
            }
          }
        }
      };
      stub(Selectors, 'realTimeBiasesAllIds').returns(allIds);
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
  });
});