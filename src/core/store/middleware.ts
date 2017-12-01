import { reduxBatch } from '@manaflair/redux-batch';
import * as cuid from 'cuid';
import { applyMiddleware, compose, createStore, Middleware as ReduxMiddleware, Store } from 'redux';
import { ActionCreators as ReduxActionCreators } from 'redux-undo';
import * as validatorMiddleware from 'redux-validator';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import ActionCreators from '../actions/creators';
import ConfigurationAdapter from '../adapters/configuration';
import PersonalizationAdapter from '../adapters/personalization';
import Events from '../events';
import Selectors from '../selectors';
import * as utils from '../utils';

export const HISTORY_UPDATE_ACTIONS = [
  Actions.RECEIVE_PRODUCTS,
  Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS,
  Actions.RECEIVE_NAVIGATION_SORT,
  Actions.RECEIVE_COLLECTION_COUNT,
  Actions.RECEIVE_MORE_REFINEMENTS,
  Actions.RECEIVE_PAST_PURCHASE_PRODUCTS,
];

export const RECALL_CHANGE_ACTIONS = [
  Actions.RESET_REFINEMENTS,
  Actions.UPDATE_QUERY,
  Actions.ADD_REFINEMENT,
  Actions.SELECT_REFINEMENT,
  Actions.DESELECT_REFINEMENT,
];

export const PAST_PURCHASE_SKU_ACTIONS = [
  Actions.FETCH_PAST_PURCHASE_PRODUCTS,
  Actions.FETCH_SAYT_PAST_PURCHASES,
];

export const SEARCH_CHANGE_ACTIONS = [
  ...RECALL_CHANGE_ACTIONS,
  Actions.SELECT_COLLECTION,
  Actions.SELECT_SORT,
  Actions.UPDATE_PAGE_SIZE,
  Actions.UPDATE_CURRENT_PAGE,
];

export const PAST_PURCHASES_SEARCH_CHANGE_ACTIONS = [
  Actions.RESET_PAST_PURCHASE_REFINEMENTS,
  Actions.SELECT_PAST_PURCHASE_REFINEMENT,
  Actions.RESET_AND_SELECT_PAST_PURCHASE_REFINEMENT,
  Actions.DESELECT_PAST_PURCHASE_REFINEMENT,
  Actions.SELECT_PAST_PURCHASE_SORT,
  Actions.UPDATE_PAST_PURCHASE_CURRENT_PAGE,
  Actions.UPDATE_PAST_PURCHASE_PAGE_SIZE,
];

export const PERSONALIZATION_CHANGE_ACTIONS = [
  Actions.SELECT_REFINEMENT,
  Actions.ADD_REFINEMENT,
];

export namespace Middleware {
  export const validator = validatorMiddleware();

  export function idGenerator(key: string, actions: string[]): ReduxMiddleware {
    return () => (next) => (action) =>
      actions.includes(action.type)
        ? next({ ...action, meta: { ...action.meta, [key]: cuid() } })
        : next(action);
  }

  export function errorHandler(flux: FluxCapacitor): ReduxMiddleware {
    return () => (next) => (action) => {
      if (action.error) {
        switch (action.type) {
          case Actions.RECEIVE_PRODUCTS: return next(ReduxActionCreators.undo());
          default:
            flux.emit(Events.ERROR_FETCH_ACTION, action.payload);
            return action.payload;
        }
      } else {
        return next(action);
      }
    };
  }

  export function injectStateIntoRehydrate(store: Store<any>) {
    return (next) => (action) =>
      action.type === 'persist/REHYDRATE' && action.payload && action.payload.biasing ? next({
        ...action,
        payload: {
          ...action.payload,
          biasing: PersonalizationAdapter.transformFromBrowser(action.payload.biasing, store.getState())
        }
      }) : next(action);
  }

  export function checkPastPurchaseSkus(flux: FluxCapacitor): ReduxMiddleware {
    return (store) => (next) => (action) => {
      if (!PAST_PURCHASE_SKU_ACTIONS.includes(action.type) ||
          Selectors.pastPurchases(flux.store.getState()).length > 0) {
        return next(action);
      }
      if (ConfigurationAdapter.extractSecuredPayload(Selectors.config(flux.store.getState()))) {
        flux.once(Events.PAST_PURCHASE_SKUS_UPDATED, () => store.dispatch(action));
      }
    };
  }

  export function insertAction(triggerActions: string[], extraAction: Actions.Action) {
    return (next) => (batchAction) => {
      const actions = utils.rayify(batchAction);
      if (actions.some((action) => triggerActions.includes(action.type))) {
        return next([...actions, extraAction]);
      } else {
        return next(actions);
      }
    };
  }

  // TODO RENAMETHIS
  export function fetchPastPurchaseProductsAnalyzer() {
    return insertAction(PAST_PURCHASES_SEARCH_CHANGE_ACTIONS, ActionCreators.fetchPastPurchaseProducts());
  }

  export function saveStateAnalyzer() {
    return insertAction(HISTORY_UPDATE_ACTIONS, { type: Actions.SAVE_STATE });
  }

  export function thunkEvaluator(store: Store<any>) {
    return (next) => (thunkAction) => {
      if (typeof thunkAction === 'function') {
        return next(thunkAction(store.getState()));
      } else {
        return next(thunkAction);
      }
    };
  }

  export function personalizationAnalyzer(store: Store<any>) {
    return (next) => (action) => {
      const state = store.getState();
      if (ConfigurationAdapter.isRealTimeBiasEnabled(Selectors.config(state)) &&
          PERSONALIZATION_CHANGE_ACTIONS.includes(action.type)) {
        const biasing = PersonalizationAdapter.extractBias(action, state);
        if (biasing) {
          return next([
            action,
            ActionCreators.updateBiasing(biasing)
          ]);
        }
      }
      return next(action);
    };
  }

  export function create(sagaMiddleware: any, flux: FluxCapacitor): any {
    const middleware = [
      thunkEvaluator,
      Middleware.injectStateIntoRehydrate,
      Middleware.validator,
      Middleware.idGenerator('recallId', RECALL_CHANGE_ACTIONS),
      Middleware.idGenerator('searchId', SEARCH_CHANGE_ACTIONS),
      Middleware.errorHandler(flux),
      Middleware.checkPastPurchaseSkus(flux),
      sagaMiddleware,
      personalizationAnalyzer,
      thunkEvaluator,
      saveStateAnalyzer,
    ];

    // tslint:disable-next-line max-line-length
    if (process.env.NODE_ENV === 'development' && ((((<any>flux.__config).services || {}).logging || {}).debug || {}).flux) {
      middleware.push(require('redux-logger').default);
    }

    const composeEnhancers = global && global['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

    return composeEnhancers(
      applyMiddleware(thunkEvaluator, saveStateAnalyzer, fetchPastPurchaseProductsAnalyzer),
      reduxBatch,
      applyMiddleware(...middleware),
      reduxBatch,
      applyMiddleware(thunkEvaluator, Middleware.validator),
      reduxBatch,
    );
  }
}

export default Middleware;
