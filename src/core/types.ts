export interface RecommendationsResponse {
  status: {
    code: number,
    message: string,
    additionalInfo: object
  };
  result: Array<{ query: string, count: number }>;
  serverTimestamp: string;
}
