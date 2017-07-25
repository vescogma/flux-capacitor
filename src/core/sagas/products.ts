import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import * as Events from '../events';
import Requests from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';

export namespace Tasks {
  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchProducts) {
    try {
      const request = yield effects.select(Requests.search, flux.config);
      const res = yield effects.call([flux.clients.bridge, flux.clients.bridge.search], request);

      if (res.redirect) {
        yield effects.put(flux.actions.receiveRedirect(res.redirect));
      }

      flux.emit(Events.BEACON_SEARCH, res.id);
      yield effects.put(<any>flux.actions.receiveProducts(res));
      flux.saveState(utils.Routes.SEARCH);
    } catch (e) {
      yield effects.put(<any>flux.actions.receiveProducts(e));
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
