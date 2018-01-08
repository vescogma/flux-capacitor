import Actions from '../actions';
import Store from '../store';

export type Action = Actions.CreateComponentState
  | Actions.RemoveComponentState
  | Actions.Action<any>;
export type State = Store.UI;

export default function updateUi(state: State = {}, { type, payload, meta = <Actions.Metadata>{} }: Action): State {
  switch (type) {
    case Actions.CREATE_COMPONENT_STATE: return createComponentState(state, payload);
    case Actions.REMOVE_COMPONENT_STATE: return removeComponentState(state, payload);
    default:
      if ('recallId' in meta) {
        return clearComponentState(state);
      }
      return state;
  }
}

// tslint:disable-next-line max-line-length
export const createComponentState = (state: State, { tagName, id, state: tagState, persist }: Actions.Payload.Component.State) =>
  ({
    ...state,
    [tagName]: {
      ...state[tagName],
      [id]: {
        persist,
        data: tagState,
      }
    }
  });

export const removeComponentState = (state: State, { tagName, id }: Actions.Payload.Component.Identifier) =>
  ({
    ...state,
    [tagName]: {
      ...Object.keys(state[tagName])
        .filter((key) => state[tagName][key] !== state[tagName][id])
        .reduce((tags, key) => Object.assign(tags, { [key]: state[tagName][key] }), {})
    }
  });

export const clearComponentState = (state: State): State => (
  Object.keys(state)
    .reduce((all, tagName) => {
      const tagState = Object.keys(state[tagName])
        .filter((id) => state[tagName][id].persist)
        .reduce((tags, key) => ({ ...tags, [key]: state[tagName][key] }), {});

      return Object.keys(tagState).length > 0 ? { ...all, [tagName]: tagState } : all;
    }, {})
);
