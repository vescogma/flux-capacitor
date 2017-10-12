import * as cuid from 'cuid';
import { Middleware } from 'redux';
import { ActionCreators } from 'redux-undo';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Events from '../events';
import * as utils from '../utils';

export const HISTORY_UPDATE_ACTIONS = [
  Actions.RECEIVE_PRODUCTS,
  Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS,
  Actions.RECEIVE_PAST_PURCHASES,
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

export const BATCH_MIDDLEWARE_CREATORS = [
  saveStateAnalyzer
];

export const MIDDLEWARE_CREATORS = [
  idGenerator('recallId', RECALL_CHANGE_ACTIONS),
  idGenerator('searchId', SEARCH_CHANGE_ACTIONS),
  errorHandler
];

export function idGenerator(key: string, actions: string[]) {
  return (flux) => () => (next) => (action) =>
    actions.includes(action.type)
      ? next({ ...action, meta: { ...action.meta, [key]: cuid() } })
      : next(action);
}

export function errorHandler(flux: FluxCapacitor) {
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
  return () => (next) => (batchAction) => {
    const actions = utils.rayify(batchAction);
    if (actions.some((action) => HISTORY_UPDATE_ACTIONS.includes(action.type))) {
      return next([...actions, { type: Actions.SAVE_STATE }]);
    } else {
      return next(actions);
    }
  };
}

export default (middleware: Array<(flux: FluxCapacitor) => Middleware>, flux: FluxCapacitor) =>
  middleware.map((handler) => handler(flux));
