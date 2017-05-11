import { Action, Store } from '../..';

export default function updateWarnings(state: string[] = [], action) {
  switch (action.type) {
    // case Actions.UPDATE_WARNINGS:
    //   return { ...state };
    default:
      return state;
  }
}
