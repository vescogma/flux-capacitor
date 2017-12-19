import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';
import ConfigurationAdapter from './configuration';

namespace PastPurchases {

// tslint:disable-next-line max-line-length
  export const pastPurchaseBiasing = (state: Store.State) => {
    const { recommendations: { idField, pastPurchases } } = Selectors.config(state);
    return {
      bringToTop: [],
      augmentBiases: true,
      influence: pastPurchases.biasInfluence,
      biases: Selectors.pastPurchases(state)
        .slice(0, pastPurchases.biasCount)
        .map((pastPurchase) => ({ name: idField, content: pastPurchase.sku, strength: pastPurchases.biasStrength }))
    };
  };

  // maps an array of products to an object with ids as keys and product data as value

  export const pastPurchaseProducts = (products: Store.ProductWithMetadata[]) => {
    return products.reduce((productMap, product) => {
      productMap[product.data.id] = product;
      return productMap;
    }, {});
  };

  export const sortSkus = (skus: Store.PastPurchases.PastPurchaseProduct[], field: string) => {
    return [...skus].sort(({ [field]: lhs }, { [field]: rhs }) => rhs - lhs);
  };

  export const pastPurchaseNavigations = (config: Configuration, navigations: Store.Navigation[]) => {
    const configNavigations = ConfigurationAdapter.extractPastPurchaseNavigations(config);
    return navigations.filter((navigation) => configNavigations[navigation.field])
      .map((navigation) => ({
        ...navigation,
        refinements: configNavigations[navigation.field].length > 0 ?
          navigation.refinements.reduce((refinementAcc, refinement: Store.ValueRefinement) => {
            if (refinement.value) {
              const ref = configNavigations[navigation.field].find((nav) =>
                nav === refinement.value || nav['value'] === refinement.value
              );
              if (ref) {
                refinementAcc.push(ref['display'] ? {
                  ...refinement,
                  display: ref['display']
                } : refinement);
              }
            }
            return refinementAcc;
        }, []) : navigation.refinements
      }));
  };
}

export default PastPurchases;
