export type State = string[];

export default function updateWarnings(state: State = [], action): State {
  switch (action.type) {
    // case Actions.UPDATE_WARNINGS:
    //   return { ...state };
    default:
      return state;
  }
}
