import { reduxBatch } from '@manaflair/redux-batch';
import { applyMiddleware, compose, createStore, Store as ReduxStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import * as validatorMiddleware from 'redux-validator';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/configuration';
import Configuration from '../configuration';
import reducer from '../reducers';
import createSagas, { SAGA_CREATORS } from '../sagas';
import Middleware from './middleware';

export { ReduxStore };

namespace Store {

  // tslint:disable-next-line max-line-length
  export function create(flux: FluxCapacitor, listener?: (store: ReduxStore<State>) => () => void): ReduxStore<State> {
    const sagaMiddleware = createSagaMiddleware();
    const middleware = Middleware.create(sagaMiddleware, flux);

    const store = createStore<State>(
      reducer,
      <State>Adapter.initialState(flux.__config),
      middleware,
    );

    createSagas(SAGA_CREATORS, flux).forEach(sagaMiddleware.run);

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
      past: Data[];
      present: Data;
      future: Data[];
    };
    ui: UI;
  }

  export interface Data {
    area: string;
    query: Query; // mixed

    sorts: SelectableList<Sort>;
    products: ProductWithMetadata[]; // post
    collections: Indexed.Selectable<Collection>; // mixed
    navigations: AvailableNavigations; // mixed

    autocomplete: Autocomplete; // mixed

    page: Page; // mixed

    template?: Template; // post

    details: Details; // mixed

    recommendations: Recommendations; // mixed

    recordCount: number; // post

    redirect?: string; // post

    fields: string[]; // static

    errors: string[]; // post
    warnings: string[]; // post
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
    related: string[]; // post
    didYouMean: string[]; // post
    rewrites: string[]; // post
  }

  export interface Collection {
    /**
     * byId key
     */
    name: string; // static
    total?: number; // post
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
    location?: Geolocation;
    origin?: Actions.Metadata.Tag;
    config?: Configuration;
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
    data?: Product; // pre
    product?: Product; // post
  }

  export interface Recommendations {
    suggested: {
      products: ProductWithMetadata[];
    };
    pastPurchases: {
      products: Recommendations.PastPurchase[];
    };
    queryPastPurchases: Product[];
    orderHistory: any[];
  }

  export type AvailableNavigations = Indexed<Navigation> & {
    sort: Recommendations.Navigation[];
  };

  export namespace Recommendations {
    export interface Navigation {
      name: string;
      values: RecommendationRefinement[];
      lows?: any[];
      highs?: any[];
    }

    export interface RecommendationRefinement {
      value: string;
      count: number;
    }

    export interface PastPurchase {
      sku: string;
      quantity: number;
    }

    // slide 18 of epic
    export interface OrderHistoryProduct {
      sku: string;
      quantity: number;
      collection: string;
      metadata: object;
    }
  }

  export interface Product {
    id: string; // post
    [key: string]: any; // post
  }

  export interface ProductWithMetadata {
    data: Product;
    index: number; // record index
    meta: {
      collection: string;
    };
  }

  export interface Navigation {
    /**
     * byId key
     */
    field: string; // post
    label: string; // post
    more?: boolean; // post
    range?: boolean; // post
    max?: number;
    min?: number;
    or?: boolean; // post
    selected: number[]; // pre
    refinements: Refinement[]; // post
    sort?: Sort; // post
    metadata: { [key: string]: string };
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
    suggestions: Autocomplete.Suggestion[]; // post
    category: Autocomplete.Category; // static & post
    navigations: Autocomplete.Navigation[]; // post
    products: ProductWithMetadata[]; // post
    template?: Template; // post
  }

  export namespace Autocomplete {
    export interface Category {
      field?: string; // static
      values: string[]; // post
    }

    export interface Navigation {
      field: string;
      label: string;
      refinements: string[];
    }

    export interface Suggestion {
      value: string;
      trending?: boolean;
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

  export interface Geolocation {
    latitude: number;
    longitude: number;
  }
}

export default Store;
