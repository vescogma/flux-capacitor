import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/search';
import Requests from '../requests';

export namespace Tasks {
  export function* fetchCount(flux: FluxCapacitor, { payload: collection }: Actions.FetchCollectionCount) {
    try {
      const request = yield effects.select(Requests.search, flux.config);
      const res = yield effects.call([flux.clients.bridge, flux.clients.bridge.search], {
        ...request,
        collection
      });

      yield effects.put(flux.actions.receiveCollectionCount({
        collection,
        count: Adapter.extractRecordCount(res)
      }));
    } catch (e) {
      yield effects.put(flux.actions.receiveCollectionCount(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* saga() {
  yield effects.takeEvery(Actions.FETCH_COLLECTION_COUNT, Tasks.fetchCount, flux);
};
