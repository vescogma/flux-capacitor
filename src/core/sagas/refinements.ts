import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import * as utils from '../actions/utils';
import RecommendationsAdapter from '../adapters/recommendations';
import Adapter from '../adapters/refinements';
import Requests from '../requests';
import Selectors from '../selectors';
import Store from '../store';

export namespace Tasks {
  export function* fetchMoreRefinements(flux: FluxCapacitor, action: Actions.FetchMoreRefinements) {
    try {
      const state: Store.State = yield effects.select();
      const res = yield effects.call(
        [flux.clients.bridge, flux.clients.bridge.refinements],
        Requests.search(state, flux.config),
        action.payload
      );
      res.navigation = RecommendationsAdapter.sortAndPinNavigations(
        [res.navigation],
        Selectors.navigationSort(flux.store.getState()),
        flux.config
      )[0];
      const { navigationId, refinements, selected } = Adapter.mergeRefinements(res, state);
      yield effects.put(flux.actions.receiveMoreRefinements(navigationId, refinements, selected));
    } catch (e) {
      yield effects.put(utils.createAction(Actions.RECEIVE_MORE_REFINEMENTS, e));
    }
  }
}

export default (flux: FluxCapacitor) => function* saga() {
  yield effects.takeLatest(Actions.FETCH_MORE_REFINEMENTS, Tasks.fetchMoreRefinements, flux);
};
