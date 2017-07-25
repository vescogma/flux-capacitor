import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import Adapter from '../../../../src/core/adapters/refinements';
import Requests from '../../../../src/core/requests';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/refinements';
import * as utils from '../../../../src/core/utils';
import suite from '../../_suite';

suite('refinements saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b', actions: {} };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_MORE_REFINEMENTS, Tasks.fetchMoreRefinements, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('fetchMoreRefinements()', () => {
      it('should return more refinements', () => {
        const navigationId = 'colour';
        const config = { a: 'b' };
        const mergedRefinements = ['k', 'l'];
        const selected = ['m', 'n'];
        const refinements = () => null;
        const bridge = { refinements };
        const receiveMoreRefinementsAction: any = { c: 'd' };
        const receiveMoreRefinements = spy(() => receiveMoreRefinementsAction);
        const request = { g: 'h' };
        const state = { i: 'j' };
        const results = { o: 'p' };
        const flux: any = { clients: { bridge }, actions: { receiveMoreRefinements }, config };
        const searchRequest = stub(Requests, 'search').returns(request);
        const mergeRefinements = stub(Adapter, 'mergeRefinements').returns({
          navigationId,
          refinements: mergedRefinements,
          selected
        });

        const task = Tasks.fetchMoreRefinements(flux, <any>{ payload: navigationId });

        expect(task.next().value).to.eql(effects.select());
        expect(task.next(state).value).to.eql(effects.call([bridge, refinements], request, navigationId));
        expect(task.next(results).value).to.eql(effects.put(receiveMoreRefinementsAction));
        expect(searchRequest).to.be.calledWithExactly(state, config);
        expect(mergeRefinements).to.be.calledWithExactly(results, state);
        expect(receiveMoreRefinements).to.be.calledWithExactly(navigationId, mergedRefinements, selected);
        task.next();
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveMoreRefinementsAction: any = { a: 'b' };
        const flux: any = {
          clients: { bridge: { search: () => null } }
        };
        const action = stub(utils, 'action').returns(receiveMoreRefinementsAction);

        const task = Tasks.fetchMoreRefinements(flux, <any>{});

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveMoreRefinementsAction));
        expect(action).to.be.calledWith(Actions.RECEIVE_MORE_REFINEMENTS, error);
        task.next();
      });
    });
  });
});
