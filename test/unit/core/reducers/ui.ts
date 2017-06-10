import { Actions, ActionCreator, Store } from '../../../../src/core';
import ui from '../../../../src/core/reducers/ui';
import suite from '../../_suite';

suite('ui', ({ expect }) => {
  let actions: ActionCreator;

  const global = true;
  const id = '5';
  const state: Store.UI = {
    breadcrumbs: {
      global,
      [id]: 'yeah'
    }
  }

  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateUi()', () => {
    it('should update state on CREATE_COMPONENT_STATE', () => {
      const id = 2;
      const idState = {};
      const tagName = 'query';
      const newState = {
        ...state,
        query: {
          [id]: idState
        }
      };

      const reducer = ui(state, { type: Actions.CREATE_COMPONENT_STATE, tagName, id, state: idState });

      expect(reducer).to.eql(newState);
    });

    it('should update state on REMOVE_COMPONENT_STATE', () => {
      const newState = { breadcrumbs: { global } };
      const reducer = ui(state, { type: Actions.REMOVE_COMPONENT_STATE, tagName: 'breadcrumbs', id });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = ui(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
