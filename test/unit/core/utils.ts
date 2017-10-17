import SearchAdapter from '../../../src/core/adapters/search';
import Selectors from '../../../src/core/selectors';
import * as utils from '../../../src/core/utils';
import suite from '../_suite';

const ACTION = 'MY_ACTION';

suite('utils', ({ expect, spy, stub }) => {

  describe('rayify()', () => {
    it('should return an array if the argument is a value', () => {
      expect(utils.rayify(20)).to.eql([20]);
      expect(utils.rayify('apple')).to.eql(['apple']);
      expect(utils.rayify({ a: 'b' })).to.eql([{ a: 'b' }]);
      expect(utils.rayify(true)).to.eql([true]);
    });

    it('should return the original argument if it is an array', () => {
      const array = [{ a: 'b' }, { c: 'd' }];

      expect(utils.rayify(array)).to.eq(array);
    });
  });

  describe('action()', () => {
    it('should build an FSA compliant action with empty meta and no payload when payload is undefined', () => {
      expect(utils.action(ACTION)).to.eql({ type: ACTION, meta: {} });
    });

    it('should build an FSA compliant action with empty meta and a payload', () => {
      const payload = { a: 'b' };

      expect(utils.action(ACTION, payload)).to.eql({ type: ACTION, payload, meta: {} });
    });

    it('should build an FSA compliant action with meta and a payload', () => {
      const payload = { a: 'b' };
      const meta = { e: 'f' };

      expect(utils.action(ACTION, payload, meta)).to.eql({ type: ACTION, payload, meta });
    });

    it('should build an FSA complaint action with payload when payload is null', () => {
      const payload = null;

      expect(utils.action(ACTION, payload)).to.eql({ type: ACTION, payload, meta: {} });
    });

    it('should add error flag if payload is an Error', () => {
      const payload = new Error('request failed');
      const meta = { e: 'f' };

      expect(utils.action(ACTION, payload, meta)).to.eql({ type: ACTION, payload, meta, error: true });
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

  describe('sortBasedOn()', () => {
    it('should sort array based on basis array', () => {
      const firstArray = [1, 5, 2, 3, 9];
      const secondArray = [5, 3, 8];

      expect(utils.sortBasedOn(firstArray, secondArray)).to.eql([5, 3, 1, 2, 9]);
    });

    it('should sort array based on basis array and cb', () => {
      const firstArray = [{ value: 1 }, { value: 3 }, { value: 5 }, { value: 2 }, { value: 9 }];
      const secondArray = [{ value: 5 }, { value: 3 }, { value: 8 }];
      const comparison = (first, second) => first.value === second.value;

      expect(utils.sortBasedOn(firstArray, secondArray, comparison)).to.eql([
        { value: 5 },
        { value: 3 },
        { value: 1 },
        { value: 2 },
        { value: 9 }
      ]);
    });
  });
});
