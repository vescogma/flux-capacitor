import { ForkEffect } from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import autocomplete from './autocomplete';
import cart from './cart';
import collection from './collection';
import productDetails from './product-details';
import products from './products';
import recommendations from './recommendations';
import refinements from './refinements';

export type SagaCreator = (flux: FluxCapacitor) => () => IterableIterator<ForkEffect>;

export const SAGA_CREATORS = [
  autocomplete,
  cart,
  collection,
  productDetails,
  products,
  recommendations,
  refinements
];

export default function createSagas(sagaCreators: SagaCreator[], flux: FluxCapacitor) {
  return sagaCreators.map((createSaga) => createSaga(flux));
}
