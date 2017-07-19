import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/refinements';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';

export namespace Tasks {
  export function* fetchMoreRefinements(flux: FluxCapacitor, action: Actions.FetchMoreRefinements) {
    try {
      const state: Store.State = yield effects.select();
      const res = yield effects.call(
        [flux.clients.bridge, flux.clients.bridge.refinements],
        Selectors.searchRequest(state, flux.config),
        action.payload
      );
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
