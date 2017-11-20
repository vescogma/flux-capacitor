import * as effects from 'redux-saga/effects';
import * as sinon from 'sinon';
import Actions from '../../../../src/core/actions';
import Events from '../../../../src/core/events';
import Requests from '../../../../src/core/requests';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/product-details';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('product details saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_PRODUCT_DETAILS, Tasks.fetchProductDetails, flux));
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.SET_DETAILS, Tasks.receiveDetailsProduct, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('fetchProductDetails()', () => {
      it('should call setDetails', () => {
        const id = '123';
        const config: any = { a: 'b' };
        const search = () => null;
        const bridge = { search };
        const record = { allMeta: { e: 'f' } };
        const request = { g: 'h' };
        const setDetailsAction: any = { a: 'b' };
        const setDetails = spy(() => setDetailsAction);
        const flux: any = { clients: { bridge }, actions: { setDetails } };

        const task = Tasks.fetchProductDetails(flux, <any>{ payload: id });

        expect(task.next().value).to.eql(effects.select(Requests.search));
        expect(task.next(request).value).to.eql(effects.call([bridge, search], {
          g: 'h',
          query: null,
          pageSize: 1,
          skip: 0,
          refinements: [{ navigationName: 'id', type: 'Value', value: id }]
        }));
        expect(task.next({ records: [record] }).value).to.eql(
          effects.put(setDetailsAction)
        );
        expect(setDetails).to.be.calledWith(record);
        task.next();
      });

      it('should handle product not found', () => {
        const error = new Error();
        const updateDetailsAction: any = { a: 'b' };
        const updateDetails = spy(() => updateDetailsAction);
        const flux: any = {
          clients: { bridge: { search: () => null } },
          actions: { updateDetails }
        };

        const task = Tasks.fetchProductDetails(flux, <any>{});

        task.next();
        task.next();
        expect(task.next({ records: [] }).value).to.eql(effects.put(updateDetailsAction));
        expect(updateDetails).to.be.calledWith(sinon.match.instanceOf(Error));
        task.next();
      });

      it('should handle request failure', () => {
        const error = new Error();
        const updateDetailsAction: any = { a: 'b' };
        const updateDetails = spy(() => updateDetailsAction);
        const flux: any = {
          clients: { bridge: { search: () => null } },
          actions: { updateDetails }
        };

        const task = Tasks.fetchProductDetails(flux, <any>{});

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(updateDetailsAction));
        expect(updateDetails).to.be.calledWith(error);
        task.next();
      });
    });

    describe('receiveDetailsProduct()', () => {
      it('should return product details', () => {
        const emit = spy();
        const saveState = spy();
        const updateDetailsAction: any = { c: 'd' };
        const updateDetails = spy(() => updateDetailsAction);
        const record = { allMeta: { e: 'f' }, id: '123' };
        const flux: any = { emit, saveState, actions: { updateDetails } };

        const task = Tasks.receiveDetailsProduct(flux, <any>{ payload: record });

        expect(task.next().value).to.eql(effects.put(updateDetailsAction));
        expect(emit).to.be.calledWith(Events.BEACON_VIEW_PRODUCT, record);
        task.next();
        expect(updateDetails).to.be.calledWith(record.allMeta);
        expect(saveState).to.be.called;
      });

      it('should ignore beaconing if not full product', () => {
        const emit = spy();
        const saveState = spy();
        const updateDetailsAction: any = { c: 'd' };
        const updateDetails = spy(() => updateDetailsAction);
        const record = { id: '123' };
        const flux: any = { emit, saveState, actions: { updateDetails } };

        const task = Tasks.receiveDetailsProduct(flux, <any>{ payload: record });

        expect(task.next().value).to.eql(effects.put(updateDetailsAction));
        expect(emit).to.not.be.called;
        task.next();
        expect(updateDetails).to.be.calledWith(record);
        expect(saveState).to.be.called;
      });
    });
  });
});
