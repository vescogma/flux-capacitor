import { Request } from 'groupby-api';
import { Store } from '.';

namespace Selectors {

  // export const searchRequest = (store: Store.State): Request => ({
  export const searchRequest = (state: Store.State): Request => (<any>{
    query: state.data.query.original,
    collection: Selectors.collection(state),
    refinements: state.data.navigations.allIds.map((id) => state.data.navigations.byId[id])
      .reduce((allRefinements, navigation) =>
        (<any[]>navigation.refinements).reduce((refinements, { field, type, low, high, value }) =>
          refinements.concat(navigation.range
            ? { navigationName: field, high, low, type: 'Range' }
            : { navigationName: field, type: 'Value', value }), []), []),
    // sort: store.data.sorts.allIds.map((id) => store.data.sorts.byId[id]),
  });

  export const query = (state: Store.State) =>
    state.data.query.original;

  export const collection = (state: Store.State) =>
    state.data.collections.selected;

  export const refinements = (state: Store.State) =>
    state.data.navigations.allIds.map((id) => state.data.navigations.byId[id])
      .reduce((allRefinements, navigation) =>
        (<any[]>navigation.refinements).reduce((refs, { field, type, low, high, value }) =>
          refs.concat(navigation.range
            ? { navigationName: field, high, low, type: 'Range' }
            : { navigationName: field, type: 'Value', value }), []), []);

  export const navigation = (state: Store.State, navigationId: string) =>
    state.data.navigations.byId[navigationId];

  export const isRefinementDeselected = (state: Store.State, navigationId: string, index: number) => {
    const nav = Selectors.navigation(state, navigationId);
    return nav && !nav.selected.includes(index);
  };

  export const isRefinementSelected = (state: Store.State, navigationId: string, index: number) => {
    const nav = Selectors.navigation(state, navigationId);
    return nav && nav.selected.includes(index);
  };

  export const hasMoreRefinements = (state: Store.State, navigationId: string) => {
    const nav = Selectors.navigation(state, navigationId);
    return nav && nav.more;
  };

  export const refinementCrumb = (state: Store.State, navigationId: string, index: number) => {
    const nav = Selectors.navigation(state, navigationId);
    const { value, low, high } = <any>nav.refinements[index];

    return {
      value,
      low,
      high,
      field: navigationId,
      range: nav.range,
    };
  };
}

export default Selectors;
