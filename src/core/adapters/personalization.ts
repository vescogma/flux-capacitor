import Actions from '../actions';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';

namespace Personalization {
  export const extractBias = ({ payload }: Actions.SelectRefinement, store: Store.State) => {
    const config = Selectors.config(store).personalization.realtimeBiasing;
    const byId = Selectors.realTimeBiasesById(store);
    const { value, field } = Selectors.refinementCrumb(store, payload.navigationId, payload.index);

    // TODO: check if we need to bias for it, we're not using config at all
    if (!config.attributes[field]) {
      return <any>{};
    }
    return {
      variant: field,
      key: value,
      config: Selectors.config(store),
      bias: (byId[field] && byId[field][value]) ? {
        ...byId[field][value],
        lastUsed: Math.floor(Date.now() / 1000)
      } : generateNewBias(value, field)
    };
  };

  export const generateNewBias = (value, field) => ({
      lastUsed: Math.floor(Date.now() / 1000)
    });

  export const transformToBrowser = (state, reducerKey) =>
    state.allIds.map(({ variant, key }) => ({
      variant,
      key,
      ...state.byId[variant][key]
    }));

  export const transformFromBrowser = (state: any, reducerKey) => {
    const olderThanTime = Math.floor(Date.now() / 1000) - 2628000;
    const filteredState = state.filter((element) => element.lastUsed >= olderThanTime);
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
      allIds,
      byId
    };
  };

  export const convertToBias = (store) => {
    // const byId = Selectors.realTimeBiasesById(store);
    const allIds = Selectors.realTimeBiasesAllIds(store);
    const config = Selectors.config(store).personalization.realtimeBiasing;

    return allIds.map(({ variant, key }) => ({
      name: variant,
      content: key,
      strength: (config.attributes[variant] && config.attributes[variant].strength) || config.globalStrength
    }));
  };
}

export default Personalization;
