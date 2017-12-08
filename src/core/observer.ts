import { Store as ReduxStore } from 'redux';
import FluxCapacitor from '../flux-capacitor';
import SearchAdapter from './adapters/search';
import Events from './events';
import Store from './store';
import * as utils from './utils';

type Observer = (oldState: any, newState: any, path: string) => void;

namespace Observer {
  export interface Map { [key: string]: Observer | Map; }
  export type Node = Map | Observer | (Observer & Map);

  export const listener = (flux: FluxCapacitor) =>
    (store: ReduxStore<Store.State>) => Observer.listen(flux, store);

  export function listen(flux: FluxCapacitor, store: ReduxStore<Store.State>) {
    let savedState = store.getState();

    return () => {
      const oldState = savedState;
      const newState = savedState = store.getState();

      Observer.resolve(oldState, newState, Observer.create(flux), '[root]');
    };
  }

  export function resolve(oldState: any, newState: any, observer: Node, path: string) {
    if (oldState !== newState) {
      if (typeof observer === 'function') {
        observer(oldState, newState, path);
      }

      Object.keys(observer)
        .forEach((key) => Observer.resolve(
          (oldState || {})[key],
          (newState || {})[key],
          observer[key],
          `${path}.${key}`
        ));
    }
  }

  export function terminal(oldState: any, newState: any, observer: Observer, path: string) {
    if (oldState !== newState) {
      observer(oldState, newState, path);
    }
  }

  export function indexed(emit: Observer) {
    return (oldState, newState, path) =>
      Object.keys(newState)
        .forEach((key) => Observer.terminal(oldState[key], newState[key], emit, `${path}.${key}`));
  }

  export function navigations(navigationsEvent: string, selectedRefinementsEvent: string, emit: Function) {
    return ((emitIndexUpdated: Observer) =>
            (oldState: Store.Indexed<Store.Navigation>, newState: Store.Indexed<Store.Navigation>, path: string) => {
              if (oldState.allIds !== newState.allIds) {
                emitIndexUpdated(oldState, newState, path);
              } else {
                newState.allIds.forEach((id) => {
                  const oldNavigation = oldState.byId[id];
                  const newNavigation = newState.byId[id];
                  if (oldNavigation.selected !== newNavigation.selected
                    || oldNavigation.refinements !== newNavigation.refinements) {
                    // tslint:disable-next-line max-line-length
                    emit(`${selectedRefinementsEvent}:${id}`)(oldNavigation, newNavigation, `${path}.byId.${id}`);
                  }
                });
              }
            })(emit(navigationsEvent));
  }

  export function create(flux: FluxCapacitor) {
    const emit = (event: string) => (_, value: any, path: string) => {
      flux.emit(event, value);
      flux.emit(Events.OBSERVER_NODE_CHANGED, { event, path, value });
    };

    return {
      data: {
        present: {
          // tslint:disable-next-line max-line-length
          autocomplete: ((emitSuggestionsUpdated: Observer, emitQueryUpdated: Observer, emitProductsUpdated: Observer, emitTemplateUpdated: Observer) =>
            (oldState: Store.Autocomplete, newState: Store.Autocomplete, path: string) => {
              if (oldState !== newState) {
                if (oldState.suggestions !== newState.suggestions
                  || oldState.category !== newState.category
                  || oldState.navigations !== newState.navigations) {
                  emitSuggestionsUpdated(oldState, newState, path);
                }
                if (oldState.query !== newState.query) {
                  emitQueryUpdated(oldState.query, newState.query, `${path}.query`);
                }
                if (oldState.products !== newState.products) {
                  // tslint:disable-next-line max-line-length
                  emitProductsUpdated(SearchAdapter.extractData(oldState.products), SearchAdapter.extractData(newState.products), `${path}.products`);
                }
                if (oldState.template !== newState.template) {
                  emitTemplateUpdated(oldState.template, newState.template, `${path}.template`);
                }
              }
            })(
            emit(Events.AUTOCOMPLETE_SUGGESTIONS_UPDATED),
            emit(Events.AUTOCOMPLETE_QUERY_UPDATED),
            emit(Events.AUTOCOMPLETE_PRODUCTS_UPDATED),
            emit(Events.AUTOCOMPLETE_TEMPLATE_UPDATED)
            ),

          collections: {
            byId: Observer.indexed(emit(Events.COLLECTION_UPDATED)),
            selected: emit(Events.SELECTED_COLLECTION_UPDATED),
          },

          details: {
            data: emit(Events.DETAILS_UPDATED),
          },

          navigations: Observer.navigations(Events.NAVIGATIONS_UPDATED, Events.SELECTED_REFINEMENTS_UPDATED, emit),
          page: Object.assign(emit(Events.PAGE_UPDATED), {
            current: emit(Events.CURRENT_PAGE_UPDATED),
            sizes: emit(Events.PAGE_SIZE_UPDATED)
          }),

          products: ((emitMoreProductsAdded: Observer, emitProductsUpdated: Observer) =>
            (oldState: Store.ProductWithMetadata[], newState: Store.ProductWithMetadata[], path: string) => {
              const oldLength = oldState.length;
              if (oldLength < newState.length && oldState[0] === newState[0]) {
                emitMoreProductsAdded(oldState, newState.slice(oldLength), path);
              } else {
                emitProductsUpdated(SearchAdapter.extractData(oldState), SearchAdapter.extractData(newState), path);
              }
            })(emit(Events.MORE_PRODUCTS_ADDED), emit(Events.PRODUCTS_UPDATED)),

          query: {
            corrected: emit(Events.CORRECTED_QUERY_UPDATED),
            didYouMean: emit(Events.DID_YOU_MEANS_UPDATED),
            original: emit(Events.ORIGINAL_QUERY_UPDATED),
            related: emit(Events.RELATED_QUERIES_UPDATED),
            rewrites: emit(Events.QUERY_REWRITES_UPDATED),
          },

          recommendations: {
            suggested: {
              products: (oldState, newState, path) =>
                // tslint:disable-next-line max-line-length
                emit(Events.RECOMMENDATIONS_PRODUCTS_UPDATED)(SearchAdapter.extractData(oldState), SearchAdapter.extractData(newState), path)
            },
          },

          pastPurchases: {
            skus: emit(Events.PAST_PURCHASE_SKUS_UPDATED),
            products: emit(Events.PAST_PURCHASE_PRODUCTS_UPDATED),
            saytPastPurchases: emit(Events.SAYT_PAST_PURCHASES_UPDATED),
            query: emit(Events.PAST_PURCHASE_QUERY_UPDATED),
            page: Object.assign(emit(Events.PAST_PURCHASE_PAGE_UPDATED), {
              current: emit(Events.PAST_PURCHASE_CURRENT_PAGE_UPDATED),
              sizes: emit(Events.PAST_PURCHASE_PAGE_SIZE_UPDATED),
            }),
            navigations: Observer.navigations(Events.PAST_PURCHASE_NAVIGATIONS_UPDATED,
                                              Events.PAST_PURCHASE_SELECTED_REFINEMENTS_UPDATED, emit),
            sort: emit(Events.PAST_PURCHASE_SORT_UPDATED),
          },

          cart: {
            content: {
              cartId: emit(Events.CART_ID_UPDATED),
              // items: emit(Events.CART_UPDATED)
            }
          },

          recordCount: emit(Events.RECORD_COUNT_UPDATED),

          redirect: emit(Events.REDIRECT),

          sorts: emit(Events.SORTS_UPDATED),

          template: emit(Events.TEMPLATE_UPDATED),

          personalization: {
            _persist: {
              rehydrated: (oldState, newState, path) => {
                if (newState) {
                  emit(Events.PERSONALIZATION_BIASING_REHYDRATED)(oldState, newState, path);
                }
              }
            }
          },
        },
      },
      isRunning: (oldState, newState, path) => {
        if (newState) {
          emit(Events.APP_STARTED)(oldState, newState, path);
        } else if (oldState) {
          emit(Events.APP_KILLED)(oldState, newState, path);
        }
      },
      session: {
        recallId: emit(Events.RECALL_CHANGED),
        searchId: emit(Events.SEARCH_CHANGED),
        location: emit(Events.LOCATION_UPDATED)
      },
      ui: ((emitUiUpdated: Observer) =>
        (oldState: Store.UI, newState: Store.UI, path: string) => {
          if (oldState !== newState) {
            emitUiUpdated(oldState, newState, path);
            Object.keys(newState).forEach((tagName) => {
              Object.keys(newState[tagName]).forEach((id) => {
                const oldTagState = (oldState[tagName] || {})[id] || {};
                const newTagState = newState[tagName][id];
                if (oldTagState !== newTagState) {
                  emit(`${Events.UI_UPDATED}:${tagName}:${id}`)(oldTagState, newTagState, `${path}.${tagName}.${id}`);
                }
              });
            });
          }
        })(emit(Events.UI_UPDATED)),
    };
  }
}

export default Observer;
