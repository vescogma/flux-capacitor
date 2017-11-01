import { Actions, Store } from '../../../../../src/core';
import * as personalization from '../../../../../src/core/reducers/data/personalization';
import suite from '../../../_suite';

suite('personalization', ({ expect, spy, stub }) => {
  describe('updatePersonalization()', () => {
    const state: Store.Personalization = {
      biasing: <any>{ a: 1 }
    };
    const updatePersonalization = personalization.default;

    it('should call updateBiasing when action type is UPDATE_BIASING', () => {
      const type = Actions.UPDATE_BIASING;
      const payload = 1;
      const updateBiasing = stub(personalization, 'updateBiasing');
      const action = { type, payload };

      updatePersonalization(state, action);

      expect(updateBiasing).to.be.calledWithExactly(state, payload);
    });

    it('should return state on default', () => {
      const reducer = updatePersonalization(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });

  describe('updateBiasing()', () => {
    const state: Store.Personalization = <any>{
      biasing: {
        byId: {
          a: {
            b: 1
          },
          c: {
            d: 2
          },
        },
        allIds: [
          { variant: 'a', key: 'b' },
          { variant: 'c', key: 'd' },
        ],
        globalExpiry: 2
      }
    };

    const config = {
      globalMaxBiases: 4095,
      attributes: {
        a: {
          maxBiases: 1023
        }
      }
    };

    it('should update state\'s allId and byId', () => {
      const payload = {
        variant: 'a',
        key: 'z',
        bias: 3,
        config
      };
      const newState = {
        ...state,
        biasing: {
          ...state.biasing,
          byId: {
            ...state.biasing.byId,
            a: {
              ...state.biasing.byId.a,
              z: 3
            }
          },
          allIds: [
            { variant: 'a', key: 'z' },
            ...state.biasing.allIds
          ]
        }
      };
      stub(personalization, 'insertSorted').returns(
        newState.biasing.allIds
      );

      const reducer = personalization.updateBiasing(state, <any>payload);

      expect(reducer).to.eql(newState);
    });

    it('should call removeLast with allIds when attribute\'s maxBiases exceeded', () => {
      const variant = 'a';
      const payload = {
        variant,
        key: 'z',
        bias: 3,
        config: {
          attributes: {
            a: { maxBiases: 0 }
          }
        }
      };
      const allIds = [0, 1, 2, 3, { variant: 'a' }, 4];
      stub(personalization, 'insertSorted').returns(allIds);
      const removeLast = stub(personalization, 'removeLast').returns(allIds);

      personalization.updateBiasing(state, <any>payload);

      expect(removeLast).to.be.calledWithExactly(allIds, variant);
    });

    it('should slice allIds when it\'s length exceeds globalMaxBiases', () => {
      const variant = 'a';
      const payload = {
        variant,
        key: 'z',
        bias: 3,
        config
      };
      const slice = spy();
      const allIds = {
        length: 10020000,
        slice
      };
      stub(personalization, 'insertSorted').returns(allIds);
      const removeLast = stub(personalization, 'removeLast').returns(allIds);

      personalization.updateBiasing(state, <any>payload);

      expect(slice).to.be.calledOnce;
    });
  });

  describe('removeLast', () => {
    const arr = [
      { variant: 'a', key: 1},
      { variant: 'b', key: 2},
      { variant: 'c', key: 3},
    ];

    it('shoud remove last element of a specific variant if it exists ', () => {
      const newArr = [
        { variant: 'a', key: 1 },
        { variant: 'c', key: 3 },
      ];

      const ret = personalization.removeLast(arr, 'b');

      expect(ret).to.eql(newArr);
    });

    it('shoud not modify input array if variant does not exists in array', () => {
      const ret = personalization.removeLast(arr, 'd');

      expect(ret).to.eql(arr);
    });
  });
  describe('insertSorted', () => {
    const arr = [
      { variant: 'a', key: 1},
      { variant: 'b', key: 2},
      { variant: 'c', key: 3},
    ];

    it('shoud insert element to front of array', () => {
      const obj = { variant: 'd', key: 4};
      const newArr = [
        obj,
        ...arr
      ];

      const ret = personalization.insertSorted(<any>arr, <any>obj);

      expect(ret).to.eql(newArr);
    });

    it('shoud insert element to front of array and remove duplicates', () => {
      const obj = { variant: 'b', key: 2};
      const newArr = [
        { variant: 'b', key: 2 },
        { variant: 'a', key: 1 },
        { variant: 'c', key: 3 },
      ];

      const ret = personalization.insertSorted(<any>arr, <any>obj);

      expect(ret).to.eql(newArr);
    });
  });
});