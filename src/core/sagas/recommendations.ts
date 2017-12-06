import { Biasing, Request, Sort } from 'groupby-api';
import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import ConfigAdapter from '../adapters/configuration';
import Adapter from '../adapters/recommendations';
import SearchAdapter from '../adapters/search';
import Configuration from '../configuration';
import Requests from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';

export class MissingPayload extends Error {
  constructor (err: string = 'No Secured Payload') {
    super(err);
    Object.setPrototypeOf(this, MissingPayload.prototype);
  }
}

export namespace Tasks {
  // tslint:disable-next-line max-line-length
  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchRecommendationsProducts) {
    try {
      const state = yield effects.select();
      const config = yield effects.select(Selectors.config);
      const { idField, productSuggestions: productConfig } = config.recommendations;
      const productCount = productConfig.productCount;
      if (productCount > 0) {
        // fall back to default mode "popular" if not provided
        // "popular" default will likely provide the most consistently strong data
        const mode = Configuration.RECOMMENDATION_MODES[productConfig.mode || 'popular'];
        const recommendationsUrl = Adapter.buildUrl(config.customerId, 'products', mode);
        const recommendationsRequestBody = {
          size: productConfig.productCount,
          type: 'viewProduct',
          target: idField
        };

        const recommendationsResponse = yield effects.call(utils.fetch, recommendationsUrl, {
          method: 'POST',
          body: JSON.stringify(Adapter.addLocationToRequest(recommendationsRequestBody, state))
        });
        const recommendations = yield recommendationsResponse.json();
        const refinements = recommendations.result
          .filter(({ productId }) => productId)
          .map(({ productId }) => ({ navigationName: idField, type: 'Value', value: productId }));
        const results = yield effects.call(
          [flux.clients.bridge, flux.clients.bridge.search],
          {
            ...Requests.search(state),
            pageSize: productConfig.productCount,
            includedNavigations: [],
            skip: 0,
            refinements
          }
        );

        yield effects.put(flux.actions.receiveRecommendationsProducts(SearchAdapter.augmentProducts(results)));
      }
    } catch (e) {
      yield effects.put(flux.actions.receiveRecommendationsProducts(e));
    }
  }

  export function* fetchSkus(config: Configuration, endpoint: string, query?: string) {
    const securedPayload = ConfigAdapter.extractSecuredPayload(config);
    if (securedPayload) {
      const url = `https://${config.customerId}.groupbycloud.com/orders/v1/public/skus/${endpoint}`;
      const response = yield effects.call(utils.fetch, url, Adapter.buildBody({
        securedPayload,
        query
      }));
      return yield response.json();
    }
    throw new MissingPayload();
  }

  // tslint:disable-next-line max-line-length
  export function* fetchProductsFromSkus(flux: FluxCapacitor, skus: Store.PastPurchases.PastPurchaseProduct[], request: Request) {
    const ids: string[] = skus.map(({ sku }) => sku);
    return yield effects.call(
      [flux.clients.bridge, flux.clients.bridge.search],
      {
        ...request,
        biasing: <Biasing>{
          restrictToIds: ids,
        },
        sort: <Sort[]>[{ type: 'ByIds', ids }],
      });
  }

  export function* fetchPastPurchases(flux: FluxCapacitor, action: Actions.FetchPastPurchases) {
    try {
      const config: Configuration = yield effects.select(Selectors.config);
      const productCount = ConfigAdapter.extractPastPurchaseProductCount(config);
      if (productCount > 0) {
        const { result } = yield effects.call(fetchSkus, config, 'popular');
        if (result) {
          yield effects.put(flux.actions.receivePastPurchaseSkus(result));
          yield effects.put(flux.actions.fetchPastPurchaseNavigations());
        }
      } else {
        yield effects.put(flux.actions.receivePastPurchaseSkus([]));
      }
    } catch (e) {
      if (!(e instanceof MissingPayload)) { // pass through misisng payloads
        return effects.put(flux.actions.receivePastPurchaseSkus(e));
      }
    }
  }

  // tslint:disable-next-line max-line-length
  export function* fetchPastPurchaseProducts(flux: FluxCapacitor, action: Actions.FetchPastPurchaseProducts, getNavigations: boolean = false) {
    try {
      const pastPurchaseSkus: Store.PastPurchases.PastPurchaseProduct[] = yield effects.select(Selectors.pastPurchases);
      if (pastPurchaseSkus.length > 0) {
        const request = yield effects.select(Requests.pastPurchaseProducts, getNavigations);
        const results = yield effects.call(fetchProductsFromSkus, flux, pastPurchaseSkus, request);
        if (getNavigations) {
          const navigations = Adapter.pastPurchaseNavigations(yield effects.select(Selectors.config),
                                                              SearchAdapter.combineNavigations(results));
          yield effects.put(<any>[
            flux.actions.receivePastPurchaseAllRecordCount(results.totalRecordCount),
            flux.actions.receivePastPurchaseRefinements(navigations),
          ]);
        } else {
          yield effects.put(<any>[
            flux.actions.receivePastPurchasePage(SearchAdapter.extractPage(
              flux.store.getState(), SearchAdapter.extractRecordCount(results),
              Selectors.pastPurchasePage,Selectors.pastPurchasePageSize)),
            flux.actions.receivePastPurchaseCurrentRecordCount(results.totalRecordCount),
            flux.actions.receivePastPurchaseProducts(SearchAdapter.augmentProducts(results)),
          ]);
          flux.saveState(utils.Routes.PAST_PURCHASE);
        }
      }
    } catch (e) {
      return effects.put(flux.actions.receivePastPurchaseProducts(e));
    }
  }

  export function* fetchSaytPastPurchases(flux: FluxCapacitor, { payload }: Actions.FetchSaytPastPurchases) {
    try {
      const config: Configuration = yield effects.select(Selectors.config);
      const pastPurchaseSkus = yield effects.select(Selectors.pastPurchases);
      if (pastPurchaseSkus.length > 0) {
        const request = yield effects.select(Requests.autocompleteProducts);
        const results = yield effects.call(fetchProductsFromSkus, flux, pastPurchaseSkus, {
          ...request,
          query: payload
        });
        yield effects.put(flux.actions.receiveSaytPastPurchases(SearchAdapter.augmentProducts(results)));
      } else {
        yield effects.put(flux.actions.receiveSaytPastPurchases([]));
      }
    } catch (e) {
      return effects.put(flux.actions.receiveSaytPastPurchases(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* recommendationsSaga() {
  yield effects.takeLatest(Actions.FETCH_RECOMMENDATIONS_PRODUCTS, Tasks.fetchProducts, flux);
  yield effects.takeLatest(Actions.FETCH_PAST_PURCHASES, Tasks.fetchPastPurchases, flux);
  yield effects.takeLatest(Actions.FETCH_PAST_PURCHASE_PRODUCTS, Tasks.fetchPastPurchaseProducts, flux);
  yield effects.takeLatest(Actions.FETCH_PAST_PURCHASE_NAVIGATIONS, Tasks.fetchPastPurchaseProducts, flux, null, true);
  yield effects.takeLatest(Actions.FETCH_SAYT_PAST_PURCHASES, Tasks.fetchSaytPastPurchases, flux);
};
