import { EventEmitter } from 'eventemitter3';
import { BrowserBridge } from 'groupby-api';
import { Store } from 'redux';
import { Sayt } from 'sayt';
import * as core from './core';

export default class FluxCapacitor extends EventEmitter {

  originalQuery: string;
  actions: core.Action.Creator;
  clients: {
    bridge: BrowserBridge;
    sayt: Sayt;
  };
  store: Store<core.Store.State> = core.Store.create();

  constructor() {
    super();
    this.actions = new core.Action.Creator(this, { search: '/search' });
    this.store.subscribe(() => this.originalQuery = this.store.getState().data.query.original);
  }

  search(query: string = this.originalQuery) {
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
}
