import { Results } from 'groupby-api';
import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import RecommendationsAdapter from '../adapters/recommendations';
import Events from '../events';
import Requests from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';
import { Tasks as productDetailsTasks } from './product-details';

export namespace Tasks {
  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchProducts) {
    try {
      let [products, navigations]: [Results, Store.Recommendations.Navigation[]] = yield effects.all([
        effects.call(fetchProductsRequest, flux, action),
        effects.call(fetchNavigations, flux, action)
      ]);
      if (products.redirect) {
        yield effects.put(flux.actions.receiveRedirect(products.redirect));
      }
      if (flux.config.search.redirectSingleResult && products.totalRecordCount === 1) {
        yield effects.call(productDetailsTasks.receiveDetailsProduct, flux, products.records[0]);
      } else {
        flux.emit(Events.BEACON_SEARCH, products.id);
        const actions: any[] = [flux.actions.receiveProducts(products)];
        if (navigations && !(navigations instanceof Error)) {
          actions.unshift(flux.actions.receiveNavigationSort(navigations));
        } else {
          // if inav navigations is invalid then make it an empty array so it does not sort
          navigations = [];
        }
        products.availableNavigation = RecommendationsAdapter.sortAndPinNavigations(
          products.availableNavigation,
          navigations,
          flux.config
        );
        yield effects.put(<any>actions);
        flux.saveState(utils.Routes.SEARCH);
      }
    } catch (e) {
      yield effects.put(<any>flux.actions.receiveProducts(e));
    }
  }

  export function* fetchProductsRequest(flux: FluxCapacitor, action: Actions.FetchProducts) {
    const request = yield effects.select(Requests.search, flux.config);
    return yield effects.call([flux.clients.bridge, flux.clients.bridge.search], request);
  }

  export function* fetchNavigations(flux: FluxCapacitor, action: Actions.FetchProducts) {
    try {
      const iNav = flux.config.recommendations.iNav;
      if (iNav.navigations.sort || iNav.refinements.sort) {
        const query = yield effects.select(Selectors.query, flux.store.getState());
        const recommendationsUrl = RecommendationsAdapter.buildUrl(flux.config.customerId, 'refinements', 'Popular');
        const sizeAndWindow = { size: iNav.size, window: iNav.window };
        // tslint:disable-next-line max-line-length
        const recommendationsResponse = yield effects.call(utils.fetch, recommendationsUrl, RecommendationsAdapter.buildBody({
          minSize: iNav.minSize || iNav.size,
          sequence: [
            { ...sizeAndWindow,
              matchPartial: {
                and: [{ search: { query } }]
              },
            },
            {
              ...sizeAndWindow,
            }
          ]}));
        const recommendations = yield recommendationsResponse.json();
        return recommendations.result
          .filter(({ values }) => values); // assumes no values key will be empty
      }
      return [];
    } catch (e) {
      return e;
    }
  }

  export function* fetchMoreProducts(flux: FluxCapacitor, action: Actions.FetchMoreProducts) {
    try {
      const state: Store.State = yield effects.select();
      const { records: products, id } = yield effects.call(
        [flux.clients.bridge, flux.clients.bridge.search],
        {
          ...Requests.search(state, flux.config),
          pageSize: action.payload,
          skip: Selectors.products(state).length
        }
      );

      flux.emit(Events.BEACON_SEARCH, id);
      yield effects.put(flux.actions.receiveMoreProducts(products));
    } catch (e) {
      yield effects.put(flux.actions.receiveMoreProducts(e));
    }
  }
}

export default (flux: FluxCapacitor) => {
  return function* saga() {
    yield effects.takeLatest(Actions.FETCH_PRODUCTS, Tasks.fetchProducts, flux);
    yield effects.takeLatest(Actions.FETCH_MORE_PRODUCTS, Tasks.fetchMoreProducts, flux);
  };
};
