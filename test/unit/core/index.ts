import * as core from '../../../src/core';
import createActions from '../../../src/core/action-creator';
import Actions from '../../../src/core/actions';
import Adapters from '../../../src/core/adapters';
import Events from '../../../src/core/events';
import Observer from '../../../src/core/observer';
import reducer from '../../../src/core/reducers';
import Selectors from '../../../src/core/selectors';
import Store from '../../../src/core/store';
import { Routes } from '../../../src/core/utils';
import suite from '../_suite';

suite('core', ({ expect }) => {
  describe('createActions()', () => {
    it('should expose createActions', () => {
      expect(core.createActions).to.eq(createActions);
    });
  });

  describe('Actions', () => {
    it('should expose Actions', () => {
      expect(core.Actions).to.eq(Actions);
    });
  });

  describe('Adapters', () => {
    it('should expose Adapters', () => {
      expect(core.Adapters).to.eq(Adapters);
    });
  });

  describe('Events', () => {
    it('should expose Events', () => {
      expect(core.Events).to.eq(Events);
    });
  });

  describe('Observer', () => {
    it('should expose Observer', () => {
      expect(core.Observer).to.eq(Observer);
    });
  });

  describe('reducer', () => {
    it('should expose reducer', () => {
      expect(core.reducer).to.eq(reducer);
    });
  });

  describe('Selectors', () => {
    it('should expose Selectors', () => {
      expect(core.Selectors).to.eq(Selectors);
    });
  });

  describe('Routes', () => {
    it('should expose Routes', () => {
      expect(core.Routes).to.eq(Routes);
    });
  });
});
