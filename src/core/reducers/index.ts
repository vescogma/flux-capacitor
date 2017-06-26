import * as redux from 'redux';
import Actions from '../actions';
import Store from '../store';

import data from './data';
import isFetching from './is-fetching';
import isRunning from './is-running';
import session from './session';
import ui from './ui';

export const rootReducer = redux.combineReducers<Store.State>({
  isRunning,
  isFetching,
  session,
  data,
  ui,
});

export default (state: any, action) => {
  switch (action.type) {
    case Actions.REFRESH_STATE: return updateState(state, action);
    default: return rootReducer(state, action);
  }
};

export const updateState = (state: any, action) => {
  return {
    ...action.state,
    session: state.session,
    data: {
      ...action.state.data,
      details: {
        ...action.state.data.details,
        id: state.data.details.id
      }
    }
  };
};
