import { Store } from '.';
import FluxCapacitor from '../flux-capacitor';
import * as Events from './events';
import { rayify } from './utils';

export const DETAIL_QUERY_INDICATOR = 'gbiDetailQuery';
export const INDEXED = Symbol();
export const FETCH_EVENTS = {
  autocompleteProducts: Events.FETCH_AUTOCOMPLETE_PRODUCTS_DONE,
  autocompleteSuggestions: Events.FETCH_AUTOCOMPLETE_SUGGESTIONS_DONE,
  details: Events.FETCH_DETAILS_DONE,
  moreRefinements: Events.FETCH_MORE_REFINEMENTS_DONE,
  search: Events.FETCH_SEARCH_DONE,
};

type Observer = (oldState: any, newState: any) => void;

namespace Observer {
  export interface Map { [key: string]: Observer | Map; }
  export type Node = Map | Observer | (Observer & Map);

  export function listen(flux: FluxCapacitor) {
    let oldState;

    return () => {
      const state = flux.store.getState();

      Observer.resolve(oldState, state, Observer.create(flux));

      oldState = state;
    };
  }

  export function shouldObserve(oldState: any, newState: any, observer: Node): observer is Observer {
    // double check this logic
    return typeof observer === 'function'
      && !(INDEXED in observer && oldState.allIds === newState.allIds);
  }

  export function resolve(oldState: any, newState: any, observer: Node) {
    if (oldState !== newState) {
      if (Observer.shouldObserve(oldState, newState, observer)) {
        observer(oldState, newState);
      }

      if (INDEXED in observer && 'allIds' in newState && oldState.allIds === newState.allIds) {
        Object.keys(newState.allIds)
          .forEach((key) => Observer.resolveIndexed(oldState.byId[key], newState.byId[key], observer[INDEXED]));
      }

      Object.keys(observer)
        .forEach((key) => Observer.resolve((oldState || {})[key], (newState || {})[key], observer[key]));
    }
  }

  export function resolveIndexed(oldState: any, newState: any, observer: Observer) {
    if (oldState !== newState) {
      observer(oldState, newState);
    }
  }

  export function create(flux: FluxCapacitor) {
    const emit = (event: string) => (_, newValue) => flux.emit(event, newValue);

    return {
      data: {
        autocomplete: Object.assign(emit(Events.AUTOCOMPLETE_UPDATED), {
          products: emit(Events.AUTOCOMPLETE_PRODUCTS_UPDATED),
          query: emit(Events.AUTOCOMPLETE_QUERY_UPDATED),
        }),

        collections: {
          [INDEXED]: (_, newIndexed) => flux.emit(`${Events.COLLECTION_UPDATED}:${newIndexed.name}`, newIndexed),
          selected: emit(Events.SELECTED_COLLECTION_UPDATED),
        },

        details: {
          id: emit(Events.DETAILS_ID_UPDATED),
          product: emit(Events.DETAILS_PRODUCT_UPDATED),
        },

        navigations: Object.assign(emit(Events.NAVIGATIONS_UPDATED), {
          [INDEXED]: (oldNavigation, newNavigation) => {
            if (oldNavigation.selected !== newNavigation.selected) {
              flux.emit(`${Events.SELECTED_REFINEMENTS_UPDATED}:${newNavigation.field}`, newNavigation.selected);
            }
          },
        }),

        page: Object.assign(emit(Events.PAGE_UPDATED), {
          current: emit(Events.CURRENT_PAGE_UPDATED),
          size: emit(Events.PAGE_SIZE_UPDATED),
        }),

        products: emit(Events.PRODUCTS_UPDATED),

        query: Object.assign(emit(Events.QUERY_UPDATED), {
          corrected: emit(Events.CORRECTED_QUERY_UPDATED),
          didYouMeans: emit(Events.DID_YOU_MEANS_UPDATED),
          original: emit(Events.ORIGINAL_QUERY_UPDATED),
          related: emit(Events.RELATED_QUERIES_UPDATED),
          rewrites: emit(Events.QUERY_REWRITES_UPDATED),
        }),

        recordCount: emit(Events.RECORD_COUNT_UPDATED),

        reditect: emit(Events.REDIRECT),

        sorts: emit(Events.SORTS_UPDATED),

        template: emit(Events.TEMPLATE_UPDATED),
      },
      isFetching: (oldState, newState) => {
        Object.keys(newState)
          .forEach((key) => {
            if (!oldState[key] && newState[key]) {
              this.flux.emit(FETCH_EVENTS[key]);
            }
          });
      },
      session: {
        recallId: emit(Events.RECALL_CHANGED),
        searchId: emit(Events.SEARCH_CHANGED),
      },
    };
  }
}

export default Observer;
