import { EventEmitter } from 'eventemitter3';
import { BrowserBridge, Request, Results } from 'groupby-api';
import { Sayt } from 'sayt';
import * as core from './core';

class FluxCapacitor extends EventEmitter {

  /**
   * actions for modifying contents of the store
   */
  actions: core.ActionCreator = new core.ActionCreator(this, { search: '/search' });
  /**
   * selector functions for extracting data from the store
   */
  selectors: typeof core.Selectors = core.Selectors;
  /**
   * instances of all microservice clients
   */
  clients: FluxCapacitor.Clients = FluxCapacitor.createClients(this);
  /**
   * instance of the state store
   */
  store: core.ReduxStore<core.Store.State> = core.Store.create(this.config, core.Observer.listener(this));

  constructor(public config: FluxCapacitor.Configuration) {
    super();
  }

  /* ACTION SUGAR */

  search(query: string = core.Selectors.query(this.store.getState())) {
    this.store.dispatch(this.actions.updateSearch({ query, clear: true }));
  }

  refinements(navigationName: string) {
    this.store.dispatch(this.actions.fetchMoreRefinements(navigationName));
  }

  reset(query: string = null, { field: navigationId, index }: { field: string, index: number } = <any>{}) {
    this.store.dispatch(this.actions.updateSearch({ query, navigationId, index, clear: true }));
  }

  resetQuery() {
    this.store.dispatch(this.actions.updateSearch({ query: null }));
  }

  resize(pageSize: number) {
    this.store.dispatch(this.actions.updatePageSize(pageSize));
  }

  sort(index: number) {
    this.store.dispatch(this.actions.selectSort(index));
  }

  refine(navigationName: string, index: number) {
    this.store.dispatch(this.actions.selectRefinement(navigationName, index));
  }

  unrefine(navigationName: string, index: number) {
    this.store.dispatch(this.actions.deselectRefinement(navigationName, index));
  }

  details(id: string) {
    this.store.dispatch(this.actions.updateDetailsId(id));
  }

  switchCollection(collection: string) {
    this.store.dispatch(this.actions.selectCollection(collection));
  }

  switchPage(page: number) {
    this.store.dispatch(this.actions.updateCurrentPage(page));
  }

  countRecords(collection: string) {
    this.store.dispatch(this.actions.fetchCollectionCount(collection));
  }

  autocomplete(query: string) {
    this.store.dispatch(this.actions.updateAutocompleteQuery(query));
  }

  /**
   * create instances of all clients used to contact microservices
   */
  static createClients(flux: FluxCapacitor) {
    return {
      bridge: FluxCapacitor.createBridge(flux.config, (err) => {
        const networkConfig = flux.config.network;
        flux.emit(core.Events.ERROR_BRIDGE, err);
        if (networkConfig.errorHandler) {
          networkConfig.errorHandler(err);
        }
      }),
      sayt: FluxCapacitor.createSayt(flux.config)
    };
  }

  /**
   * create instance of Searchandiser API client
   */
  static createBridge(config: FluxCapacitor.Configuration, errorHandler: (err: Error) => void) {
    const networkConfig = config.network;
    const bridge = new BrowserBridge(config.customerId, networkConfig.https, networkConfig);
    if (networkConfig.headers) {
      bridge.headers = networkConfig.headers;
    }
    bridge.errorHandler = errorHandler;

    return bridge;
  }

  /**
   * create instance of SAYT API client
   */
  static createSayt(config: FluxCapacitor.Configuration) {
    const saytConfig = config.autocomplete;

    return new Sayt(<any>{
      autocomplete: { language: saytConfig.language || config.language },
      collection: saytConfig.collection || FluxCapacitor.extractCollection(config),
      productSearch: { area: saytConfig.area || config.area },
      subdomain: config.customerId,
    });
  }

  /**
   * extract current collection from config
   */
  static extractCollection(config: FluxCapacitor.Configuration) {
    return typeof config.collection === 'object' ? config.collection.default : config.collection;
  }
}

namespace FluxCapacitor {
  export interface Configuration {
    /**
     * GroupBy customer ID
     */
    customerId: string;
    /**
     * ID unique to the viewer of the rendered page
     */
    visitorId?: string;
    /**
     * ID unique to the session of the viewer of the rendered page
     */
    sessionId?: string;

    /**
     * area of search data
     */
    area?: string;
    /**
     * input language for the search engine
     */
    language?: string;
    /**
     * collection of search data or collection options
     */
    collection?: ValueOptions<string>;

    /**
     * state initial configuration for SAYT
     */
    autocomplete?: {
      /**
       * area override
       */
      area?: string;
      /**
       * collection override
       */
      collection?: string;
      /**
       * language override
       */
      language?: string;
      /**
       * category field used to render sayt results
       */
      category?: string;
      /**
       * number of suggestions to request
       */
      suggestionCount?: number;
      /**
       * number of navigations to request
       */
      navigationCount?: number;
      /**
       * number of products to request
       */
      productCount?: number;
      /**
       * map of field to label, also restricts displayed navigations if provided
       */
      navigations?: { [field: string]: string };
      /**
       * default request values
       */
      defaults?: object;
      /**
       * override any computed request value
       */
      overrides?: object;
    };

    /**
     * state initial configuration for Searchandiser
     */
    search?: {
      /**
       * product fields to request
       * auto-generated from structure if not provided
       */
      fields?: string[];
      /**
       * number of products to request or sort options and default
       */
      pageSize?: ValueOptions<number>;
      /**
       * sorting of products or sort options and default
       */
      sort?: ValueOptions<{
        /**
         * field path to sort on
         */
        field: string;
        descending?: boolean;
      }>;
      /**
       * default request values
       */
      defaults?: Request;
      /**
       * override any computed request value
       */
      overrides?: Request;
    };

    /**
     * network request configuration
     */
    network?: Bridge.Configuration;
  }

  export namespace Bridge {
    export interface Configuration {
      /**
       * map of headers to send with search requests
       */
      headers?: { [key: string]: string };
      /**
       * send requests over HTTPS
       */
      https?: boolean;
      /**
       * connection timeout for search requests
       */
      timeout?: number;
      /**
       * global request error handler
       */
      errorHandler?: (error: Error) => void;
      /**
       * add SkipCache header to search requests
       */
      skipCache?: boolean;
      /**
       * add SkipSemantish header to search requests
       */
      skipSemantish?: boolean;
    }
  }

  export interface Clients {
    bridge: BrowserBridge;
    sayt: Sayt;
  }

  export type ValueOptions<T> = T | { options: T[], default: T };
}

export default FluxCapacitor;
