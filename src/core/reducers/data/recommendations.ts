import Actions from '../../actions';
import RecommendationsAdapters from '../../adapters/recommendations';
import Store from '../../store';

export type Action = Actions.ReceiveRecommendationsProducts;
export type State = Store.Recommendations;

export const DEFAULTS: State = <any>{
  suggested: {
    products: []
  },
};

export default function updateRecommendations(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS: return updateRecommendationsProducts(state, action);
    default: return state;
  }
}

export const updateRecommendationsProducts = (state: State, { payload }: Actions.ReceiveRecommendationsProducts) =>
  ({
    ...state,
    suggested: {
      products: payload
    }
  });
