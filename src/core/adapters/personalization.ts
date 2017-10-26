import Actions from '../actions';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';

namespace Personalization {
 export const extractBias = ({ payload }: Actions.SelectRefinement, store: Store.State) => {
   const config = Selectors.config(store).personalization.realtimeBiasing;
   const byId = Selectors.realTimeBiasesById(store);

   const { value, field } = Selectors.refinementCrumb(store, payload.navigationId, payload.index);
   if (byId[field] && byId[field][value]) {
     return {
       ...byId[field][value],
     };
   }
   else {
     
   }
 };

}

export default Personalization;
