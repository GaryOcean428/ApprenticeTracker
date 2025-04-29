export interface TransformOptions {
  isReactComponent?: boolean;
  isNextPage?: boolean;
  isApiRoute?: boolean;
}

export interface TransformResult {
  content: string;
  modified: boolean;
  errors?: string[];
}
