import _Action, * as Actions from '../actions';
import Store from '../store';
import Action = _Action.UI;

export type State = Store.UI;

export default function updateUi(state: State = {}, action): State {
  switch (action.type) {
    case Actions.CREATE_COMPONENT_STATE: return createComponentState(state, action);
    case Actions.REMOVE_COMPONENT_STATE: return removeComponentState(state, action);
    default: return state;
  }
}

export const createComponentState = (state: State, { tagName, id, state: tagState }: Action.CreateComponentState) =>
  ({
    ...state,
    [tagName]: {
      ...state[tagName],
      [id]: tagState
    }
  });

export const removeComponentState = (state: State, { tagName, id }: Action.RemoveComponentState) =>
  ({
    ...state,
    [tagName]: {
      ...Object.keys(state[tagName])
        .filter((key) => key !== id)
        .reduce((tags, key) => Object.assign(tags, { [key]: state[tagName][key] }), {})
    }
  });
