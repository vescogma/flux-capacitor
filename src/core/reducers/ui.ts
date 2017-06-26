import Actions from '../actions';
import Store from '../store';

export type Action = Actions.CreateComponentState
  | Actions.RemoveComponentState;
export type State = Store.UI;

export default function updateUi(state: State = {}, action: Action): State {
  switch (action.type) {
    case Actions.CREATE_COMPONENT_STATE: return createComponentState(state, action.payload);
    case Actions.REMOVE_COMPONENT_STATE: return removeComponentState(state, action.payload);
    default: return state;
  }
}

export const createComponentState = (state: State, { tagName, id, state: tagState }: Actions.Payload.Component.State) =>
  ({
    ...state,
    [tagName]: {
      ...state[tagName],
      [id]: tagState
    }
  });

export const removeComponentState = (state: State, { tagName, id }: Actions.Payload.Component.Identifier) =>
  ({
    ...state,
    [tagName]: {
      ...Object.keys(state[tagName])
        .filter((key) => key !== id)
        .reduce((tags, key) => Object.assign(tags, { [key]: state[tagName][key] }), {})
    }
  });
