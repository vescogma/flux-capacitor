import { EventEmitter } from 'eventemitter3';
import { BrowserBridge, Results } from 'groupby-api';
import { Action as ReduxAction, Store as ReduxStore } from 'redux';
import { Sayt } from 'sayt';
import createActions from './core/action-creator';
import Actions from './core/actions';
import Adapter from './core/adapters/configuration';
import Configuration from './core/configuration';
import * as Events from './core/events';
import Observer from './core/observer';
import Selectors from './core/selectors';
import Store from './core/store';

declare module 'redux' {
  export interface Dispatch<S> {
    <A extends ReduxAction>(action: A): A;
    <A extends ReduxAction>(action: A[]): A[];
  }
}

class FluxCapacitor extends EventEmitter {

  // tslint:disable-next-line typedef variable-name
  __rawActions = createActions(this);
  /**
   * actions for modifying contents of the store
   */
  // tslint:disable-next-line typedef
  actions = this.__rawActions(() => ({}));
  /**
   * selector functions for extracting data from the store
   */
  selectors: typeof Selectors = Selectors;
  /**
   * instances of all microservice clients
   */
  clients: Configuration.Clients = FluxCapacitor.createClients(this);
  /**
   * instance of the state store
   */
  store: ReduxStore<Store.State> = Store.create(this, Observer.listener(this));

  constructor(public config: Configuration) {
    super();
  }

  saveState(route: string) {
    this.emit(Events.HISTORY_SAVE, { route, state: this.store.getState() });
  }

  /* ACTION SUGAR */

  search(query?: string) {
    this.store.dispatch(this.actions.search(query));
  }

  products() {
    this.store.dispatch(this.actions.fetchProducts());
  }

  moreRefinements(navigationName: string) {
    this.store.dispatch(this.actions.fetchMoreRefinements(navigationName));
  }

  moreProducts(amount: number) {
    this.store.dispatch(this.actions.fetchMoreProducts(amount));
  }

  reset(query?: string, refinement?: { field: string, index: number }) {
    this.store.dispatch(this.actions.resetRecall(query, refinement));
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

  details(product: Store.Product) {
    this.store.dispatch(this.actions.updateDetails(product));
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

  saytSuggestions(query: string) {
    this.store.dispatch(this.actions.fetchAutocompleteSuggestions(query));
  }

  saytProducts(query: string, refinements: Actions.Payload.Autocomplete.Refinement[] = []) {
    this.store.dispatch(this.actions.fetchAutocompleteProducts(query, refinements));
  }

  /**
   * create instances of all clients used to contact microservices
   */
  static createClients(flux: FluxCapacitor) {
    return {
      bridge: FluxCapacitor.createBridge(flux.config, (err) => {
        const networkConfig = flux.config.network;
        flux.emit(Events.ERROR_BRIDGE, err);
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
  static createBridge(config: Configuration, errorHandler: (err: Error) => void) {
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
  static createSayt(config: Configuration) {
    const networkConfig = config.network;
    return new Sayt(<any>{
      https: networkConfig.https,
      collection: Adapter.extractAutocompleteCollection(config) || Adapter.extractCollection(config),
      subdomain: config.customerId,
    });
  }
}

export default FluxCapacitor;
