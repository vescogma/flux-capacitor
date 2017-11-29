import Actions from '../actions';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';
import ConfigAdapter from './configuration';

namespace Personalization {
  type ExtractableAction = Actions.SelectRefinement & Actions.AddRefinement;

  export const DAYS_IN_SECONDS = 86400;

  export const extractBias = (action: ExtractableAction, state: Store.State) => {
    const config = Selectors.config(state).personalization.realTimeBiasing;
    const byId = Selectors.realTimeBiasesById(state);
    const { field, value } = extractRefinement(action, state);

    if (config.attributes[field]) {
      return {
        field,
        value,
        bias: (byId[field] && byId[field][value]) ? {
          ...byId[field][value],
          lastUsed: Math.floor(Date.now() / 1000)
        } : generateNewBias()
      };
    }
  };

  // tslint:disable-next-line max-line-length
  export const extractRefinement = ({ type, payload }: ExtractableAction, state: Store.State): { field: string, value: string } => {
    switch (type) {
      case Actions.ADD_REFINEMENT:
        if (!payload.range) {
          return { field: payload.navigationId, value: payload.value };
        }
        break;
      case Actions.SELECT_REFINEMENT:
        return Selectors.refinementCrumb(state, payload.navigationId, payload.index);
    }

    return { field: undefined, value: undefined };
  };

  export const generateNewBias = () => ({ lastUsed: Math.floor(Date.now() / 1000) });

  // tslint:disable-next-line max-line-length
  export const transformToBrowser = (state: Store.Personalization.Biasing, reducerKey: string): BrowserStorageState => ({
    allIds: state.allIds.map(({ field, value }) => ({
      field,
      value,
      ...state.byId[field][value]
    }))
  });

  // tslint:disable-next-line max-line-length
  export const transformFromBrowser = (incomingState: BrowserStorageState, state: Store.State): Store.Personalization.Biasing => {
    const config = Selectors.config(state);
    // tslint:disable-next-line max-line-length
    const olderThanTime = Math.floor(Date.now() / 1000) - DAYS_IN_SECONDS * ConfigAdapter.extractRealTimeBiasingExpiry(config);
    const filteredIncomingState = incomingState.allIds.filter((element) => element.lastUsed >= olderThanTime);
    const biasingConfig = config.personalization.realTimeBiasing;
    const allIds = [];
    const byId = {};

    filteredIncomingState.forEach(({ field, value, lastUsed }) => {
      if (!byId[field]) {
        byId[field] = {}; // init
      }
      // do not push if too many biases
      if (allIds.length < biasingConfig.maxBiases &&
           // if no max defined for variant, push
          (!(biasingConfig.attributes[field] && biasingConfig.attributes[field].maxBiases) ||
           // if max defined and over, do not push
           Object.keys(byId[field]).length < biasingConfig.attributes[field].maxBiases)) {
        allIds.push({ field, value });
        byId[field][value] = { lastUsed };
      }
    });

    return { allIds, byId };
  };

  export const convertBiasToSearch = (state: Store.State) => {
    const allIds = Selectors.realTimeBiasesAllIds(state);
    const config = Selectors.config(state).personalization.realTimeBiasing;
    const selectedRefinements = Selectors.selectedRefinements(state);

    return allIds.filter(({ field, value }) =>
      config.attributes[field] && !selectedRefinements.some(({ navigationName, type, value: navigationValue }) =>
        type === 'Value' && navigationName === field && value && value === navigationValue)
    ).map(({ field, value }) => ({
      name: field,
      content: value,
      strength: config.attributes[field].strength || config.strength,
    }));
  };

  // tslint:disable-next-line max-line-length
  export const pruneBiases = (biasKeys: Store.Personalization.BiasKey[], field: string, fieldCount: number, config: Configuration.Personalization.RealTimeBiasing) => {
    if (config.attributes[field] && fieldCount >= config.attributes[field].maxBiases) {
      for (let i = biasKeys.length - 1; i >= 0; i--) {
        if (biasKeys[i].field === field) {
          return [...biasKeys.slice(0, i), ...biasKeys.slice(i + 1)];
        }
      }
    }
    if (biasKeys.length > config.maxBiases) {
      return biasKeys.slice(0, config.maxBiases);
    }
    return biasKeys;
  };

  export interface BrowserStorageState {
    allIds: BrowserBiasKey[];
  }

  export interface BrowserBiasKey extends Store.Personalization.BiasKey, Store.Personalization.SingleBias { }
}

export default Personalization;
