import Actions from '../../../../src/core/actions';
import reducer, * as reducers from '../../../../src/core/reducers';
import * as dataReducers from '../../../../src/core/reducers/data';
import suite from '../../_suite';

suite('reducers', ({ expect, stub }) => {
  it('should handle REFRESH_STATE action', () => {
    // tslint:disable-next-line max-line-length
    const payload = { a: 'b', data: { past: [], present: { autocomplete: { c: 'd' }, details: { data: '3' } }, future: [] } };
    const newState = {
      a: 'b',
      session: undefined,
      data: {
        past: [{ autocomplete: { c: 'd' }, details: { data: '3' } }],
        present: { autocomplete: {}, details: { data: '3' } },
        future: []
      }
    };

    expect(reducer(<any>{
      data: {
        past: [],
        present: { autocomplete: {}, details: {} },
        future: []
      }
    }, { type: Actions.REFRESH_STATE, payload })).to.eql(newState);
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
