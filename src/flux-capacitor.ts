import { EventEmitter } from 'eventemitter3';
import { BrowserBridge, Request, Results } from 'groupby-api';
import { Sayt } from 'sayt';
import * as core from './core';

class FluxCapacitor extends EventEmitter {

  actions: core.ActionCreator = new core.ActionCreator(this, { search: '/search' });
  clients: {
    bridge: BrowserBridge;
    sayt: Sayt;
  } = FluxCapacitor.createClients(this);
  store: core.ReduxStore<core.Store.State> = core.Store.create(this.config, core.Observer.listener(this));

  constructor(public config: FluxCapacitor.Configuration) {
    super();
  }

  search(query: string = core.Selectors.query(this.store.getState())) {
    this.store.dispatch(this.actions.updateSearch({ query }));
  }

  refinements(navigationName: string) {
    this.store.dispatch(this.actions.fetchMoreRefinements(navigationName));
  }

  reset(query: string = null, { field: navigationId, index }: { field: string, index: number } = <any>{}) {
    this.store.dispatch(this.actions.updateSearch({ query, navigationId, index, clear: true }));
  }

  resize(pageSize: number) {
    this.store.dispatch(this.actions.updatePageSize(pageSize));
  }

  sort(label: string) {
    this.store.dispatch(this.actions.selectSort(label));
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

  countRecords(collection: string) {
    this.store.dispatch(this.actions.fetchCollectionCount(collection));
  }

  autocomplete(query: string) {
    this.store.dispatch(this.actions.updateAutocompleteQuery(query));
  }

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

  static createBridge(config: FluxCapacitor.Configuration, errorHandler: (err: Error) => void) {
    const networkConfig = config.network;
    const bridge = new BrowserBridge(config.customerId, networkConfig.https, networkConfig);
    if (networkConfig.headers) {
      bridge.headers = networkConfig.headers;
    }
    bridge.errorHandler = errorHandler;

    return bridge;
  }

  static createSayt(config: FluxCapacitor.Configuration) {
    const saytConfig = config.autocomplete;

    return new Sayt(<any>{
      autocomplete: { language: saytConfig.language || config.language },
      collection: saytConfig.collection || FluxCapacitor.extractCollection(config),
      productSearch: { area: saytConfig.area || config.area },
      subdomain: config.customerId,
    });
  }

  static extractCollection(config: FluxCapacitor.Configuration) {
    return typeof config.collection === 'object' ? config.collection.default : config.collection;
  }
}

namespace FluxCapacitor {
  export interface Configuration {
    customerId: string;
    visitorId?: string;
    sessionId?: string;

    area?: string;
    language?: string;
    collection?: string | {
      options: string[];
      default: string;
    };

    autocomplete?: {
      area?: string;
      collection?: string;
      language?: string;
      category?: string;
      suggestionCount?: number;
      navigationCount?: number;
      productCount?: number;
      // map of field to label, also restricts displayed navigations
      navigations?: { [field: string]: string };
      defaults?: any;
      overrides?: any;
    };

    search?: {
      fields?: string[]; // should be auto-generated from structure
      pageSize?: number | {
        options: number[];
        default: number;
      };
      sort?: { field: string, descending?: boolean } | {
        options: Array<{
          label: string; // the problem with label being the key is multilingual
          field: string;
          descending?: boolean;
        }>;
        default: string; // label
      };
      defaults?: Request; // unhandled options
      overrides?: Request; // applied before request is sent
    };

    network?: Bridge.Configuration;
  }

  export namespace Bridge {
    export interface Configuration {
      headers?: { [key: string]: string };
      https?: boolean;
      timeout?: number;
      errorHandler?: (error: Error) => void;
      skipCache?: boolean;
      skipSemantish?: boolean;
    }
  }
}

export default FluxCapacitor;
