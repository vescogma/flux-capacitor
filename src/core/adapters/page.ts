import * as range from 'lodash.range';

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
  }

  export function toResult(currentPage: number, pageSize: number, totalRecords: number) {
    if ((currentPage * pageSize) > totalRecords) {
      const total = (currentPage - 1) * pageSize;
      return total + (totalRecords % total);
    } else {
      return currentPage * pageSize;
    }
  }
}

export default Page;
