import { EventEmitter } from 'eventemitter3';
import * as groupbyApi from 'groupby-api';
import * as saytApi from 'sayt';
import * as core from '../../src/core';
import ActionCreator from '../../src/core/action-creator';
import ConfigAdapter from '../../src/core/adapters/configuration';
import Observer from '../../src/core/observer';
import Selectors from '../../src/core/selectors';
import Store from '../../src/core/store';
import FluxCapacitor from '../../src/flux-capacitor';
import suite from './_suite';

suite('FluxCapacitor', ({ expect, spy, stub }) => {

  describe('constructor()', () => {
    it('should initialize action creator', () => {
      const instance = { a: 'b' };
      const creator = stub(core, 'ActionCreator').returns(instance);
      stub(FluxCapacitor, 'createClients');
      stub(Observer, 'listen');
      stub(Store, 'create');

      const flux = new FluxCapacitor(<any>{});

      expect(creator.calledWith(flux, { search: '/search' })).to.be.true;
      expect(flux.actions).to.eq(instance);
    });

    it('should create API clients', () => {
      const clients = { a: 'b' };
      const createClients = stub(FluxCapacitor, 'createClients').returns(clients);
      stub(core, 'ActionCreator');
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
      stub(core, 'ActionCreator');

      const flux = new FluxCapacitor(config);

      expect(flux.store).to.eq(instance);
      expect(create.calledWith(config, observer)).to.be.true;
      expect(listener.calledWith(flux));
    });

    it('should extend EventEmitter', () => {
      stub(core, 'ActionCreator');
      stub(FluxCapacitor, 'createClients');
      stub(Observer, 'listen');
      stub(Store, 'create');

      expect(new FluxCapacitor(<any>{})).to.be.an.instanceOf(EventEmitter);
    });
  });

  describe('actions', () => {
    let flux: FluxCapacitor;
    let actions: ActionCreator;
    let store: any;

    function expectDispatch(action: () => void, creatorName: string, ...params: any[]) {
      const fakeAction = { type: 'FAKE_ACTION' };
      const dispatch = store.dispatch = spy();
      const actionCreator = actions[creatorName] = stub().returns(action);

      action();

      expect(actionCreator.calledWith(...params)).to.be.true;
      expect(dispatch.calledWith(action)).to.be.true;
    }

    beforeEach(() => {
      stub(core, 'ActionCreator').returns(actions = <any>{});
      stub(FluxCapacitor, 'createClients');
      stub(Observer, 'listen');
      stub(Store, 'create').returns(store = {});
      flux = new FluxCapacitor(<any>{});
    });

    describe('search()', () => {
      it('should updateSearch() action', () => {
        const query = 'black bear';

        expectDispatch(() => flux.search(query), 'updateSearch', { query, clear: true });
      });

      it('should revert to current query value', () => {
        const query = 'black bear';
        const state = { a: 'b' };
        const selectedQuery = 'black bar';
        const querySelector = stub(Selectors, 'query').returns(selectedQuery);
        store.getState = () => state;

        expectDispatch(() => flux.search(), 'updateSearch', { query: selectedQuery, clear: true });
        expect(querySelector.calledWith(state)).to.be.true;
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
        expectDispatch(() => flux.reset(), 'updateSearch', {
          query: null,
          navigationId: undefined,
          index: undefined,
          clear: true
        });
      });
    });

    describe('resetQuery()', () => {
      it('should call updateSearch() action', () => {
        expectDispatch(() => flux.resetQuery(), 'updateSearch', { query: null });
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

    describe('details()', () => {
      it('should call fetchProductDetails() action', () => {
        const id = '123';

        expectDispatch(() => flux.details(id), 'fetchProductDetails', id);
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

        expectDispatch(() => flux.saytProducts(query), 'fetchAutocompleteProducts', query);
      });
    });
  });

  describe('static', () => {
    describe('createClients()', () => {
      it('should call createBridge()', () => {
        const config = { a: 'b' };
        const bridge = { c: 'd' };
        const createBridge = stub(FluxCapacitor, 'createBridge').returns(bridge);
        stub(FluxCapacitor, 'createSayt');

        const clients = FluxCapacitor.createClients(<any>{ config });

        expect(createBridge).to.be.calledWith(config);
        expect(clients.bridge).to.eq(bridge);
      });

      it('should call createSayt()', () => {
        const config = { a: 'b' };
        const sayt = { c: 'd' };
        const createSayt = stub(FluxCapacitor, 'createSayt').returns(sayt);
        stub(FluxCapacitor, 'createBridge');

        const clients = FluxCapacitor.createClients(<any>{ config });

        expect(createSayt).to.be.calledWith(config);
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
        const language = 'en';
        const collection = 'products';
        const area = 'development';
        const saytConfig = { language, collection, area };
        const saytClient = { a: 'b' };
        const sayt = stub(saytApi, 'Sayt').returns(saytClient);

        const created = FluxCapacitor.createSayt(<any>{ customerId, autocomplete: saytConfig });

        expect(created).to.eq(saytClient);
        expect(sayt).to.be.calledWith({
          collection,
          autocomplete: { language },
          productSearch: { area },
          subdomain: customerId,
        });
      });

      it('should fallback to defaults', () => {
        const customerId = 'othercustomer';
        const language = 'fr';
        const collection = 'international';
        const area = 'development';
        const config = { language, customerId, area, autocomplete: {} };
        const sayt = stub(saytApi, 'Sayt').returns({});
        const extractCollection = stub(ConfigAdapter, 'extractCollection').returns(collection);

        FluxCapacitor.createSayt(config);

        expect(sayt).to.be.calledWith({
          collection,
          autocomplete: { language },
          productSearch: { area },
          subdomain: customerId,
        });
      });
    });
  });
});
