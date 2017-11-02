import Adapter from '../../../../src/core/adapters/personalization';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('Personalization Adapter', ({ expect, stub }) => {
  
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
      })
    });
  })

  describe('transformFromBrowser()', () => {
    it('should filter allIds that are older than the set time', () => {
      const oneDayInSec = 86400;
      const key = 'test';
      const now = Date.now()/1000;
      const browserStorage = {
        expiry: oneDayInSec * 30,
        allIds: [{ variant: 'color', key: 'blue', lastUsed: now - oneDayInSec * 5 }, 
        { variant: 'color', key: 'red', lastUsed: now - oneDayInSec * 21 }, 
        { variant: 'brand', key: 'Nike', lastUsed: now - oneDayInSec * 33 }]
      }

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
      }
      expect(result).to.deep.equal(biasFromBrowser);
    })
  })

  describe('convertBiasToSearch()', () => {
    it('should convert biasing to search API bias format', () => {
      const state: any = {};
      const allIds = [{ variant: 'color', key: 'blue' }, { variant: 'brand', key: 'Nike' }]
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
      }
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
      }])
    })
  })
});