import Actions from '../actions';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';

namespace Personalization {
 export const extractBias = ({ payload }: Actions.SelectRefinement, state: Store.State) => {
  const config = Selectors.config(state).personalization.realtimeBiasing;
  const globalMaxBiases = config.globalMaxBiases;

  const { value, field } = Selectors.refinementCrumb(state, payload.navigationId, payload.index);



 };

}

export default Personalization;
