import { Dispatch } from 'redux';
import Actions from '.';
import SearchAdapter from '../adapters/search';
import Selectors from '../selectors';
import Store from '../store';

// tslint:disable-next-line max-line-length
export const createAction = <T extends string, P>(type: T, payload?: P, validator?: object): Actions.Action<T, P> => {
  const builtAction: Actions.Action<T, P> = { type, meta: { validator: validator || {} } };

  if (payload !== undefined) {
    builtAction.payload = payload;
    if (payload instanceof Error) {
      builtAction.error = true;
    }
  }
  return builtAction;
};

export const refinementPayload = (field: string, valueOrLow: any, high: any = null) =>
  typeof high === 'number' ?
    {
      navigationId: field,
      low: valueOrLow,
      high,
      range: true
    } :
    {
      navigationId: field,
      value: valueOrLow
    };

// a passthrough to allow error to propagate to middleware
// tslint:disable-next-line max-line-length
export const handleError = (errorAction: Actions.Action<any>, actionCreator: () => any) =>
  errorAction.error ? errorAction : actionCreator();

// tslint:disable-next-line max-line-length
export const shouldResetRefinements = ({ low, high, value, navigationId, range, index }: Actions.Payload.Search, state: any): boolean => {
  const currentRefinements = Selectors.selectedRefinements(state);
  // assumes only one refinement can be added at once
  return (!navigationId || currentRefinements.length !== 1 ||
    (index && !Selectors.isRefinementSelected(state, navigationId, index)) ||
    !SearchAdapter.refinementsMatch(<any>{ low, high, value }, currentRefinements[0], range ? 'Range' : 'Value'));
};
