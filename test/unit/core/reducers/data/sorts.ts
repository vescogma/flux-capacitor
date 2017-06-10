import { Actions, ActionCreator, Store } from '../../../../../src/core';
import sorts from '../../../../../src/core/reducers/data/sorts';
import suite from '../../../_suite';

suite('sorts', ({ expect }) => {
  let actions: ActionCreator;
  const items = [
    { label: 'Price low to high', field: 'price', descending: false },
    { label: 'Price high to low', field: 'price', descending: true },
  ];
  const state: Store.SelectableList<Store.Sort> = {
    items,
    selected: 0,
  };
  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateSorts()', () => {
    it('should update selected state on UPDATE_SORTS', () => {
      const newSelected = 1;
      const newState = {
        ...state,
        selected: newSelected,
      };

      const reducer = sorts(state, { type: Actions.SELECT_SORT, index: newSelected });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = sorts(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
