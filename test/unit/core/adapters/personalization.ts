import ConfigAdapter from '../../../../src/core/adapters/configuration';
import Adapter from '../../../../src/core/adapters/personalization';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('Personalization Adapter', ({ expect, stub }) => {

  describe('extractBias()', () => {
    let config = {
      personalization: {
        realTimeBiasing: {
          attributes: {
            color: 'blue'
          }
        }
      }
    };

    let byId = {};

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
      stub(Selectors, 'realTimeBiasesById').returns(byId);
    });

    it('should generate new timeStamp if variant and key do not exist', () => {

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

    });

    it('should overwrite the timestamp if variant and key already exist', () => {
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
      expect(result).to.deep.equal(bias);
    });

    it('should return null if the attribute is not in the config', () => {
      const newRefinement = {
        field: 'brand',
        value: 'Nike'
      };

      stub(Selectors, 'refinementCrumb').returns(newRefinement);

      const result = Adapter.extractBias(action, store);
      expect(result).to.deep.equal(null);
    });
  });

  describe('generateNewBias()', () => {
    it('should generate lastUsed timestamp', () => {

    });
  })

  describe('transformToBrowser()', () => {
    it('should create empty array if there are no allIds', () => {
      const state = {
        globalExpiry: 2000,
      };
    });
  });
});