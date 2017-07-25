import { Request } from 'groupby-api';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import Autocomplete from './adapters/autocomplete';
import Configuration from './adapters/configuration';
import { MAX_RECORDS } from './adapters/search';
import AppConfig from './configuration';
import Selectors from './selectors';
import Store from './store';

namespace Requests {

  export const search = (state: Store.State, config: AppConfig): Request => {
    const sort = Selectors.sort(state);
    const pageSize = Selectors.pageSize(state);
    const skip = Selectors.skip(state, pageSize);
    const request: Partial<Request> = {
      pageSize: Math.min(pageSize, MAX_RECORDS - skip),
      area: Selectors.area(state),
      fields: Selectors.fields(state),
      query: Selectors.query(state),
      collection: Selectors.collection(state),
      refinements: Selectors.selectedRefinements(state),
      skip
    };

    const language = Configuration.extractLanguage(config);
    if (language) {
      request.language = language;
    }
    if (sort) {
      request.sort = <any>Selectors.requestSort(sort);
    }

    return <Request>{
      ...config.search.defaults,
      ...request,
      ...config.search.overrides,
    };
  };

  export const autocompleteSuggestions = (config: AppConfig): QueryTimeAutocompleteConfig =>
    ({
      ...config.autocomplete.defaults.suggestions,
      language: Autocomplete.extractLanguage(config),
      numSearchTerms: Configuration.extractAutocompleteSuggestionCount(config),
      numNavigations: Configuration.extractAutocompleteNavigationCount(config),
      sortAlphabetically: Configuration.isAutocompleteAlphabeticallySorted(config),
      fuzzyMatch: Configuration.isAutocompleteMatchingFuzzily(config),
      ...config.autocomplete.overrides.suggestions,
    });

  export const autocompleteProducts = (config: AppConfig): QueryTimeProductSearchConfig =>
    ({
      ...config.autocomplete.defaults.products,
      language: Autocomplete.extractLanguage(config),
      area: Autocomplete.extractArea(config),
      numProducts: Configuration.extractAutocompleteProductCount(config),
      ...config.autocomplete.overrides.products,
    });
}

export default Requests;
