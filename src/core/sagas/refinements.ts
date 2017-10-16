import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import RecommendationsAdapter from '../adapters/recommendations';
import Adapter from '../adapters/refinements';
import Events from '../events';
import Requests from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';

export namespace Tasks {
  export function* fetchMoreRefinements(flux: FluxCapacitor, action: Actions.FetchMoreRefinements) {
    try {
      const state: Store.State = yield effects.select();
      const res = yield effects.call(
        [flux.clients.bridge, flux.clients.bridge.refinements],
        Requests.search(state, flux.config),
        action.payload
      );
      flux.emit(Events.BEACON_MORE_REFINEMENTS, action.payload);
      res.navigation = RecommendationsAdapter.sortAndPinNavigations(
        [res.navigation],
        Selectors.navigationSort(flux.store.getState()),
        flux.config
      )[0];
      const { navigationId, refinements, selected } = Adapter.mergeRefinements(res, state);
      yield effects.put(flux.actions.receiveMoreRefinements(navigationId, refinements, selected));
    } catch (e) {
      yield effects.put(utils.action(Actions.RECEIVE_MORE_REFINEMENTS, e));
    }
  }
}

export default (flux: FluxCapacitor) => function* saga() {
  yield effects.takeLatest(Actions.FETCH_MORE_REFINEMENTS, Tasks.fetchMoreRefinements, flux);
};
