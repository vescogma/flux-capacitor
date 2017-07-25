namespace Recommendations {

  export const buildUrl = (customerId: string) =>
    `https://${customerId}.groupbycloud.com/wisdom/v2/public/recommendations`;
}

export default Recommendations;
