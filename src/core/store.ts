import { applyMiddleware, createStore, Store as ReduxStore } from 'redux';
import thunk from 'redux-thunk';
import * as uuid from 'uuid/v1';
import FluxCapacitor from '../flux-capacitor';
import Actions from './actions';
import Adapter from './adapters/configuration';
import reducer from './reducers';
import * as PageReducer from './reducers/data/page';

export { ReduxStore };

export const RECALL_CHANGE_ACTIONS = [
  Actions.UPDATE_SEARCH,
  Actions.SELECT_REFINEMENT,
  Actions.DESELECT_REFINEMENT,
];

export const SEARCH_CHANGE_ACTIONS = [
  Actions.UPDATE_SEARCH,
  Actions.SELECT_REFINEMENT,
  Actions.DESELECT_REFINEMENT,
  Actions.SELECT_COLLECTION,
  Actions.SELECT_SORT,
  Actions.UPDATE_PAGE_SIZE,
  Actions.UPDATE_CURRENT_PAGE,
];

export const idGenerator = (key: string, actions: string[]) =>
  (store) => (next) => (action) => {
    if (actions.includes(action.type)) {
      return next({ ...action, [key]: uuid() });
    } else {
      return next(action);
    }
  };

namespace Store {

  // tslint:disable-next-line max-line-length
  export function create(config: FluxCapacitor.Configuration, listener?: (store: ReduxStore<State>) => () => void): ReduxStore<State> {
    const middleware = [
      thunk,
      idGenerator('recallId', RECALL_CHANGE_ACTIONS),
      idGenerator('searchId', SEARCH_CHANGE_ACTIONS)
    ];

    if (process.env.NODE_ENV === 'development' && (((config.services || {}).logging || {}).debug || {}).flux) {
      const logger = require('redux-logger').default;

      middleware.push(logger);
    }

    const store = createStore<State>(
      reducer,
      <any>Adapter.initialState(config),
      applyMiddleware(...middleware),
    );

    if (listener) {
      store.subscribe(listener(store));
    }

    return store;
  }

  export interface State {
    isRunning: boolean;
    isFetching: IsFetching;
    session: Session;
    data: {
      query: Query; // mixed

      sorts: SelectableList<Sort>;
      products: Product[]; // post
      collections: Indexed.Selectable<Collection>; // mixed
      navigations: Indexed<Navigation>; // mixed

      autocomplete: Autocomplete; // mixed

      page: Page; // mixed

      template?: Template; // post

      details: Details; // mixed

      recordCount: number; // post

      redirect?: string; // post

      fields: string[]; // static

      errors: string[]; // post
      warnings: string[]; // post
    };
    ui: UI;
  }

  export interface UI {
    [tagName: string]: {
      global?: any;
      [tagId: string]: any;
    };
  }

  export interface Query {
    original?: string; // pre
    corrected?: string; // post
    related: Query.Related[]; // post
    didYouMean: Query.DidYouMean[]; // post
    rewrites: string[]; // post
  }

  export namespace Query {
    export type Related = Linkable;
    export type DidYouMean = Linkable;
  }

  export interface Collection {
    /**
     * byId key
     */
    name: string; // static
    total: number; // post
  }

  export interface Sort {
    field: string;
    descending?: boolean;
  }

  export interface Page {
    /**
     * number of products per page
     */
    sizes: SelectableList<number>; // mixed

    /**
     * current page number
     */
    current: number; // pre

    /**
     * number of first page
     */
    first: 1; // static

    /**
     * number of next page
     */
    previous?: number; // post
    /**
     * number of previous page
     */
    next?: number; // post
    /**
     * number of last page
     */
    last?: number; // post

    /**
     * start of displayed products
     */
    from?: number; // post
    /**
     * end of displayed products
     */
    to?: number; // post
  }

  export interface Template {
    name: string;
    rule: string;
    zones: {
      [zoneName: string]: Zone;
    };
  }

  export interface Session {
    recallId?: string;
    searchId?: string;
  }

  export interface IsFetching {
    moreRefinements?: boolean;
    moreProducts?: boolean;
    search?: boolean;
    autocompleteSuggestions?: boolean;
    autocompleteProducts?: boolean;
    details?: boolean;
  }

  export type Zone = ContentZone | RichContentZone | ProductsZone;

  export namespace Zone {
    export type Type = typeof Type.CONTENT | typeof Type.RICH_CONTENT | typeof Type.PRODUCTS;

    export namespace Type {
      export const CONTENT = 'content';
      export const RICH_CONTENT = 'rich_content';
      export const PRODUCTS = 'products';
    }
  }

  export interface BaseZone {
    name: string;
    type: Zone.Type;
  }

  export interface ContentZone extends BaseZone {
    type: typeof Zone.Type.CONTENT;
    content: string;
  }

  export interface RichContentZone extends BaseZone {
    type: typeof Zone.Type.RICH_CONTENT;
    content: string;
  }

  export interface ProductsZone extends BaseZone {
    type: typeof Zone.Type.PRODUCTS;
    query: string;
    products: Product[];
  }

  export interface Details {
    id?: string; // pre
    product?: Product; // post
  }

  export interface Product {
    id: string; // post
    [key: string]: any; // post
  }

  export interface Navigation {
    /**
     * byId key
     */
    field: string; // post
    label: string; // post
    more?: boolean; // post
    range?: boolean; // post
    or?: boolean; // post
    selected: number[]; // pre
    refinements: Array<ValueRefinement | RangeRefinement>; // post
    sort?: Sort; // post
  }

  export interface BaseRefinement {
    total: number; // post
  }

  export type Refinement = ValueRefinement | RangeRefinement;

  export interface ValueRefinement extends BaseRefinement {
    value: string; // post
  }

  export interface RangeRefinement extends BaseRefinement {
    low: number; // post
    high: number; // post
  }

  export interface Autocomplete {
    query?: string; // pre
    suggestions: string[]; // post
    category: Autocomplete.Category; // static & post
    navigations: Autocomplete.Navigation[]; // post
    products: Product[]; // post
  }

  export namespace Autocomplete {
    export interface Category {
      field?: string; // static
      values: string[]; // post
    }

    export interface Navigation {
      field: string;
      refinements: string[];
    }
  }

  export interface SelectableList<T> {
    items: T[];
    selected?: number;
  }

  export interface Indexed<T> {
    byId: { [key: string]: T };
    allIds: string[];
  }

  export namespace Indexed {
    export interface Selectable<T> extends Indexed<T> {
      selected?: string;
    }
  }

  export interface Linkable {
    value: string; // post
    url: string; // post (generated)
  }
}

export default Store;
