import Store from './store';

namespace Actions {
  export const UPDATE_AUTOCOMPLETE_QUERY = 'UPDATE_AUTOCOMPLETE_QUERY';
  export const UPDATE_DETAILS_ID = 'UPDATE_DETAILS_ID';
  export const UPDATE_SEARCH = 'UPDATE_SEARCH';
  export const SELECT_REFINEMENT = 'SELECT_REFINEMENT';
  export const DESELECT_REFINEMENT = 'DESELECT_REFINEMENT';
  export const SELECT_COLLECTION = 'SELECT_COLLECTION';
  export const SELECT_SORT = 'UPDATE_SORTS';
  export const UPDATE_PAGE_SIZE = 'UPDATE_PAGE_SIZE';
  export const UPDATE_CURRENT_PAGE = 'UPDATE_CURRENT_PAGE';

  // response actions
  export const RECEIVE_MORE_REFINEMENTS = 'RECEIVE_MORE_REFINEMENTS';
  export const RECEIVE_MORE_PRODUCTS = 'RECEIVE_MORE_PRODUCTS';
  export const RECEIVE_AUTOCOMPLETE_SUGGESTIONS = 'RECEIVE_AUTOCOMPLETE_SUGGESTIONS';
  export const RECEIVE_AUTOCOMPLETE_PRODUCTS = 'RECEIVE_AUTOCOMPLETE_PRODUCTS';
  export const RECEIVE_DETAILS_PRODUCT = 'RECEIVE_DETAILS_PRODUCT';
  export const RECEIVE_QUERY = 'RECEIVE_QUERY';
  export const RECEIVE_PRODUCTS = 'RECEIVE_PRODUCTS';
  export const RECEIVE_COLLECTION_COUNT = 'RECEIVE_COLLECTION_COUNT';
  export const RECEIVE_NAVIGATIONS = 'RECEIVE_NAVIGATIONS';
  export const RECEIVE_PAGE = 'RECEIVE_PAGE';
  export const RECEIVE_RECORD_COUNT = 'RECEIVE_RECORD_COUNT';
  export const RECEIVE_TEMPLATE = 'RECEIVE_TEMPLATE';
  export const RECEIVE_REDIRECT = 'RECEIVE_REDIRECT';

  // request status
  export const SO_FETCHING = 'SO_FETCHING';

  // ui
  export const CREATE_COMPONENT_STATE = 'CREATE_COMPONENT_STATE';
  export const REMOVE_COMPONENT_STATE = 'REMOVE_COMPONENT_STATE';

  // app
  export const START_APP = 'START_APP';
  export const SHUTDOWN_APP = 'SHUTDOWN_APP';
  export const REFRESH_STATE = 'REFRESH_STATE';

  export interface Base { type: string; }

  export namespace UI {
    export interface ComponentStateAction extends Base {
      tagName: string;
      id: string;
    }
    export interface CreateComponentState extends ComponentStateAction {
      state: object;
    }
    export type RemoveComponentState = ComponentStateAction;
  }

  export namespace Autocomplete {
    export interface UpdateQuery extends Base {
      query: string;
    }

    export interface ReceiveSuggestions extends Base {
      suggestions: string[];
      categoryValues: string[];
      navigations: Store.Autocomplete.Navigation[];
    }

    export interface ReceiveProducts extends Base {
      products: any[];
    }
  }

  export interface Search {
    query?: string;
    navigationId?: string;
    index?: number;

    /**
     * only for refinements
     * if true, replace refinements with the provided ones
     * if false, add the provided refinements
     */
    clear?: boolean;
  }
  export namespace Search {
    export type Refinement = ValueRefinement | RangeRefinement;

    export interface BaseRefinement {
      field: string;
    }

    export interface ValueRefinement extends BaseRefinement {
      value: string;
    }

    export interface RangeRefinement extends BaseRefinement {
      low?: number;
      high?: number;
    }

    export type UpdateSearch = Base & Actions.Search;
  }

  export namespace Collections {
    export interface SelectCollection extends Base {
      id: string;
    }
    export interface ReceiveCount extends Base {
      collection: string;
      count: number;
    }
  }

  export namespace Details {
    export interface UpdateId extends Base {
      id: string;
    }
    export interface ReceiveProduct extends Base {
      product: Store.Product;
    }
  }

  export namespace Navigation {
    export interface RefinementAction extends Base {
      navigationId: string;
      index: number;
    }
    export type SelectRefinement = RefinementAction;
    export type DeselectRefinement = RefinementAction;
    export interface UpdateSearch extends Partial<RefinementAction> {
      clear?: boolean;
    }
    export interface ReceiveNavigations extends Base {
      navigations: Store.Navigation[];
    }
    export interface ReceiveMoreRefinements extends Base {
      navigationId: string;
      refinements: Store.Refinement[];
    }
  }

  export interface Page {
    previous: number;
    next: number;
    last: number;
    from: number;
    to: number;
  }
  export namespace Page {
    export interface UpdateCurrent extends Base {
      page: number;
    }
    export interface UpdateSize extends Base {
      size: number;
    }
    export interface ReceivePage extends Base {
      from: number;
      to: number;
      last: number;
      next: number;
      previous: number;
    }
  }

  export namespace Products {
    export interface ReceiveProducts extends Base {
      products: Store.Product[];
    }
  }

  export interface Query {
    corrected?: string;
    related: Store.Query.Related[];
    didYouMean: Store.Query.DidYouMean[];
    rewrites: string[];
  }
  export namespace Query {
    export interface UpdateOriginal extends Base {
      query: string;
    }
    export interface ReceiveQuery extends Base {
      corrected?: string;
      rewrites: string[];
      didYouMean: Store.Linkable[];
      related: Store.Linkable[];
    }
  }

  export namespace RecordCount {
    export interface ReceiveRecordCount extends Base {
      recordCount: number;
    }
  }

  export namespace Redirect {
    export interface ReceiveRedirect extends Base {
      redirect: string;
    }
  }

  export namespace Sort {
    export interface UpdateSelected extends Base {
      index: number;
    }
  }

  export namespace Template {
    export interface UpdateTemplate extends Base {
      template: Store.Template;
    }
  }

  export interface Paths {
    search: string;
    // details: string;
  }
}

export default Actions;
