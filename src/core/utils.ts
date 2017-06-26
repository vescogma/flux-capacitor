import { Dispatch } from 'redux';
import Actions from './actions';
import Store from './store';

// tslint:disable-next-line variable-name
export const Routes = {
  SEARCH: 'search',
  DETAILS: 'details',
  NAVIGATION: 'navigation'
};

export const rayify = <T>(arr: T | T[]): T[] => Array.isArray(arr) ? arr : [arr];

// tslint:disable-next-line max-line-length
export const action = <P, T extends string, M extends Actions.Metadata | {} = {}>(type: T, payload?: P, meta?: M): Actions.Action<T, P, M | {}> => {
  const builtAction: Actions.Action<T, P, M | {}> = { type, metadata: meta || {} };

  if (payload !== undefined) {
    builtAction.payload = payload;
  }
  return builtAction;
};

export const thunk = <P, T extends string, M extends Actions.Metadata | {} = {}>(type: T, payload: P, meta?: M) =>
  (dispatch: Dispatch<Actions.Action<T, P, M>>) =>
    dispatch(action(type, payload, meta));

export const conditional =
  // tslint:disable-next-line max-line-length
  <P, T extends string, M extends Actions.Metadata | {} = {}>(predicate: (state: Store.State) => boolean, type: T, payload: P, meta?: M) =>
    (dispatch: Dispatch<Actions.Action<T, P, M>>, getState: () => Store.State) => {
      if (predicate(getState())) {
        dispatch(action(type, payload, meta));
      }
    };
