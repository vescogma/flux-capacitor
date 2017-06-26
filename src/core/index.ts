import ActionCreator from './action-creator';
import Actions from './actions';
import Adapters from './adapters';
import * as Events from './events';
import Observer from './observer';
import reducer from './reducers';
import { DEFAULT_AREA } from './reducers/data/area';
import { DEFAULT_COLLECTION } from './reducers/data/collections';
import Selectors from './selectors';
import Store, { ReduxStore } from './store';

// tslint:disable-next-line variable-name
export const Routes = {
  SEARCH: 'search',
  DETAILS: 'details',
  NAVIGATION: 'navigation'
};

export {
  DEFAULT_AREA,
  DEFAULT_COLLECTION,
  ActionCreator,
  Actions,
  Adapters,
  Events,
  ReduxStore,
  Selectors,
  Store,
  Observer,
  reducer
};
