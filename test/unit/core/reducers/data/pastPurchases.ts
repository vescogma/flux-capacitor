import { Actions, Store } from '../../../../../src/core';
import Adapter from '../../../../../src/core/adapters/recommendations';
import * as navigations from '../../../../../src/core/reducers/data/navigations';
import * as page from '../../../../../src/core/reducers/data/page';
import pastPurchases, * as past from '../../../../../src/core/reducers/data/pastPurchases';
import suite from '../../../_suite';

suite('recommendations', ({ expect, stub }) => {
  describe('updateRecommendations()', () => {
    const state: Store.PastPurchase = <any>{
      defaultSkus: [
        { sku: '1652791', quantity: 2, lastPurchased: 1501732800001 },
        { sku: '2466185', quantity: 1, lastPurchased: 1501732800003 },
        { sku: '2402432', quantity: 3, lastPurchased: 150173280000 }
      ],
      skus: [
        { sku: '1652791', quantity: 2, lastPurchased: 1501732800001 },
        { sku: '2466185', quantity: 1, lastPurchased: 1501732800003 },
        { sku: '2402432', quantity: 3, lastPurchased: 150173280000 }
      ],
      saytPastPurchases: [],
      query: 'shirt',
      sort: {
        items: [
          { field: 'Default', descending: true, type: 0 },
          { field: 'Most Recent', descending: true, type: 2 },
          { field: 'Most Purchased', descending: true, type: 1 }
        ],
        selected: 0
      },
      currentRecordCount: 4,
      allRecordCount: 5,
      navigations: {
        byId: {},
        allIds: []
      },
      page: {
        sizes: {
          items: [1,2,3],
          selected: 0
        },
        current: 1,
        first: 1,
      },
    };

    it('should return state on default', () => {
      expect(pastPurchases(state, <any>{})).to.eql(state);
    });

    it('should overwrite skus on RECEIVE_PAST_PURCHASE_SKUS', () => {
      const payload: any = 'skus';

      const reducer = pastPurchases(state, { type: Actions.RECEIVE_PAST_PURCHASE_SKUS, payload });

      expect(reducer).to.eql({
        ...state,
        skus: payload,
        defaultSkus: payload
      });
    });

    it('should overwrite products on RECEIVE_PAST_PURCHASE_PRODUCTS', () => {
      const payload: any = 'prod';

      const reducer = pastPurchases(state, { type: Actions.RECEIVE_PAST_PURCHASE_PRODUCTS, payload });

      expect(reducer).to.eql({
        ...state,
        products: payload
      });
    });

    it('should overwrite saytPastPurchases on RECEIVE_SAYT_PAST_PURCHASES', () => {
      const payload: any = 'saayt';

      const reducer = pastPurchases(state, { type: Actions.RECEIVE_SAYT_PAST_PURCHASES, payload });

      expect(reducer).to.eql({
        ...state,
        saytPastPurchases: payload
      });
    });

    it('should overwrite query on UPDATE_PAST_PURCHASE_QUERY', () => {
      const payload: any = 'q';

      const reducer = pastPurchases(state, { type: Actions.UPDATE_PAST_PURCHASE_QUERY, payload });

      expect(reducer).to.eql({
        ...state,
        query: payload
      });
    });

    it('should overwrite query on RECEIVE_PAST_PURCHASE_ALL_RECORD_COUNT', () => {
      const payload: any = 3;

      const reducer = pastPurchases(state, { type: Actions.RECEIVE_PAST_PURCHASE_ALL_RECORD_COUNT, payload });

      expect(reducer).to.eql({
        ...state,
        allRecordCount: payload
      });
    });

    it('should overwrite query on RECEIVE_PAST_PURCHASE_CURRENT_RECORD_COUNT', () => {
      const payload: any = 3;

      const reducer = pastPurchases(state, { type: Actions.RECEIVE_PAST_PURCHASE_CURRENT_RECORD_COUNT, payload });

      expect(reducer).to.eql({
        ...state,
        currentRecordCount: payload
      });
    });

    it('should handle updating sort on SELECT_PAST_PURCHASE_SORT and call mostPurchases if MOST_PURCHASED', () => {
      const payload = 2;
      const skus = 'f';
      const purchased = stub(Adapter, 'sortSkusMostPurchased').returns(skus);
      const recent = stub(Adapter, 'sortSkusMostRecent').returnsArg(0);

      const reducer = pastPurchases(state, { type: Actions.SELECT_PAST_PURCHASE_SORT, payload });

      expect(reducer).to.eql({
        ...state,
        skus,
        sort: {
          ...state.sort,
          selected: payload
        }
      });
      expect(purchased).to.be.calledWithExactly(state.skus);
      expect(recent).to.not.be.called;
    });

    it('should handle updating sort on SELECT_PAST_PURCHASE_SORT and call mostRecent if MOST_RECENT', () => {
      const payload = 1;
      const skus = 'e';
      const purchased = stub(Adapter, 'sortSkusMostPurchased').returnsArg(0);
      const recent = stub(Adapter, 'sortSkusMostRecent').returns(skus);

      const reducer = pastPurchases(state, { type: Actions.SELECT_PAST_PURCHASE_SORT, payload });

      expect(reducer).to.eql({
        ...state,
        skus,
        sort: {
          ...state.sort,
          selected: payload
        }
      });
      expect(recent).to.be.calledWithExactly(state.skus);
      expect(purchased).to.not.be.called;
    });

    it('should handle updating sort on SELECT_PAST_PURCHASE_SORT and call mostPurchases if MOST_PURCHASED', () => {
      const payload = 0;
      const purchased = stub(Adapter, 'sortSkusMostPurchased').returns('bad data');
      const recent = stub(Adapter, 'sortSkusMostRecent').returns('bad data');

      const reducer = pastPurchases(state, { type: Actions.SELECT_PAST_PURCHASE_SORT, payload });

      expect(reducer).to.eql({
        ...state,
        sort: {
          ...state.sort,
          selected: payload
        }
      });
      expect(purchased).to.not.be.called;
      expect(recent).to.not.be.called;
    });

    describe('reducer chain functions', () => {
      let nav: sinon.SinonStub;
      let pageStub: sinon.SinonStub;
      const returnValue = 'return value';
      const payload: any = 'pay';

      function testReducerChain(type: string, reducerChain: Function, reducerStub: Function) {
        const action: any = { type, payload };

        const reducer = pastPurchases(state, action);

        expect(reducer).to.eq(returnValue);

        expect(reducerStub).to.be.calledWithExactly(state, action, reducerChain);
      }

      beforeEach(() => {
        nav = stub(past, 'applyNavigationReducer').returns(returnValue);
        pageStub = stub(past, 'applyPageReducer').returns(returnValue);
      });

      it('should call navigations reducer if RECEIVE_PAST_PURCHASE_REFINEMENTS', () => {
        testReducerChain(Actions.RECEIVE_PAST_PURCHASE_REFINEMENTS, navigations.receiveNavigations, nav);
      });

      it('should call navigations reducer if SELECT_PAST_PURCHASE_REFINEMENT', () => {
        testReducerChain(Actions.SELECT_PAST_PURCHASE_REFINEMENT, navigations.selectRefinement, nav);
      });

      it('should call navigations reducer if DESELECT_PAST_PURCHASE_REFINEMENT', () => {
        testReducerChain(Actions.DESELECT_PAST_PURCHASE_REFINEMENT, navigations.deselectRefinement, nav);
      });

      it('should call navigations reducer if RESET_PAST_PURCHASE_REFINEMENTS', () => {
        testReducerChain(Actions.RESET_PAST_PURCHASE_REFINEMENTS, navigations.resetRefinements, nav);
      });

      it('should call page reducer if RESET_PAST_PURCHASE_PAGE', () => {
        testReducerChain(Actions.RESET_PAST_PURCHASE_PAGE, page.resetPage, pageStub);
      });

      it('should call page reducer if UPDATE_PAST_PURCHASE_CURRENT_PAGE', () => {
        testReducerChain(Actions.UPDATE_PAST_PURCHASE_CURRENT_PAGE, page.updateCurrent, pageStub);
      });

      it('should call page reducer if UPDATE_PAST_PURCHASE_PAGE_SIZE', () => {
        testReducerChain(Actions.UPDATE_PAST_PURCHASE_PAGE_SIZE, page.updateSize, pageStub);
      });

      it('should call page reducer if RECEIVE_PAST_PURCHASE_PAGE', () => {
        testReducerChain(Actions.RECEIVE_PAST_PURCHASE_PAGE, page.receivePage, pageStub);
      });
    });

    describe('applyNavigationReducer()', () => {
      it('should call function with navigation section of store and empty sort', () => {
        const payload = 'load';
        const returnedNavigations = 'returned value';
        const nav = stub().returns(returnedNavigations);

        const reducer = past.applyNavigationReducer(state, <any>{ payload }, nav);

        expect(reducer).to.eql({
          ...state,
          navigations: returnedNavigations
        });
        expect(nav).to.be.calledWithExactly({
          ...state.navigations,
          sort: [],
        }, payload);
      });
    });

    describe('applyPageReducer()', () => {
      it('should call function with page section of store', () => {
        const payload = 'load';
        const returnValue = 'returned value';
        const pageReducer = stub().returns(returnValue);

        const reducer = past.applyPageReducer(state, <any>{ payload }, pageReducer);

        expect(reducer).to.eql({
          ...state,
          page: returnValue
        });
        expect(pageReducer).to.be.calledWithExactly(state.page, payload);
      });
    });
  });
});
