import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.ReceiveTemplate;
export type State = Store.Template;

export default function updateTemplate(state: State = <any>{}, action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_TEMPLATE: return action.payload;
    default: return state;
  }
}
