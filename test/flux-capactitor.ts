import * as Actions from '../src/core/actions';
import Observer from '../src/core/observer';
import Store from '../src/core/store';
import FluxCapacitor from '../src/flux-capacitor';
import suite from './_suite';

suite('FluxCapacitor', ({ expect, spy, stub }) => {

  describe('constructor()', () => {
    it('should initialize action creator, API clients and store', () => {
      const instance = { a: 'b' };
      const creator = stub(Actions, 'Creator').returns(instance);
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
      stub(Actions, 'Creator');
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
      const listen = stub(Observer, 'listen').returns(observer);
      stub(FluxCapacitor, 'createClients');
      stub(Actions, 'Creator');

      const flux = new FluxCapacitor(config);

      expect(flux.store).to.eq(instance);
      expect(create.calledWith(config, observer)).to.be.true;
      expect(listen.calledWith(flux));
    });
  });
});
