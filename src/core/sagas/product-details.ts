import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Events from '../events';
import Requests from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';

export namespace Tasks {
  export function* fetchProductDetails(flux: FluxCapacitor, { payload: id }: Actions.FetchProductDetails) {
    try {
      const request = yield effects.select(Requests.search);
      const { records } = yield effects.call(
        [flux.clients.bridge, flux.clients.bridge.search],
        {
          ...request,
          query: null,
          pageSize: 1,
          skip: 0,
          refinements: [{ navigationName: 'id', type: 'Value', value: id }]
        }
      );

      if (records.length !== 0) {
        const [record] = records;
        yield effects.call(receiveDetailsProduct, flux, record);
      } else {
        throw new Error(`no records found matching id: ${id}`);
      }
    } catch (e) {
      yield effects.put(flux.actions.receiveDetailsProduct(e));
    }
  }

  export function* receiveDetailsProduct(flux: FluxCapacitor, record: Store.Product) {
    flux.emit(Events.BEACON_VIEW_PRODUCT, record);
    yield effects.put(flux.actions.receiveDetailsProduct(record.allMeta));
    flux.saveState(utils.Routes.DETAILS);
  }
}

export default (flux: FluxCapacitor) => function* saga() {
  yield effects.takeLatest(Actions.FETCH_PRODUCT_DETAILS, Tasks.fetchProductDetails, flux);
};
