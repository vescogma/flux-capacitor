import * as range from 'lodash.range';

const MAX_RECORDS = 10000;

namespace Page {

  export function previousPage(currentPage: number) {
    return currentPage - 1 >= 1 ? currentPage - 1 : null;
  }

  export function nextPage(currentPage: number, finalPage: number) {
    return (currentPage + 1 <= finalPage) ? currentPage + 1 : null;
  }

  export function finalPage(pageSize: number, totalRecords: number) {
    return Math.max(Math.ceil(totalRecords / pageSize), 1);
  }

  export function fromResult(currentPage: number, pageSize: number) {
    return (currentPage - 1) * pageSize + 1;
    // TODO move the default value into reducer setup
    // return this.flux.query.build().skip + 1 || 1;
  }

  export function toResult(currentPage: number, pageSize: number, totalRecords: number) {
    if ((currentPage * pageSize) > totalRecords) {
      const total = (currentPage - 1) * pageSize;
      return total + (totalRecords % total);
    } else {
      return currentPage * pageSize;
    }
  }

  export function pageNumbers(currentPage: number, finalPage: number, limit: number) {
    return range(1, Math.min(finalPage + 1, limit + 1))
      .map(Page.transformPages(currentPage, finalPage, limit));
  }

  export function restrictTotalRecords(pageSize: number, totalRecords: number) {
    if (totalRecords > MAX_RECORDS) {
      return MAX_RECORDS - (MAX_RECORDS % pageSize);
    } else if ((totalRecords + pageSize) > MAX_RECORDS) {
      if (MAX_RECORDS % pageSize === 0) {
        return MAX_RECORDS;
      } else {
        return totalRecords - (totalRecords % pageSize);
      }
    } else {
      return totalRecords;
    }
  }

  export function transformPages(currentPage: number, finalPage: number, limit: number) {
    const border = Math.ceil(limit / 2);
    return (value: number) => {
      // account for 0-indexed pages
      if (currentPage <= border || limit > finalPage) {
        // pages start at beginning
        return value;
      } else if (currentPage > finalPage - border) {
        // pages start and end in the middle
        return value + finalPage - limit;
      } else {
        // pages end at last page
        return value + currentPage - border;
      }
    };
  }
}

export default Page;
