import * as redux from 'redux';
import loggerMiddleware from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import * as sinon from 'sinon';
import * as uuid from 'uuid';
import Adapter from '../../../src/core/adapters/configuration';
import rootReducer from '../../../src/core/reducers';
import Store, { idGenerator } from '../../../src/core/store';
import suite from '../_suite';

suite('Store', ({ expect, spy, stub }) => {

  describe('idGenerator()', () => {
    it('should add id if action type is in whitelist', (done) => {
      const id = '1234';
      const idKey = 'myId';
      const v1 = stub(uuid, 'v1').returns(id);
      const whitelist = ['a', 'b', 'c'];

      idGenerator(idKey, whitelist)(null)((action) => {
        expect(action).to.eql({ type: 'b', c: 'd', metadata: { [idKey]: id } });
        done();
      })({ type: 'b', c: 'd' });
    });

    it('should augment existing metadata', (done) => {
      const id = '1234';
      const idKey = 'myId';
      const metadata = { d: 'e' };
      stub(uuid, 'v1').returns(id);

      idGenerator(idKey, ['a', 'b', 'c'])(null)((action) => {
        expect(action).to.eql({ type: 'b', c: 'd', metadata: { d: 'e', [idKey]: id } });
        done();
      })({ type: 'b', c: 'd', metadata });
    });

    it('should not modify action if type not in whitelist', (done) => {
      const idKey = 'myId';
      const originalAction = { a: 'b', type: 'c' };

      idGenerator(idKey, ['e', 'f', 'g'])(null)((action) => {
        expect(action).to.eq(originalAction);
        done();
      })(originalAction);
    });
  });

  describe('Store', () => {
    describe('create()', () => {
      afterEach(() => delete process.env.NODE_ENV);

      it('should create a store using middleware and initialState', () => {
        const config: any = { a: 'b' };
        const state = { c: 'd' };
        const middleware = ['e', 'f', 'g'];
        const storeInstance = { h: 'i' };
        const initialState = stub(Adapter, 'initialState').returns(state);
        const applyMiddleware = stub(redux, 'applyMiddleware').returns(middleware);
        const createStore = stub(redux, 'createStore').returns(storeInstance);

        const store = Store.create(config);

        expect(store).to.eq(storeInstance);
        expect(initialState).to.be.calledWith(config);
        expect(applyMiddleware).to.be.calledWithExactly(thunkMiddleware, sinon.match.func, sinon.match.func);
        expect(createStore).to.be.calledWith(rootReducer, state, middleware);
      });

      it('should include redux-logger when debugging in development environement', () => {
        const applyMiddleware = stub(redux, 'applyMiddleware');
        stub(Adapter, 'initialState');
        stub(redux, 'createStore');
        process.env.NODE_ENV = 'development';

        Store.create(<any>{ services: { logging: { debug: { flux: true } } } });

        // tslint:disable-next-line max-line-length
        expect(applyMiddleware).to.be.calledWithExactly(thunkMiddleware, sinon.match.func, sinon.match.func, loggerMiddleware);
      });

      it('should not include redux-logger when not debugging', () => {
        const applyMiddleware = stub(redux, 'applyMiddleware');
        stub(Adapter, 'initialState');
        stub(redux, 'createStore');
        process.env.NODE_ENV = 'development';

        Store.create(<any>{});

        // tslint:disable-next-line max-line-length
        expect(applyMiddleware).to.be.calledWithExactly(thunkMiddleware, sinon.match.func, sinon.match.func);
      });

      it('should attach listener if provided', () => {
        const subscribe = spy();
        const listener = spy();
        const storeInstance = { subscribe };
        stub(redux, 'applyMiddleware');
        stub(Adapter, 'initialState');
        stub(redux, 'createStore').returns(storeInstance);

        Store.create(<any>{}, listener);

        expect(listener).to.be.calledWith(storeInstance);
      });
    });
  });
});
