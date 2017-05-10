import { Action, Store } from '..';

export type State = Store.Template;

export default function updateTemplate(state: State = null, action): State {
  switch (action.type) {
    case Action.types.RECEIVE_TEMPLATE: return action.template;
    default: return state;
  }
}
