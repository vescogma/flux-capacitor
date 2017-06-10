import { Actions, ActionCreator, Store } from '../../../../../src/core';
import collections from '../../../../../src/core/reducers/data/collections';
import suite from '../../../_suite';

suite('collections', ({ expect }) => {
  let actions: ActionCreator;
  const allIds = ['Department', 'Main'];
  const Department = { // tslint:disable-line variable-name
    label: 'All content',
    name: 'contents',
    total: 750,
  };
  const Main = { // tslint:disable-line variable-name
    label: 'Main content',
    name: 'mains',
    total: 600,
  };
  const selected = 'Main';
  const state: Store.Indexed.Selectable<Store.Collection> = {
    allIds,
    byId: {
      Department,
      Main,
    },
    selected,
  };
  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateCollections()', () => {
    it('should update state on SELECT_COLLECTION', () => {
      const selectedCollection = 'Department';
      const newState = {
        allIds,
        byId: {
          Department,
          Main,
        },
        selected: selectedCollection,
      };

      const reducer = collections(state, { type: Actions.SELECT_COLLECTION, id: selectedCollection });

      expect(reducer).to.eql(newState);
    });

    it('should update state on RECEIVE_COLLECTION_COUNT', () => {
      const total = 700;
      const newState = {
        allIds,
        byId: {
          Department: {
            ...Department,
            total,
          },
          Main,
        },
        selected,
      };

      const reducer = collections(state, {
        type: Actions.RECEIVE_COLLECTION_COUNT,
        collection: allIds[0],
        count: total,
      });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = collections(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
