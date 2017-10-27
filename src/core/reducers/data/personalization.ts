
import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.UpdateBiasing;
export type State = Store.Personalization;

export default function updatePersonalization(state: State = <any>{}, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_BIASING: return updateBiasing(state, action.payload);

    default: return state;
  }
}

export function updateBiasing (state: State, bias: Actions.Payload.Personalization.Biasing) {

  const byId = {
    ...state.byId,
    [bias.variant]: {
      ...state.byId[bias.variant],
      [bias.key]: bias.bias
    }
  };

  return {...state, byId};
}
