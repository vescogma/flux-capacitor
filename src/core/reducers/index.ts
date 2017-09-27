import * as redux from 'redux';
import undoable from 'redux-undo';
import Actions from '../actions';
import Store from '../store';
import data from './data';
import isRunning from './is-running';
import session from './session';
import ui from './ui';

export type Action = Actions.RefreshState;

export const rootReducer = redux.combineReducers<Store.State>({
  isRunning,
  session,
  data: undoable(data, {
    limit: 5,
    filter: ({ type }) => !type.startsWith('FETCH_')
  }),
  ui,
});

export default (state: Store.State, action: Action) => {
  switch (action.type) {
    case Actions.REFRESH_STATE: return updateState(state, action);
    default: return rootReducer(state, action);
  }
};

export const updateState = (state: Store.State, { payload }: Actions.RefreshState) => {
  return {
    ...payload,
    session: state.session,
    data: {
      past: [
        ...payload.data.past,
        payload.data.present
      ],
      present: {
        ...payload.data.present,
        autocomplete: state.data.present.autocomplete,
        details: {
          ...payload.data.present.details,
          data: state.data.present.details.data
        }
      },
      future: []
    }
  };
};
