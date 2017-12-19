import * as fetchPonyfill from 'fetch-ponyfill';

export const { fetch } = fetchPonyfill();

// tslint:disable-next-line variable-name
export const Routes = {
  SEARCH: 'search',
  DETAILS: 'details',
  NAVIGATION: 'navigation',
  PAST_PURCHASE: 'pastpurchase',
};

export namespace StoreSections {
  export const SEARCH = 'search';

  export const PAST_PURCHASES = 'pastPurchases';

  export const SAYT = 'sayt';

  export const RECOMMENDATIONS = 'recommendations';

  export const DEFAULT = SEARCH;
}

export const rayify = <T>(arr: T | T[]): T[] => Array.isArray(arr) ? arr : [arr];

// tslint:disable-next-line max-line-length
export const sortBasedOn = function<T,S>(toBeSorted: T[], basisArray: S[], callback?: (sorted: T, unsorted: S) => boolean): T[] {
  const output: T[] = [];
  const ids = [...toBeSorted];
  basisArray.forEach((basis) => {
    const index = ids.findIndex((sortElement) => callback
      ? callback(sortElement, basis)
      : sortElement === <any>basis);
    if (index !== -1) {
      output.push(ids[index]);
      ids.splice(index, 1);
    }
  });
  return output.concat(ids);
};
