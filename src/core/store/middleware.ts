import { reduxBatch } from '@manaflair/redux-batch';
import * as cuid from 'cuid';
import { applyMiddleware, compose, createStore, Middleware as ReduxMiddleware, Store } from 'redux';
import { ActionCreators } from 'redux-undo';
import * as validatorMiddleware from 'redux-validator';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Creators from '../actions/creators';
import PersonalizationAdapter from '../adapters/personalization';
import Events from '../events';
import StorageManager from '../storage-manager';
import * as utils from '../utils';

export const HISTORY_UPDATE_ACTIONS = [
  Actions.RECEIVE_PRODUCTS,
  Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS,
  Actions.RECEIVE_PAST_PURCHASES,
  Actions.RECEIVE_ORDER_HISTORY,
  Actions.RECEIVE_NAVIGATION_SORT,
  Actions.RECEIVE_COLLECTION_COUNT,
  Actions.RECEIVE_MORE_REFINEMENTS
];

export const RECALL_CHANGE_ACTIONS = [
  Actions.RESET_REFINEMENTS,
  Actions.UPDATE_QUERY,
  Actions.ADD_REFINEMENT,
  Actions.SELECT_REFINEMENT,
  Actions.DESELECT_REFINEMENT,
];

export const SEARCH_CHANGE_ACTIONS = [
  ...RECALL_CHANGE_ACTIONS,
  Actions.SELECT_COLLECTION,
  Actions.SELECT_SORT,
  Actions.UPDATE_PAGE_SIZE,
  Actions.UPDATE_CURRENT_PAGE,
];

export const PERSONALIZATION_CHANGE_ACTIONS = [
  Actions.SELECT_REFINEMENT,
];

export namespace Middleware {
  export const validator = validatorMiddleware;

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
          case Actions.RECEIVE_PRODUCTS: return next(ActionCreators.undo());
          default:
            flux.emit(Events.ERROR_FETCH_ACTION, action.payload);
            return action.payload;
        }
      } else {
        return next(action);
      }
    };
  }

  export function saveStateAnalyzer() {
    return (next) => (batchAction) => {
      const actions = utils.rayify(batchAction);
      if (actions.some((action) => HISTORY_UPDATE_ACTIONS.includes(action.type))) {
        return next([...actions, { type: Actions.SAVE_STATE }]);
      } else {
        return next(actions);
      }
    };
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
      if (PERSONALIZATION_CHANGE_ACTIONS.includes(action.type)) {
        return next([
          action,
          Creators.updateBiasing(PersonalizationAdapter.extractBias(action, store.getState()))
        ]);
      }
      return next(action);
    };
  }

  export function create(sagaMiddleware: any, flux: FluxCapacitor): any {
    const middleware = [
      thunkEvaluator,
      Middleware.validator(),
      Middleware.idGenerator('recallId', RECALL_CHANGE_ACTIONS),
      Middleware.idGenerator('searchId', SEARCH_CHANGE_ACTIONS),
      Middleware.errorHandler(flux),
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
      applyMiddleware(thunkEvaluator, saveStateAnalyzer),
      reduxBatch,
      applyMiddleware(...middleware),
      reduxBatch,
      applyMiddleware(Middleware.validator(), thunkEvaluator),
      reduxBatch,
    );
  }
}

export default Middleware;
