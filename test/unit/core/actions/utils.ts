import * as utils from '../../../../src/core/actions/utils';
import SearchAdapter from '../../../../src/core/adapters/search';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

const ACTION = 'MY_ACTION';

suite('Action Utils', ({ expect, spy, stub }) => {

  describe('createAction()', () => {
    it('should build an FSA compliant action with empty meta', () => {
      expect(utils.createAction(ACTION)).to.eql({ type: ACTION, meta: { validator: {} } });
    });

    it('should build an FSA compliant action with empty meta and a payload', () => {
      const payload = { a: 'b' };

      expect(utils.createAction(ACTION, payload)).to.eql({ type: ACTION, payload, meta: { validator: {} } });
    });

    it('should build an FSA compliant action with meta and a payload', () => {
      const payload = { a: 'b' };
      const validator = { e: 'f' };

      expect(utils.createAction(ACTION, payload, validator)).to.eql({ type: ACTION, payload, meta: { validator } });
    });

    it('should build an FSA complaint action with payload when payload is null', () => {
      const payload = null;

      expect(utils.createAction(ACTION, payload)).to.eql({ type: ACTION, payload, meta: { validator: {} } });
    });

    it('should add error flag if payload is an Error', () => {
      const payload = new Error('request failed');
      const validator = { e: 'f' };

      expect(utils.createAction(ACTION, payload, validator)).to.eql({
        payload,
        type: ACTION,
        meta: { validator },
        error: true
      });
    });
  });

  describe('refinementPayload()', () => {
    it('should create a value refinement payload', () => {
      const navigationId = 'brand';
      const value = 'arm and hammer';

      expect(utils.refinementPayload(navigationId, value)).to.eql({ navigationId, value });
    });

    it('should create a range refinement payload', () => {
      const navigationId = 'brand';
      const low = 14;
      const high = 49;

      expect(utils.refinementPayload(navigationId, low, high)).to.eql({ navigationId, low, high, range: true });
    });
  });

  describe('shouldResetRefinements()', () => {
    it('should be true if refinementsMatch is false', () => {
      stub(Selectors, 'selectedRefinements').returns(['hello']);
      stub(SearchAdapter, 'refinementsMatch').returns(false);

      expect(utils.shouldResetRefinements({ navigationId: 'truthy' }, null)).to.be.true;
    });

    it('should be true if currentRefinements length is not 1', () => {
      stub(Selectors, 'selectedRefinements').returns(['hello', 'hello']);
      stub(SearchAdapter, 'refinementsMatch').returns(true);

      expect(utils.shouldResetRefinements({ navigationId: 'truthy' }, null)).to.be.true;
    });

    it('should be true if navigationId is falsy', () => {
      stub(Selectors, 'selectedRefinements').returns(['hello']);
      stub(SearchAdapter, 'refinementsMatch').returns(true);

      expect(utils.shouldResetRefinements({ navigationId: undefined }, null)).to.be.true;
    });

    it('should be false above conditions are false', () => {
      stub(Selectors, 'selectedRefinements').returns(['hello']);
      stub(SearchAdapter, 'refinementsMatch').returns(true);

      expect(utils.shouldResetRefinements({ navigationId: 'truthy' }, null)).to.be.false;
    });

    it('should be false above conditions are false (range is truthy case)', () => {
      stub(Selectors, 'selectedRefinements').returns(['hello']);
      stub(SearchAdapter, 'refinementsMatch').returns(true);

      expect(utils.shouldResetRefinements({ navigationId: 'truthy', range: true }, null)).to.be.false;
    });

    it('should look up refinement from index if index passed', () => {
      const crumb = stub(Selectors, 'isRefinementSelected').returns(false);
      stub(Selectors, 'selectedRefinements').returns([{ value: 'hello' }]);

      expect(utils.shouldResetRefinements(
        { navigationId: 'truthy', value: 'notHello', index: 4 }, null)).to.be.true;
      expect(crumb).to.be.calledWith(null, 'truthy', 4);
    });
  });
});
