import * as redux from 'redux';
import { Store } from '..';

import data from './data';
import isFetching from './is-fetching';
import session from './session';
import ui from './ui';

export default redux.combineReducers<Store.State>({
  isFetching,
  session,
  data,
  ui,
});
