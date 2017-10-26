import Actions from '../actions';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';

namespace Personalization {
  export const extractBias = ({ payload }: Actions.SelectRefinement, store: Store.State) => {
    const config = Selectors.config(store).personalization.realtimeBiasing;
    const byId = Selectors.realTimeBiasesById(store);

    const { value, field } = Selectors.refinementCrumb(store, payload.navigationId, payload.index);
    return {
      variant: value,
      key: field,
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
