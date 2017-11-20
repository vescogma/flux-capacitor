import Actions from '../actions';
import Configuration from '../configuration';
import ConfigAdapter from './configuration';
import Selectors from '../selectors';
import Store from '../store';

namespace Personalization {
  type ExtractableAction = Actions.SelectRefinement & Actions.AddRefinement;

  export const DAYS_IN_SECONDS = 86400;

  export const extractBias = (action: ExtractableAction, state: Store.State) => {
    const config = Selectors.config(state).personalization.realTimeBiasing;
    const byId = Selectors.realTimeBiasesById(state);
    const { field, value } = extractRefinement(action, state);

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

  // tslint:disable-next-line max-line-length
  export const extractRefinement = ({ type, payload }: ExtractableAction, state: Store.State): { field: string, value: string } => {
    // tslint:disable-next-line one-variable-per-declaration
    let field = undefined, value = undefined;

    switch (type) {
      case Actions.ADD_REFINEMENT:
        if (payload.range) {
          break;
        }
        field = payload.navigationId;
        value = payload.value;
        break;
      case Actions.SELECT_REFINEMENT:
        const refinement = Selectors.refinementCrumb(state, payload.navigationId, payload.index);
        field = refinement.field;
        value = refinement.value;
        break;
      default:
    }

    return { field, value };
  };

  export const generateNewBias = () => ({
    lastUsed: Math.floor(Date.now() / 1000)
  });

  // tslint:disable-next-line max-line-length
  export const transformToBrowser = (state: Store.Personalization.Biasing, reducerKey: string): BrowserStorageState => ({
    allIds: state.allIds ? state.allIds.map(({ variant, key }) => ({
      variant,
      key,
      ...state.byId[variant][key]
    })) : []
  });

  // tslint:disable-next-line max-line-length
  export const transformFromBrowser = (incomingState: BrowserStorageState, state: Store.State): Store.Personalization.Biasing => {
    const config = Selectors.config(state);
    const olderThanTime = Math.floor(Date.now() / 1000) - DAYS_IN_SECONDS * ConfigAdapter.extractRealTimeBiasingExpiry(config);
    const filteredIncomingState = incomingState.allIds.filter((element) => element.lastUsed >= olderThanTime);
    let allIds = [];
    const byId = {};
    filteredIncomingState.forEach(({ variant, key, lastUsed }) => {
      allIds.push({ variant, key });
      byId[variant] = { ...byId[variant], [key]: { lastUsed } };
    });
    Object.keys(byId).forEach((key) => {
      allIds = pruneBiases(allIds, key, Object.keys(byId[key]).length, config.personalization.realTimeBiasing);
    }); // filter allIds for each variant
    return {
      allIds,
      byId
    };
  };

  export const convertBiasToSearch = (state: Store.State) => {
    const allIds = Selectors.realTimeBiasesAllIds(state);
    const config = Selectors.config(state).personalization.realTimeBiasing;
    const selectedRefinements = Selectors.selectedRefinements(state);

    return allIds.filter(({ variant, key }) => {
      return !selectedRefinements.find(({ navigationName, type, value }) => {
        return type === 'Value' && navigationName === variant && key && value === key;
      });
    }).map(({ variant, key }) => ({
      name: variant,
      content: key,
      strength: (config.attributes[variant] && config.attributes[variant].strength) || config.strength
    }));
  };

  export const pruneBiases = (allIds: Store.Personalization.BiasKey[], variant: string, variantCount: number, config: Configuration.Personalization.RealTimeBiasing) => {
    if (config.attributes[variant] && (variantCount >= (config.attributes[variant].maxBiases))) {
      for (let i = allIds.length - 1; i >= 0; i--) {
        if (allIds[i].variant === variant) {
          return [...allIds.slice(0, i), ...allIds.slice(i + 1)];
        }
      }
      return allIds;
    }
    if (allIds.length > config.maxBiases) {
      return allIds.slice(0, config.maxBiases);
    }
    return allIds;
  };

  export interface BrowserStorageState {
    allIds: BrowserBiasKey[];
  }

  export interface BrowserBiasKey extends Store.Personalization.BiasKey, Store.Personalization.SingleBias { }
}

export default Personalization;
