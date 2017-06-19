export const ORIGINAL_QUERY_UPDATED = 'original_query_updated'; // pre
export const CORRECTED_QUERY_UPDATED = 'corrected_query_updated'; // post
export const RELATED_QUERIES_UPDATED = 'related_queries_updated'; // post
export const DID_YOU_MEANS_UPDATED = 'did_you_means_updated'; // post
export const QUERY_REWRITES_UPDATED = 'query_rewrites_updated'; // post

// sort events
export const SORTS_UPDATED = 'sorts_updated'; // mixed

// product events
export const PRODUCTS_UPDATED = 'products_updated'; // mixed
export const MORE_PRODUCTS_ADDED = 'more_products_added'; // post

// collection events
export const COLLECTION_UPDATED = 'collection_updated'; // post
export const SELECTED_COLLECTION_UPDATED = 'selected_collection_updated'; // post

// navigation events
export const NAVIGATIONS_UPDATED = 'navigations_updated'; // post
export const SELECTED_REFINEMENTS_UPDATED = 'selected_refinements_updated'; // post

// autocomplete events
export const AUTOCOMPLETE_QUERY_UPDATED = 'autocomplete_query_updated'; // pre
export const AUTOCOMPLETE_SUGGESTIONS_UPDATED = 'autocomplete_suggestions_updated'; // post
export const AUTOCOMPLETE_PRODUCTS_UPDATED = 'autocomplete_products_updated'; // post

// template events
export const TEMPLATE_UPDATED = 'template_updated'; // post

// details events
export const DETAILS_ID_UPDATED = 'details_id_updated'; // pre
export const DETAILS_PRODUCT_UPDATED = 'details_product_updated'; // post

// page events
export const PAGE_UPDATED = 'page_updated'; // post
export const PAGE_SIZE_UPDATED = 'page_size_updated'; // pre
export const CURRENT_PAGE_UPDATED = 'current_page_updated'; // pre

// record count event
export const RECORD_COUNT_UPDATED = 'record_count_updated'; // post

// request state change events
export const RECALL_CHANGED = 'recall_changed';
export const SEARCH_CHANGED = 'search_changed';

// redirect event
export const REDIRECT = 'redirect';

// error events
export const ERROR_BRIDGE = 'error:bridge';

// fetch complete events
export const FETCH_SEARCH_DONE = 'fetch:search:done';
export const FETCH_AUTOCOMPLETE_SUGGESTIONS_DONE = 'fetch:autocomplete_suggestions:done';
export const FETCH_AUTOCOMPLETE_PRODUCTS_DONE = 'fetch:autocomplete_products:done';
export const FETCH_MORE_REFINEMENTS_DONE = 'fetch:more_refinements:done';
export const FETCH_MORE_PRODUCTS_DONE = 'fetch:more_products:done';
export const FETCH_DETAILS_DONE = 'fetch:details:done';

// ui events
export const UI_UPDATED = 'ui:updated';

// app events
export const APP_STARTED = 'app:started';
export const APP_KILLED = 'app:killed';

// observer events
export const OBSERVER_NODE_CHANGED = 'observer:node_changed';

// tag events
export const TAG_LIFECYCLE = 'tag:lifecycle';
export const TAG_ALIASING = 'tag:aliasing';

// history events
export const HISTORY_SAVE = 'history:save';
