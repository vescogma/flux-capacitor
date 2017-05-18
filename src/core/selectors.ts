import { Request } from 'groupby-api';
import Store from './store';

namespace Selectors {

  // export const searchRequest = (state: Store.State): Request => ({
  export const searchRequest = (state: Store.State): Request => {
    const sort = Selectors.sort(state);

    return <any>{
      query: Selectors.query(state),
      collection: Selectors.collection(state),
      refinements: Selectors.selectedRefinements(state),
      pageSize: Selectors.pageSize(state),
      sort: sort && Selectors.requestSort(sort)
    };
  };

  export const query = (state: Store.State) =>
    state.data.query.original;

  export const collection = (state: Store.State) =>
    state.data.collections.selected;

  export const pageSize = (state: Store.State) =>
    state.data.page.sizes.items[state.data.page.sizes.selected];

  export const requestSort = ({ field, descending }: Store.Sort) =>
    ({ field, order: descending && 'Descending' });

  export const sort = (state: Store.State) =>
    state.data.sorts.items[state.data.sorts.selected];

  export const selectedRefinements = (state: Store.State) =>
    Selectors.navigations(state)
      .reduce((allRefinements, navigation) =>
        navigation.selected.map<any>((refinementIndex) => navigation.refinements[refinementIndex])
          .reduce((refs, { field, type, low, high, value }) =>
            refs.concat(navigation.range
              ? { navigationName: field, type: 'Range', high, low }
              : { navigationName: field, type: 'Value', value }), []), []);

  export const navigation = (state: Store.State, navigationId: string) =>
    state.data.navigations.byId[navigationId];

  export const navigations = (state: Store.State) =>
    state.data.navigations.allIds.map((id) => Selectors.navigation(state, id));

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
