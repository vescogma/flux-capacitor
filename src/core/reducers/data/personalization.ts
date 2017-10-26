
import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.UpdateBiasing;
export type State = Store.Personalization;

export default function updatePersonalization(state: State = <any>{}, action: Action): State {
  switch (action.type) {
    default: return state;
  }
}
