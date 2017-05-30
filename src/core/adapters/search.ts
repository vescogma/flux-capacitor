import {
  Navigation,
  PageInfo,
  RangeRefinement,
  Results,
  SortType,
  Template,
  ValueRefinement,
  Zone,
} from 'groupby-api';
import Actions from '../actions';
import Selectors from '../selectors';
import Store from '../store';
import Page from './page';

namespace Adapter {

  export const extractQuery = (results: Results, linkMapper: (value: string) => Store.Linkable): Actions.Query => ({
    corrected: results.correctedQuery,
    didYouMean: results.didYouMean.map(linkMapper),
    related: results.relatedQueries.map(linkMapper),
    rewrites: results.rewrites,
  });

  export const extractRefinement = ({ type, value, low, high, count: total }: RangeRefinement & ValueRefinement):
    Store.ValueRefinement | Store.RangeRefinement =>
    type === 'Value' ? { value, total } : { low, high, total };

  export const extractNavigationSort = (sort: SortType): Store.Sort => {
    switch (sort) {
      case 'Count_Ascending': return { field: 'count' };
      case 'Count_Descending': return { field: 'count', descending: true };
      case 'Value_Ascending': return { field: 'value' };
      case 'Value_Descending': return { field: 'value', descending: true };
    }
  };

  export const extractNavigation = (navigation: Navigation): Store.Navigation => ({
    field: navigation.name,
    label: navigation.displayName,
    more: navigation.moreRefinements,
    or: navigation.or,
    range: !!navigation.range,
    refinements: navigation.refinements.map(Adapter.extractRefinement),
    selected: [],
    sort: navigation.sort && Adapter.extractNavigationSort(navigation.sort),
  });

  // tslint:disable-next-line max-line-length
  export const refinementsMatch = (lhs: Store.RangeRefinement & Store.ValueRefinement, rhs: RangeRefinement & ValueRefinement) => {
    if (rhs.type === 'Value') {
      return lhs.value === rhs.value;
    } else {
      return lhs.low === rhs.low && lhs.high === rhs.high;
    }
  };

  export const appendSelectedRefinements = (available: Store.Navigation, selected: Navigation) => {
    available.selected = selected.refinements.reduce((indices, refinement) => {
      // tslint:disable-next-line max-line-length
      const index = (<any>available.refinements.findIndex)((availableRef) =>
        Adapter.refinementsMatch(availableRef, <any>refinement));
      if (index !== -1) {
        indices.push(index);
      }
      return indices;
    }, []);
  };

  export const combineNavigations = (available: Navigation[], selected: Navigation[]): Store.Navigation[] => {
    const navigations = available.reduce((map, navigation) =>
      Object.assign(map, { [navigation.name]: Adapter.extractNavigation(navigation) }), {});

    selected.forEach((selectedNav) => {
      const availableNav = navigations[selectedNav.name];

      if (availableNav) {
        Adapter.appendSelectedRefinements(availableNav, selectedNav);
      } else {
        const navigation = Adapter.extractNavigation(selectedNav);
        navigation.selected = <any[]>Object.keys(Array(selectedNav.refinements.length));
        navigations[selectedNav.name] = navigation;
      }
    });

    return Object.keys(navigations).reduce((navs, key) => navs.concat(navigations[key]), []);
  };

  export const extractZone = (zone: Zone): Store.Zone => {
    switch (zone.type) {
      case 'Content': return {
        content: zone.content,
        name: zone.name,
        type: Store.Zone.Type.CONTENT,
      };
      case 'Rich_Content': return {
        content: zone.richContent,
        name: zone.name,
        type: Store.Zone.Type.RICH_CONTENT,
      };
      case 'Record': return {
        name: zone.name,
        query: zone.query,
        products: zone.records.map((record) => record.allMeta),
        type: Store.Zone.Type.PRODUCTS,
      };
    }
  };

  export const extractTemplate = (template: Template): Store.Template => ({
    name: template.name,
    rule: template.ruleName,
    zones: Object.keys(template.zones).reduce((zones, key) =>
      Object.assign(zones, { [key]: Adapter.extractZone(template.zones[key]) }), {}),
  });

  export const extractPage = (state: Store.State, data): Actions.Page => {
    const pageSize = Selectors.pageSize(state);
    const currentPage = state.data.page.current;
    const totalRecords = data.totalRecordCount;
    const last = Page.finalPage(pageSize, totalRecords);
    const pageInfo = data.pageInfo;
    const from = Page.fromResult(currentPage, pageSize);
    const to = Page.toResult(currentPage, pageSize, totalRecords);

    return {
      from,
      last,
      next: Page.nextPage(currentPage, last),
      previous: Page.previousPage(currentPage),
      range: Page.pageNumbers(currentPage, last, state.data.page.limit),
      to,
    };
  };

  // tslint:disable-next-line max-line-length
  export const extractAutocompleteSuggestions = ({ result }: any, category?: string): { suggestions: string[], categoryValues: string[] } => ({
    categoryValues: category && result.searchTerms[0] ? Adapter.extractCategoryValues(result.searchTerms[0], category) : [],
    suggestions: result.searchTerms.map(({ value }) => value),
  });

  // tslint:disable-next-line max-line-length
  export const extractCategoryValues = ({ additionalInfo }: { additionalInfo: { [key: string]: any } }, category: string) => additionalInfo[category] || [];

  export const extractAutocompleteProducts = ({ result: { products } }: any) => products.map(Adapter.extractProduct);

  export const extractProduct = ({ allMeta }) => allMeta;
}

export default Adapter;
