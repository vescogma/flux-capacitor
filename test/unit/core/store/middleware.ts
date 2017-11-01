import { reduxBatch } from '@manaflair/redux-batch';
import * as redux from 'redux';
import reduxLogger from 'redux-logger';
import { ActionCreators } from 'redux-undo';
import * as sinon from 'sinon';
import Actions from '../../../../src/core/actions';
import Events from '../../../../src/core/events';
import Middleware, {
  RECALL_CHANGE_ACTIONS,
  SEARCH_CHANGE_ACTIONS
} from '../../../../src/core/store/middleware';
import suite from '../../_suite';

suite('Middleware', ({ expect, spy, stub }) => {

  describe('create()', () => {
    const sagaMiddleware = { a: 'b' };
    const idGeneratorMiddleware = { g: 'h' };
    const errorHandlerMiddleware = { i: 'j' };
    const validatorMiddleware = { m: 'n' };

    afterEach(() => delete process.env.NODE_ENV);

    it('should return composed middleware', () => {
      const flux: any = { __config: {} };
      const composed = ['e', 'f'];
      const simpleMiddleware = ['k', 'l'];
      const batchMiddleware = ['k', 'l'];
      const thunkMiddleware = ['k', 'l'];
      const idGenerator = stub(Middleware, 'idGenerator').returns(idGeneratorMiddleware);
      const errorHandler = stub(Middleware, 'errorHandler').returns(errorHandlerMiddleware);
      const compose = stub(redux, 'compose').returns(composed);
      const applyMiddleware = stub(redux, 'applyMiddleware');
      const validator = stub(Middleware, 'validator').returns(validatorMiddleware);
      applyMiddleware.withArgs().returns(batchMiddleware);
      applyMiddleware.withArgs(Middleware.thunkEvaluator, validator).returns(thunkMiddleware);
      applyMiddleware.withArgs(Middleware.thunkEvaluator, Middleware.saveStateAnalyzer).returns(simpleMiddleware);

      const middleware = Middleware.create(sagaMiddleware, flux);

      expect(idGenerator).to.have.callCount(2)
        .and.calledWithExactly('recallId', RECALL_CHANGE_ACTIONS)
        .and.calledWithExactly('searchId', SEARCH_CHANGE_ACTIONS);
      expect(errorHandler).to.be.calledWithExactly(flux);
      expect(applyMiddleware).to.be.calledWithExactly(
        Middleware.thunkEvaluator,
        validatorMiddleware,
        idGeneratorMiddleware,
        idGeneratorMiddleware,
        errorHandlerMiddleware,
        sagaMiddleware,
        Middleware.personalizationAnalyzer,
        Middleware.thunkEvaluator,
        Middleware.saveStateAnalyzer
      );
      expect(compose).to.be.calledWithExactly(
        simpleMiddleware,
        reduxBatch,
        batchMiddleware,
        reduxBatch,
        thunkMiddleware,
        reduxBatch,
      );
      expect(middleware).to.eql(composed);
    });

    it('should include redux-logger when running in development and debug set', () => {
      const flux: any = { __config: { services: { logging: { debug: { flux: true } } } } };
      const applyMiddleware = stub(redux, 'applyMiddleware');
      stub(Middleware, 'idGenerator').returns(idGeneratorMiddleware);
      stub(Middleware, 'errorHandler').returns(errorHandlerMiddleware);
      stub(Middleware, 'validator').returns(validatorMiddleware);
      stub(redux, 'compose');
      process.env.NODE_ENV = 'development';

      Middleware.create(sagaMiddleware, flux);

      expect(applyMiddleware).to.be.calledWithExactly(
        Middleware.thunkEvaluator,
        validatorMiddleware,
        idGeneratorMiddleware,
        idGeneratorMiddleware,
        errorHandlerMiddleware,
        sagaMiddleware,
        Middleware.personalizationAnalyzer,
        Middleware.thunkEvaluator,
        Middleware.saveStateAnalyzer,
        reduxLogger
      );
    });

    it('should not include redux-logger when running in development and debug not set', () => {
      const flux: any = { __config: {} };
      const applyMiddleware = stub(redux, 'applyMiddleware');
      stub(Middleware, 'idGenerator').returns(idGeneratorMiddleware);
      stub(Middleware, 'errorHandler').returns(errorHandlerMiddleware);
      stub(Middleware, 'validator').returns(validatorMiddleware);
      stub(redux, 'compose');
      process.env.NODE_ENV = 'development';

      Middleware.create(sagaMiddleware, flux);

      expect(applyMiddleware).to.be.calledWithExactly(
        Middleware.thunkEvaluator,
        validatorMiddleware,
        idGeneratorMiddleware,
        idGeneratorMiddleware,
        errorHandlerMiddleware,
        sagaMiddleware,
        Middleware.personalizationAnalyzer,
        Middleware.thunkEvaluator,
        Middleware.saveStateAnalyzer
      );
    });
  });

  describe('idGenerator()', () => {
    it('should add id if action type is in whitelist', () => {
      const idKey = 'myId';
      const next = spy();
      const whitelist = ['a', 'b', 'c'];

      Middleware.idGenerator(idKey, whitelist)(null)(next)({ type: 'b', c: 'd' });

      expect(next).to.be.calledWith({ type: 'b', c: 'd', meta: { [idKey]: sinon.match.string } });
    });

    it('should augment existing meta', () => {
      const idKey = 'myId';
      const meta = { d: 'e' };
      const next = spy();

      Middleware.idGenerator(idKey, ['a', 'b', 'c'])(null)(next)({ type: 'b', c: 'd', meta });

      expect(next).to.be.calledWithExactly({ type: 'b', c: 'd', meta: { d: 'e', [idKey]: sinon.match.string } });
    });

    it('should not modify action if type not in whitelist', () => {
      const idKey = 'myId';
      const originalAction = { a: 'b', type: 'c' };
      const next = spy();

      Middleware.idGenerator(idKey, ['e', 'f', 'g'])(null)(next)(originalAction);

      expect(next).to.be.calledWith(originalAction);
    });
  });

  describe('errorHandler()', () => {
    it('should emit ERROR_FETCH_ACTION on error', () => {
      const payload = { a: 'b' };
      const emit = spy();

      const error = Middleware.errorHandler(<any>{ emit })(null)(() => null)(<any>{ error: true, payload });

      expect(emit).to.be.calledWith(Events.ERROR_FETCH_ACTION, payload);
      expect(error).to.eq(payload);
    });

    it('should allow valid actions through', () => {
      const action: any = { a: 'b' };
      const next = spy();

      Middleware.errorHandler(<any>{})(null)(next)(action);

      expect(next).to.be.calledWith(action);
    });

    it('should handle failed RECEIVE_PRODUCTS action', () => {
      const action = { type: Actions.RECEIVE_PRODUCTS, error: true };
      const undoAction = { a: 'b' };
      const next = spy();
      stub(ActionCreators, 'undo').returns(undoAction);

      Middleware.errorHandler(<any>{})(null)(next)(action);

      expect(next).to.be.calledWith(undoAction);
    });
  });

  describe('saveStateAnalyzer()', () => {
    it('should add SAVE_STATE action if match found', () => {
      const batchAction = [{ type: 'a' }, { type: Actions.RECEIVE_PRODUCTS }];
      const next = spy();

      Middleware.saveStateAnalyzer()(next)(batchAction);

      expect(next).to.be.calledWithExactly([...batchAction, { type: Actions.SAVE_STATE }]);
    });

    it('should not add SAVE_STATE action if no match found', () => {
      const batchAction = [{ type: 'a' }, { type: 'b' }];
      const next = spy();

      Middleware.saveStateAnalyzer()(next)(batchAction);

      expect(next).to.be.calledWithExactly(batchAction);
    });
  });

  describe('thunkEvaluator()', () => {
    it('should pass forward a plain object action', () => {
      const action = { a: 'b' };
      const next = spy();

      Middleware.thunkEvaluator(null)(next)(action);

      expect(next).to.be.calledWithExactly(action);
    });

    it('should evaluate and pass forward a synchonous thunk action', () => {
      const action = { a: 'b' };
      const state = { c: 'd' };
      const next = spy();
      const thunk = spy(() => action);
      const getState = () => state;

      Middleware.thunkEvaluator(<any>{ getState })(next)(thunk);

      expect(next).to.be.calledWithExactly(action);
      expect(thunk).to.be.calledWithExactly(state);
    });
  });
});
