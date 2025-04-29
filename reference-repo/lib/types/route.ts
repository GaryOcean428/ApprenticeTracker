export interface RouteParams {
  params: {
    awardCode: string;
    classificationCode: string;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  status: number;
}
