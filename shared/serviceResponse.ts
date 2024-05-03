export interface ServiceResponse<T> {
  content?: T;
  error?: string;
}

export function errorResponse(error: string): ServiceResponse<void> {
  return { error };
}

export function emptyResponse(): ServiceResponse<void> {
  return {};
}

export function contentResponse<T>(content: T): ServiceResponse<T> {
  return { content };
}
