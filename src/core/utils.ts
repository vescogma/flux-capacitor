import Actions from './actions';

// tslint:disable-next-line variable-name
export const Routes = {
  SEARCH: 'search',
  DETAILS: 'details',
  NAVIGATION: 'navigation'
};

export const rayify = <T>(arr: T | T[]): T[] => Array.isArray(arr) ? arr : [arr];

// tslint:disable-next-line max-line-length
export const action = <P, T extends string, M extends Actions.Metadata | {} = {}>(type: T, payload?: P, meta?: M): Actions.Action<T, P, M | {}> => {
  const builtAction: Actions.Action<T, P, M | {}> = { type, meta: meta || {} };

  if (payload != null) {
    builtAction.payload = payload;
    if (payload instanceof Error) {
      builtAction.error = true;
    }
  }
  return builtAction;
};
