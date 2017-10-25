import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import Adapters from '../../../../src/core/adapters';
import Requests from '../../../../src/core/requests';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/collection';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('collection saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeEvery(Actions.FETCH_COLLECTION_COUNT, Tasks.fetchCount, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('fetchCount()', () => {
      it('should return collection count', () => {
        const search = () => null;
        const bridge = { search };
        const collection = 'myCollection';
        const receiveCollectionCountAction: any = { c: 'd' };
        const receiveCollectionCount = spy(() => receiveCollectionCountAction);
        const flux: any = { clients: { bridge }, actions: { receiveCollectionCount } };
        const recordCount = 89;
        const request = { e: 'f' };
        const response = { g: 'h' };
        const extractRecordCount = stub(Adapters.Search, 'extractRecordCount').returns(recordCount);

        const task = Tasks.fetchCount(flux, <any>{ payload: collection });

        expect(task.next().value).to.eql(effects.select(Requests.search));
        expect(task.next(request).value).to.eql(effects.call([bridge, search], { e: 'f', collection }));
        expect(task.next(response).value).to.eql(effects.put(receiveCollectionCountAction));
        expect(receiveCollectionCount).to.be.calledWithExactly({ collection, count: recordCount });
        expect(extractRecordCount).to.be.calledWith(response);
        task.next();
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveCollectionCountAction: any = { a: 'b' };
        const receiveCollectionCount = spy(() => receiveCollectionCountAction);
        const flux: any = {
          clients: { bridge: {} },
          actions: { receiveCollectionCount }
        };

        const task = Tasks.fetchCount(flux, <any>{});

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveCollectionCountAction));
        expect(receiveCollectionCount).to.be.calledWith(error);
        task.next();
      });
    });
  });
});
