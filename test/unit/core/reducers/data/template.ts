import { Actions, Store } from '../../../../../src/core';
import template from '../../../../../src/core/reducers/data/template';
import suite from '../../../_suite';

suite('template', ({ expect }) => {
  const state: Store.Template = {
    name: 'idk',
    rule: 'semantish',
    zones: {
      mainZone: {
        name: 'Starting template',
        type: 'content',
        content: 'Here\'s a template',
      },
    },
  };

  describe('updateTemplate()', () => {
    it('should update state on RECEIVE_TEMPLATE', () => {
      const payload: any = {
        name: 'idk2',
        rule: 'semantish2',
        zones: {
          mainZone: {
            name: 'Starting template2',
            type: 'content',
            content: 'Here\'s a template2',
          },
        },
      };

      const reducer = template(state, { type: Actions.RECEIVE_TEMPLATE, payload });

      expect(reducer).to.eql(payload);
    });

    it('should return state on default', () => {
      const reducer = template(state, <any>{});

      expect(reducer).to.eql(state);
    });

    it('should have default empty state', () => {
      const reducer = template(undefined, <any>{});

      expect(reducer).to.eql({});
    });
  });
});
