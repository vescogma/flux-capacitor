import { Results } from 'groupby-api';
import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import PersonalizationAdapter from '../adapters/personalization';
import RecommendationsAdapter from '../adapters/recommendations';
import SearchAdapter from '../adapters/search';
import Events from '../events';
import Requests from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';

export namespace Tasks {
  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchProducts) {
    try {
      let [result, navigations]: [Results, Store.Recommendations.Navigation[]] = yield effects.all([
        effects.call(fetchProductsRequest, flux, action),
        effects.call(fetchNavigations, flux, action)
      ]);
      const config = yield effects.select(Selectors.config);

      if (result.redirect) {
        yield effects.put(flux.actions.receiveRedirect(result.redirect));
      }
      if (config.search.redirectSingleResult && result.totalRecordCount === 1) {
        yield effects.put(flux.actions.setDetails(result.records[0]));
      } else {
        flux.emit(Events.BEACON_SEARCH, result.id);
        const actions: any[] = [flux.actions.receiveProducts(result)];
        if (navigations && !(navigations instanceof Error)) {
          actions.unshift(flux.actions.receiveNavigationSort(navigations));
        } else {
          // if inav navigations is invalid then make it an empty array so it does not sort
          navigations = [];
        }
        result.availableNavigation = RecommendationsAdapter.sortAndPinNavigations(
          result.availableNavigation,
          navigations,
          config
        );
        yield effects.put(<any>actions);
        flux.saveState(utils.Routes.SEARCH);
      }
    } catch (e) {
      yield effects.put(<any>flux.actions.receiveProducts(e));
    }
  }

  export function* fetchProductsRequest(flux: FluxCapacitor, action: Actions.FetchProducts) {
    const addedBiases = yield effects.select(PersonalizationAdapter.convertBiasToSearch);
    const request = yield effects.select(Requests.search);
    const requestWithBiases = {
      ...request,
      biasing: {
        ...request.biasing,
        biases: ((request.biasing ? request.biasing.biases : []) || []).concat(addedBiases),
      }
    };
    return yield effects.call([flux.clients.bridge, flux.clients.bridge.search], requestWithBiases);
  }

  export function* fetchNavigations(flux: FluxCapacitor, action: Actions.FetchProducts) {
    try {
      const config = yield effects.select(Selectors.config);
      const iNav = config.recommendations.iNav;
      if (iNav.navigations.sort || iNav.refinements.sort) {
        const query = yield effects.select(Selectors.query);
        const recommendationsUrl = RecommendationsAdapter.buildUrl(config.customerId, 'refinements', 'Popular');
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
      const config = yield effects.select(Selectors.config);

      const result = yield effects.call(
        [flux.clients.bridge, flux.clients.bridge.search],
        {
          ...Requests.search(state),
          pageSize: action.payload.amount,
          skip: Selectors.products(state).length
        }
      );

      flux.emit(Events.BEACON_SEARCH, result.id);
      yield effects.put(<any>flux.actions.receiveMoreProducts(result));
    } catch (e) {
      yield effects.put(<any>flux.actions.receiveMoreProducts(e));
    }
  }

  export function* fetchProductsWhenHydrated(flux: FluxCapacitor, action: Actions.fetchProductsWhenHydrated) {
    if (Selectors.realTimeBiasesHydrated(flux.store.getState())) {
      yield effects.put(action.payload);
    } else {
      flux.once(Events.PERSONALIZATION_BIASING_REHYDRATED, () => flux.store.dispatch(action.payload));
    }
  }
}

export default (flux: FluxCapacitor) => {
  return function* saga() {
    yield effects.takeLatest(Actions.FETCH_PRODUCTS, Tasks.fetchProducts, flux);
    yield effects.takeLatest(Actions.FETCH_PRODUCTS_WHEN_HYDRATED, Tasks.fetchProductsWhenHydrated, flux);
    yield effects.takeLatest(Actions.FETCH_MORE_PRODUCTS, Tasks.fetchMoreProducts, flux);
  };
};