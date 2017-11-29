import { EventEmitter } from 'eventemitter3';
import * as groupbyApi from 'groupby-api';
import * as saytApi from 'sayt';
import * as sinon from 'sinon';
import * as core from '../../src/core';
import ActionCreators from '../../src/core/actions/creators';
import ConfigAdapter from '../../src/core/adapters/configuration';
import Events from '../../src/core/events';
import Observer from '../../src/core/observer';
import Selectors from '../../src/core/selectors';
import Store from '../../src/core/store';
import FluxCapacitor from '../../src/flux-capacitor';
import suite from './_suite';

suite('FluxCapacitor', ({ expect, spy, stub }) => {

  describe('constructor()', () => {
    it('should initialize action creator', () => {
      const primedInstance = { a: 'b' };
      stub(FluxCapacitor, 'createClients');
      stub(Observer, 'listen');
      stub(Store, 'create');

      const flux = new FluxCapacitor(<any>{});

      expect(flux.actions).to.eq(ActionCreators);
    });

    it('should have a config getter', () => {
      const state = { a: 'b' };
      const getState = spy(() => state);
      stub(FluxCapacitor, 'createClients');
      stub(Observer, 'listen');
      stub(Store, 'create');

      const flux = new FluxCapacitor(<any>{});
      const selector = stub(flux.selectors, 'config');
      flux.store = <any>{ getState };
      flux.config;

      expect(selector).to.be.calledWithExactly(state);
      expect(getState).to.be.calledWithExactly();
    });

    it('should create API clients', () => {
      const clients = { a: 'b' };
      const createClients = stub(FluxCapacitor, 'createClients').returns(clients);
      stub(Observer, 'listen');
      stub(Store, 'create');

      const flux = new FluxCapacitor(<any>{});

      expect(createClients.calledWith(flux)).to.be.true;
      expect(flux.clients).to.eq(clients);
    });

    it('should initialize state store and observe changes', () => {
      const config: any = { a: 'b' };
      const instance = { c: 'd' };
      const observer = () => null;
      const create = stub(Store, 'create').returns(instance);
      const listener = stub(Observer, 'listener').returns(observer);
      stub(FluxCapacitor, 'createClients');

      const flux = new FluxCapacitor(config);

      expect(flux.store).to.eq(instance);
      expect(create).to.be.calledWith(flux, observer);
      expect(listener).to.be.calledWith(flux);
    });

    it('should extend EventEmitter', () => {
      stub(FluxCapacitor, 'createClients');
      stub(Observer, 'listen');
      stub(Store, 'create');

      expect(new FluxCapacitor(<any>{})).to.be.an.instanceOf(EventEmitter);
    });
  });

  describe('actions', () => {
    let flux: FluxCapacitor;
    let actions: typeof FluxCapacitor.prototype.actions;
    let store: any;

    function expectDispatch(action: () => void, creatorName: string, ...params: any[]) {
      const fakeAction = { type: 'FAKE_ACTION' };
      const dispatch = store.dispatch = spy();
      const actionCreator = stub(ActionCreators, creatorName).returns(action);

      action();

      expect(actionCreator).to.be.calledWithExactly(...params);
    }

    beforeEach(() => {
      actions = <any>{};
      stub(FluxCapacitor, 'createClients');
      stub(Observer, 'listen');
      stub(Store, 'create').returns(store = {});
      flux = new FluxCapacitor(<any>{});
    });

    describe('saveState()', () => {
      it('should emit HISTORY_SAVE event with state and route', () => {
        const state = { a: 'b' };
        const emit = flux.emit = spy();
        const route = 'search';
        flux.store = <any>{ getState: () => state };

        flux.saveState(route);

        expect(emit).to.be.calledWith(Events.HISTORY_SAVE, { state, route });
      });
    });

    describe('search()', () => {
      it('should updateSearch() action', () => {
        const query = 'black bear';

        expectDispatch(() => flux.search(query), 'search', query);
      });

      it('should revert to current query value', () => {
        expectDispatch(() => flux.search(), 'search', undefined);
      });
    });

    describe('products()', () => {
      it('should call fetchProducts() action', () => {
        expectDispatch(() => flux.products(), 'fetchProducts');
      });
    });

    describe('moreRefinements()', () => {
      it('should call fetchMoreRefinements() action', () => {
        const navigationName = 'brand';

        expectDispatch(() => flux.moreRefinements(navigationName), 'fetchMoreRefinements', navigationName);
      });
    });

    describe('moreProducts()', () => {
      it('should call fetchMoreRefinements() action', () => {
        const amount = 23;

        expectDispatch(() => flux.moreProducts(amount), 'fetchMoreProducts', amount);
      });
    });

    describe('reset()', () => {
      it('should call updateSearch() action', () => {
        expectDispatch(() => flux.reset(), 'resetRecall', undefined, undefined);
      });
    });

    describe('resize()', () => {
      it('should call updatePageSize() action', () => {
        const pageSize = 24;

        expectDispatch(() => flux.resize(pageSize), 'updatePageSize', pageSize);
      });
    });

    describe('sort()', () => {
      it('should call selectSort() action', () => {
        const index = 2;

        expectDispatch(() => flux.sort(index), 'selectSort', index);
      });
    });

    describe('refine()', () => {
      it('should call selectRefinement() action', () => {
        const field = 'brand';
        const index = 2;

        expectDispatch(() => flux.refine(field, index), 'selectRefinement', field, index);
      });
    });

    describe('unrefine()', () => {
      it('should call deselectRefinement() action', () => {
        const field = 'brand';
        const index = 2;

        expectDispatch(() => flux.unrefine(field, index), 'deselectRefinement', field, index);
      });
    });

    describe('detailsWithRouting()', () => {
      it('should call setDetails() action', () => {
        const product: any = { a: 'b' };

        expectDispatch(() => flux.detailsWithRouting(product), 'setDetails', product);
      });
    });

    describe('switchCollection()', () => {
      it('should call selectCollection() action', () => {
        const collection = 'products';

        expectDispatch(() => flux.switchCollection(collection), 'selectCollection', collection);
      });
    });

    describe('switchPage()', () => {
      it('should call selectCollection() action', () => {
        const page = 26;

        expectDispatch(() => flux.switchPage(page), 'updateCurrentPage', page);
      });
    });

    describe('countRecords()', () => {
      it('should call fetchCollectionCount() action', () => {
        const collection = 'products';

        expectDispatch(() => flux.countRecords(collection), 'fetchCollectionCount', collection);
      });
    });

    describe('autocomplete()', () => {
      it('should call updateAutocompleteQuery() action', () => {
        const query = 'elon musk';

        expectDispatch(() => flux.autocomplete(query), 'updateAutocompleteQuery', query);
      });
    });

    describe('saytSuggestions()', () => {
      it('should call fetchAutocompleteSuggestions() action', () => {
        const query = 'douglas fir';

        expectDispatch(() => flux.saytSuggestions(query), 'fetchAutocompleteSuggestions', query);
      });
    });

    describe('saytProducts()', () => {
      it('should call fetchAutocompleteProducts() action', () => {
        const query = 'maple beans';
        const refinements: any[] = ['a', 'b'];

        expectDispatch(() => flux.saytProducts(query, refinements), 'fetchAutocompleteProducts', query, refinements);
      });

      it('should default to an empty array of refinements', () => {
        const query = 'maple beans';

        expectDispatch(() => flux.saytProducts(query), 'fetchAutocompleteProducts', query, []);
      });
    });

    describe('saytPastPurchases()', () => {
      it('should call fetchSaytPastPurchases() action', () => {
        const query = 'hat';

        expectDispatch(() => flux.saytPastPurchases(query), 'fetchSaytPastPurchases', query);
      });
    });

    describe('pastPurchaseProducts()', () => {
      it('should call fetchPastPurchaseProducts() action', () => {
        expectDispatch(() => flux.pastPurchaseProducts(), 'fetchPastPurchaseProducts');
      });
    });

    describe('displaySaytPastPurchases()', () => {
      it('should call receiveAutocompleteProductRecords() action', () => {
        const pastPurchases = [1, 2, 3];
        const state = { a: 1 };
        store.getState = () => state;
        stub(Selectors, 'saytPastPurchases').returns(pastPurchases);

        expectDispatch(() => flux.displaySaytPastPurchases(), 'receiveAutocompleteProductRecords', pastPurchases);
      });
    });
  });

  describe('static', () => {
    describe('createClients()', () => {
      it('should call createBridge()', () => {
        // tslint:disable-next-line variable-name
        const __config = { a: 'b' };
        const bridge = { c: 'd' };
        const createBridge = stub(FluxCapacitor, 'createBridge').returns(bridge);
        stub(FluxCapacitor, 'createSayt');

        const clients = FluxCapacitor.createClients(<any>{ __config });

        expect(createBridge).to.be.calledWith(__config);
        expect(clients.bridge).to.eq(bridge);
      });

      it('should return error callback that emits an ERROR_BRIDGE and calls error handler', () => {
        const errorHandler = spy(() => null);
        const emit = spy(() => null);
        // tslint:disable-next-line variable-name
        const __config = { network: { errorHandler } };
        const bridge = { c: 'd' };
        const err = 'err';
        stub(FluxCapacitor, 'createBridge').returns(bridge).callsArgWith(1, err);
        stub(FluxCapacitor, 'createSayt');

        const clients = FluxCapacitor.createClients(<any>{ __config, emit });

        expect(emit).to.be.calledWith(Events.ERROR_BRIDGE, err);
        expect(errorHandler).to.be.calledWith(err);
      });

      it('should return error callback that does not call error handler if not present', () => {
        const emit = spy(() => null);
        // tslint:disable-next-line variable-name
        const __config = { network: { } };
        const bridge = { c: 'd' };
        const err = 'err';
        stub(FluxCapacitor, 'createBridge').returns(bridge).callsArgWith(1, err);
        stub(FluxCapacitor, 'createSayt');

        const clients = FluxCapacitor.createClients(<any>{ __config, emit });

        expect(emit).to.be.calledWith(Events.ERROR_BRIDGE, err);
      });

      it('should call createSayt()', () => {
        // tslint:disable-next-line variable-name
        const __config = { a: 'b' };
        const sayt = { c: 'd' };
        const createSayt = stub(FluxCapacitor, 'createSayt').returns(sayt);
        stub(FluxCapacitor, 'createBridge');

        const clients = FluxCapacitor.createClients(<any>{ __config });

        expect(createSayt).to.be.calledWith(__config);
        expect(clients.sayt).to.eq(sayt);
      });
    });

    describe('createBridge()', () => {
      it('should create new BrowserBridge', () => {
        const customerId = 'testcustomer';
        const https = true;
        const networkConfig = { https };
        const bridge = { a: 'b' };
        const errorHandler = () => null;
        const browserBridge = stub(groupbyApi, 'BrowserBridge').returns(bridge);

        const created = FluxCapacitor.createBridge(<any>{ customerId, network: networkConfig }, errorHandler);

        expect(browserBridge).to.be.calledWith(customerId, https, networkConfig);
        expect(created).to.eq(bridge);
        expect(created.errorHandler).to.eq(errorHandler);
      });

      it('should set headers', () => {
        const headers = { a: 'b' };
        stub(groupbyApi, 'BrowserBridge').returns({});

        const created = FluxCapacitor.createBridge(<any>{ network: { headers } }, () => null);

        expect(created.headers).to.eq(headers);
      });
    });

    describe('createSayt()', () => {
      it('should create a new Sayt', () => {
        const customerId = 'mycustomer';
        const collection = 'products';
        const https = true;
        const saytConfig = { collection };
        const saytClient = { a: 'b' };
        const sayt = stub(saytApi, 'Sayt').returns(saytClient);

        const created = FluxCapacitor.createSayt(<any>{ customerId, autocomplete: saytConfig, network: { https } });

        expect(created).to.eq(saytClient);
        expect(sayt).to.be.calledWith({
          https,
          collection,
          subdomain: customerId,
        });
      });

      it('should fallback to defaults', () => {
        const customerId = 'othercustomer';
        const collection = 'international';
        const config = { customerId, autocomplete: {}, network: {} };
        const sayt = stub(saytApi, 'Sayt').returns({});
        const extractCollection = stub(ConfigAdapter, 'extractCollection').returns(collection);

        FluxCapacitor.createSayt(config);

        expect(sayt).to.be.calledWith({
          https: undefined,
          collection,
          subdomain: customerId,
        });
      });
    });
  });
});
