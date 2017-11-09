import Actions from '../actions';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';

namespace Personalization {
  type ExtractableAction = Actions.SelectRefinement & Actions.AddRefinement;

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
    expiry: state.expiry,
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
    const allIds = [];
    const byId = {};
    filteredState.forEach(({ variant, key, lastUsed }) => {
      allIds.push({ variant, key });
      byId[variant] = { ...byId[variant], [key]: { lastUsed } };
    });
    return {
      expiry: state.expiry,
      allIds,
      byId
    };
  };

  export const convertBiasToSearch = (state: Store.State) => {
    const allIds = Selectors.realTimeBiasesAllIds(state);
    const config = Selectors.config(state).personalization.realTimeBiasing;

    return allIds.map(({ variant, key }) => ({
      name: variant,
      content: key,
      strength: (config.attributes[variant] && config.attributes[variant].strength) || config.strength
    }));
  };

  export interface BrowserStorageState {
    allIds: BrowserBiasKey[];
    expiry: number;
  }

  export interface BrowserBiasKey extends Store.Personalization.BiasKey, Store.Personalization.SingleBias {}
}

export default Personalization;
