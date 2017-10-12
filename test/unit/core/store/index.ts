import * as redux from 'redux';
import * as reduxSaga from 'redux-saga';
import * as sinon from 'sinon';
import Adapter from '../../../../src/core/adapters/configuration';
import rootReducer from '../../../../src/core/reducers';
import * as sagas from '../../../../src/core/sagas';
import Store from '../../../../src/core/store';
import Middleware from '../../../../src/core/store/middleware';
import suite from '../../_suite';

suite('Store', ({ expect, spy, stub }) => {
  describe('create()', () => {
    it('should create a store using middleware and initialState', () => {
      const config = { a: 'b' };
      const flux: any = { config };
      const state = { c: 'd' };
      const middleware = ['e', 'f', 'g'];
      const storeInstance = { h: 'i' };
      const runSagaMiddleware = spy();
      const sagaMiddleware = { run: runSagaMiddleware };
      const initialState = stub(Adapter, 'initialState').returns(state);
      const createStore = stub(redux, 'createStore').returns(storeInstance);
      const createSagaMiddleware = stub(reduxSaga, 'default').returns(sagaMiddleware);
      const createMiddleware = stub(Middleware, 'create').returns(middleware);
      const createSagas = stub(sagas, 'default').returns(['m', 'n', 'o']);

      const store = Store.create(flux);

      expect(store).to.eq(storeInstance);
      expect(createMiddleware).to.be.calledWith(sagaMiddleware, flux);
      expect(initialState).to.be.calledWith(config);
      expect(createStore).to.be.calledWithExactly(rootReducer, state, middleware);
      expect(createSagas).to.be.calledWith(sagas.SAGA_CREATORS, flux);
      expect(runSagaMiddleware).to.be.calledThrice
        .and.calledWith('m')
        .and.calledWith('n')
        .and.calledWith('o');
    });

    it('should attach listener if provided', () => {
      const subscribe = spy();
      const listener = { e: 'f' };
      const listenerFactory = spy(() => listener);
      const storeInstance = { subscribe };
      stub(Adapter, 'initialState');
      stub(redux, 'createStore').returns(storeInstance);
      stub(reduxSaga, 'default').returns({ run: () => null });
      stub(sagas, 'default').returns([]);
      stub(Middleware, 'create').returns([]);

      Store.create(<any>{ config: {} }, listenerFactory);

      expect(listenerFactory).to.be.calledWithExactly(storeInstance);
      expect(subscribe).to.be.calledWithExactly(listener);
    });
  });
});
