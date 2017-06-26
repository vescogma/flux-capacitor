import Actions from '../../../../src/core/actions';
import reducer, * as reducers from '../../../../src/core/reducers';
import * as dataReducer from '../../../../src/core/reducers/data';
import suite from '../../_suite';

suite('reducers', ({ expect, stub }) => {
  it('should handle REFRESH_STATE action', () => {
    const state = { a: 'b', data: { details: {} } };
    const newState = { a: 'b', session: undefined, data: { details: { id: undefined } } };

    expect(reducer({ data: { details: { } }}, { type: Actions.REFRESH_STATE, state })).to.eql(newState);
  });

  it('should return default', () => {
    const state = { a: 'b' };
    stub(reducers, 'rootReducer').returns(state);

    expect(reducer({}, { type: '' })).to.eq(state);
  });
});
