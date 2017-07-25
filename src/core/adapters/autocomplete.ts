import Actions from '../actions';
import Configuration from '../configuration';
import { RecommendationsResponse } from '../types';
import Config from './configuration';
import Search from './search';

namespace Adapter {

  export const extractLanguage = (config: Configuration) =>
    Config.extractAutocompleteLanguage(config) || Config.extractLanguage(config);

  export const extractArea = (config: Configuration) =>
    Config.extractAutocompleteArea(config) || Config.extractArea(config);

  // tslint:disable-next-line max-line-length
  export const extractSuggestions = ({ result }: any, category: string): Actions.Payload.Autocomplete.Suggestions => {
    const searchTerms = result.searchTerms || [];
    const navigations = result.navigations || [];
    return {
      categoryValues: category && searchTerms[0] ? Adapter.extractCategoryValues(searchTerms[0], category) : [],
      suggestions: searchTerms.map(({ value }) => ({ value })),
      navigations: navigations.map(({ name: field, values: refinements }) => ({ field, refinements }))
    };
  };

  // tslint:disable-next-line max-line-length
  export const extractCategoryValues = ({ additionalInfo }: { additionalInfo: object }, category: string) =>
    (additionalInfo || {})[category] || [];

  export const extractProducts = ({ result: { products } }: any) => products.map(Search.extractProduct);

  export const mergeSuggestions = (suggestions: Array<{ value: string }>, recommendations: RecommendationsResponse) =>
    [...recommendations.result.map(({ query }) => ({ value: query, trending: true })), ...suggestions];
}

export default Adapter;
