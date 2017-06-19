import { Actions, ActionCreator, Store } from '../../../../../src/core';
import navigations from '../../../../../src/core/reducers/data/navigations';
import suite from '../../../_suite';

suite('navigations', ({ expect }) => {
  let actions: ActionCreator;
  const allIds = ['Format', 'Section'];
  const Format = { // tslint:disable-line variable-name
    field: 'format',
    label: 'Format',
    more: true,
    or: true,
    selected: [0, 2],
    refinements: [
      { value: 'Hardcover', total: 200 },
      { value: 'Paper', total: 129 },
      { value: 'Audio Book', total: 293 },
    ],
  };
  const Section = { // tslint:disable-line variable-name
    field: 'section',
    label: 'Section',
    more: true,
    or: false,
    selected: [3],
    refinements: [
      { value: 'Books', total: 203 },
      { value: 'Gifts', total: 1231 },
      { value: 'Toys', total: 231 },
      { value: 'Teens', total: 193 },
    ],
  };
  const state: Store.Indexed<Store.Navigation> = {
    allIds,
    byId: {
      Format,
      Section,
    },
  };
  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateNavigations()', () => {
    it('should clear selected refinements state on UPDATE_SEARCH', () => {
      const newState = {
        allIds,
        byId: {
          Format: {
            ...Format,
            selected: [],
          },
          Section: {
            ...Section,
            selected: [],
          },
        },
      };

      const reducer = navigations(state, { type: Actions.UPDATE_SEARCH, clear: true });

      expect(reducer).to.eql(newState);
    });

    it('should clear and add selected refinement state on UPDATE_SEARCH', () => {
      const newState = {
        allIds,
        byId: {
          Format: {
            ...Format,
            selected: [0],
          },
          Section: {
            ...Section,
            selected: [],
          },
        },
      };

      const reducer = navigations(state, {
        type: Actions.UPDATE_SEARCH,
        clear: true,
        navigationId: 'Format',
        index: 0,
      });

      expect(reducer).to.eql(newState);
    });

    it('should return state if not clear on UPDATE_SEARCH', () => {

      const reducer = navigations(state, {
        type: Actions.UPDATE_SEARCH,
        clear: false
      });

      expect(reducer).to.eql(state);
    });

    it('should update navigations state on RECEIVE_NAVIGATIONS', () => {
      const newNavs = [
        {
          field: 'colour',
          label: 'Colour',
          more: true,
          or: true,
          selected: [],
          refinements: [
            { value: 'red', total: 23 },
            { value: 'green', total: 199 },
            { value: 'blue', total: 213 },
          ],
        }, {
          field: 'size',
          label: 'Size',
          more: false,
          or: false,
          selected: [],
          refinements: [
            { value: 'small', total: 123 },
            { value: 'medium', total: 309 },
            { value: 'large', total: 13 },
          ],
        },
      ];
      const newState = {
        allIds: ['colour', 'size'],
        byId: {
          colour: newNavs[0],
          size: newNavs[1],
        },
      };

      const reducer = navigations(state, {
        type: Actions.RECEIVE_NAVIGATIONS,
        navigations: newNavs,
      });

      expect(reducer).to.eql(newState);
    });

    it('should add selected refinement state on SELECT_REFINEMENT', () => {
      const newState = {
        allIds,
        byId: {
          Format,
          Section: {
            ...Section,
            selected: [3, 0],
          },
        },
      };

      const reducer = navigations(state, {
        type: Actions.SELECT_REFINEMENT,
        navigationId: 'Section',
        index: 0,
      });

      expect(reducer).to.eql(newState);
    });

    it('should return state on SELECT_REFINEMENT if no navigationId and refinementIndex', () => {
      const reducer = navigations(state, {
        type: Actions.SELECT_REFINEMENT,
      });

      expect(reducer).to.eql(state);
    });

    it('should add value navigation and refinement on UPDATE_SEARCH', () => {
      const newState = {
        allIds: ['Format', 'Section', 'Brand'],
        byId: {
          Format: {
            ...Format,
            selected: []
          },
          Section: {
            ...Section,
            selected: []
          },
          Brand: {
            field: 'Brand',
            label: 'Brand',
            range: false,
            refinements: [{ value: 'Oakley' }],
            selected: [0]
          }
        }
      };

      const reducer = navigations(state, {
        type: Actions.UPDATE_SEARCH,
        navigationId: 'Brand',
        range: false,
        value: 'Oakley',
        clear: true
      });

      expect(reducer).to.eql(newState);
    });

    it('should add range navigation and refinement on UPDATE_SEARCH', () => {
      const newState = {
        allIds: ['Format', 'Section', 'Brand'],
        byId: {
          Format: {
            ...Format,
            selected: []
          },
          Section: {
            ...Section,
            selected: []
          },
          Brand: {
            field: 'Brand',
            label: 'Brand',
            range: true,
            refinements: [{ low: 23, high: 34 }],
            selected: [0]
          }
        }
      };

      const reducer = navigations(state, {
        type: Actions.UPDATE_SEARCH,
        navigationId: 'Brand',
        range: true,
        low: 23,
        high: 34,
        clear: true
      });

      expect(reducer).to.eql(newState);
    });

    it('should add refinement to existing navigation on UPDATE_SEARCH', () => {
      const newState = {
        allIds,
        byId: {
          Section: {
            ...Section,
            selected: []
          },
          Format: {
            ...Format,
            refinements: [
              ...Format.refinements,
              { value: 'eBook' }
            ],
            selected: [3]
          }
        }
      };

      const reducer = navigations(state, {
        type: Actions.UPDATE_SEARCH,
        navigationId: 'Format',
        range: false,
        value: 'eBook',
        clear: true
      });

      expect(reducer).to.eql(newState);
    });

    it('should select existing refinement on UPDATE_SEARCH', () => {
      const newState = {
        allIds,
        byId: {
          Section: {
            ...Section,
            selected: []
          },
          Format: {
            ...Format,
            selected: [1]
          }
        }
      };

      const reducer = navigations(state, {
        type: Actions.UPDATE_SEARCH,
        navigationId: 'Format',
        range: false,
        value: 'Paper',
        clear: true
      });

      expect(reducer).to.eql(newState);
    });

    it('should return state on UPDATE_SEARCH if no navigationId', () => {
      const reducer = navigations(state, {
        type: Actions.UPDATE_SEARCH,
      });

      expect(reducer).to.eql(state);
    });

    it('should remove selected refinement state on DESELECT_REFINEMENT', () => {
      const newState = {
        allIds,
        byId: {
          Format: {
            ...Format,
            selected: [2],
          },
          Section,
        },
      };

      const reducer = navigations(state, {
        type: Actions.DESELECT_REFINEMENT,
        navigationId: 'Format',
        index: 0,
      });

      expect(reducer).to.eql(newState);
    });

    it('should return state on DESELECT_REFINEMENT if no navigationId and refinementIndex', () => {
      const reducer = navigations(state, {
        type: Actions.DESELECT_REFINEMENT,
      });

      expect(reducer).to.eql(state);
    });

    it('should update refinements state on RECEIVE_MORE_REFINEMENTS', () => {
      const selected = [0, 3, 4];
      const refinements = [
        { value: 'Paper back', total: 400 },
        { value: 'ebook', total: 2000 },
      ];
      const newState = {
        allIds,
        byId: {
          Format: {
            ...Format,
            more: false,
            refinements,
            selected
          },
          Section,
        },
      };

      const reducer = navigations(state, {
        type: Actions.RECEIVE_MORE_REFINEMENTS,
        navigationId: 'Format',
        refinements,
        selected
      });

      expect(reducer).to.eql(newState);
    });

    it('should return state on RECEIVE_MORE_REFINEMENTS if no navigationId and refinements', () => {
      const reducer = navigations(state, {
        type: Actions.RECEIVE_MORE_REFINEMENTS,
      });

      expect(reducer).to.eql(state);
    });

    it('should return state on default', () => {
      const reducer = navigations(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
