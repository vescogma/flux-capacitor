import Actions from '../actions';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';

namespace Personalization {
  export const extractBias = ({ payload }: Actions.SelectRefinement, store: Store.State) => {
    const config = Selectors.config(store).personalization.realTimeBiasing;
    const byId = Selectors.realTimeBiasesById(store);
    const { value, field } = Selectors.refinementCrumb(store, payload.navigationId, payload.index);

    // TODO: check if we need to bias for it, we're not using config at all
    if (!config.attributes[field]) {
      return null;
    }
    return {
      variant: field,
      key: value,
      bias: (byId[field] && byId[field][value]) ? {
        ...byId[field][value],
        lastUsed: Math.floor(Date.now() / 1000)
      } : generateNewBias()
    };
  };

  export const generateNewBias = () => ({
    lastUsed: Math.floor(Date.now() / 1000)
  });

  // tslint:disable-next-line max-line-length
  export const transformToBrowser = (state: Store.Personalization.RealTimeBiasing, reducerKey): BrowserStorageState => ({
    expiry: state.globalExpiry,
    allIds: state.allIds ? state.allIds.map(({ variant, key }) => ({
      variant,
      key,
      ...state.byId[variant][key]
    })) : []
  });

  // tslint:disable-next-line max-line-length
  export const transformFromBrowser = (state: BrowserStorageState, reducerKey: string): Store.Personalization.Biasing => {
    const olderThanTime = Math.floor(Date.now() / 1000) - state.expiry;
    const filteredState = state.allIds.filter((element) => element.lastUsed >= olderThanTime);
    let allIds = [];
    let byId = {};
    filteredState.forEach(({ variant, key, lastUsed }) => {
      allIds.push({ variant, key });
      if (!byId[variant]) {
        byId[variant] = {};
      }
      byId[variant][key] = { lastUsed };
    });
    return {
      globalExpiry: state.expiry,
      allIds,
      byId
    };
  };

  export const convertBiasToSearch = (state: Store.State) => {
    // const byId = Selectors.realTimeBiasesById(state);
    const allIds = Selectors.realTimeBiasesAllIds(state);
    const config = Selectors.config(state).personalization.realTimeBiasing;

    return allIds.map(({ variant, key }) => ({
      name: variant,
      content: key,
      strength: (config.attributes[variant] && config.attributes[variant].strength) || config.globalStrength
    }));
  };

  export interface BrowserStorageState {
    allIds: BrowserBiasKey[];
    expiry: number;
  }

  export interface BrowserBiasKey extends Store.Personalization.BiasKey, Store.Personalization.SingleBias {}
}

export default Personalization;
