import Configuration from '../configuration';
import Store from '../store';

namespace Payload {
  export namespace Personalization {
    export interface Biasing {
      field: string;
      value: string;
      bias: Store.Personalization.SingleBias;
      config?: Configuration.Personalization.RealTimeBiasing;
    }
  }

  export namespace Component {
    export interface Identifier {
      tagName: string;
      id: string;
    }

    export interface State extends Identifier {
      state: object;
      persist: boolean;
    }
  }

  export namespace Collection {
    export interface Count {
      collection: string;
      count: number;
    }
  }

  export interface Query {
    corrected?: string;
    related: string[];
    didYouMean: string[];
    rewrites: string[];
  }

  // note: Isn't getting the right type in generated doc for some reason
  export interface Search extends Partial<Navigation.Refinement>, Partial<Navigation.AddRefinement> {
    query?: string;

    /**
     * only for refinements
     * if true, replace refinements with the provided ones
     * if false, add the provided refinements
     */
    clear?: boolean | string;
  }

  export namespace Autocomplete {
    export interface Suggestions {
      suggestions: Store.Autocomplete.Suggestion[];
      categoryValues: string[];
      navigations: Store.Autocomplete.Navigation[];
    }

    export interface Refinement {
      field: string;
      value: string;
    }
  }

  export namespace Navigation {
    export interface Refinement {
      navigationId: string;
      index: number;
    }

    export interface AddRefinement {
      navigationId: string;
      range?: boolean;

      // used to add new value refinement
      value?: string;

      // used to add new range refinement
      low?: number;
      high?: number;
    }

    export interface MoreRefinements {
      navigationId: string;
      refinements: Store.Refinement[];
      selected: number[];
    }
  }

  export interface Page {
    previous: number;
    next: number;
    last: number;
    from: number;
    to: number;
    current?: number;
  }

  export interface InfiniteScroll {
    isFetchingForward?: boolean;
    isFetchingBackward?: boolean;
  }
}

export default Payload;
