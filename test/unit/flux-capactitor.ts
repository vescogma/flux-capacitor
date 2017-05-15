import ActionCreator, * as creatorPkg from '../../src/core/action-creator';
import Observer from '../../src/core/observer';
import Selectors from '../../src/core/selectors';
import Store from '../../src/core/store';
import FluxCapacitor from '../../src/flux-capacitor';
import suite from './_suite';

suite('FluxCapacitor', ({ expect, spy, stub }) => {

  describe('constructor()', () => {
    it('should initialize action creator, API clients and store', () => {
      const instance = { a: 'b' };
      const creator = stub(creatorPkg, 'default').returns(instance);
      stub(FluxCapacitor, 'createClients');
      stub(Observer, 'listen');
      stub(Store, 'create').returns({ subscribe: () => null });

      const flux = new FluxCapacitor(<any>{});

      expect(creator.calledWith(flux, { search: '/search' })).to.be.true;
      expect(flux.actions).to.eq(instance);
    });

    it('should create API clients', () => {
      const clients = { a: 'b' };
      const createClients = stub(FluxCapacitor, 'createClients').returns(clients);
      stub(creatorPkg, 'default');
      stub(Observer, 'listen');
      stub(Store, 'create').returns({ subscribe: () => null });

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
      stub(creatorPkg, 'default');

      const flux = new FluxCapacitor(config);

      expect(flux.store).to.eq(instance);
      expect(create.calledWith(config, observer)).to.be.true;
      expect(listener.calledWith(flux));
    });
  });

  describe('actions', () => {
    let flux: FluxCapacitor;
    let actions: ActionCreator;
    let store: any;

    function expectDispatch(action: () => void, creatorName: string, expectedValue: any) {
      const fakeAction = { type: 'FAKE_ACTION' };
      const dispatch = store.dispatch = spy();
      const actionCreator = actions[creatorName] = stub().returns(action);

      action();

      expect(actionCreator.calledWith(expectedValue)).to.be.true;
      expect(dispatch.calledWith(action)).to.be.true;
    }

    beforeEach(() => {
      stub(creatorPkg, 'default').returns(actions = <any>{});
      stub(FluxCapacitor, 'createClients');
      stub(Observer, 'listen');
      stub(Store, 'create').returns(store = {});
      flux = new FluxCapacitor(<any>{});
    });

    describe('search()', () => {
      it('should updateSearch() action', () => {
        const query = 'black bear';

        expectDispatch(() => flux.search(query), 'updateSearch', { query });
      });

      it('should revert to current query value', () => {
        const query = 'black bear';
        const state = { a: 'b' };
        const selectedQuery = 'black bar';
        const querySelector = stub(Selectors, 'query').returns(selectedQuery);
        store.getState = () => state;

        expectDispatch(() => flux.search(), 'updateSearch', { query: selectedQuery });
        expect(querySelector.calledWith(state)).to.be.true;
      });
    });

    describe('refinements()', () => {
      it('should call fetchMoreRefinements() action', () => {
        const navigationName = 'brand';

        expectDispatch(() => flux.refinements(navigationName), 'fetchMoreRefinements', navigationName);
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

    describe('resize()', () => {
      it('should call updatePageSize() action', () => {
        const pageSize = 24;

        expectDispatch(() => flux.resize(pageSize), 'updatePageSize', pageSize);
      });
    });
  });
});
