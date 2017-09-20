import Store from './store';

export interface Validator<T> {
  func: (payload?: T, state?: Store.State) => boolean;
  msg: string;
}

export const isString: Validator<string> = ({
    func: (value: any) => typeof value === 'string' && value.trim().length !== 0,
    msg: 'must be a non-empty string'
});
