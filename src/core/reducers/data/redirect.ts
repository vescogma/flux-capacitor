import Actions from '../../actions';

export type Action = Actions.ReceiveRedirect;
export type State = string;

export default function updateRedirect(state: State = null, action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_REDIRECT: return action.payload;
    default: return state;
  }
}
