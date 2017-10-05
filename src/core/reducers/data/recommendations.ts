import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.ReceiveRecommendationsProducts | Actions.ReceivePastPurchases;
export type State = Store.Recommendations;

export const DEFAULTS: State = {
  suggested: {
    products: []
  },
  pastPurchases: {
    products: []
  }
};

export default function updateRecommendations(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS: return updateProducts(state, action);
    case Actions.RECEIVE_PAST_PURCHASES: return updatePastPurchases(state, action);
    default: return state;
  }
}

export const updateProducts = (state: State, { payload }: Actions.ReceiveRecommendationsProducts) =>
  ({ ...state,
    suggested: {
      products: payload
    }
  });

export const updatePastPurchases = (state: State, { payload }: Actions.ReceivePastPurchases) =>
  ({ ...state,
    pastPurchases: {
      products: payload
    }
  });
