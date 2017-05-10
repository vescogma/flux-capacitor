import { Dispatch } from 'redux';
import { Store } from '.';

export const rayify = <T>(arr: T | T[]): T[] => Array.isArray(arr) ? arr : [arr];

// tslint:disable-next-line max-line-length
export const thunk = <T>(type: string, data: Partial<T>) => (dispatch: Dispatch<T>) => dispatch({ type, ...<any>data });

export const conditional = <T>(predicate: (state: Store.State) => boolean, type: string, data: Partial<T>) =>
  (dispatch: Dispatch<T>, getStore) => {
    if (predicate(getStore())) {
      dispatch({ type, ...<any>data });
    }
  };
