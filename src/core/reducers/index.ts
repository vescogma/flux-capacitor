import * as redux from 'redux';
import { Store } from '..';

import autocomplete from './autocomplete';
import collections from './collections';
import details from './details';
import errors from './errors';
import isFetching from './is-fetching';
import navigations from './navigations';
import page from './page';
import products from './products';
import query from './query';
import recordCount from './record-count';
import redirect from './redirect';
import session from './session';
import sorts from './sorts';
import template from './template';
import warnings from './warnings';

export default redux.combineReducers<Store.State>({
  isFetching,
  session,
  data: redux.combineReducers({
    autocomplete,
    collections,
    details,
    errors,
    navigations,
    page,
    products,
    query,
    recordCount,
    redirect,
    sorts,
    template,
    warnings,
  }),
});
