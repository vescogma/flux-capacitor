import { ActionCreators } from 'redux-undo';
import * as sinon from 'sinon';
import Actions from '../../../../src/core/actions';
import * as Events from '../../../../src/core/events';
import createMiddleware, { errorHandler, idGenerator } from '../../../../src/core/store/middleware';
import suite from '../../_suite';

suite('store middleware', ({ expect, spy, stub }) => {

  describe('createMiddleware()', () => {
    it('should return middleware', () => {
      const middleware1 = { c: 'd' };
      const middleware2 = { e: 'f' };
      const creator1 = spy(() => middleware1);
      const creator2 = spy(() => middleware2);
      const flux: any = { a: 'b' };

      const middleware = createMiddleware([creator1, creator2], flux);

      expect(creator1).to.be.calledWith(flux);
      expect(creator2).to.be.calledWith(flux);
      expect(middleware).to.eql([middleware1, middleware2]);
    });
  });

  describe('idGenerator()', () => {
    it('should add id if action type is in whitelist', () => {
      const idKey = 'myId';
      const next = spy();
      const whitelist = ['a', 'b', 'c'];

      idGenerator(idKey, whitelist)(null)(null)(next)({ type: 'b', c: 'd' });

      expect(next).to.be.calledWith({ type: 'b', c: 'd', meta: { [idKey]: sinon.match.string } });
    });

    it('should augment existing meta', () => {
      const idKey = 'myId';
      const meta = { d: 'e' };
      const next = spy();

      idGenerator(idKey, ['a', 'b', 'c'])(null)(null)(next)({ type: 'b', c: 'd', meta });

      expect(next).to.be.calledWithExactly({ type: 'b', c: 'd', meta: { d: 'e', [idKey]: sinon.match.string } });
    });

    it('should not modify action if type not in whitelist', () => {
      const idKey = 'myId';
      const originalAction = { a: 'b', type: 'c' };
      const next = spy();

      idGenerator(idKey, ['e', 'f', 'g'])(null)(null)(next)(originalAction);

      expect(next).to.be.calledWith(originalAction);
    });
  });

  describe('errorHandler()', () => {
    it('should emit ERROR_FETCH_ACTION on error', () => {
      const payload = { a: 'b' };
      const emit = spy();

      const error = errorHandler(<any>{ emit })(null)(() => null)({ error: true, payload });

      expect(emit).to.be.calledWith(Events.ERROR_FETCH_ACTION, payload);
      expect(error).to.eq(payload);
    });

    it('should allow valid actions through', () => {
      const action = { a: 'b' };
      const next = spy();

      errorHandler(<any>{})(null)(next)(action);

      expect(next).to.be.calledWith(action);
    });

    it('should handle failed RECEIVE_PRODUCTS action', () => {
      const action = { type: Actions.RECEIVE_PRODUCTS, error: true };
      const undoAction = { a: 'b' };
      const next = spy();
      stub(ActionCreators, 'undo').returns(undoAction);

      errorHandler(<any>{})(null)(next)(action);

      expect(next).to.be.calledWith(undoAction);
    });
  });
});
