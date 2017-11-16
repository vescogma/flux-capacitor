import { Actions, Store } from '../../../../src/core';
import ui from '../../../../src/core/reducers/ui';
import suite from '../../_suite';

suite('ui', ({ expect }) => {
  const global = true;
  const ID = '5';
  const state: Store.UI = {
    breadcrumbs: {
      global,
      [ID]: 'yeah',
    }
  };

  describe('updateUi()', () => {
    it('should update state on CREATE_COMPONENT_STATE', () => {
      const id = 2;
      const idState = {};
      const tagName = 'query';
      const newState = {
        ...state,
        query: {
          [id]: {
            data: {},
            persist: false,
          }
        }
      };

      // tslint:disable-next-line max-line-length
      const reducer = ui(state, <any>{ type: Actions.CREATE_COMPONENT_STATE, payload: { tagName, id, state: idState, persist: false } });

      expect(reducer).to.eql(newState);
    });

    it('should update state on REMOVE_COMPONENT_STATE', () => {
      const newState = { breadcrumbs: { global } };
      const reducer = ui(state, { type: Actions.REMOVE_COMPONENT_STATE, payload: { tagName: 'breadcrumbs', id: ID } });

      expect(reducer).to.eql(newState);
    });

    it('should clear state when recallId in meta', () => {
      const reducer = ui(<any>{
        ['gb-query']: { 3: { persist: false } },
        ['gb-sort']: {
          4: { persist: true, data: { eyy: 'yo' } },
          5: { persist: false, data: { ayy: 'lmao' } },
          6: { persist: true, data: { anotha: 'one' } },
        },
        ['gb-infinite-scroll']: { 1: { persist: true } },
      },
      { type: null,
        payload: { query: 'eyy' },
        meta: { recallId: 'a' } }
      );

      expect(reducer).to.eql({
        ['gb-sort']: {
          4: { persist: true, data: { eyy: 'yo' } },
          6: { persist: true, data: { anotha: 'one' } },
        },
        ['gb-infinite-scroll']: { 1: { persist: true } },
      });
    });

    it('should return state on default', () => {
      const reducer = ui(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
