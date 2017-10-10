import * as cuid from 'cuid';
import { Middleware } from 'redux';
import { ActionCreators } from 'redux-undo';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Events from '../events';

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

export const MIDDLEWARE_CREATORS = [
  idGenerator('recallId', RECALL_CHANGE_ACTIONS),
  idGenerator('searchId', SEARCH_CHANGE_ACTIONS),
  errorHandler
];

export function idGenerator(key: string, actions: string[]) {
  return (flux) => (store) => (next) => (action) =>
    actions.includes(action.type)
      ? next({ ...action, meta: { ...action.meta, [key]: cuid() } })
      : next(action);
}

export function errorHandler(flux: FluxCapacitor) {
  return (store) => (next) => (action) => {
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

export default (middleware: Array<(flux: FluxCapacitor) => Middleware>, flux: FluxCapacitor) =>
  middleware.map((handler) => handler(flux));
