import Actions from '../actions';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';

namespace Personalization {
  export const extractBias = ({ payload }: Actions.SelectRefinement, store: Store.State) => {
    // TODO: check if we need to bias for it, we're not using config at all
    const config = Selectors.config(store).personalization.realtimeBiasing;
    const byId = Selectors.realTimeBiasesById(store);

    const { value, field } = Selectors.refinementCrumb(store, payload.navigationId, payload.index);
    return {
      variant: field,
      key: value,
      config: Selectors.config(store),
      bias: (byId[field] && byId[field][value]) ? {
        ...byId[field][value],
        lastUsed: Date.now()
      } : generateNewBias(value, field)
    };
  };

  export const generateNewBias = (value, field) => {
    return {
      lastUsed: Date.now()
    };
  };

}

export default Personalization;
