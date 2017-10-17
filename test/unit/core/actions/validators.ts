import * as validators from '../../../../src/core/actions/validators';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('validators', ({ expect, spy, stub }) => {

  describe('isString', () => {
    const validator = validators.isString;

    it('should be valid if value is a string', () => {
      expect(validator.func('test')).to.be.true;
    });

    it('should be invalid if value is an empty string', () => {
      expect(validator.func('')).to.be.false;
      expect(validator.func(' ')).to.be.false;
      expect(validator.func(<any>false)).to.be.false;
    });
  });

  describe('isValidQuery', () => {
    it('should use isString validator', () => {
      const query = 'rambo';
      const isString = stub(validators.isString, 'func').returns(true);

      expect(validators.isValidQuery.func(query)).to.be.true;
      expect(isString).to.be.calledWithExactly(query);
    });

    it('should be valid if null', () => {
      expect(validators.isValidQuery.func(null)).to.be.true;
    });
  });

  describe('isDifferentQuery', () => {
    const query = 'rambo';

    it('should be valid if query will change', () => {
      stub(Selectors, 'query').returns('shark');

      expect(validators.isDifferentQuery.func(query)).to.be.true;
    });

    it('should be invalid if query will not change', () => {
      stub(Selectors, 'query').returns(query);

      expect(validators.isDifferentQuery.func(query)).to.be.false;
    });
  });

  describe('isValidClearField', () => {
    it('should use isString validator', () => {
      const field = 'brand';
      const isString = stub(validators.isString, 'func').returns(true);

      expect(validators.isValidClearField.func(field)).to.be.true;
      expect(isString).to.be.calledWithExactly(field);
    });

    it('should be valid if true', () => {
      expect(validators.isValidClearField.func(true)).to.be.true;
    });

    it('should be invalid if falsey', () => {
      expect(validators.isValidClearField.func()).to.be.false;
      expect(validators.isValidClearField.func(undefined)).to.be.false;
      expect(validators.isValidClearField.func(null)).to.be.false;
    });
  });

  describe('hasSelectedRefinements', () => {
    it('should be valid if existing selected refinements', () => {
      stub(Selectors, 'selectedRefinements').returns(['a']);

      expect(validators.hasSelectedRefinements.func()).to.be.true;
    });

    it('should be invalid if no existing selected refinements', () => {
      stub(Selectors, 'selectedRefinements').returns([]);

      expect(validators.hasSelectedRefinements.func()).to.be.false;
    });
  });

  describe('hasSelectedRefinementsByField', () => {
    it('should be valid if existing selected refinements for field', () => {
      const field = 'size';
      const state: any = { a: 'b' };
      const navigation = stub(Selectors, 'navigation').returns({ selected: ['a'] });

      expect(validators.hasSelectedRefinementsByField.func(field, state)).to.be.true;
      expect(navigation).to.be.calledWithExactly(state, field);
    });

    it('should be invalid if no existing selected refinements for field', () => {
      stub(Selectors, 'navigation').returns({ selected: [] });

      expect(validators.hasSelectedRefinementsByField.func()).to.be.false;
    });
  });

  describe('notOnFirstPage', () => {
    it('should be valid if current page is not 1', () => {
      stub(Selectors, 'page').returns(9);

      expect(validators.notOnFirstPage.func()).to.be.true;
    });

    it('should be invalid if current page is 1', () => {
      stub(Selectors, 'page').returns(1);

      expect(validators.notOnFirstPage.func()).to.be.false;
    });
  });

  describe('isRangeRefinement', () => {
    it('should be valid if low and high are numeric', () => {
      expect(validators.isRangeRefinement.func(<any>{ range: true, low: 20, high: 40 })).to.be.true;
    });

    it('should be valid if not a range refinement', () => {
      expect(validators.isRangeRefinement.func(<any>{ range: false })).to.be.true;
    });

    it('should be invalid if low or high are non-numeric', () => {
      expect(validators.isRangeRefinement.func(<any>{ range: true, low: 20, high: true })).to.be.false;
      expect(validators.isRangeRefinement.func(<any>{ range: true, low: '3', high: 31 })).to.be.false;
      expect(validators.isRangeRefinement.func(<any>{ range: true, low: 2 })).to.be.false;
      expect(validators.isRangeRefinement.func(<any>{ range: true, high: 2 })).to.be.false;
      expect(validators.isRangeRefinement.func(<any>{ range: true })).to.be.false;
    });
  });

  describe('isValidRange', () => {
    it('should be valid if low value is lower than high value', () => {
      expect(validators.isValidRange.func(<any>{ range: true, low: 30, high: 40 })).to.be.true;
      expect(validators.isValidRange.func(<any>{ range: true, low: 30, high: 40 })).to.be.true;
    });

    it('should be valid if not range refinement', () => {
      expect(validators.isValidRange.func(<any>{ range: false })).to.be.true;
    });

    it('should be invalid if low value is higher than or equal to high value', () => {
      expect(validators.isValidRange.func(<any>{ range: true, low: 50, high: 40 })).to.be.false;
      expect(validators.isValidRange.func(<any>{ range: true, low: 40, high: 40 })).to.be.false;
    });
  });

  describe('isValueRefinement', () => {
    it('should use isString validator', () => {
      const value = 'brand';
      const isString = stub(validators.isString, 'func').returns(true);

      expect(validators.isValueRefinement.func(<any>{ value })).to.be.true;
      expect(isString).to.be.calledWithExactly(value);
    });

    it('should be valid if range refinement', () => {
      expect(validators.isValueRefinement.func(<any>{ range: true })).to.be.true;
    });

    it('should be invalid if not a range refinement', () => {
      expect(validators.isValueRefinement.func(<any>{ range: false })).to.be.false;
    });
  });

  describe('isRefinementDeselectedByValue', () => {
    const navigationId = 'brand';

    it('should be valid if no matching navigation', () => {
      const state: any = { a: 'b' };
      const navigation = stub(Selectors, 'navigation');

      expect(validators.isRefinementDeselectedByValue.func({ navigationId }, state)).to.be.true;
      expect(navigation).to.be.calledWithExactly(state, navigationId);
    });

    it('should be valid if no matching range refinement in navigation', () => {
      stub(Selectors, 'navigation').returns({ selected: [1], refinements: [{}, { value: 'boar' }] });

      expect(validators.isRefinementDeselectedByValue.func({ navigationId, value: 'bear' })).to.be.true;
    });

    it('should be valid if no matching value refinement in navigation', () => {
      stub(Selectors, 'navigation').returns({ range: true, selected: [1], refinements: [{}, { low: 4, high: 4 }] });

      expect(validators.isRefinementDeselectedByValue.func({ navigationId, low: 4, high: 8 })).to.be.true;
    });

    it('should be invalid matching refinement exists already', () => {
      const value = 'bear';
      stub(Selectors, 'navigation').returns({ selected: [1], refinements: [{}, { value }] });

      expect(validators.isRefinementDeselectedByValue.func({ navigationId, value })).to.be.false;
    });
  });

  describe('isRefinementSelectedByIndex', () => {
    const navigationId = 'colour';
    const index = 8;

    it('should be valid if refinement is deselected', () => {
      const state: any = { a: 'b' };
      const isRefinementDeselected = stub(Selectors, 'isRefinementDeselected').returns(true);

      expect(validators.isRefinementDeselectedByIndex.func({ navigationId, index }, state)).to.be.true;
      expect(isRefinementDeselected).to.be.calledWithExactly(state, navigationId, index);
    });

    it('should be invalid if refinement is selected', () => {
      stub(Selectors, 'isRefinementDeselected').returns(true);

      expect(validators.isRefinementDeselectedByIndex.func({ navigationId, index })).to.be.true;
    });
  });

  describe('isRefinementDeselectedByIndex', () => {
    const navigationId = 'brand';
    const index = 5;

    it('should be valid if refinement is selected', () => {
      const state: any = { a: 'b' };
      const isRefinementSelected = stub(Selectors, 'isRefinementSelected').returns(true);

      expect(validators.isRefinementSelectedByIndex.func({ navigationId, index }, state)).to.be.true;
      expect(isRefinementSelected).to.be.calledWithExactly(state, navigationId, index);
    });

    it('should be invalid if refinement is deselected', () => {
      stub(Selectors, 'isRefinementSelected').returns(true);

      expect(validators.isRefinementSelectedByIndex.func({ navigationId, index })).to.be.true;
    });
  });

  describe('isCollectionDeselected', () => {
    const collection = 'alternative';

    it('should be valid if collection is deselected', () => {
      const state: any = { a: 'b' };
      const isCollectionDeselected = stub(Selectors, 'collection').returns('main');

      expect(validators.isCollectionDeselected.func(collection, state)).to.be.true;
      expect(isCollectionDeselected).to.be.calledWithExactly(state);
    });

    it('should be invalid if collection is selected', () => {
      stub(Selectors, 'collection').returns(collection);

      expect(validators.isCollectionDeselected.func(collection)).to.be.false;
    });
  });

  describe('isSortDeselected', () => {
    const index = 8;

    it('should be valid if sort is deselected', () => {
      const state: any = { a: 'b' };
      const sortIndex = stub(Selectors, 'sortIndex').returns(4);

      expect(validators.isSortDeselected.func(index, state)).to.be.true;
      expect(sortIndex).to.be.calledWithExactly(state);
    });

    it('should be invalid if sort is selected', () => {
      stub(Selectors, 'sortIndex').returns(index);

      expect(validators.isSortDeselected.func(index)).to.be.false;
    });
  });

  describe('isDifferentPageSize', () => {
    const pageSize = 25;

    it('should be valid if page size is different', () => {
      const state: any = { a: 'b' };
      const pageSizeSelector = stub(Selectors, 'pageSize').returns(12);

      expect(validators.isDifferentPageSize.func(pageSize, state)).to.be.true;
      expect(pageSizeSelector).to.be.calledWithExactly(state);
    });

    it('should be invalid if page size is the same', () => {
      stub(Selectors, 'pageSize').returns(pageSize);

      expect(validators.isDifferentPageSize.func(pageSize)).to.be.false;
    });
  });

  describe('isOnDifferentPage', () => {
    const page = 3;

    it('should be valid if page is different not the current page', () => {
      const state: any = { a: 'b' };
      const pageSelector = stub(Selectors, 'page').returns(4);

      expect(validators.isOnDifferentPage.func(page, state)).to.be.true;
      expect(pageSelector).to.be.calledWithExactly(state);
    });

    it('should be invalid if page is the current page', () => {
      stub(Selectors, 'page').returns(page);

      expect(validators.isOnDifferentPage.func(page)).to.be.false;
    });

    it('should be invalid if page is null', () => {
      expect(validators.isOnDifferentPage.func(null)).to.be.false;
    });
  });

  describe('isDifferentAutocompleteQuery', () => {
    const query = 'red apple';

    it('should be valid is autocomplete query is different', () => {
      const state: any = { a: 'b' };
      const autocompleteQuery = stub(Selectors, 'autocompleteQuery').returns('orange');

      expect(validators.isDifferentAutocompleteQuery.func(query, state)).to.be.true;
      expect(autocompleteQuery).to.be.calledWithExactly(state);
    });

    it('should be invalid if autocomplete query is the same', () => {
      stub(Selectors, 'autocompleteQuery').returns(query);

      expect(validators.isDifferentAutocompleteQuery.func(query)).to.be.false;
    });
  });

  describe('isNotFullRange', () => {
    const low = 4;
    const high = 8;
    const range = true;
    const navigationId = 'a';
    const payload = {
      navigationId,
      range,
      low,
      high
    };
    const state: any = { a: 'b' };

    it('should be valid if it is not full range', () => {
      stub(Selectors, 'rangeNavigationMax').returns(high);
      stub(Selectors, 'rangeNavigationMin').returns(low + 1);

      expect(validators.isNotFullRange.func(payload, state)).to.be.true;
    });

    it('should be invalid if it is full range', () => {
      stub(Selectors, 'rangeNavigationMax').returns(high);
      stub(Selectors, 'rangeNavigationMin').returns(low);

      expect(validators.isNotFullRange.func(payload, state)).to.be.false;
    });
  });
});
