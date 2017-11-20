namespace Events {
  /**
   * Triggered when the original query is updated.
   * Returns the original query.
   */
  export const ORIGINAL_QUERY_UPDATED = 'original_query_updated'; // pre
  /**
   * Triggered when the corrected query is updated.
   * Returns the corrected query.
   */
  export const CORRECTED_QUERY_UPDATED = 'corrected_query_updated'; // post
  /**
   * Triggered when related queries are updated.
   * Returns the related queries.
   */
  export const RELATED_QUERIES_UPDATED = 'related_queries_updated'; // post
  /**
   * Triggered when did you means are updated.
   * Returns the did you means.
   */
  export const DID_YOU_MEANS_UPDATED = 'did_you_means_updated'; // post
  /**
   * Triggered when query rewrites are updated.
   * Returns the query rewrites.
   */
  export const QUERY_REWRITES_UPDATED = 'query_rewrites_updated'; // post

  // sort events
  /**
   * Triggered when sorts are updated.
   * Returns the sorts object.
   */
  export const SORTS_UPDATED = 'sorts_updated'; // mixed

  // product events
  /**
   * Triggered when products are updated.
   * Returns the products.
   */
  export const PRODUCTS_UPDATED = 'products_updated'; // mixed
  /**
   * Triggered when more products are added to the products array.
   * Returns the new products.
   */
  export const MORE_PRODUCTS_ADDED = 'more_products_added'; // post

  // collection events
  /**
   * Triggered when collection object is updated.
   * Returns the collection object.
   */
  export const COLLECTION_UPDATED = 'collection_updated'; // post
  /**
   * Triggered when selected collection is updated.
   * Returns the selected collection.
   */
  export const SELECTED_COLLECTION_UPDATED = 'selected_collection_updated'; // post

  // navigation events
  /**
   * Triggered when navigations are updated.
   * Returns the navigations object.
   */
  export const NAVIGATIONS_UPDATED = 'navigations_updated'; // post
  /**
   * Triggered when selected refinements are updated.
   * Listened to in the format 'selected_refinements_updated:id', where id is the
   * refinement's id.
   * Returns the selected refinement.
   */
  export const SELECTED_REFINEMENTS_UPDATED = 'selected_refinements_updated'; // post

  // autocomplete events
  /**
   * Triggered when autocomplete query is updated.
   * Returns the autocomplete query.
   */
  export const AUTOCOMPLETE_QUERY_UPDATED = 'autocomplete_query_updated'; // pre
  /**
   * Triggered when autocomplete suggestions are updated.
   * Returns the autocomplete suggestions.
   */
  export const AUTOCOMPLETE_SUGGESTIONS_UPDATED = 'autocomplete_suggestions_updated'; // post
  /**
   * Triggered when autocomplete product suggestions are updated.
   * Returns the autocomplete products.
   */
  export const AUTOCOMPLETE_PRODUCTS_UPDATED = 'autocomplete_products_updated'; // post
  /**
   * Triggered when autocomplete template is updated.
   * Returns the autocomplete template.
   */
  export const AUTOCOMPLETE_TEMPLATE_UPDATED = 'autocomplete_template_updated'; // post

  // template events
  /**
   * Triggered when template is updated.
   * Returns the template.
   */
  export const TEMPLATE_UPDATED = 'template_updated'; // post

  // details events
  /**
   * Triggered when details page is updated.
   * Returns the details data.
   */
  export const DETAILS_UPDATED = 'details_updated'; // pre

  // page events
  /**
   * Triggered when page object is updated.
   * Returns the page object.
   */
  export const PAGE_UPDATED = 'page_updated'; // post
  /**
   * Triggered when page size is updated.
   * Returns the sizes object.
   */
  export const PAGE_SIZE_UPDATED = 'page_size_updated'; // pre
  /**
   * Triggered when current page is updated.
   * Returns the current page number.
   */
  export const CURRENT_PAGE_UPDATED = 'current_page_updated'; // pre

  // record count event
  /**
   * Triggered when record count is updated.
   * Returns the record count number.
   */
  export const RECORD_COUNT_UPDATED = 'record_count_updated'; // post

  // request state change events
  /**
   * Triggered when the recallId changes. Occurs when a new search with
   * different refinements selected or a new query is fired.
   * Returns the recallId.
   */
  export const RECALL_CHANGED = 'recall_changed';
  /**
   * Triggered when searchId changes. Occurs whenever a new search is fired.
   * Returns the searchId.
   */
  export const SEARCH_CHANGED = 'search_changed';

  // redirect event
  /**
   * Triggered when redirect occurs.
   * Returns the redirect.
   */
  export const REDIRECT = 'redirect';

  // recommendations events
  /**
   * Triggered when recommendations products are updated.
   * Returns the recommendations products object.
   */
  export const RECOMMENDATIONS_PRODUCTS_UPDATED = 'recommendations_products_updated';

  /**
   * Triggered when past purchases are updated
   * Returns the past purchases products array
   */
  export const PAST_PURCHASES_UPDATED = 'past_purchases_updated';

  /**
   * Triggered when order history is updated
   * Returns the order history products array
   */
  export const ORDER_HISTORY_UPDATED = 'order_history_updated';

  // error events
  /**
   * Triggered when a bridge error occurs.
   * Returns the error.
   */
  export const ERROR_BRIDGE = 'error:bridge';
  /**
   * Triggered when a fetch action error occurs.
   * Returns the action.
   */
  export const ERROR_FETCH_ACTION = 'error:fetch_action';

  // ui events
  /**
   * Triggered when the UI section of the store is updated.
   * Listened to in the format 'ui:updated:tagName:id', where tagName is the
   * name of the tag, and id is the tag's id.
   */
  export const UI_UPDATED = 'ui:updated';

  // app events
  /**
   * Triggered when the app is started.
   * Returns true.
   */
  export const APP_STARTED = 'app:started';
  /**
   * Triggered when the app is killed.
   * Returns false.
   */
  export const APP_KILLED = 'app:killed';

  // location events
  /**
   * Triggered when the location is updated.
   * Returns the location.
   */
  export const LOCATION_UPDATED = 'location:updated';

  // tracker events
  /**
   * Triggered when a search beacon is sent.
   * Returns the product id.
   */
  export const BEACON_SEARCH = 'beacon:search';
  /**
   * Triggered when a view product beacon is sent.
   * Returns the product viewed.
   */
  export const BEACON_VIEW_PRODUCT = 'beacon:view_product';
  /**
   * Triggered when an add to cart beacon is sent.
   */
  export const BEACON_ADD_TO_CART = 'beacon:add_to_cart';
  /**
   * Triggered when a remove from cart beacon is sent.
   */
  export const BEACON_REMOVE_FROM_CART = 'beacon:remove_from_cart';
  /**
   * Triggered when a view cart beacon is sent.
   */
  export const BEACON_VIEW_CART = 'beacon:view_cart';
  /**
   * Triggered when an order beacon is sent.
   */
  export const BEACON_ORDER = 'beacon:order';
  /**
   * Triggered when more refinements beacon is sent
   */
  export const BEACON_MORE_REFINEMENTS = 'beacon:more_refinements';

  // observer events
  /**
   * INTERNAL EVENT: Triggered when an observer node has changed.
   */
  export const OBSERVER_NODE_CHANGED = 'observer:node_changed';

  // tag events
  /**
   * INTERNAL EVENT: Used by logging service to indicate tag lifecycle event has occurred.
   */
  export const TAG_LIFECYCLE = 'tag:lifecycle';
  /**
   * INTERNAL EVENT: Used by logging service to indicate tag aliasing event has occurred.
   */
  export const TAG_ALIASING = 'tag:aliasing';

  // history events
  /**
   * Triggered when history is saved.
   * Returns the state.
   */
  export const HISTORY_SAVE = 'history:save';

  // url events
  /**
   * Triggered when the url is updated.
   * Returns the url.
   */
  export const URL_UPDATED = 'url:updated';
}

export default Events;
