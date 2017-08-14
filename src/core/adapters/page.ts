namespace Page {

  export const previousPage = (currentPage: number) =>
    currentPage - 1 >= 1 ? currentPage - 1 : null;

  export const nextPage = (currentPage: number, finalPage: number) =>
    (currentPage + 1 <= finalPage) ? currentPage + 1 : null;

  export const finalPage = (pageSize: number, totalRecords: number) =>
    Math.max(Math.ceil(totalRecords / pageSize), 1);

  export const fromResult = (currentPage: number, pageSize: number) =>
    (currentPage - 1) * pageSize + 1;

  export const toResult = (currentPage: number, pageSize: number, totalRecords: number) => {
    return Math.min(currentPage * pageSize, totalRecords);
  };
}

export default Page;
