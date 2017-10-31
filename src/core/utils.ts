import * as fetchPonyfill from 'fetch-ponyfill';

export const { fetch } = fetchPonyfill();
import Store from './store';

// tslint:disable-next-line variable-name
export const Routes = {
  SEARCH: 'search',
  DETAILS: 'details',
  NAVIGATION: 'navigation'
};

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

export const transformProducts = (products: Store.Product[], structure): Store.Products.TransformedProduct[] => {
  return products.map((product) => transformProduct(product, structure));
};

export const transformProduct = (product: Store.Product, structure): Store.Products.TransformedProduct => {
  const { _variant: variantInfo, ...baseStructure } = structure;
    const userTransform = baseStructure._transform || DEFAULT_TRANSFORM;
    const transformedProduct = { ...product, ...(userTransform(clone(product, false)) || {}) };
    const effectiveStructure = Utils.extendStructure(product, transformedProduct, baseStructure);
    const data = Utils.remap(transformedProduct, effectiveStructure);

    if (variantInfo) {
      // tslint:disable-next-line max-line-length
      const variants = Utils.unpackVariants(variantInfo, transformedProduct, data, baseStructure)
        .map((variant) => ({ ...data, ...variant }));

      return { data: variants[0], variants };
    } else {
      return { data, variants: [data] };
    }
  }
};
