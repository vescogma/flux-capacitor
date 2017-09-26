import {
  Navigation,
  PageInfo,
  RangeRefinement,
  Refinement,
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

export const MAX_RECORDS = 10000;

namespace Adapter {

  // tslint:disable-next-line max-line-length
  export const extractQuery = ({ correctedQuery: corrected, didYouMean, relatedQueries: related, rewrites }: Results): Actions.Payload.Query =>
    ({ corrected, didYouMean, related, rewrites });

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
    metadata: navigation.metadata
      .reduce((metadata, keyValue) => Object.assign(metadata, { [keyValue.key]: keyValue.value }), {}),
  });

  export const refinementsMatch = (lhs: Store.Refinement, rhs: Refinement, type: string = rhs.type) => {
    if (type === 'Value') {
      return (<any>lhs).value === (<any>rhs).value;
    } else {
      return (<any>lhs).low === (<any>rhs).low && (<any>lhs).high === (<any>rhs).high;
    }
  };

  export const mergeSelectedRefinements = (available: Store.Navigation, selected: Navigation) => {
    available.selected = [];

    selected.refinements.forEach((refinement) => {
      const index = available.refinements.findIndex((availableRef) =>
        Adapter.refinementsMatch(<any>availableRef, <any>refinement));

      if (index !== -1) {
        available.selected.push(index);
      } else {
        const { value, low, high, total } = <any>refinement;
        const newIndex = available.refinements.push(available.range
          ? { low, high, total }
          : { value, total }) - 1;
        available.selected.push(newIndex);
      }
    });
  };

  // tslint:disable-next-line max-line-length
  export const combineNavigations = ({ availableNavigation: available, selectedNavigation: selected }: Results): Store.Navigation[] => {
    const navigations = available.reduce((map, navigation) =>
      Object.assign(map, { [navigation.name]: Adapter.extractNavigation(navigation) }), {});

    selected.forEach((selectedNav) => {
      const availableNav = navigations[selectedNav.name];

      if (availableNav) {
        Adapter.mergeSelectedRefinements(availableNav, selectedNav);
      } else {
        const navigation = Adapter.extractNavigation(selectedNav);
        navigation.selected = <any[]>Object.keys(Array(navigation.refinements.length).fill(0))
          .map((value) => Number(value));
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

  export const extractTemplate = (template: Template = <any>{ zones: [] }): Store.Template => ({
    name: template.name,
    rule: template.ruleName,
    zones: Object.keys(template.zones).reduce((zones, key) =>
      Object.assign(zones, { [key]: Adapter.extractZone(template.zones[key]) }), {}),
  });

  export const extractRecordCount = (results: Results) =>
    Math.min(results.totalRecordCount, MAX_RECORDS);

  export const extractPage = (state: Store.State, totalRecords: number): Actions.Payload.Page => {
    const pageSize = Selectors.pageSize(state);
    const currentPage = Selectors.page(state);
    const last = Page.finalPage(pageSize, totalRecords);
    const from = Page.fromResult(currentPage, pageSize);
    const to = Page.toResult(currentPage, pageSize, totalRecords);

    return {
      from,
      last,
      next: Page.nextPage(currentPage, last),
      previous: Page.previousPage(currentPage),
      to,
    };
  };

  export const extractProducts = (results: Results) =>
    results.records.map(Adapter.extractProduct);

  export const extractProduct = ({ allMeta }) => allMeta;
}

export default Adapter;
