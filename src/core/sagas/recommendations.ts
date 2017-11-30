import { Biasing, Request, SelectedRefinement, Sort } from 'groupby-api';
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
    const token = ConfigAdapter.extractSecuredPayload(config);
    const securedPayload = token['parser'] && token['cookie'] ? token['parser'](token['cookie']) : token;
    if (securedPayload) {
      const url = `https://${config.customerId}.groupbycloud.com/orders/v1/public/skus/${endpoint}`;
      const response = yield effects.call(utils.fetch, url, Adapter.buildBody({
        securedPayload,
        query
      }));
      return yield response.json();
    }
    return [];
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
      const productCount = ConfigAdapter.extractProductCount(config);
      if (productCount > 0) {
        const { result } = yield effects.call(fetchSkus, config, 'popular');
        yield effects.put(flux.actions.receivePastPurchaseSkus(result));
      } else {
        yield effects.put(flux.actions.receivePastPurchaseSkus([]));
      }
    } catch (e) {
      return effects.put(flux.actions.receivePastPurchaseSkus(e));
    }
  }

  export function* fetchPastPurchaseProducts(flux: FluxCapacitor, action: Actions.FetchPastPurchaseProducts) {
    try {
      const query = yield effects.select(Selectors.pastPurchaseQuery);
      const config: Configuration = yield effects.select(Selectors.config);
      const pastPurchaseSkus: Store.PastPurchases.PastPurchaseProduct[] = query ?
        (yield effects.call(fetchSkus, config, '_search', query)).result :
        yield effects.select(Selectors.pastPurchases);
      if (pastPurchaseSkus.length > 0) {
        const request = yield effects.select(Requests.pastPurchaseProducts);
        const results = yield effects.call(fetchProductsFromSkus, flux, pastPurchaseSkus, request);
        const navigations = SearchAdapter.combineNavigations({
          ...results,
          availableNavigation: Adapter.pastPurchaseNavigations(config, results.availableNavigation),
          selectedNavigation: results.selectedNavigation.filter((navigation) => navigation.name !== 'id'),
        });
        yield effects.put(<any>[
          flux.actions.receivePastPurchaseProducts(SearchAdapter.augmentProducts(results)),
          flux.actions.receivePastPurchaseRecordCount(results.totalRecordCount),
          flux.actions.receivePastPurchaseRefinements(navigations),
          flux.actions.receivePastPurchasePage(SearchAdapter.extractPage(
            flux.store.getState(),
            SearchAdapter.extractRecordCount(results), {
              pageSelector: Selectors.pastPurchasePage,
              pageSizeSelector: Selectors.pastPurchasePageSize,
            }))
        ]);
        flux.saveState(utils.Routes.PAST_PURCHASE);
      }
    } catch (e) {
      return effects.put(flux.actions.receivePastPurchaseProducts(e));
    }
  }

  export function* fetchSaytPastPurchases(flux: FluxCapacitor, { payload }: Actions.FetchSaytPastPurchases) {
    try {
      const config: Configuration = yield effects.select(Selectors.config);
      const { result } = yield effects.call(fetchSkus, config, '_search', payload);
      if (result.length > 0) {
        const request = yield effects.select(Requests.autocompleteProducts);
        const results = yield effects.call(fetchProductsFromSkus, flux, result, request);
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
  yield effects.takeLatest(Actions.FETCH_SAYT_PAST_PURCHASES, Tasks.fetchSaytPastPurchases, flux);
};
