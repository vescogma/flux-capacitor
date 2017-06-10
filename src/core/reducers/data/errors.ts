export type State = string[];

export default function updateErrors(state: State = [], action): State {
  switch (action.type) {
    // case Actions.UPDATE_ERRORS:
    //   return { ...state };
    default:
      return state;
  }
}
