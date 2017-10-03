import * as redux from 'redux';

import area from './area';
import autocomplete from './autocomplete';
import collections from './collections';
import details from './details';
import navigations from './navigations';
import page from './page';
import products from './products';
import query from './query';
import recommendations from './recommendations';
import recordCount from './record-count';
import redirect from './redirect';
import sorts from './sorts';
import template from './template';

export default redux.combineReducers({
  area,
  autocomplete,
  collections,
  details,
  fields: (state = []) => state,
  navigations,
  page,
  products,
  query,
  recommendations,
  recordCount,
  redirect,
  sorts,
  template,
});
