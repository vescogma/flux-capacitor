import { reduxBatch } from '@manaflair/redux-batch';
import * as redux from 'redux';
import loggerMiddleware from 'redux-logger';
import * as reduxSaga from 'redux-saga';
import * as sinon from 'sinon';
import Adapter from '../../../../src/core/adapters/configuration';
import rootReducer from '../../../../src/core/reducers';
import * as sagas from '../../../../src/core/sagas';
import Store from '../../../../src/core/store';
import * as customMiddleware from '../../../../src/core/store/middleware';
import suite from '../../_suite';

suite('Store', ({ expect, spy, stub }) => {
  describe('create()', () => {
    afterEach(() => delete process.env.NODE_ENV);

    it('should create a store using middleware and initialState', () => {
      const config = { a: 'b' };
      const flux: any = { config };
      const state = { c: 'd' };
      const middleware = ['e', 'f', 'g'];
      const composed = ['j', 'k', 'l'];
      const storeInstance = { h: 'i' };
      const runSagaMiddleware = spy();
      const sagaMiddleware = { run: runSagaMiddleware };
      const initialState = stub(Adapter, 'initialState').returns(state);
      const applyMiddleware = stub(redux, 'applyMiddleware').returns(middleware);
      const createStore = stub(redux, 'createStore').returns(storeInstance);
      const compose = stub(redux, 'compose').returns(composed);
      const createSagaMiddleware = stub(reduxSaga, 'default').returns(sagaMiddleware);
      const createMiddleware = stub(customMiddleware, 'default');
      const createSagas = stub(sagas, 'default').returns(['m', 'n', 'o']);
      createMiddleware.withArgs(customMiddleware.MIDDLEWARE_CREATORS).returns(['p', 'q']);
      createMiddleware.withArgs(customMiddleware.BATCH_MIDDLEWARE_CREATORS).returns(['r', 's']);

      const store = Store.create(flux);

      expect(store).to.eq(storeInstance);
      expect(createMiddleware).to.be.calledWith(customMiddleware.MIDDLEWARE_CREATORS, flux);
      expect(createMiddleware).to.be.calledWith(customMiddleware.BATCH_MIDDLEWARE_CREATORS, flux);
      expect(initialState).to.be.calledWith(config);
      // tslint:disable-next-line max-line-length
      expect(applyMiddleware).to.be.calledWithExactly(sinon.match.func, 'p', 'q', sagaMiddleware, 'r', 's');
      expect(compose).to.be.calledWithExactly(reduxBatch, middleware, reduxBatch);
      expect(createStore).to.be.calledWithExactly(rootReducer, state, composed);
      expect(createSagas).to.be.calledWith(sagas.SAGA_CREATORS, flux);
      expect(runSagaMiddleware).to.be.calledThrice
        .and.calledWith('m')
        .and.calledWith('n')
        .and.calledWith('o');
    });

    it('should include redux-logger when debugging in development environement', () => {
      const applyMiddleware = stub(redux, 'applyMiddleware');
      const sagaMiddleware = { run: () => null };
      stub(Adapter, 'initialState');
      stub(redux, 'createStore');
      stub(reduxSaga, 'default').returns(sagaMiddleware);
      stub(sagas, 'default').returns([]);
      stub(customMiddleware, 'default').returns([]);
      process.env.NODE_ENV = 'development';

      Store.create(<any>{ config: { services: { logging: { debug: { flux: true } } } } });

      // tslint:disable-next-line max-line-length
      expect(applyMiddleware).to.be.calledWithExactly(sinon.match.func, sagaMiddleware, loggerMiddleware);
    });

    it('should not include redux-logger when not debugging', () => {
      const applyMiddleware = stub(redux, 'applyMiddleware');
      const sagaMiddleware = { run: () => null };
      stub(Adapter, 'initialState');
      stub(redux, 'createStore');
      stub(reduxSaga, 'default').returns(sagaMiddleware);
      stub(sagas, 'default').returns([]);
      stub(customMiddleware, 'default').returns([]);
      process.env.NODE_ENV = 'development';

      Store.create(<any>{ config: {} });

      // tslint:disable-next-line max-line-length
      expect(applyMiddleware).to.be.calledWithExactly(sinon.match.func, sagaMiddleware);
    });

    it('should attach listener if provided', () => {
      const subscribe = spy();
      const listener = spy();
      const storeInstance = { subscribe };
      stub(redux, 'applyMiddleware');
      stub(Adapter, 'initialState');
      stub(reduxSaga, 'default').returns({ run: () => null });
      stub(redux, 'createStore').returns(storeInstance);
      stub(sagas, 'default').returns([]);
      stub(customMiddleware, 'default').returns([]);

      Store.create(<any>{ config: {} }, listener);

      expect(listener).to.be.calledWith(storeInstance);
    });
  });
});
