import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.ReceiveRecommendationsProducts | Actions.ReceivePastPurchases |
  Actions.ReceiveQueryPastPurchases | Actions.ReceiveOrderHistory;
export type State = Store.Recommendations;

export const DEFAULTS: State = {
  suggested: {
    products: []
  },
  pastPurchases: {
    products: []
  },
  queryPastPurchases: [],
  orderHistory: []
};

export default function updateRecommendations(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS: return updateProducts(state, action);
    case Actions.RECEIVE_PAST_PURCHASES: return updatePastPurchases(state, action);
    case Actions.RECEIVE_QUERY_PAST_PURCHASES: return updateQueryPastPurchases(state, action);
    case Actions.RECEIVE_ORDER_HISTORY: return updateOrderHistory(state, action);
    default: return state;
  }
}

export const updateProducts = (state: State, { payload }: Actions.ReceiveRecommendationsProducts) =>
  ({
    ...state,
    suggested: {
      products: payload
    }
  });

export const updatePastPurchases = (state: State, { payload }: Actions.ReceivePastPurchases) =>
  ({
    ...state,
    pastPurchases: {
      products: payload
    }
  });

export const updateQueryPastPurchases = (state: State, { payload }: Actions.ReceiveQueryPastPurchases) =>
  ({
    ...state,
    queryPastPurchases: payload
  });

export const updateOrderHistory = (state: State, { payload }: Actions.ReceiveOrderHistory) =>
  ({
    ...state,
    orderHistory: payload
  });