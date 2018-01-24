import Actions from '../../../../src/core/actions';
import reducer, * as reducers from '../../../../src/core/reducers';
import * as dataReducers from '../../../../src/core/reducers/data';
import suite from '../../_suite';

suite('reducers', ({ expect, stub }) => {
  it('should handle REFRESH_STATE action', () => {
    const payload = {
      a: 'b',
      data: {
        past: [],
        present: {
          personalization: { biasing: 'bias' },
          autocomplete: { c: 'd' },
          details: { data: '3' }
        },
        future: [],
      }
    };
    const oldState = <any>{
      data: {
        past: [],
        present: {
          personalization: { biasing: 'not' },
          autocomplete: {},
          details: {}
        },
        future: []
      },
      session: {
        config: {
          history: {
            length: 5
          }
        }
      }
    };
    const newState = {
      a: 'b',
      data: {
        past: [{ personalization: { biasing: 'bias' }, autocomplete: { c: 'd' }, details: { data: '3' } }],
        present: { personalization: { biasing: 'not' }, autocomplete: {}, details: { data: '3' } },
        future: []
      },
      session: {
        config: {
          history: {
            length: 5
          }
        }
      }
    };

    expect(reducer(oldState, { type: Actions.REFRESH_STATE, payload })).to.eql(newState);
  });

  it('should keep the correct length of past', () => {
    const historyLength = 2;
    const payload = {
      a: 'b',
      data: {
        past: [{ a: 1 }, { b: 2 }],
        present: { personalization: { biasing: 2 }, autocomplete: {}, details: { data: 2 } },
        future: []
      }
    };
    const oldState = <any>{
      a: 'b',
      data: {
        present: { personalization: { biasing: 1 }, autocomplete: {}, details: { data: 1 } },
      },
      session: {
        config: { history: { length: historyLength } }
      }
    };

    expect(reducer(oldState, { type: Actions.REFRESH_STATE, payload }).data.past.length).to.eql(historyLength);
  });

  it('should advance history on SAVE_STATE', () => {
    const updated = reducer(<any>{
      data: {
        past: [],
        present: {},
        future: []
      }
    }, <any>{ type: Actions.SAVE_STATE });

    expect(updated.data.future).to.eql([]);
    expect(updated.data.past).to.eql([{}]);
    expect(updated.data.present).to.be.an('object');
  });

  it('should return default', () => {
    const state = { a: 'b' };
    stub(reducers, 'rootReducer').returns(state);

    expect(reducer(<any>{}, <any>{ type: '' })).to.eq(state);
  });
});
